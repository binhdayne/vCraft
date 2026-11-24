import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { money, date } from './shared';

export function WorkshopBidDialog({ quote, initialBid, onClose, onSubmit }) {
  const isEditing = Boolean(initialBid);
  const deadlineMs = quote.deadline ? new Date(quote.deadline + 'T23:59:59Z').getTime() : 0;
  const maxRemainingDays = deadlineMs ? Math.max(1, Math.floor((deadlineMs - Date.now()) / 86400000)) : 365;

  const hasMultipleItems = quote.items && quote.items.length >= 2;
  const initialMode = initialBid?.itemPrices?.length ? 'itemized' : (hasMultipleItems ? 'itemized' : 'package');
  const [mode, setMode] = useState(initialMode);

  // Initialize itemPrices map: { [productId]: price }
  const [itemPrices, setItemPrices] = useState(() => {
    const prices = {};
    const defaultPrice = initialBid?.unitPrice || 100000;
    (quote.items || []).forEach(it => {
      const existing = initialBid?.itemPrices?.find(ip => ip.productId === it.productId);
      prices[it.productId] = existing?.unitPrice ? Number(existing.unitPrice) : defaultPrice;
    });
    return prices;
  });

  const [packageUnitPrice, setPackageUnitPrice] = useState(() => {
    return initialBid?.unitPrice ? Number(initialBid.unitPrice) : 100000;
  });

  const [days, setDays] = useState(() => {
    const d = initialBid?.days ? Number(initialBid.days) : 7;
    return Math.min(d, maxRemainingDays);
  });
  const [note, setNote] = useState(() => initialBid?.note || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [busy, onClose]);

  // Compute totals
  const totalQuantity = quote.quantity || 1;
  let calculatedTotalPrice = 0;
  let calculatedBlendedUnitPrice = 0;

  if (mode === 'itemized' && quote.items?.length) {
    calculatedTotalPrice = quote.items.reduce((sum, it) => {
      const p = Number(itemPrices[it.productId]) || 0;
      return sum + p * (it.quantity || 1);
    }, 0);
    calculatedBlendedUnitPrice = Math.round(calculatedTotalPrice / totalQuantity);
  } else {
    calculatedBlendedUnitPrice = Number(packageUnitPrice) || 0;
    calculatedTotalPrice = calculatedBlendedUnitPrice * totalQuantity;
  }

  const handleItemPriceChange = (productId, val) => {
    const num = Math.max(0, Number(val) || 0);
    setItemPrices(prev => ({ ...prev, [productId]: num }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (busy) return;
    setError('');

    const daysNum = Math.round(Number(days));
    if (!daysNum || daysNum < 1 || daysNum > 365) {
      setError('Số ngày hoàn thành phải từ 1 đến 365 ngày');
      return;
    }
    if (deadlineMs && daysNum > maxRemainingDays) {
      setError(`Thời gian hoàn thành (${daysNum} ngày) vượt quá hạn giao còn lại (${maxRemainingDays} ngày). Vui lòng chọn số ngày tối đa là ${maxRemainingDays} ngày.`);
      return;
    }

    let payload = {
      days: daysNum,
      note: note.trim(),
      quantity: totalQuantity,
    };

    if (mode === 'itemized' && quote.items?.length) {
      const missing = quote.items.find(it => !itemPrices[it.productId] || itemPrices[it.productId] <= 0);
      if (missing) {
        setError(`Vui lòng nhập đơn giá hợp lệ cho tác phẩm "${missing.artworkName}"`);
        return;
      }
      const itemPricesArray = quote.items.map(it => ({
        productId: it.productId,
        unitPrice: Number(itemPrices[it.productId]),
      }));
      payload.itemPrices = itemPricesArray;
      payload.totalPrice = calculatedTotalPrice;
      payload.unitPrice = calculatedBlendedUnitPrice;
    } else {
      if (calculatedBlendedUnitPrice <= 0) {
        setError('Đơn giá mỗi bản phải lớn hơn 0 VNĐ');
        return;
      }
      payload.unitPrice = calculatedBlendedUnitPrice;
      payload.totalPrice = calculatedTotalPrice;
    }

    setBusy(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi gửi chào giá');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop">
      <section role="dialog" aria-modal="true" aria-labelledby="bid-dialog-title" className="modal modal-wide workshop-bid-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 2 }}>CHÀO GIÁ XƯỞNG CHẾ TÁC</span>
            <h2 id="bid-dialog-title" style={{ margin: 0, fontSize: '22px' }}>
              {isEditing ? 'Cập nhật chào giá lô tranh' : 'Gửi chào giá lô tranh'}
            </h2>
          </div>
          <button className="icon-btn" aria-label="Đóng" disabled={busy} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bid-error-banner" role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fdf2f2', border: '1px solid #f8b4b4', color: '#9e2c21', fontSize: '13.5px', margin: '0 0 16px' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switcher: hoàn toàn không dùng icon AI / Gemini */}
        {quote.items && quote.items.length > 0 && (
          <div className="bid-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'itemized'}
              className={`bid-tab-btn ${mode === 'itemized' ? 'active' : ''}`}
              onClick={() => setMode('itemized')}
            >
              Báo giá từng bức tranh ({quote.items.length} tác phẩm)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'package'}
              className={`bid-tab-btn ${mode === 'package' ? 'active' : ''}`}
              onClick={() => setMode('package')}
            >
              Báo giá trọn gói cả lô
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="workshop-bid-form">
          {mode === 'itemized' && quote.items?.length > 0 ? (
            <div className="itemized-bid-section">
              <div className="cart-table-shell" style={{ maxHeight: 340, overflowY: 'auto', marginBottom: 16 }}>
                <table className="cart-table itemized-bid-table">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>Ảnh</th>
                      <th>Tác phẩm</th>
                      <th style={{ width: 85, textAlign: 'center' }}>Số lượng</th>
                      <th style={{ width: 180, textAlign: 'right' }}>Đơn giá xưởng đề xuất</th>
                      <th style={{ width: 140, textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((it, idx) => {
                      const curPrice = itemPrices[it.productId] ?? 100000;
                      const subtotal = curPrice * (it.quantity || 1);
                      return (
                        <tr key={it.productId || idx}>
                          <td>
                            <img
                              src={it.image || '/art/in-tranh.jpg'}
                              alt={it.artworkName}
                              className="cart-thumbnail"
                              style={{ width: 44, height: 44 }}
                            />
                          </td>
                          <td>
                            <div className="quote-item-info">
                              <h4 style={{ margin: '0 0 3px', fontFamily: 'var(--serif)', fontSize: '14.5px', color: 'var(--ink)' }}>
                                {it.artworkName}
                              </h4>
                              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                {it.dimensions || 'Tiêu chuẩn'} · {it.type === 'custom' ? 'Độc bản xưởng' : 'Di sản'}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <strong style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{it.quantity}</strong>{' '}
                            <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>bản</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="item-price-input-wrap">
                              <input
                                type="number"
                                required
                                min="1000"
                                step="1000"
                                value={curPrice || ''}
                                onChange={e => handleItemPriceChange(it.productId, e.target.value)}
                                className="item-price-input"
                                placeholder="85.000"
                              />
                              <span className="currency-unit">đ / bản</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{money(subtotal)}</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary box */}
              <div className="bid-calculation-summary">
                <div className="summary-left">
                  <span className="summary-label">Đơn giá bình quân toàn lô</span>
                  <strong className="summary-blended">{money(calculatedBlendedUnitPrice)} <small>/ bản</small></strong>
                </div>
                <div className="summary-right">
                  <span className="summary-label">TỔNG GIÁ TRỊ LÔ TRANH</span>
                  <strong className="summary-total">{money(calculatedTotalPrice)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="package-bid-section">
              <div className="form-grid">
                <label className="wide">
                  <span>Đơn giá mỗi bản in (VNĐ) *</span>
                  <div className="item-price-input-wrap large">
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      className="item-price-input"
                      value={packageUnitPrice || ''}
                      onChange={e => setPackageUnitPrice(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="100.000"
                    />
                    <span className="currency-unit">đ / bản</span>
                  </div>
                </label>
              </div>

              <div className="bid-calculation-summary" style={{ marginTop: 16 }}>
                <div className="summary-left">
                  <span className="summary-label">Tổng số lượng phôi giấy</span>
                  <strong style={{ fontSize: '15px' }}>{totalQuantity.toLocaleString('vi-VN')} bản</strong>
                </div>
                <div className="summary-right">
                  <span className="summary-label">TỔNG TIỀN TRỌN GÓI</span>
                  <strong className="summary-total">{money(calculatedTotalPrice)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Common fields */}
          <div className="form-grid" style={{ marginTop: 20 }}>
            <label>
              <span>Thời gian hoàn thành (ngày) *</span>
              <input
                type="number"
                required
                min="1"
                max={maxRemainingDays}
                step="1"
                value={days || ''}
                onChange={e => setDays(Number(e.target.value))}
                placeholder={String(Math.min(7, maxRemainingDays))}
              />
              {quote.deadline && (
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                  Hạn giao: {date(quote.deadline)} (tối đa {maxRemainingDays} ngày)
                </span>
              )}
            </label>
            <label className="wide">
              <span>Cam kết kỹ thuật & chất lượng chế tác</span>
              <textarea
                rows={3}
                maxLength={2000}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ví dụ: Giấy Dó quét điệp tự nhiên, thợ cả tra ván và dập màu 5 lớp chuẩn lối cổ..."
              />
            </label>
          </div>

          {error && <p className="error" role="alert" style={{ marginTop: 12 }}>{error}</p>}

          <div className="modal-actions" style={{ marginTop: 22 }}>
            <button type="button" className="btn ghost" disabled={busy} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn" disabled={busy}>
              {busy ? (isEditing ? 'Đang cập nhật…' : 'Đang gửi chào giá…') : (isEditing ? 'Cập nhật chào giá' : 'Gửi chào giá lô tranh')}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}
