import { useState } from 'react';
import { BookOpen, Check, Edit3 } from 'lucide-react';
import { api, date } from './shared';
import { BatchLandingDialog } from './BatchLandingDialog';
import './production-journal.css';

export function ProductionJournal({ quote, allocation, studio, onSaved }) {
  const [open, setOpen] = useState(false);
  const draft = allocation.journalDraft;
  const events = draft?.events || [];
  const ready = events.filter(event => event.title?.trim() && event.date && event.note?.trim() && event.images?.length).length;
  return <>
    <section className="panel production-journal" aria-labelledby="production-journal-title">
      <div className="production-journal-head"><div><span className="eyebrow">BẢN NHÁP CỦA XƯỞNG</span><h2 id="production-journal-title"><BookOpen size={21} />Nhật ký sản xuất</h2></div>
        <span className="production-journal-count">{events.length} mốc · {ready} đủ thông tin</span></div>
      <p>Ghi lại công đoạn và ảnh ngay trong lúc làm. Bản nháp được lưu để tiếp tục ở lần sau; landing page và QR chỉ tạo khi bạn xác nhận hoàn thành lô.</p>
      {events.length > 0 && <ol className="production-journal-preview">{events.map((event, index) => <li key={index}>
        <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{event.title || 'Công đoạn chưa đặt tên'}</strong><small>{event.date ? date(event.date) : 'Chưa ghi ngày'} · {event.images?.length || 0} ảnh</small></div>
        {event.title?.trim() && event.date && event.note?.trim() && event.images?.length > 0 && <Check size={16} aria-label="Đủ thông tin" />}
      </li>)}</ol>}
      <div className="production-journal-actions"><button type="button" className="btn outline small" onClick={() => setOpen(true)}><Edit3 size={16} />{draft ? 'Tiếp tục ghi nhật ký' : 'Ghi nhật ký sản xuất'}</button>
        {draft?.savedAt && <span>Đã lưu: {new Date(draft.savedAt).toLocaleString('vi-VN')}</span>}</div>
    </section>
    {open && <BatchLandingDialog mode="draft" quote={quote} allocation={allocation} studio={studio} initialDraft={draft}
      onClose={() => setOpen(false)} onRefresh={onSaved} onSubmit={async (journal, version) => {
        const updated = await api('/quotes/' + quote._id + '/production-journal', { method: 'PATCH', body: { version, journal } });
        onSaved(); return updated;
      }} />}
  </>;
}
