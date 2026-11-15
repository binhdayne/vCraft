import { useEffect, useRef, useState } from 'react';
import { Clapperboard, Pause, Play, RotateCcw } from 'lucide-react';
import { findArtworkFilm } from './artwork-films.mjs';
import './artwork-film.css';

export function ArtworkFilm({ product, motion }) {
  const film = findArtworkFilm(product);
  if (film) return <ArtworkPlayer key={film.src} film={film} motion={motion} />;
  return <figure className="trace-film trace-film-pending" aria-label={`Góc thưởng tranh ${product.name || ''}`}>
    <ArtworkStill product={product} />
    <figcaption><strong>{product.name || 'Tác phẩm đang cập nhật'}</strong><p>Chưa có hoạt họa riêng cho tác phẩm này. Bạn vẫn có thể thưởng tranh và đọc nhật ký phía trên.</p></figcaption>
  </figure>;
}

function ArtworkStill({ product }) {
  const [failed, setFailed] = useState(false);
  const src = product.images?.[0];
  useEffect(() => setFailed(false), [src]);
  return <div className="trace-film-still">{src && !failed ? <img src={src} alt={product.name || 'Tác phẩm'} loading="lazy" onError={() => setFailed(true)} /> : <Clapperboard size={44} strokeWidth={1} />}</div>;
}

function ArtworkPlayer({ film, motion }) {
  const container = useRef(null);
  const player = useRef(null);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const [userPaused, setUserPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');
  const shouldPlay = seen && visible && tabVisible && (motion || manual) && !userPaused;

  useEffect(() => { if (!motion) setManual(false); }, [motion]);

  useEffect(() => {
    const video = player.current;
    const visibility = () => setTabVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && entry.intersectionRatio >= .1);
      if (entry.isIntersecting) setSeen(true);
    }, { threshold: [0, .1] });
    observer.observe(container.current);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); video.pause(); };
  }, []);

  useEffect(() => {
    const video = player.current;
    if (!shouldPlay) { video.pause(); return; }
    if (video.error) return;
    let current = true;
    video.play().catch(failure => {
      if (!current || failure.name === 'AbortError') return;
      setBuffering(false);
      if (failure.name === 'NotAllowedError') setBlocked(true);
      else setError('Chưa phát được hoạt họa. Bạn thử tải lại nhé.');
    });
    return () => { current = false; };
  }, [shouldPlay]);

  const resume = () => {
    setUserPaused(false);
    setManual(true);
    setBlocked(false);
    player.current.play().catch(failure => {
      if (failure.name !== 'AbortError') setError('Chưa phát được hoạt họa. Bạn thử tải lại nhé.');
    });
  };
  const toggle = () => { if (playing) setUserPaused(true); else resume(); };
  const retry = () => { setError(''); player.current.load(); resume(); };

  return <figure className="trace-film" ref={container} data-film-key={film.key} aria-label={`Hoạt họa ${film.title}`}>
    <div className="trace-film-screen">
      <video ref={player} src={seen ? film.src : undefined} autoPlay={shouldPlay && !blocked} playsInline muted loop preload="none" poster={film.poster} aria-label={`Hoạt họa tự phát ${film.title}`}
        onPlaying={() => { setPlaying(true); setBuffering(false); setError(''); setBlocked(false); }}
        onPause={() => { setPlaying(false); setBuffering(false); }}
        onWaiting={() => setBuffering(true)} onCanPlay={() => setBuffering(false)}
        onError={() => { setPlaying(false); setBuffering(false); setError('Chưa tải được hoạt họa. Bạn thử tải lại nhé.'); }} />
      {seen && !error && <button type="button" className="trace-film-toggle" onClick={toggle} aria-label={playing ? `Tạm dừng hoạt họa ${film.title}` : `Phát hoạt họa ${film.title}`}>
        {playing ? <Pause size={15} /> : <Play size={15} />}<span>{playing ? 'Tạm dừng' : 'Phát hoạt họa'}</span>
      </button>}
      {buffering && !error && <span className="trace-film-loading" role="status">Đang tải hoạt họa…</span>}
      {error && <div className="trace-film-error" role="alert"><Clapperboard size={28} strokeWidth={1} /><p>{error}</p><button type="button" onClick={retry}><RotateCcw size={14} /> Thử tải lại hoạt họa</button></div>}
    </div>
    <figcaption className="trace-film-description">Hoạt họa minh họa {film.title}, phát lặp, không có âm thanh.</figcaption>
  </figure>;
}
