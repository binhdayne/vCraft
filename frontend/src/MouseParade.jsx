import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import './mouse-parade.css';

export function MouseParade() {
  const container = useRef(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    const visibility = () => setTabVisible(!document.hidden);
    update();
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const running = visible && tabVisible && !reduced && !paused;
  return <section ref={container} className={`mouse-parade${running ? ' is-running' : ''}${reduced ? ' is-reduced' : ''}`} aria-label="Đoàn chuột Đông Hồ">
    <div className="mouse-parade-track" aria-hidden="true">
      <div className="mouse-parade-troupe">
        <img src={running ? '/animation/mice-running.webp' : '/animation/mice-still.webp'} width="720" height="354" alt="" draggable="false" />
      </div>
    </div>
    {!reduced && <button className="mouse-parade-toggle" type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Tiếp tục chuyển động đàn chuột' : 'Tạm dừng chuyển động đàn chuột'} aria-pressed={paused}>
      {paused ? <Play size={14}/> : <Pause size={14}/>}<span>{paused ? 'Tiếp tục' : 'Tạm dừng'}</span>
    </button>}
  </section>;
}
