import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';

export function CompletionConfirmModal({ quote, onClose, onConfirm, busy }) {
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

  const totalQuantity = quote.quantity || 1;
  const itemsCount = quote.items?.length || 1;

  return createPortal(
    <div className="modal-backdrop">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-completion-title"
        className="modal"
        style={{ maxWidth: 560, borderRadius: 0 }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 2 }}>
              XÁC NHẬN XUẤT XƯỞNG
            </span>
            <h2 id="confirm-completion-title" style={{ margin: 0, fontSize: '21px' }}>
              Hoàn tất chế tác lô tranh
            </h2>
          </div>
          <button className="icon-btn" aria-label="Đóng" disabled={busy} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 0', fontSize: '14px', lineHeight: 1.6, color: 'var(--ink)' }}>
          <p style={{ margin: '0 0 14px' }}>
            Bạn đang xác nhận toàn bộ <strong>{totalQuantity.toLocaleString('vi-VN')} bản in</strong> ({itemsCount} tác phẩm) của lô tranh <strong>&ldquo;{quote.title}&rdquo;</strong> đã hoàn thiện và đạt tiêu chuẩn chất lượng xuất xưởng.
          </p>

          <div style={{ padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--line)', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '13.5px' }}>
              <span style={{ color: 'var(--muted)' }}>Lô tranh:</span>
              <strong>{quote.title}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '13.5px' }}>
              <span style={{ color: 'var(--muted)' }}>Tổng số bản in:</span>
              <strong>{totalQuantity.toLocaleString('vi-VN')} bản</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--muted)' }}>Thể loại:</span>
              <span>{quote.category || 'Tranh Đông Hồ'}</span>
            </div>
          </div>

          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
            Sau khi hoàn tất, hệ thống sẽ mở bước tạo trang truy xuất nguồn gốc và cấp mã QR định danh vĩnh viễn cho lô tranh.
          </p>
        </div>

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button type="button" className="btn ghost" disabled={busy} onClick={onClose}>
            Kiểm tra lại
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={onConfirm}
          >
            <Check size={16} /> Xác nhận & Hoàn thành
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
