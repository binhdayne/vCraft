import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, ImageOff, Pause, Play, RotateCcw } from 'lucide-react';
import { ArtworkFilm } from './trace-media/ArtworkFilm';
import { getWorkshopStoryExcerpt } from './workshops/story-book.mjs';
import './trace-landing.css';

const number = value => String(value).padStart(2, '0');
const dateLabel = value => {
  if (!value || Number.isNaN(Date.parse(value))) return 'Ngày đang cập nhật';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
};

function FolkFlower({ className = '' }) {
  return <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true" focusable="false">
    <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth=".7" />
    <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth=".7" strokeDasharray="2 6" />
    {Array.from({ length: 12 }, (_, index) => <g key={index} transform={`rotate(${index * 30} 100 100)`}>
      <path d="M100 95C77 76 79 46 100 28C121 46 123 76 100 95Z" stroke="currentColor" strokeWidth="1" />
      <path d="M100 81V40M95 55L100 62L105 55" stroke="currentColor" strokeWidth=".7" />
    </g>)}
    <circle cx="100" cy="100" r="16" fill="currentColor" />
    <circle cx="100" cy="100" r="9" stroke="var(--trace-cream)" strokeWidth="1" />
  </svg>;
}

function FolkCloud({ className = '' }) {
  return <svg className={className} viewBox="0 0 260 100" fill="none" aria-hidden="true" focusable="false">
    <path d="M12 64H65C31 64 33 33 54 33C64 7 100 10 108 35C119 14 151 19 155 40C179 18 212 41 201 62H248M39 76H226M72 52C65 40 82 30 90 41M117 53C115 35 141 34 141 48M165 62H188" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M7 86H116M151 86H250M104 76V86M140 64H154" stroke="currentColor" strokeWidth=".7" />
  </svg>;
}

function ImprintOrbit({ className = '' }) {
  return <svg className={className} viewBox="0 0 360 360" fill="none" aria-hidden="true" focusable="false">
    <g className="trace-imprint-orbit">
      <circle cx="180" cy="180" r="163" stroke="currentColor" strokeWidth=".6" />
      <circle cx="180" cy="180" r="151" stroke="currentColor" strokeWidth=".7" strokeDasharray="1 7" strokeLinecap="round" />
      {Array.from({ length: 12 }, (_, index) => <g key={index} transform={`rotate(${index * 30} 180 180)`}>
        <path d="M180 51C159 69 160 91 180 105C200 91 201 69 180 51Z" stroke="currentColor" strokeWidth=".8" />
        <path d="M180 64V95M174 78L180 84L186 78M176 41H184" stroke="currentColor" strokeWidth=".7" />
      </g>)}
    </g>
    <circle cx="180" cy="180" r="65" stroke="currentColor" strokeWidth=".8" />
    <circle cx="180" cy="180" r="72" stroke="currentColor" strokeWidth=".6" strokeDasharray="3 6" />
    <g className="trace-imprint-seal">
      <rect x="142" y="137" width="76" height="86" rx="2" fill="currentColor" />
      <rect x="147" y="142" width="66" height="76" rx="1" stroke="var(--trace-forest)" strokeWidth=".7" />
      <text x="180" y="174" textAnchor="middle" fill="var(--trace-forest)" fontSize="24" fontFamily="var(--serif)">LƯU</text>
      <text x="180" y="205" textAnchor="middle" fill="var(--trace-forest)" fontSize="24" fontFamily="var(--serif)">DẤU</text>
    </g>
    {[0, 90, 180, 270].map(angle => <path key={angle} transform={`rotate(${angle} 180 180)`}
      d="M180 12V25M174 18.5H186" stroke="currentColor" strokeWidth=".7" />)}
  </svg>;
}

