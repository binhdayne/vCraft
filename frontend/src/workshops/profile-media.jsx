import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ImageOff, RotateCcw, X } from 'lucide-react';

export function WorkshopImage({ src, alt, className = '', retry = false, ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span className={'sp-image-empty ' + className} role="img" aria-label={alt}>
    <ImageOff size={28} strokeWidth={1.25} /><span>Chưa tải được ảnh</span>
    {retry && src && <button type="button" onClick={() => setFailed(false)}><RotateCcw size={15} /> Thử tải lại ảnh</button>}
  </span>;
  return <img src={src} alt={alt} className={className} decoding="async" onError={() => setFailed(true)} {...props} />;
}

export function WorkshopLightbox({ photos, initialIndex = 0, title, captions = [], onClose }) {
  const [index, setIndex] = useState(Math.min(initialIndex, photos.length - 1));
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const move = delta => setIndex(current => (current + delta + photos.length) % photos.length);
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; closeButton.current.focus();
    return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => {
    const handler = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'Home') { event.preventDefault(); setIndex(0); }
      if (event.key === 'End') { event.preventDefault(); setIndex(photos.length - 1); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.current.querySelectorAll('button,a[href]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [photos.length, onClose]);
  return createPortal(<div className="sp-lightbox" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="sp-lightbox-title">
    <div className="sp-lightbox-head"><div><span>GÓC NHÌN TỪ XƯỞNG</span><h2 id="sp-lightbox-title">{title}</h2></div>
      <button type="button" ref={closeButton} onClick={onClose} aria-label="Đóng ảnh phóng lớn"><X size={25} /></button></div>
    <div className="sp-lightbox-stage">
      {photos.length > 1 && <button type="button" className="sp-lightbox-prev" onClick={() => move(-1)} aria-label="Xem ảnh trước"><ChevronLeft size={25} /></button>}
      <WorkshopImage key={photos[index]} src={photos[index]} alt={`${title} · Ảnh ${index + 1}`} retry />
      {photos.length > 1 && <button type="button" className="sp-lightbox-next" onClick={() => move(1)} aria-label="Xem ảnh tiếp theo"><ChevronRight size={25} /></button>}
    </div>
    <div className="sp-lightbox-caption" aria-live="polite"><strong>{index + 1} / {photos.length}</strong><span>{captions[index] || 'Hình ảnh do xưởng cung cấp'}</span></div>
    {photos.length > 1 && <div className="sp-lightbox-thumbs" aria-label="Chọn ảnh">{photos.map((src, number) => <button key={src + number} type="button" aria-label={`Xem ảnh ${number + 1}`} aria-pressed={index === number} onClick={() => setIndex(number)}>
      <WorkshopImage src={src} alt="" loading="lazy" /></button>)}</div>}
  </div>, document.body);
}

export function StudioRosette({ className = '' }) {
  return <svg className={className} viewBox="0 0 240 240" fill="none" aria-hidden="true">
    <circle cx="120" cy="120" r="112" stroke="currentColor" strokeWidth=".65" />
    <circle cx="120" cy="120" r="103" stroke="currentColor" strokeWidth=".65" strokeDasharray="1 5" />
    <g className="sp-rosette-petals">{Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30} 120 120)`}>
      <path d="M120 25C99 43 98 69 120 85C142 69 141 43 120 25Z" stroke="currentColor" strokeWidth=".8" />
      <path d="M120 35V77M112 52L120 62L128 52" stroke="currentColor" strokeWidth=".7" />
    </g>)}</g>
    <circle cx="120" cy="120" r="29" stroke="currentColor" strokeWidth=".8" />
    <path d="M120 102V138M102 120H138M107 107L133 133M107 133L133 107" stroke="currentColor" strokeWidth=".8" />
    <circle cx="120" cy="120" r="12" fill="currentColor" opacity=".7" />
  </svg>;
}

export function StudioLotus({ className = '' }) {
  return <svg className={className} viewBox="0 0 330 520" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.2" className="sp-lotus-stem">
      <path d="M132 505C125 411 179 336 160 225M135 452C79 406 77 359 82 307M151 382C213 327 233 254 226 201" />
      <path d="M160 225C106 219 69 182 75 151C113 142 145 169 160 209C147 159 139 116 163 83C193 113 187 163 171 209C193 171 226 149 252 159C242 200 208 228 160 225Z" />
      <path d="M159 226C120 198 108 163 125 143C152 157 162 182 164 211C167 178 184 153 205 148C217 184 194 211 159 226Z" />
      <path d="M226 202C192 178 195 142 218 128C244 144 247 179 226 202Z" />
      <path d="M82 309C26 297 20 248 68 217C116 245 115 280 82 309ZM82 309L69 232M80 278L48 264M80 278L95 258" />
      <path d="M138 447C184 419 240 412 280 452C239 485 178 474 138 447ZM150 448L260 452M211 450L239 431" />
    </g>
  </svg>;
}
