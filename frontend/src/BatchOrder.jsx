import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertCircle, ShoppingCart, Trash2, Plus, Minus,
  MapPin, Clock, ArrowLeft, ArrowUpRight, Check, Layers, Users, Info
} from 'lucide-react';
import { api, useApp, useCart, useLoad, LoadState, Empty } from './shared';
import { money, date } from './lib/catalog';

const cleanAddress = (addr) => (addr || 'Làng Đông Hồ, Thuận Thành, Bắc Ninh').replace(/\s*\(vị trí minh họa\)/gi, '');

export function BatchOrder() {
  const { user, notify } = useApp();
  const { cart, updateCartItem, removeCartItem, clearCart, openCart } = useCart();
  const navigate = useNavigate();
  const studios = useLoad('/workshops');

  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
    fullName: '',
    phoneNumber: '',
    shippingAddress: '',
    packagingNote: '',
    targetType: 'bidding', // 'bidding' | 'direct'
    targetWorkshopId: '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill from user profile and sensible defaults
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phoneNumber: prev.phoneNumber || user.phoneNumber || user.phone || '',
        shippingAddress: prev.shippingAddress || user.address || '',
        title: prev.title || `Yêu cầu đặt in lô tranh Đông Hồ - ${user.name || 'Khách hàng'}`,
        deadline: prev.deadline || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      }));
    }
  }, [user]);

  // Sync targetType and workshopId if cart has custom artwork
  useEffect(() => {
    if (cart?.hasCustomArtwork) {
      setFormData(prev => ({
        ...prev,
        targetType: 'direct',
        targetWorkshopId: cart.targetWorkshopId || prev.targetWorkshopId || '',
      }));
    }
  }, [cart?.hasCustomArtwork, cart?.targetWorkshopId]);

  const selectedItems = (cart?.items || []).filter(i => i.selected);
  const hasConflict = (cart?.customWorkshopCount || 0) > 1;

  // Find target workshop details if direct
  const selectedWorkshop = studios.data?.find(s => s._id === formData.targetWorkshopId) 
    || (cart?.hasCustomArtwork 
        ? studios.data?.find(s => s._id === cart.targetWorkshopId || s.name === cart.items?.find(i => i.type === 'custom')?.workshopName)
        : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!user) {
      notify('Vui lòng đăng nhập để gửi yêu cầu đặt lô');
      navigate('/dang-nhap?redirect=/batch-order');
      return;
    }
    if (user.role !== 'buyer') {
      notify('Chỉ tài khoản khách hàng mới có thể tạo yêu cầu đặt lô');
      return;
    }
    if (selectedItems.length === 0) {
      notify('Vui lòng chọn ít nhất 1 tác phẩm để tạo đơn đặt lô');
      return;
    }
    if (hasConflict) {
      notify('Không thể gộp tranh độc bản của nhiều xưởng vào cùng một đơn');
      return;
    }
    if (!cart.hasCustomArtwork && formData.targetType === 'direct' && !formData.targetWorkshopId) {
      setError('Vui lòng chọn xưởng chế tác nhận đơn');
      return;
    }

    try {
      setBusy(true);
      const isCustom = cart.hasCustomArtwork;
      const targetType = isCustom ? 'direct' : formData.targetType;
      const targetWorkshopId = isCustom ? cart.targetWorkshopId : (formData.targetType === 'direct' ? formData.targetWorkshopId : null);

      const payload = {
        title: formData.title.trim(),
        deadline: formData.deadline,
        description: formData.packagingNote?.trim() || 'Yêu cầu đặt in lô tranh theo thỏa thuận',
        targetType,
        ...(targetWorkshopId ? { targetWorkshopId } : {}),
        items: selectedItems.map(i => ({
          productId: i.productId,
          artworkName: i.artworkName,
          category: i.category,
          dimensions: i.dimensions,
          quantity: i.quantity,
          note: i.note || '',
        })),
        customerInfo: {
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          shippingAddress: formData.shippingAddress.trim(),
          packagingNote: formData.packagingNote?.trim() || '',
        },
      };

      const res = await api('/quotes', { method: 'POST', body: payload });
      await clearCart(true);
      notify('Tạo yêu cầu đặt lô thành công!');
      navigate('/quotes/' + res._id);
    } catch (err) {
      setError(err.message || 'Không thể tạo đơn đặt lô');
      notify(err.message || 'Không thể tạo đơn đặt lô');
    } finally {
      setBusy(false);
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <section className="wrap page batch-order-page">
        <div className="batch-order-empty-box">
          <div className="empty-seal-icon">
            <ShoppingCart size={36} strokeWidth={1.3} />
          </div>
          <h3>Đăng nhập để tiến hành đặt lô</h3>
          <p>Bạn cần có tài khoản khách hàng để lưu trữ và theo dõi tiến độ báo giá với các nghệ nhân.</p>
          <div className="batch-order-empty-actions">
            <Link to="/dang-nhap?redirect=/batch-order" className="btn">
              Đăng nhập ngay
            </Link>
            <Link to="/tranh" className="btn outline">
              Khám phá bộ sưu tập
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // If no items selected
  if (!selectedItems.length) {
    return (
      <section className="wrap page batch-order-page">
        <div className="batch-order-empty-box">
          <div className="empty-seal-icon">
            <ShoppingCart size={36} strokeWidth={1.3} />
          </div>
          <h3>Giỏ hàng chưa có tranh được chọn</h3>
          <p>Vui lòng chọn các tác phẩm bạn muốn đặt in từ giỏ hàng hoặc bộ sưu tập tranh Đông Hồ.</p>
          <div className="batch-order-empty-actions">
            <button type="button" className="btn" onClick={openCart}>
              Mở giỏ hàng tác phẩm
            </button>
            <Link to="/tranh" className="btn outline">
              Khám phá bộ sưu tập
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap page batch-order-page">
      {/* Compact Header - Tiết kiệm tối đa diện tích dọc */}
      <div className="batch-order-header-compact">
        <span className="eyebrow">ĐẶT IN LÔ THEO YÊU CẦU</span>
        <div className="batch-order-header-row">
          <h1>Xác nhận & Gửi yêu cầu đặt lô</h1>
          <p>Kiểm tra danh sách tác phẩm, chọn xưởng chế tác và cung cấp thông tin giao nhận.</p>
        </div>
      </div>

      {hasConflict && (
        <div className="cart-copyright-banner banner-conflict" style={{ marginBottom: 20 }}>
          <AlertCircle size={20} />
          <div>
            <strong>Xung đột xưởng chế tác độc bản:</strong> Đơn hàng đang chọn chứa tranh độc bản thuộc về các xưởng khác nhau. Theo quy ước bảo tồn di sản, tranh độc bản chỉ được in tại xưởng sở hữu ván khắc gốc. Vui lòng mở giỏ hàng để tách thành từng đơn riêng.
          </div>
          <button type="button" className="btn small outline" onClick={openCart} style={{ marginLeft: 'auto' }}>
            Mở giỏ hàng
          </button>
        </div>
      )}

      <form className="batch-order-layout" onSubmit={handleSubmit}>
        {/* CỘT TRÁI - CHI TIẾT */}
        <div className="batch-order-main">
          {/* 1. KHỐI TÁC PHẨM TRONG LÔ */}
          <div className="batch-order-card">
            <div className="batch-order-card-header">
              <div className="card-header-title">
                <span className="step-badge">01</span>
                <div>
                  <h3>Danh sách tác phẩm trong lô in</h3>
                  <p>Lô gồm <strong>{selectedItems.length}</strong> tác phẩm · Tổng cộng <strong>{cart.selectedQuantity}</strong> bản in trên nền giấy điệp</p>
                </div>
              </div>
              <button type="button" className="text-link batch-order-change-cart-btn" onClick={openCart}>
                Thay đổi giỏ hàng
              </button>
            </div>

            <div className="batch-order-art-list">
              {selectedItems.map((item) => (
                <div key={item.productId} className="batch-order-art-item">
                  <Link to={'/tranh/' + item.productId} className="batch-order-art-thumb-link" title="Xem chi tiết tác phẩm">
                    <img src={item.image || '/art/in-tranh.jpg'} alt={item.artworkName} className="batch-order-art-thumb" />
                  </Link>

                  <div className="batch-order-art-details">
                    <div className="batch-order-art-title-row">
                      <Link to={'/tranh/' + item.productId} className="batch-order-art-name">
                        <h4>{item.artworkName}</h4>
                      </Link>
                      {item.type === 'custom' ? (
                        <span className="cart-tag-custom" title="Tranh độc quyền ván khắc gỗ">
                          <ShieldCheck size={13} /> Độc bản · {item.workshopName || 'Xưởng chế tác'}
                        </span>
                      ) : (
                        <span className="cart-tag-general">Di sản làng nghề</span>
                      )}
                    </div>

                    <div className="batch-order-art-specs">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>{item.dimensions || '26 × 37 cm'}</span>
                      <span>·</span>
                      <span>Giấy Dó quét điệp</span>
                    </div>

                    {/* Dòng đáy: Ô ghi chú và Bộ chỉnh số lượng căn ngang hàng, thẳng tắp */}
                    <div className="batch-order-art-bottom-row">
                      <input
                        type="text"
                        placeholder="Ghi chú in ấn riêng cho bức tranh này (tùy chọn)..."
                        value={item.note || ''}
                        onChange={(e) => updateCartItem(item.productId, { note: e.target.value })}
                        maxLength={200}
                        className="batch-order-item-note-input"
                      />

                      <div className="batch-order-art-actions">
                        <div className="cart-counter">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => updateCartItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })}
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={1000000}
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item.productId, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                          />
                          <button
                            type="button"
                            onClick={() => updateCartItem(item.productId, { quantity: item.quantity + 1 })}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="batch-order-qty-label">bản in</span>
                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          title="Bỏ tranh khỏi lô"
                          onClick={() => updateCartItem(item.productId, { selected: false })}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. KHỐI XƯỞNG CHẾ TÁC & PHƯƠNG THỨC */}
          <div className="batch-order-card">
            <div className="batch-order-card-header">
              <div className="card-header-title">
                <span className="step-badge">02</span>
                <div>
                  <h3>Phương thức điều phối & Xưởng chế tác</h3>
                  <p>Chọn hình thức nhận báo giá từ các nghệ nhân làng tranh Đông Hồ</p>
                </div>
              </div>
            </div>

            {cart.hasCustomArtwork ? (
              <div className="batch-order-custom-workshop-section">
                <div className="custom-lock-card">
                  <div className="lock-header">
                    <ShieldCheck size={20} className="lock-icon" />
                    <div>
                      <h4>Chỉ định xưởng chế tác (Ràng buộc bản quyền)</h4>
                      <p>
                        Lô tranh của bạn chứa tác phẩm độc bản. Theo quy ước làng nghề, tác phẩm này được lưu giữ và in ấn độc quyền tại <strong>{selectedWorkshop?.name || cart.items?.find(i => i.type === 'custom')?.workshopName || 'xưởng chủ quản'}</strong>.
                      </p>
                    </div>
                  </div>

                  {selectedWorkshop ? (
                    <div className="batch-order-workshop-showcase">
                      <img
                        src={selectedWorkshop.images?.[0] || '/art/in-tranh.jpg'}
                        alt={selectedWorkshop.name}
                        className="workshop-showcase-img"
                      />
                      <div className="workshop-showcase-content">
                        <div className="workshop-showcase-top">
                          <span className="showcase-seal">MỘC BẢN GỐC</span>
                          <h4>{selectedWorkshop.name}</h4>
                        </div>
                        <p className="workshop-showcase-story">
                          {selectedWorkshop.story?.slice(0, 160)}…
                        </p>
                        <div className="workshop-showcase-meta">
                          <span><MapPin size={14} /> {cleanAddress(selectedWorkshop.address)}</span>
                          <span><Clock size={14} /> {selectedWorkshop.visitingHours || '8:00 - 17:30'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="workshop-fallback-banner">
                      <span>Đơn hàng sẽ được chuyển thẳng tới nghệ nhân xưởng <strong>{cart.items?.find(i => i.type === 'custom')?.workshopName}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="batch-order-method-selector">
                <div className="method-options-grid">
                  <label className={'method-option-card ' + (formData.targetType === 'bidding' ? 'active' : '')}>
                    <div className="method-radio-top">
                      <input
                        type="radio"
                        name="targetType"
                        value="bidding"
                        checked={formData.targetType === 'bidding'}
                        onChange={() => setFormData({ ...formData, targetType: 'bidding', targetWorkshopId: '' })}
                      />
                      <span className="method-title">Đấu thầu công khai (Đề xuất)</span>
                      <span className="method-badge">Cạnh tranh</span>
                    </div>
                    <p className="method-desc">
                      Yêu cầu sẽ được gửi tới tất cả các xưởng nghệ nhân trong làng Đông Hồ. Các xưởng sẽ gửi chào giá cạnh tranh về chi phí và tiến độ để bạn lựa chọn.
                    </p>
                  </label>

                  <label className={'method-option-card ' + (formData.targetType === 'direct' ? 'active' : '')}>
                    <div className="method-radio-top">
                      <input
                        type="radio"
                        name="targetType"
                        value="direct"
                        checked={formData.targetType === 'direct'}
                        onChange={() => setFormData({ ...formData, targetType: 'direct' })}
                      />
                      <span className="method-title">Chỉ định một xưởng</span>
                    </div>
                    <p className="method-desc">
                      Gửi trực tiếp yêu cầu tới một xưởng nghệ nhân cụ thể mà bạn quen biết hoặc tin tưởng tay nghề.
                    </p>
                  </label>
                </div>

                {formData.targetType === 'direct' && (
                  <div className="direct-workshop-picker">
                    <label className="picker-label">
                      <span>Chọn xưởng nhận yêu cầu *</span>
                      <select
                        required
                        value={formData.targetWorkshopId}
                        onChange={(e) => setFormData({ ...formData, targetWorkshopId: e.target.value })}
                        className="picker-select"
                      >
                        <option value="">-- Chọn xưởng trong làng nghề --</option>
                        {studios.data?.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({cleanAddress(s.address)})
                          </option>
                        ))}
                      </select>
                    </label>

                    {selectedWorkshop && (
                      <div className="batch-order-workshop-showcase">
                        <img
                          src={selectedWorkshop.images?.[0] || '/art/in-tranh.jpg'}
                          alt={selectedWorkshop.name}
                          className="workshop-showcase-img"
                        />
                        <div className="workshop-showcase-content">
                          <div className="workshop-showcase-top">
                            <span className="showcase-seal">NGHỆ NHÂN ĐÔNG HỒ</span>
                            <h4>{selectedWorkshop.name}</h4>
                          </div>
                          <p className="workshop-showcase-story">
                            {selectedWorkshop.story?.slice(0, 160)}…
                          </p>
                          <div className="workshop-showcase-meta">
                            <span><MapPin size={14} /> {cleanAddress(selectedWorkshop.address)}</span>
                            <span><Clock size={14} /> {selectedWorkshop.visitingHours || '8:00 - 17:30'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. KHỐI THÔNG TIN GIAO NHẬN & TIẾN ĐỘ */}
          <div className="batch-order-card">
            <div className="batch-order-card-header">
              <div className="card-header-title">
                <span className="step-badge">03</span>
                <div>
                  <h3>Thông tin nhận hàng & Tiến độ mong muốn</h3>
                  <p>Cung cấp địa chỉ và thời gian để xưởng lên kế hoạch chuẩn bị giấy dó và màu in</p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <label className="wide">
                <span>Tiêu đề đơn yêu cầu *</span>
                <input
                  required
                  maxLength={150}
                  placeholder="Ví dụ: Đặt in 20 tranh chúc tụng làm quà Tết doanh nghiệp"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </label>

              <label>
                <span>Họ và tên người nhận *</span>
                <input
                  required
                  maxLength={100}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </label>

              <label>
                <span>Số điện thoại liên hệ *</span>
                <input
                  required
                  type="tel"
                  maxLength={20}
                  placeholder="0912 345 678"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </label>

              <label className="wide">
                <span>Hạn giao hàng mong muốn *</span>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
                <small className="field-hint">
                  Tranh Đông Hồ cần trải qua các lớp in màu tự nhiên và phơi gió truyền thống, khuyến nghị thời gian thực hiện tối thiểu từ 7 - 14 ngày.
                </small>
              </label>

              <label className="wide">
                <span>Địa chỉ nhận hàng chi tiết *</span>
                <input
                  required
                  maxLength={300}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                />
              </label>

              <label className="wide">
                <span>Ghi chú đóng gói & hoàn thiện (tùy chọn)</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="Yêu cầu về đóng hộp quà lụa, bọc chống ẩm, thẻ chứng nhận làng nghề xuất xưởng..."
                  value={formData.packagingNote}
                  onChange={(e) => setFormData({ ...formData, packagingNote: e.target.value })}
                />
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI - STICKY SIDEBAR */}
        <aside className="batch-order-sidebar">
          <div className="batch-order-summary-card">
            <h3 className="summary-title">Tóm tắt đơn đặt lô</h3>

            <div className="summary-stat-group">
              <div className="summary-row">
                <span>Số loại tranh</span>
                <strong>{selectedItems.length} tác phẩm</strong>
              </div>
              <div className="summary-row">
                <span>Tổng số bản in</span>
                <strong>{cart.selectedQuantity} bản</strong>
              </div>
              <div className="summary-row">
                <span>Hình thức điều phối</span>
                <span className="summary-badge">
                  {cart.hasCustomArtwork
                    ? 'Chỉ định trực tiếp'
                    : formData.targetType === 'bidding'
                    ? 'Đấu thầu công khai'
                    : 'Chỉ định 1 xưởng'}
                </span>
              </div>
              {formData.deadline && (
                <div className="summary-row">
                  <span>Hạn giao mong muốn</span>
                  <strong>{new Date(formData.deadline).toLocaleDateString('vi-VN')}</strong>
                </div>
              )}
            </div>

            <div className="summary-divider" />

            <div className="heritage-guarantee-box">
              <div className="guarantee-header">
                <ShieldCheck size={16} />
                <span>Cam kết chất lượng Đông Hồ</span>
              </div>
              <ul>
                <li>100% Giấy Dó quét điệp tự nhiên lấp lánh</li>
                <li>Màu sắc thủ công từ sỏi son, tro lá tre, hoa hòe</li>
                <li>Đóng dấu triện mộc bản nghệ nhân làng nghề</li>
              </ul>
            </div>

            {error && <p className="error" role="alert" style={{ margin: '14px 0 0' }}>{error}</p>}

            <div className="summary-actions">
              <button
                type="submit"
                className="btn full batch-order-submit-btn"
                disabled={busy || hasConflict || selectedItems.length === 0}
              >
                {busy ? 'Đang gửi yêu cầu đặt lô…' : 'Gửi yêu cầu đặt lô'}
              </button>
            </div>

            <p className="summary-footnote">
              Sau khi gửi yêu cầu, các nghệ nhân sẽ xem xét và phản hồi báo giá trong Workspace của bạn.
            </p>
          </div>
        </aside>
      </form>
    </section>
  );
}
