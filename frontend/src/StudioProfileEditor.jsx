import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Camera, Check, ChevronLeft, ChevronRight, Edit3, Eye, ImagePlus, MapPin, ShieldCheck, Star, Upload, X } from 'lucide-react';
import { api, CATEGORIES, ImageUpload, LoadState, PageTitle, useApp, useLoad } from './shared';
import { LocationPicker } from './maps/LocationPicker';
import { WorkshopImage } from './workshops/profile-media';
import './workshop-profile.css';
import './studio-profile-editor.css';

const PHOTO_LIMIT = 8;
const profileValues = studio => Object.fromEntries(['name', 'story', 'address', 'latitude', 'longitude', 'openForVisits', 'visitingHours', 'categories', 'images', 'certificates'].map(key => [key, studio[key]]));

export function StudioEditor() {
  const state = useLoad('/studio');
  const [editing, setEditing] = useState(null);
  const { notify } = useApp();
  const studio = state.data, photos = studio?.images || [];
  return <div className="sp-owner">
    <PageTitle eyebrow="KHÔNG GIAN DO BẠN KỂ" title="Hồ sơ xưởng" action={<button className="btn" type="button" disabled={!studio} onClick={() => setEditing('photos')}><Camera size={17} /> Quản lý ảnh</button>}>Chia sẻ câu chuyện làm nghề và những góc nhìn từ xưởng của bạn.</PageTitle>
    <LoadState {...state} retry={state.reload} />
    {studio && <>
      <div className="sp-owner-profile"><div className="sp-owner-cover">{photos[0] ? <WorkshopImage src={photos[0]} alt={`Ảnh bìa ${studio.name}`} /> : <div className="sp-owner-no-cover"><ImagePlus size={34} strokeWidth={1} /><span>Ảnh bìa xưởng của bạn</span></div>}<span>ẢNH BÌA HỒ SƠ</span></div>
        <div className="sp-owner-copy"><span className={'badge ' + (studio.approved ? 'status-delivered' : 'status-draft')}><ShieldCheck size={14} />{studio.approved ? 'Hồ sơ đã được duyệt' : 'Đang chờ BQL duyệt'}</span><h2>{studio.name}</h2><p><MapPin size={16} />{studio.address}</p><p>{studio.visitingHours} · {studio.openForVisits ? 'Đang đón khách' : 'Vui lòng hẹn trước'}</p><div className="sp-owner-tags">{studio.categories.map(category => <span key={category}>{category}</span>)}</div>
          <div className="sp-owner-actions"><button type="button" className="btn outline small" onClick={() => setEditing('info')}><Edit3 size={16} /> Chỉnh sửa hồ sơ</button>{studio.approved && <Link className="sp-text-link" to={'/xuong/' + studio._id} target="_blank" rel="noopener noreferrer"><Eye size={16} /> Xem trang công khai</Link>}</div></div>
      </div>
      <section className="sp-owner-photos"><div className="sp-owner-section-head"><div><span className="eyebrow">NHỮNG GÓC XƯỞNG CỦA BẠN</span><h3>Ảnh hồ sơ xưởng</h3></div><span>{photos.length} / {PHOTO_LIMIT} ảnh</span></div>
        <p>Ảnh đầu tiên là ảnh bìa của trang hồ sơ. Bạn có thể thêm ảnh, đổi ảnh bìa và sắp xếp thứ tự; ảnh bạn tải lên cũng xuất hiện trên bản đồ khi xưởng được công khai.</p>
        {photos.length > 0 && <div className="sp-owner-photo-strip">{photos.map((src, i) => <button key={src + i} type="button" onClick={() => setEditing('photos')} aria-label={`Quản lý ảnh ${i + 1} của xưởng`}><WorkshopImage src={src} alt={`Ảnh xưởng ${i + 1}`} loading="lazy" />{i === 0 && <span><Star size={12} /> Ảnh bìa</span>}</button>)}</div>}
        <button type="button" className="sp-owner-add" onClick={() => setEditing('photos')}><ImagePlus size={19} />{photos.length ? 'Thêm ảnh & sắp xếp bộ ảnh' : 'Thêm những hình ảnh đầu tiên'}</button>
      </section>
      <section className="sp-owner-story"><span className="eyebrow">CÂU CHUYỆN CỦA XƯỞNG</span><p>{studio.story}</p><small>{studio.certificates?.length || 0} ảnh giấy tờ / chứng nhận đã được xưởng cung cấp.</small></section>
    </>}
    {editing && studio && <StudioProfileDialog studio={studio} initialSection={editing} onClose={() => setEditing(null)} onSubmit={async values => {
      await api('/studio', { method: 'PATCH', body: values });
      state.reload(); notify('Đã lưu hồ sơ và bộ ảnh của xưởng');
    }} />}
  </div>;
}