function ArtImage({ src, alt, className = '', ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <div className={`trace-image-placeholder ${className}`} role="img" aria-label={alt}>
    <ImageOff size={28} strokeWidth={1} /><span>Ảnh đang được cập nhật</span>
  </div>;
  return <img className={className} src={src} alt={alt} decoding="async" onError={() => setFailed(true)} {...props} />;
}

// Presentation only: the route supplies the existing trace response and retry callback.
export function TraceLanding({ batch, batchId, loading, error, onRetry }) {
  useEffect(() => {
    const previous = document.title;
    document.title = batch
      ? `${batch.product?.name || 'Hành trình lô tranh'} · ${batch.code} | vCraft`
      : 'Câu chuyện một lô tranh | vCraft';
    return () => { document.title = previous; };
  }, [batch]);
  if (loading || error || !batch) return <section className="trace-experience trace-state" aria-busy={loading}>
    <FolkFlower className="trace-state-flower" />
    <span className="trace-kicker">VCRAFT · HÀNH TRÌNH MỘT LÔ TRANH</span>
    <h1>{error ? 'Câu chuyện chưa mở được.' : 'Một câu chuyện đang mở…'}</h1>
    <p role={error ? 'alert' : 'status'}>{error || 'Đang tìm lại những dấu tay phía sau bức tranh.'}</p>
    {error && <button className="trace-button" type="button" onClick={onRetry}><RotateCcw size={16} /> Thử tải lại</button>}
    <a className="trace-text-link" href="#/tranh" target="_blank" rel="noopener noreferrer">Khám phá bộ sưu tập <ArrowUpRight size={16} /></a>
  </section>;
  return <TraceStory key={batch._id || batchId} batch={batch} />;
}

function TraceStory({ batch }) {
  const root = useRef(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [active, setActive] = useState(0);
  const events = useMemo(() => [...(batch.events || [])].sort((a, b) => (a.date || '').localeCompare(b.date || '')), [batch.events]);
  const product = batch.product || {};
  const workshop = batch.workshop || {};
  const currentEvent = events[active];
  const motion = !paused && !reduced;
  const isDemo = /DEMO/i.test(batch.code || '');
  const hasProcessIllustration = [...(product.images || []), ...events.flatMap(event => event.images || [])].includes('/art/in-tranh.jpg');

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const element = root.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height - innerHeight)));
      element.style.setProperty('--trace-progress', progress);
      element.style.setProperty('--hero-shift', motion ? `${Math.min(90, Math.max(0, -box.top) * .11)}px` : '0px');
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onVisibility = () => { element.dataset.tabVisible = String(!document.hidden); };
    const onPointer = event => {
      if (!motion || event.pointerType !== 'mouse') return;
      const box = element.querySelector('.trace-hero').getBoundingClientRect();
      element.style.setProperty('--pointer-x', `${((event.clientX - box.left) / box.width - .5) * 12}px`);
      element.style.setProperty('--pointer-y', `${((event.clientY - box.top) / box.height - .5) * 10}px`);
    };
    const resetPointer = () => {
      element.style.setProperty('--pointer-x', '0px');
      element.style.setProperty('--pointer-y', '0px');
    };
    const hero = element.querySelector('.trace-hero');
    const resize = new ResizeObserver(onScroll);
    resize.observe(element);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('visibilitychange', onVisibility);
    hero.addEventListener('pointermove', onPointer, { passive: true });
    hero.addEventListener('pointerleave', resetPointer);
    onVisibility(); update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      hero.removeEventListener('pointermove', onPointer);
      hero.removeEventListener('pointerleave', resetPointer);
      resetPointer();
    };
  }, [motion]);

  useEffect(() => {
    const element = root.current;
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
      });
    }, { threshold: .12 });
    const ambient = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.style.setProperty('--trace-running', entry.isIntersecting ? 'running' : 'paused'));
    });
    const chapters = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(Number(entry.target.dataset.chapter)); });
    }, { rootMargin: '-35% 0px -45% 0px' });
    element.querySelectorAll('[data-reveal]').forEach(node => reveal.observe(node));
    element.querySelectorAll('[data-ambient]').forEach(node => ambient.observe(node));
    element.querySelectorAll('[data-chapter]').forEach(node => chapters.observe(node));
    element.classList.add('trace-observed');
    return () => { reveal.disconnect(); ambient.disconnect(); chapters.disconnect(); };
  }, []);

  const goTo = id => root.current.querySelector(`[id="${id}"]`)?.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });

  return <article className={`trace-experience${motion ? ' trace-motion' : ''}`} ref={root} aria-label={`Hành trình lô tranh ${batch.code}`}>
    <div className="trace-reading-progress" aria-hidden="true" />
    <section className="trace-hero" id="trace-top" data-ambient>
      <div className="trace-hero-grain" aria-hidden="true" />
      <FolkCloud className="trace-cloud trace-cloud-one" />
      <FolkCloud className="trace-cloud trace-cloud-two" />
      <FolkFlower className="trace-hero-flower" />
      <div className="trace-opening-lines" aria-hidden="true"><svg viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path pathLength="1" d="M-40 110C190 16 252 180 480 95S807 13 1010 84S1310 129 1480 25" />
        <path pathLength="1" d="M-40 124C190 30 252 194 480 109S807 27 1010 98S1310 143 1480 39" />
      </svg></div>
      <div className="trace-hero-top trace-shell">
        <span className="trace-kicker trace-story-identity"><span className="trace-opening-seal" aria-hidden="true">ĐÔNG<br />HỒ</span><span>VCRAFT<span className="trace-identity-caption">MỘT LÔ TRANH · MỘT CÂU CHUYỆN</span></span></span>
        <button type="button" className="trace-motion-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused || reduced} disabled={reduced}
          aria-label={reduced ? 'Đã giảm chuyển động theo cài đặt thiết bị' : paused ? 'Bật chuyển động trang truy xuất' : 'Tạm dừng chuyển động trang truy xuất'}>
          {paused || reduced ? <Play size={13} /> : <Pause size={13} />}<span>{reduced ? 'Đã giảm chuyển động' : paused ? 'Bật chuyển động' : 'Tạm dừng chuyển động'}</span>
        </button>
      </div>

      <div className="trace-hero-main trace-shell">
        <div className="trace-hero-copy">
          <div className="trace-edition"><span /> HỒ SƠ LÔ TRANH <b>{batch.code}</b></div>
          <h1><span className="trace-title-line">Trước khi</span><span className="trace-title-line"><em>thành tranh.</em></span></h1>
          <p className="trace-hero-description">Có một hành trình nằm sau mỗi nét in.<br />Mời bạn đi từ dấu tay người thợ đến<br className="trace-desktop-break" /> câu chuyện của <strong>{product.name || 'bức tranh'}</strong>.</p>
          <button className="trace-button trace-button-light" type="button" onClick={() => goTo('trace-story')}>Mở câu chuyện <span className="trace-button-icon"><ArrowDown size={17} /></span></button>
          <div className="trace-hero-footnote"><span className="trace-footnote-line" />{isDemo ? 'Bản ghi minh họa · Dữ liệu từ xưởng' : 'Nhật ký do xưởng cung cấp'}</div>
        </div>

        <div className="trace-art-scene" aria-label={product.name}>
          <div className="trace-orbit" aria-hidden="true"><span /><span /><span /></div>
          <div className="trace-art-parallax">
            <div className="trace-paper-stack">
              <div className="trace-paper-sheet trace-paper-sheet-back" aria-hidden="true" />
              <div className="trace-paper-sheet trace-paper-sheet-middle" aria-hidden="true" />
              <figure className="trace-paper-front">
                <div className="trace-art-mat"><ArtImage src={product.images?.[0]} alt={product.name || 'Tác phẩm của lô tranh'} fetchPriority="high" /></div>
                <figcaption><span>{product.name || 'Tác phẩm đang cập nhật'}</span><span>ĐÔNG HỒ · VIỆT NAM</span></figcaption>
              </figure>
              <div className="trace-art-seal" aria-hidden="true"><span>LƯU</span><span>DẤU</span></div>
            </div>
          </div>
          <span className="trace-art-note">MỘT BẢN IN. NHIỀU DẤU TAY.</span>
        </div>
      </div>

      <div className="trace-hero-bottom trace-shell">
        <div><span>{batch.items?.length > 1 ? 'TÁC PHẨM ĐẠI DIỆN' : 'TÁC PHẨM'}</span><strong>{product.name || 'Đang cập nhật'}</strong></div>
        <div><span>KHÔNG GIAN LÀM NGHỀ</span><strong>{workshop.name || 'Đang cập nhật'}</strong></div>
        <div><span>TRONG LÔ TRANH NÀY</span><strong>{Number(batch.quantity || 0).toLocaleString('vi-VN')} <small>bản in</small></strong></div>
        <button type="button" className="trace-scroll-cue" onClick={() => goTo('trace-process')} aria-label="Đi tới nhật ký sản xuất"><ArrowDown size={18} /><span>CUỘN ĐỂ KHÁM PHÁ</span></button>
      </div>
    </section>

    <div className="trace-wordband" data-ambient aria-hidden="true"><div>{[0, 1].map(copy => <span key={copy}>GIẤY ĐIỆP <i>✳</i> VÁN KHẮC <i>✳</i> MÀU IN <i>✳</i> DẤU TAY <i>✳</i> ĐÔNG HỒ <i>✳</i> </span>)}</div></div>

    <section className="trace-story trace-shell" id="trace-story" aria-labelledby="trace-story-title">
      <div className="trace-section-marker" data-reveal><span>01</span><p>CÂU CHUYỆN<br />PHÍA SAU NÉT IN</p></div>
      <div className="trace-story-content" data-reveal>
        <span className="trace-kicker">MỖI BỨC TRANH, MỘT HÀNH TRÌNH</span>
        <h2 id="trace-story-title">Bạn thấy một bức tranh.<br /><em>Chúng tôi kể những dấu tay.</em></h2>
        <p className="trace-batch-story">{batch.story || 'Xưởng đang cập nhật câu chuyện cho lô tranh này.'}</p>
        {batch.items?.length > 0 && <div className="trace-batch-artworks"><span className="trace-kicker">CÁC TÁC PHẨM TRONG LÔ</span>
          <ul>{batch.items.map((item, index) => <li key={item.productId + ':' + index}><strong>{item.artworkName}</strong><span>{Number(item.quantity).toLocaleString('vi-VN')} bản in</span></li>)}</ul>
        </div>}
        <div className="trace-story-facts">
          <div><strong>{number(events.length)}</strong><span>mốc nhật ký<br />được lưu lại</span></div>
          <div><strong>{Number(batch.quantity || 0).toLocaleString('vi-VN')}</strong><span>bản in<br />chung một câu chuyện</span></div>
          <div className="trace-date-fact"><span>NGÀY ĐẦU ĐƯỢC GHI LẠI</span><strong>{events.length ? dateLabel(events[0].date) : 'Đang cập nhật'}</strong><span>THEO NHẬT KÝ CỦA XƯỞNG</span></div>
        </div>
      </div>
      <FolkFlower className="trace-story-flower" />
    </section>

    <section className="trace-process" id="trace-process" aria-labelledby="trace-process-title">
      <div className="trace-shell">
        <div className="trace-process-heading" data-reveal>
          <div><span className="trace-kicker">02 / NHẬT KÝ SẢN XUẤT</span><h2 id="trace-process-title">Một tờ giấy.<br /><em>Từng lớp ký ức.</em></h2></div>
          <p>Đi dọc những công đoạn được xưởng ghi lại.<br />Mỗi ngày, một nét gần hơn với thành phẩm.</p>
        </div>
        {events.length ? <div className="trace-chapters">
          <aside className="trace-chapter-stage" aria-label="Công đoạn đang xem">
            <div className="trace-stage-topline"><span>DẤU TAY NGƯỜI THỢ</span><span>{number(active + 1)} / {number(events.length)}</span></div>
            <div className="trace-stage-image"><ArtImage key={currentEvent?.images?.[0]} src={currentEvent?.images?.[0]} alt={currentEvent?.title || 'Ảnh công đoạn'} loading="lazy" /><span className="trace-stage-index" aria-hidden="true">{number(active + 1)}</span></div>
            <div className="trace-stage-caption" aria-live="polite"><span>{dateLabel(currentEvent?.date)}</span><strong>{currentEvent?.title}</strong></div>
            <nav className="trace-chapter-dots" aria-label="Chọn công đoạn">{events.map((event, index) => <button key={event._id || index} type="button" className={index === active ? 'is-active' : ''} aria-current={index === active ? 'step' : undefined}
              aria-label={`Xem công đoạn ${index + 1}: ${event.title}`} onClick={() => goTo(`trace-chapter-${index}`)}>{number(index + 1)}</button>)}</nav>
            <p className="trace-stage-hint">Cuộn để lật sang công đoạn tiếp theo <ArrowDown size={14} /></p>
          </aside>
          <div className="trace-chapter-list">{events.map((event, index) => <section className={`trace-chapter${active === index ? ' is-active' : ''}`} key={event._id || index} id={`trace-chapter-${index}`} data-chapter={index} aria-labelledby={`trace-chapter-title-${index}`}>
            <div className="trace-chapter-copy" data-reveal>
              <div className="trace-chapter-meta"><span className="trace-chapter-counter">{number(index + 1)}</span><time dateTime={event.date}>{dateLabel(event.date)}</time><span className="trace-chapter-dash" /></div>
              <h3 id={`trace-chapter-title-${index}`}>{event.title}</h3>
              <p>{event.note}</p>
              <div className="trace-chapter-photos">{(event.images || []).map((src, imageIndex) => <a key={`${src}-${imageIndex}`} href={src} target="_blank" rel="noopener noreferrer" aria-label={`Xem ảnh ${imageIndex + 1} của công đoạn ${event.title}`}>
                <ArtImage src={src} alt={`${event.title} · Ảnh ${imageIndex + 1}`} loading="lazy" /><span><ArrowUpRight size={15} /> Xem ảnh</span>
              </a>)}</div>
              <span className="trace-chapter-end">{index === events.length - 1 ? 'MỐC MỚI NHẤT TRONG NHẬT KÝ' : 'CÂU CHUYỆN TIẾP TỤC'}<span aria-hidden="true">✳</span></span>
            </div>
          </section>)}</div>
        </div> : <div className="trace-no-events" data-reveal><FolkFlower /><h3>Những dấu tay đang được viết tiếp.</h3><p>Xưởng chưa đăng mốc nhật ký cho lô tranh này. Bạn có thể quay lại để theo dõi câu chuyện.</p></div>}
      </div>
    </section>

    <section className="trace-maker trace-shell" aria-labelledby="trace-maker-title">
      <div className="trace-maker-emblem" data-reveal data-ambient><FolkFlower /><span>NGƯỜI<br /><em>giữ nghề.</em></span></div>
      <div className="trace-maker-copy" data-reveal><span className="trace-kicker">CÂU CHUYỆN ĐƯỢC GỬI TỪ</span><h2 id="trace-maker-title">{workshop.name || 'Không gian làm nghề'}</h2><p>{getWorkshopStoryExcerpt(workshop.story) || 'Một không gian làm nghề, nơi những câu chuyện được lưu lại qua từng bản in.'}</p>
        {workshop._id && <a className="trace-text-link" href={`#/xuong/${workshop._id}`} target="_blank" rel="noopener noreferrer">Ghé thăm không gian xưởng <ArrowUpRight size={17} /></a>}
      </div>
    </section>

    <section className="trace-screening" id="trace-screening" aria-labelledby="trace-screening-title" data-ambient>
      <FolkCloud className="trace-screening-cloud" />
      <div className="trace-shell trace-screening-grid">
        <div className="trace-screening-copy" data-reveal><span className="trace-kicker">03 / KHI TRANH KỂ CHUYỆN</span><h2 id="trace-screening-title">Nét mộc<br /><em>bước khỏi giấy.</em></h2><p>Dừng lại một chút để ngắm <strong>{product.name || 'bức tranh'}</strong> theo một cách khác. Những nhân vật và nét vẽ dân gian có thể tiếp tục câu chuyện của mình trong chuyển động.</p>
          <span className="trace-screening-note"><span aria-hidden="true">✳</span> GÓC THƯỞNG TRANH & HOẠT HỌA</span>
          <button type="button" className="trace-back-top" onClick={() => goTo('trace-top')}>Đọc lại từ đầu <ArrowUp size={15} /></button>
        </div>
        <div className="trace-screening-player" data-reveal><ArtworkFilm product={product} motion={motion} /></div>
      </div>
    </section>

    <section className="trace-closing" aria-labelledby="trace-closing-title" data-ambient>
      <FolkCloud className="trace-closing-cloud" />
      <div className="trace-shell trace-closing-main">
        <div className="trace-closing-visual" data-reveal>
          <div className="trace-closing-orbit"><ImprintOrbit className="trace-closing-imprint" /></div>
          <span>ĐƯỢC KỂ BẰNG NHỮNG DẤU TAY</span>
        </div>
        <div className="trace-closing-copy" data-reveal>
          <span className="trace-kicker">KHÉP LẠI MỘT HÀNH TRÌNH</span>
          <h2 id="trace-closing-title">Mực in đã khô.<br /><em>Câu chuyện còn ở lại.</em></h2>
          <svg className="trace-closing-brush" viewBox="0 0 300 26" fill="none" aria-hidden="true"><path pathLength="1" d="M3 17C83 3 163 6 260 10C279 11 290 13 297 17M15 22C80 12 145 13 210 15" /></svg>
          <p>Cảm ơn bạn đã đi qua câu chuyện của <strong>{product.name || 'lô tranh này'}</strong>.<br />Từ <strong>{workshop.name || 'người làm nghề'}</strong>, một nét mộc được gửi đến bạn.</p>
          <button type="button" className="trace-closing-restart" onClick={() => goTo('trace-top')}><span><ArrowUp size={18} /></span>Đọc lại câu chuyện</button>
        </div>
      </div>
      <div className="trace-colophon trace-shell"><span>HỒ SƠ LÔ TRANH · {batch.code}</span><span>Nhật ký và hình ảnh do xưởng cung cấp.{isDemo ? ' Lô hiện tại là dữ liệu minh họa.' : ''}</span><span aria-hidden="true">✳</span></div>
      {hasProcessIllustration && <p className="trace-art-credit trace-shell">Ảnh tư liệu in tranh (cắt khung khi hiển thị): <a href="https://commons.wikimedia.org/wiki/File:Kreado_de_pentra%C4%B5o_en_vila%C4%9Do_%C4%90%C3%B4ng_H%E1%BB%93_01.jpg" target="_blank" rel="noopener noreferrer">RG72 / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>.</p>}
    </section>
  </article>;
}
