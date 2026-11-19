import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { money } from './shared';

export function ConfirmWorkshopModal({ quote, bid, studioName, onClose, onConfirm, busy }) {
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

  if (!bid) return null;

  const totalPrice = bid.totalPrice || (bid.unitPrice * (quote.quantity || 1));
  const totalQuantity = quote.quantity || 1;
  const itemsCount = quote.items?.length || 1;

  return createPortal(
    <div className="modal-backdrop">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-workshop-title"
        className="modal confirm-workshop-modal"
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 2 }}>
              ĐIỀU PHỐI ĐƠN HÀNG LÔ TRANH
            </span>
            <h2 id="confirm-workshop-title" style={{ margin: 0, fontSize: '22px' }}>
              Xác nhận chọn xưởng chế tác
            </h2>
          </div>
          <button className="icon-btn" aria-label="Đóng" disabled={busy} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="confirm-workshop-body">
          <p className="confirm-workshop-intro">
            Bạn đang chuẩn bị trao quyền chế tác trọn gói 100% lô tranh cho xưởng dưới đây:
          </p>

          <div className="confirm-workshop-card">
            <div className="confirm-ws-header">
              <div>
                <h3 className="confirm-ws-name">{studioName}</h3>
                <span className="confirm-ws-badge">Xưởng sản xuất trọn gói 100%</span>
              </div>
              <div className="confirm-ws-price-box">
                <span className="price-label">Tổng thanh toán trọn gói</span>
                <strong className="price-value">{money(totalPrice)}</strong>
                <span className="price-sub">Đơn giá bình quân: {money(bid.unitPrice)} / bản</span>
              </div>
            </div>

            <div className="confirm-ws-specs-grid">
              <div className="spec-item">
                <span className="spec-label">Quy mô lô in</span>
                <strong className="spec-val">{totalQuantity.toLocaleString('vi-VN')} bản in ({itemsCount} tác phẩm)</strong>
              </div>
              <div className="spec-item">
                <span className="spec-label">Thời hạn hoàn thành</span>
                <strong className="spec-val">{bid.days} ngày</strong>
              </div>
              {bid.note && (
                <div className="spec-item wide">
                  <span className="spec-label">Cam kết kỹ thuật & chất lượng của xưởng</span>
                  <p className="spec-note">&ldquo;{bid.note}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Chi tiết đơn giá từng tranh nếu có */}
            {bid.itemPrices && bid.itemPrices.length > 0 && (
              <div className="confirm-ws-items-breakdown">
                <span className="breakdown-title">Chi tiết đơn giá từng tác phẩm:</span>
                <div className="breakdown-table-wrap">
                  <table className="breakdown-table">
                    <thead>
                      <tr>
                        <th>Tác phẩm</th>
                        <th style={{ textAlign: 'center' }}>Số lượng</th>
                        <th style={{ textAlign: 'right' }}>Đơn giá</th>
                        <th style={{ textAlign: 'right' }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bid.itemPrices.map(ip => {
                        const it = quote.items?.find(item => item.productId === ip.productId);
                        const qty = it?.quantity || 1;
                        const subtotal = ip.unitPrice * qty;
                        return (
                          <tr key={ip.productId}>
                            <td>{it?.artworkName || ip.productId}</td>
                            <td style={{ textAlign: 'center' }}>{qty} bản</td>
                            <td style={{ textAlign: 'right' }}>{money(ip.unitPrice)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{money(subtotal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="confirm-notice-box">
            <Check size={16} />
            <span>
              Sau khi xác nhận, yêu cầu sẽ được chuyển sang trạng thái <strong>Đã chấp nhận</strong>.
              Xưởng sẽ tiếp nhận và tiến hành chuẩn bị mộc bản, giấy điệp để chế tác.
            </span>
          </div>

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn ghost" disabled={busy} onClick={onClose}>
              Xem lại danh sách
            </button>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={onConfirm}
              style={{ minWidth: 180 }}
            >
              {busy ? 'Đang xử lý…' : 'Xác nhận chọn xưởng này'}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