function StudioPhotos({ images, onChange, onBusyChange, disabled }) {
  const file = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = disabled || busy;
  async function upload(event) {
    const input = event.target, files = [...(input.files || [])];
    if (!files.length || locked) return;
    setError('');
    if (files.length + images.length > PHOTO_LIMIT) { setError(`Tối đa ${PHOTO_LIMIT} ảnh. Bạn còn có thể thêm ${PHOTO_LIMIT - images.length} ảnh.`); input.value = ''; return; }
    if (files.some(item => item.size > 8 * 1024 * 1024)) { setError('Mỗi ảnh không được vượt quá 8 MB.'); input.value = ''; return; }
    if (files.some(item => !['image/jpeg', 'image/png', 'image/webp'].includes(item.type))) { setError('Hãy chọn ảnh JPEG, PNG hoặc WebP.'); input.value = ''; return; }
    setBusy(true); onBusyChange(true);
    try {
      const body = new FormData(); files.forEach(item => body.append('files', item));
      const result = await api('/media', { method: 'POST', body });
      onChange([...new Set([...images, ...result.urls])]);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); onBusyChange(false); input.value = ''; }
  }
  function move(index, destination) {
    const next = [...images]; const [value] = next.splice(index, 1); next.splice(destination, 0, value); onChange(next);
  }
  return <div className="sp-photo-manager">
    <div className="sp-photo-manager-note"><Camera size={19} /><p>Tối đa <strong>{PHOTO_LIMIT} ảnh</strong>. Chọn ảnh bìa thể hiện rõ không gian của xưởng; các ảnh còn lại xuất hiện trong thư viện ảnh công khai.</p><strong>{images.length}/{PHOTO_LIMIT}</strong></div>
    {images.length > 0 && <ol className="sp-photo-edit-grid">{images.map((src, index) => <li key={src + index}>
      <div className="sp-photo-edit-image"><WorkshopImage src={src} alt={`Ảnh hồ sơ ${index + 1}`} />{index === 0 && <span className="sp-photo-cover-tag"><Star size={12} /> Ảnh bìa</span>}
        <button className="sp-photo-remove" type="button" disabled={locked} aria-label={`Xóa ảnh xưởng ${index + 1}`} onClick={() => onChange(images.filter((_, i) => i !== index))}><X size={16} /></button></div>
      <div className="sp-photo-edit-controls"><button type="button" className="sp-set-cover" disabled={locked || index === 0} onClick={() => move(index, 0)} aria-label={index === 0 ? `Ảnh ${index + 1} đang là ảnh bìa` : `Đặt ảnh ${index + 1} làm ảnh bìa`}>{index === 0 ? <Check size={14} /> : <Star size={14} />}{index === 0 ? 'Ảnh bìa' : 'Đặt làm bìa'}</button>
        <button type="button" disabled={locked || index === 0} onClick={() => move(index, index - 1)} aria-label={`Chuyển ảnh ${index + 1} lên trước`}><ChevronLeft size={17} /></button>
        <button type="button" disabled={locked || index === images.length - 1} onClick={() => move(index, index + 1)} aria-label={`Chuyển ảnh ${index + 1} ra sau`}><ChevronRight size={17} /></button></div>
    </li>)}</ol>}
    <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={locked || images.length >= PHOTO_LIMIT} onChange={upload} aria-label="Chọn ảnh hồ sơ xưởng" />
    <button type="button" className="sp-photo-upload" disabled={locked || images.length >= PHOTO_LIMIT} aria-label={busy ? 'Đang tải ảnh xưởng' : images.length >= PHOTO_LIMIT ? 'Đã đủ 8 ảnh hồ sơ' : 'Thêm ảnh xưởng'} onClick={() => file.current.click()}><Upload size={20} /><span>{busy ? 'Đang tải và tối ưu ảnh…' : images.length >= PHOTO_LIMIT ? 'Đã đủ 8 ảnh hồ sơ' : 'Thêm ảnh xưởng'}<small>JPEG, PNG, WebP · tối đa 8 MB / ảnh</small></span></button>
    {error && <p className="error" role="alert">{error}</p>}
    <p className="sp-photo-save-note">Ảnh mới sẽ xuất hiện trên hồ sơ và bản đồ sau khi bạn nhấn <strong>Lưu hồ sơ xưởng</strong>.</p>
  </div>;
}

