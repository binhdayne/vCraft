import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageUpload, LoadState, useLoad } from './shared';
import { findArtworkFilm } from './trace-media/artwork-films.mjs';
import './batch-landing.css';

const newEvent = (title = '') => ({ key: crypto.randomUUID(), title, date: '', note: '', images: [] });
const eventValues = event => ({ title: event.title.trim(), date: event.date, note: event.note.trim(), images: event.images });

export function BatchPageLinks({ batchId }) {
  if (!batchId) return null;
  return <div className="batch-landing-links"><Link className="text-link" to={'/trace/' + batchId} target="_blank" rel="noopener noreferrer" title="Mở landing page trong tab mới">Xem landing page của lô ↗</Link>
    <a className="text-link" href={'/api/v1/trace/' + batchId + '/qr'} download={'QR-lo-' + batchId + '.png'}>Tải mã QR của lô ↓</a></div>;
}

export function BatchLandingDialog({ quote, allocation, studio, batch, initialDraft, mode = 'complete', onSubmit, onClose, onRefresh }) {
  const custom = useLoad('/studio/products');
  const heritage = useLoad('/studio/workshop-products');
  const dialog = useRef(null);
  const editing = Boolean(batch);
  const drafting = mode === 'draft';
  const initial = batch || initialDraft || {};
  const [productId, setProductId] = useState(initial.productId || '');
  const [story, setStory] = useState(initial.story || '');
  const [workshopStory, setWorkshopStory] = useState(initial.workshopStory ?? studio?.story ?? '');
  const [coverImages, setCoverImages] = useState(initial.coverImages || []);
  const [events, setEvents] = useState(() => Array.isArray(initial.events)
    ? initial.events.map(event => ({ ...eventValues(event), key: crypto.randomUUID() }))
    : ['Chuẩn bị giấy điệp', 'Khắc ván và chuẩn bị màu', 'In tranh', 'Hoàn thiện thành phẩm'].map(newEvent));
  const [published, setPublished] = useState(batch?.published ?? true);
  const [uploads, setUploads] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const uploading = Object.values(uploads).some(Boolean);
  const locked = busy || uploading;
  const ordered = quote?.items || batch?.items || [];
  const available = [...(custom.data || []).filter(p => p.published),
    ...(heritage.data || []).filter(item => item.published && item.product?.published)
      .map(item => item.product)].filter(p => !quote || p.category === quote.category);
  const choices = ordered.length ? ordered.map(item => ({ _id: item.productId, name: item.artworkName })) : available;
  const products = [...new Map(choices.map(p => [p._id, p])).values()];
  const product = products.find(item => item._id === productId) || { name: batch?.productName || '' };
  const film = findArtworkFilm(product);
  const loading = !editing && !ordered.length && (custom.loading || heritage.loading);
  const loadError = !editing && !ordered.length && (custom.error || heritage.error);
  const version = useRef(quote?.version);
  const values = { productId, story: story.trim(), workshopStory: workshopStory.trim(), coverImages, events: events.map(eventValues) };
  const signature = JSON.stringify(values);
  const [savedSignature, setSavedSignature] = useState(signature);
  const [savedAt, setSavedAt] = useState(initialDraft?.savedAt || null);
  const dirty = signature !== savedSignature;
  const requestClose = useCallback(() => {
    if (locked) return;
    if (drafting && dirty && !window.confirm('Nhật ký có thay đổi chưa lưu. Bạn muốn đóng mà không lưu?')) return;
    onClose();
  }, [locked, drafting, dirty, onClose]);

  useEffect(() => { if (quote?.version !== undefined) version.current = quote.version; }, [quote?.version]);
  useEffect(() => {
    if (!drafting || !dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [drafting, dirty]);

  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.querySelector('select, input, textarea, button')?.focus();
    return () => previous?.isConnected && previous.focus();
  }, []);

  useEffect(() => {
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); requestClose(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.current.querySelectorAll('button, input, select, textarea, a[href]')]
        .filter(el => !el.matches(':disabled') && el.getClientRects().length && el.tabIndex !== -1);
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = previous; };
  }, [requestClose]);

  const uploadState = key => active => setUploads(current => ({ ...current, [key]: active }));
  const changeEvent = (key, changes) => setEvents(current => current.map(event => event.key === key ? { ...event, ...changes } : event));

  async function submit(event) {
    event.preventDefault();
    if (locked) return;
    setError('');
    if (!drafting && !coverImages.length) { setError('Hãy tải lên ít nhất một ảnh thành phẩm của lô tranh.'); return; }
    if (!drafting && (events.length < 2 || events.some(item => !item.images.length))) {
      setError('Cần ít nhất hai mốc từ ngày đầu đến thành phẩm, mỗi mốc có ảnh thực tế.'); return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (!drafting && events.some((item, index) => item.date > today || (index > 0 && item.date < events[index - 1].date))) {
      setError('Ngày thực hiện không được ở tương lai; sắp các mốc theo thứ tự thời gian.'); return;
    }
    setBusy(true);
    try {
      const content = { story: story.trim(), workshopStory: workshopStory.trim(), coverImages, events: events.map(eventValues) };
      const result = await onSubmit(editing ? { ...content, published } : { ...content, productId }, version.current);
      if (drafting) {
        if (result?.version !== undefined) version.current = result.version;
        const saved = result?.allocations?.find(item => item.workshopId === allocation.workshopId)?.journalDraft;
        setSavedSignature(signature); setSavedAt(saved?.savedAt || new Date().toISOString());
      } else onClose();
    } catch (failure) {
      setError(failure.message);
      onRefresh?.();
    } finally { setBusy(false); }
  }

  return createPortal(<div className="modal-backdrop batch-landing-backdrop">
    <section className="modal batch-landing-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="batch-landing-title">
      <div className="modal-head"><div><span className="eyebrow">HỒ SƠ RIÊNG CỦA LÔ TRANH</span>
        <h2 id="batch-landing-title">{drafting ? 'Nhật ký sản xuất · Lưu nháp' : editing ? 'Chỉnh sửa landing page' : 'Hoàn thành lô & tạo landing page'}</h2></div>
        <button type="button" className="icon-btn" aria-label="Đóng" disabled={locked} onClick={requestClose}><X /></button>
      </div>
      <p className="batch-landing-intro">{drafting
        ? 'Ghi lại công đoạn khi đang thực hiện. Bạn có thể lưu khi nội dung, ngày hoặc ảnh chưa đầy đủ và tiếp tục vào lần sau. Bản nháp chỉ hiển thị cho xưởng của bạn; landing page và QR chỉ được tạo khi xác nhận hoàn thành.' : editing
        ? 'Nội dung cập nhật trên trang hiện tại. Đường dẫn và mã QR của lô được giữ nguyên.'
        : 'Điền câu chuyện và ảnh thực tế trước khi xác nhận hoàn thành. Hệ thống sẽ tạo một trang và mã QR chung cho mọi bản tranh trong phần lô của xưởng.'}</p>
      {drafting && <p className={'batch-draft-status' + (dirty ? ' is-dirty' : '')} role="status">{dirty ? 'Có thay đổi chưa lưu' : savedAt ? `Đã lưu nháp lúc ${new Date(savedAt).toLocaleString('vi-VN')}` : 'Chưa có bản nháp đã lưu'}{!dirty && savedAt && ' · Có thể đóng và tiếp tục ở lần sau.'}</p>}
      {!drafting && !editing && initialDraft?.savedAt && <p className="batch-draft-status" role="status">Đã nạp nhật ký lưu lúc {new Date(initialDraft.savedAt).toLocaleString('vi-VN')}. Kiểm tra và bổ sung thông tin trước khi xuất bản.</p>}
      <div className="batch-landing-summary">
        <div><span>XƯỞNG THỰC HIỆN</span><strong>{batch?.workshopName || studio?.name}</strong></div>
        <div><span>SỐ LƯỢNG CỦA XƯỞNG</span><strong>{(batch?.quantity ?? allocation?.quantity ?? 0).toLocaleString('vi-VN')} bản</strong></div>
        {batch && <div><span>MÃ LÔ</span><strong>{batch.code}</strong></div>}
      </div>
      {quote && <p className="muted">Thuộc yêu cầu: {quote.title}. Số lượng lấy từ phân bổ đơn hàng.</p>}
      {ordered.length > 0 && <div className="batch-ordered-items"><strong>Tác phẩm trong lô (lấy từ đơn hàng)</strong>
        <ul>{ordered.map((item, index) => <li key={item.productId + ':' + index}>{item.artworkName} <span>{item.quantity.toLocaleString('vi-VN')} bản</span></li>)}</ul></div>}
      <LoadState loading={loading} error={loadError} retry={() => { custom.reload(); heritage.reload(); }} />
      <form onSubmit={submit} noValidate={drafting} onChange={() => { if (error) setError(''); }}>
        <fieldset disabled={busy} className="batch-landing-fields">
          <div className="form-grid">
            <label className="wide"><span>{ordered.length > 1 ? 'Tác phẩm đại diện cho lô' : 'Tác phẩm trong lô'}{!drafting && ' *'}</span>{editing
              ? <input value={batch.productName || product.name} readOnly />
              : <select required={!drafting} value={productId} disabled={loading || Boolean(loadError) || locked} onChange={e => setProductId(e.target.value)}>
                <option value="">Chọn tranh xưởng đang nhận in / sở hữu</option>
                {products.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>}</label>
            {ordered.length > 1 && <p className="wide muted">Tác phẩm đại diện dùng cho phần mở đầu và hoạt họa. Landing page lưu toàn bộ danh sách tranh và số lượng của đơn.</p>}
            {!drafting && !editing && !loading && !loadError && !products.length && <p className="wide error">Xưởng chưa có tranh công khai thuộc phân loại {quote?.category}. Hãy thêm tranh vào “Tranh của xưởng” rồi thử lại.</p>}
            <label className="wide"><span>Câu chuyện của lô tranh{!drafting && ' *'}</span><textarea required={!drafting} maxLength={5000} rows={4} value={story} onChange={e => setStory(e.target.value)}
              placeholder="Kể về lô tranh này: nguyên liệu, cách làm, người thực hiện và điểm riêng của thành phẩm…" /></label>
            <div className="wide"><span className="batch-field-label">Ảnh thành phẩm của lô{!drafting && ' *'}</span>
              <p className="muted">Ảnh đầu tiên là ảnh chính trên landing page. Dùng ảnh thực tế do tài khoản xưởng tải lên.</p>
              <ImageUpload value={coverImages} onChange={images => { setCoverImages(images); setError(''); }} onBusyChange={uploadState('cover')} />
            </div>
            <label className="wide"><span>Câu chuyện người làm nghề{!drafting && ' *'}</span><textarea required={!drafting} maxLength={10000} rows={3} value={workshopStory} onChange={e => setWorkshopStory(e.target.value)} /></label>
            <p className="wide muted">Nội dung được gợi ý từ hồ sơ xưởng; chỉnh tại đây chỉ áp dụng cho lô tranh này.</p>
          </div>
          <div className="batch-milestones-heading"><div><span className="eyebrow">TỪ NGÀY ĐẦU ĐẾN THÀNH PHẨM</span><h3>Nhật ký sản xuất{!drafting && ' *'}</h3></div><span>{events.length} / 30 mốc</span></div>
          <p className="muted">{drafting ? 'Có thể để trống các phần chưa thực hiện. Khi xuất bản cần ít nhất hai mốc theo thứ tự thời gian, mỗi mốc có tên, ngày, mô tả và ảnh.' : 'Ít nhất hai mốc theo thứ tự thời gian. Mỗi mốc cần tên, ngày, mô tả và ảnh thực tế.'}</p>
          {events.map((item, index) => <section className="batch-milestone" key={item.key} aria-label={`Mốc sản xuất ${index + 1}`}>
            <div className="batch-milestone-head"><strong>Mốc {String(index + 1).padStart(2, '0')}</strong>
              <button type="button" className="text-link" disabled={locked || (!drafting && events.length <= 2)} onClick={() => setEvents(current => current.filter(e => e.key !== item.key))} aria-label={`Xóa mốc ${index + 1}`}><Trash2 size={15} /> Xóa mốc</button></div>
            <div className="form-grid">
              <label><span>Tên công đoạn{!drafting && ' *'}</span><input required={!drafting} maxLength={150} value={item.title} onChange={e => changeEvent(item.key, { title: e.target.value })} /></label>
              <label><span>Ngày thực hiện{!drafting && ' *'}</span><input required={!drafting} type="date" max={new Date().toISOString().slice(0, 10)} value={item.date} onChange={e => changeEvent(item.key, { date: e.target.value })} /></label>
              <label className="wide"><span>Mô tả công đoạn{!drafting && ' *'}</span><textarea required={!drafting} maxLength={3000} rows={3} value={item.note} onChange={e => changeEvent(item.key, { note: e.target.value })} /></label>
              <div className="wide"><span className="batch-field-label">Ảnh thực tế của công đoạn{!drafting && ' *'}</span><ImageUpload value={item.images} onChange={images => changeEvent(item.key, { images })} onBusyChange={uploadState(item.key)} /></div>
            </div>
          </section>)}
          <button type="button" className="btn outline small" disabled={locked || events.length >= 30} onClick={() => setEvents(current => [...current, newEvent()])}><Plus size={16} /> Thêm mốc sản xuất</button>
          <p className="batch-film-hint">{film ? `Hoạt họa “${film.title}” có sẵn sẽ tự hiển thị ở góc thưởng tranh.` : 'Góc thưởng tranh sẽ dùng ảnh thành phẩm. Tác phẩm có hoạt họa sẵn sẽ tự được gắn phim.'} Không cần nhập mã QR hoặc video.</p>
          {editing && <label className="batch-publish-check"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Công khai trang truy xuất</label>}
        </fieldset>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="btn ghost" disabled={locked} onClick={requestClose}>{drafting ? 'Đóng' : 'Hủy'}</button>
          <button className="btn" disabled={locked || (!drafting && (loading || Boolean(loadError) || !productId))}>{busy ? 'Đang lưu…' : uploading ? 'Đang tải ảnh…' : drafting ? 'Lưu nháp nhật ký' : editing ? 'Lưu landing page' : 'Hoàn thành & xuất bản trang'}</button></div>
      </form>
    </section>
  </div>, document.body);
}
