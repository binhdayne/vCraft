import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Feather, List, RotateCcw } from 'lucide-react';
import { StudioRosette } from './profile-media';
import { buildStoryPages, parseWorkshopStory } from './story-book.mjs';
import './workshop-story-book.css';

export function WorkshopStoryBook({ studio, motion = true }) {
  const book = useMemo(() => parseWorkshopStory(studio.story, studio.name), [studio.story, studio.name]);
  const [single, setSingle] = useState(() => matchMedia('(max-width: 900px)').matches);
  const { pages, chapters } = useMemo(() => buildStoryPages(book, single ? 480 : 720), [book, single]);
  const [current, setCurrent] = useState(0), [turn, setTurn] = useState(null);
  const root = useRef(null), contents = useRef(null), timer = useRef(null), pending = useRef(null), pointer = useRef(null);
  const view = useRef(null), layoutAnchor = useRef(null);
  view.current = { pages, current };
  const bookId = useId(), step = single ? 1 : 2, last = Math.floor((pages.length - 1) / step) * step;
  const currentPage = pages[current], busy = !!turn;
  function complete() {
    clearTimeout(timer.current);
    if (pending.current) setCurrent(pending.current.to);
    pending.current = null; setTurn(null);
  }
  function go(destination) {
    if (pending.current) return;
    const target = Math.max(0, Math.min(last, Math.floor(destination / step) * step));
    if (target === current) return;
    if (contents.current) contents.current.open = false;
    if (!motion) { setCurrent(target); return; }
    const next = { from: current, to: target, direction: target > current ? 'next' : 'previous' };
    pending.current = next; setTurn(next); timer.current = setTimeout(complete, 790);
  }
  useEffect(() => {
    const media = matchMedia('(max-width: 900px)');
    const resize = () => {
      clearTimeout(timer.current);
      const index = pending.current?.to ?? view.current.current;
      layoutAnchor.current = view.current.pages[index];
      pending.current = null; setTurn(null); setSingle(media.matches);
    };
    media.addEventListener('change', resize);
    return () => { media.removeEventListener('change', resize); clearTimeout(timer.current); };
  }, []);
  useLayoutEffect(() => {
    const anchor = layoutAnchor.current;
    if (!anchor) return;
    let index = pages.findIndex(page => page.type === anchor.type && (anchor.type !== 'chapter' || page.chapterIndex === anchor.chapterIndex && page.part === Math.min(anchor.part, page.parts - 1)));
    if (index < 0) index = 0;
    setCurrent(Math.floor(index / (single ? 1 : 2)) * (single ? 1 : 2));
    layoutAnchor.current = null;
  }, [pages, single]);
  useEffect(() => { if (!motion && pending.current) complete(); }, [motion]);
  useEffect(() => { setCurrent(0); pending.current = null; setTurn(null); clearTimeout(timer.current); }, [book]);
  useEffect(() => {
    const close = event => {
      if (contents.current?.open && !contents.current.contains(event.target)) contents.current.open = false;
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const jump = page => { go(page); root.current?.focus({ preventScroll: true }); };
  const onKeyDown = event => {
    if (event.target.closest('input,textarea,select') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && contents.current?.open) { contents.current.open = false; contents.current.querySelector('summary').focus(); return; }
    const destination = { ArrowRight: current + step, ArrowLeft: current - step, Home: 0, End: last }[event.key];
    if (destination === undefined) return;
    event.preventDefault(); go(destination);
  };
  const onPointerDown = event => {
    if (event.pointerType !== 'touch' || event.target.closest('button,a,summary')) return;
    pointer.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = event => {
    const start = pointer.current; pointer.current = null;
    if (!start || Math.abs(event.clientY - start.y) > 45 || Math.abs(event.clientX - start.x) < 55) return;
    go(current + (event.clientX < start.x ? step : -step));
  };
  const pageProps = { book, chapters, studio, count: pages.length, jump };
  const left = turn ? turn.direction === 'next' ? turn.from : turn.to : current;
  const right = turn ? turn.direction === 'next' ? turn.to + 1 : turn.from + 1 : current + 1;
  const leafFront = turn && (single ? turn.direction === 'next' ? turn.from : turn.to : turn.direction === 'next' ? turn.from + 1 : turn.from);
  const leafBack = turn && (turn.direction === 'next' ? turn.to : turn.to + 1);

  if (!studio.story?.trim()) return <div className="sb-empty"><BookOpen size={38} strokeWidth={1} /><h3>Những trang đầu đang được viết.</h3><p>Xưởng chưa chia sẻ câu chuyện làm nghề của mình.</p></div>;

  return <div className="sb-reader" ref={root} tabIndex={0} role="region" aria-label={`Sách câu chuyện ${studio.name}`} onKeyDown={onKeyDown} data-single={single} data-turning={busy}>
    <div className="sb-toolbar"><span className="sb-edition"><Feather size={16} />{chapters.length} chương{book.fictional && <span>Truyện hư cấu minh họa</span>}</span>
      <details className="sb-toc" ref={contents}><summary><List size={17} /> Mục lục</summary><nav aria-label="Mục lục câu chuyện xưởng"><button type="button" onClick={() => jump(0)} disabled={busy}><span>Bìa sách</span></button>{chapters.map(chapter => <button type="button" disabled={busy} key={chapter.index} onClick={() => jump(chapter.page)} aria-current={currentPage?.chapterIndex === chapter.index ? 'page' : undefined}><small>{chapter.period || 'Chương ' + (chapter.index + 1)}</small><span>{chapter.title}</span></button>)}</nav></details>
    </div>
    <div className="sb-desk"><StudioRosette className="sb-desk-rosette" /><div className="sb-book-wrap">
      <div className="sb-ribbon" aria-hidden="true" />
      <div className="sb-spread" id={bookId} aria-busy={busy} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointer.current = null; }}>
        {/* Reserve the tallest page at this width so turns never move the controls
            or change the document's scroll position. These copies cannot be read
            by assistive technology or receive keyboard/pointer interaction. */}
        <div className="sb-page-sizer" aria-hidden="true" inert>
          {pages.map((page, index) => <StoryPage key={index} page={page} index={index} side={single ? 'single' : 'left'} decorative {...pageProps} />)}
        </div>
        {single ? <StoryPage page={pages[turn ? turn.direction === 'next' ? turn.to : turn.from : current]} index={turn ? turn.direction === 'next' ? turn.to : turn.from : current} side="single" {...pageProps} /> : <>
          <StoryPage page={pages[left]} index={left} side="left" {...pageProps} />
          <StoryPage page={pages[right]} index={right} side="right" {...pageProps} />
          <span className="sb-gutter" aria-hidden="true" />
        </>}
        {turn && <div className={'sb-turn-leaf sb-turn-' + turn.direction} aria-hidden="true" inert onAnimationEnd={event => { if (event.target === event.currentTarget) complete(); }}>
          <div className="sb-leaf-front"><StoryPage page={pages[leafFront]} index={leafFront} side={single ? 'single' : turn.direction === 'next' ? 'right' : 'left'} decorative {...pageProps} /></div>
          {!single && <div className="sb-leaf-back"><StoryPage page={pages[leafBack]} index={leafBack} side={turn.direction === 'next' ? 'left' : 'right'} decorative {...pageProps} /></div>}
        </div>}
      </div>
    </div></div>
    <nav className="sb-pagination" aria-label="Lật trang sách"><button type="button" aria-label="Lật về trang trước" aria-controls={bookId} disabled={busy || current === 0} onClick={() => go(current - step)}><ChevronLeft size={19} /><span>Trang trước</span></button>
      <div className="sb-position"><span role="status" aria-live="polite" aria-atomic="true">Trang {current + 1}{!single && current + 1 < pages.length ? '–' + (current + 2) : ''} / {pages.length}</span><div className="sb-progress" aria-hidden="true"><span style={{ width: `${Math.min(100, (current + step) / pages.length * 100)}%` }} /></div></div>
      <button type="button" aria-label="Lật sang trang tiếp" aria-controls={bookId} disabled={busy || current >= last} onClick={() => go(current + step)}><span>Trang tiếp</span><ChevronRight size={19} /></button>
    </nav>
    <p className="sb-reading-hint">Chạm nút để lật trang, hoặc dùng phím trái / phải khi đang chọn quyển sách.{single && ' Bạn cũng có thể vuốt ngang trang.'}</p>
  </div>;
}

function StoryPage({ page, index, side, book, chapters, studio, count, jump, decorative = false }) {
  if (!page) return <div className={'sb-page sb-page-' + side + ' sb-blank'} aria-hidden="true"><StudioRosette /><span>MỘT XƯỞNG · MỘT CÂU CHUYỆN</span></div>;
  return <section className={`sb-page sb-page-${side} sb-page-${page.type}`} aria-label={`Trang ${index + 1}: ${page.title}`}>
    <div className="sb-page-running"><span>{studio.name}</span><Feather size={13} /></div>
    {page.type === 'cover' ? <div className="sb-cover-content"><span className="sb-cover-eyebrow">CHUYỆN MỘT NHÀ LÀM TRANH</span><StudioRosette className="sb-cover-ornament" /><h3>{book.title}</h3>{book.introduction.map((text, i) => <p key={i}>{text}</p>)}<button type="button" className="sb-open-book" disabled={decorative} onClick={() => jump(chapters[0]?.page ?? 1)}><BookOpen size={17} /> Mở câu chuyện</button><span className="sb-cover-imprint">ĐÔNG HỒ · VCRAFT</span></div>
      : page.type === 'contents' ? <div className="sb-contents-content"><span className="sb-page-kicker">MỤC LỤC</span><h3>Những trang chuyện.</h3><ol>{chapters.map(chapter => <li key={chapter.index}><button type="button" disabled={decorative} onClick={() => jump(chapter.page)}><span><small>{chapter.period || 'Chương ' + (chapter.index + 1)}</small><strong>{chapter.title}</strong></span><span className="sb-toc-page">{chapter.page + 1}</span></button></li>)}</ol></div>
      : page.type === 'end' ? <div className="sb-end-content"><StudioRosette /><span className="sb-page-kicker">GẤP SÁCH, GIỮ LẠI MỘT ĐIỀU</span><h3>Câu chuyện còn<br /><em>được viết tiếp.</em></h3><p>Những người làm nghề tiếp tục lưu lại hành trình của mình, qua từng bản in và từng lần gặp gỡ.</p>{book.fictional && <p className="sb-fiction-note">{book.note}</p>}<button type="button" className="sb-open-book" disabled={decorative} onClick={() => jump(0)}><RotateCcw size={16} /> Đọc lại từ đầu</button></div>
      : <div className="sb-chapter-content"><div className="sb-chapter-meta"><span>{page.period || 'CÂU CHUYỆN CỦA XƯỞNG'}</span><span>Chương {page.chapterIndex + 1}{page.part > 0 && ' · tiếp'}</span></div><h3>{page.title}</h3><span className="sb-chapter-rule" /><div className={'sb-prose' + (page.part === 0 ? ' sb-dropcap' : '')}>{page.paragraphs.length ? page.paragraphs.map((text, i) => <p key={i}>{text}</p>) : <p>Trang chuyện đang được xưởng viết tiếp.</p>}</div>{page.parts > 1 && <span className="sb-part">{page.part + 1} / {page.parts} trang của chương</span>}</div>}
    <div className="sb-page-folio"><span>{book.fictional ? 'TRUYỆN HƯ CẤU MINH HỌA' : 'CÂU CHUYỆN DO XƯỞNG CHIA SẺ'}</span><span>{index + 1} <i>/ {count}</i></span></div>
  </section>;
}