function StudioProfileDialog({ studio, initialSection, onClose, onSubmit }) {
  const [values, setValues] = useState(() => profileValues(studio));
  const initial = useRef(JSON.stringify(profileValues(studio)));
  const dialog = useRef(null), info = useRef(null), photos = useRef(null);
  const [busy, setBusy] = useState(false), [uploads, setUploads] = useState({}), [error, setError] = useState('');
  const locked = busy || Object.values(uploads).some(Boolean), dirty = JSON.stringify(values) !== initial.current;
  const change = (key, value) => { setValues(current => ({ ...current, [key]: value })); setError(''); };
  const requestClose = useCallback(() => {
    if (locked) return;
    if (dirty && !window.confirm('Hồ sơ có thay đổi chưa lưu. Bạn muốn đóng mà không lưu?')) return;
    onClose();
  }, [locked, dirty, onClose]);
  const goTo = ref => ref.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => {
      const target = initialSection === 'photos' ? photos : info;
      target.current.focus({ preventScroll: true }); goTo(target);
    });
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => {
    const handler = event => {
      if (event.key === 'Escape') { event.preventDefault(); requestClose(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.current.querySelectorAll('button,input,select,textarea,a[href]')].filter(el => !el.matches(':disabled') && el.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [requestClose]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  async function submit(event) {
    event.preventDefault(); if (locked) return;
    if (!values.categories.length) { setError('Hãy chọn ít nhất một phân loại nhận sản xuất.'); return; }
    setBusy(true); setError('');
    try { await onSubmit(values); onClose(); } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return createPortal(<div className="modal-backdrop sp-profile-backdrop"><section className="modal sp-profile-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="sp-profile-dialog-title">
    <div className="sp-profile-dialog-head"><div><span className="eyebrow">KHÔNG GIAN DO BẠN KỂ</span><h2 id="sp-profile-dialog-title">Chỉnh sửa hồ sơ xưởng</h2></div><button type="button" className="icon-btn" disabled={locked} onClick={requestClose} aria-label="Đóng chỉnh sửa hồ sơ"><X /></button>
      <nav aria-label="Các phần hồ sơ"><button type="button" disabled={locked} onClick={() => goTo(info)}>Thông tin xưởng</button><button type="button" disabled={locked} onClick={() => goTo(photos)}><Camera size={15} /> Ảnh hồ sơ <span>{values.images.length}/8</span></button></nav></div>
    <form onSubmit={submit}><fieldset disabled={locked} className="sp-profile-fields">
      <section className="sp-profile-info" ref={info} tabIndex={-1} aria-label="Thông tin xưởng"><h3>Thông tin & câu chuyện</h3><div className="form-grid">
        <label><span>Tên xưởng *</span><input required maxLength={120} value={values.name} onChange={e => change('name', e.target.value)} /></label>
        <label><span>Giờ đón khách *</span><input required maxLength={200} value={values.visitingHours} onChange={e => change('visitingHours', e.target.value)} /></label>
        <label className="wide"><span>Địa chỉ xưởng *</span><input required maxLength={300} value={values.address} onChange={e => change('address', e.target.value)} /></label>
        <div className="wide"><span className="sp-field-label">Vị trí xưởng trên bản đồ *</span><LocationPicker latitude={values.latitude} longitude={values.longitude} onChange={point => setValues(current => ({ ...current, ...point }))} /></div>
        <label className="wide sp-open-check"><input type="checkbox" checked={values.openForVisits} onChange={e => change('openForVisits', e.target.checked)} /><span>Xưởng đang mở cửa đón khách tham quan</span></label>
        <label className="wide"><span>Câu chuyện gia đình / lịch sử làm nghề *</span><textarea required rows={6} maxLength={10000} value={values.story} onChange={e => change('story', e.target.value)} placeholder="Kể về người làm nghề, dấu ấn riêng của xưởng và câu chuyện phía sau những bản in…" /></label>
        <fieldset className="wide sp-category-checks"><legend>Phân loại nhận sản xuất *</legend><div>{CATEGORIES.map(category => <label key={category}><input type="checkbox" checked={values.categories.includes(category)} onChange={e => change('categories', e.target.checked ? [...values.categories, category] : values.categories.filter(item => item !== category))} /><span>{category}</span></label>)}</div></fieldset>
      </div></section>
      <section className="sp-profile-photo-section" ref={photos} tabIndex={-1} aria-label="Ảnh hồ sơ xưởng"><h3>Hình ảnh kể chuyện xưởng</h3><p>Những góc không gian, bàn tay làm nghề và khoảnh khắc bạn muốn chia sẻ với khách ghé thăm.</p>
        <StudioPhotos images={values.images} onChange={value => change('images', value)} disabled={locked} onBusyChange={active => setUploads(current => ({ ...current, photos: active }))} /></section>
      <section className="sp-profile-certificates"><h3>Giấy tờ & chứng nhận</h3><p>Không bắt buộc. Tối đa 8 ảnh tài liệu do xưởng cung cấp.</p><ImageUpload value={values.certificates} onChange={value => change('certificates', value)} onBusyChange={active => setUploads(current => ({ ...current, certificates: active }))} /></section>
    </fieldset>
    {error && <p className="error sp-profile-error" role="alert">{error}</p>}
    <div className="sp-profile-dialog-actions"><span>{Object.values(uploads).some(Boolean) ? 'Đợi ảnh tải xong để lưu hồ sơ.' : dirty ? 'Có thay đổi chưa lưu' : 'Ảnh bìa là ảnh đầu tiên trong bộ ảnh.'}</span><button type="button" className="btn ghost" disabled={locked} onClick={requestClose}>Hủy</button><button className="btn" disabled={locked}>{busy ? 'Đang lưu…' : Object.values(uploads).some(Boolean) ? 'Đang tải ảnh…' : 'Lưu hồ sơ xưởng'}</button></div>
    </form>
  </section></div>, document.body);
}
