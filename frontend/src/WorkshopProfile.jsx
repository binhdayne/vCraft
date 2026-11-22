import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, Camera, Clock, ImagePlus, Leaf, MapPin, Navigation, Palette, Pause, Play, ShieldCheck, Sparkles, ZoomIn } from 'lucide-react';
import { ArtworkCard, LoadState, Pagination, useApp, useLoad } from './shared';
import { buildCatalogQuery } from './lib/catalog';
import { googleDirectionsUrl, hasCoordinates } from './maps/map-settings.mjs';
import { StudioLotus, StudioRosette, WorkshopImage, WorkshopLightbox } from './workshops/profile-media';
import './workshop-profile.css';

export function WorkshopProfile() {
  const { id } = useParams();
  const state = useLoad('/workshops/' + id);
  const [page, setPage] = useState(1);
  const products = useLoad('/products?' + buildCatalogQuery({ workshopId: id, page, limit: 8 }));
  if (!state.data) return <section className="wrap page"><Link className="back-link" to="/xuong">Nghệ nhân & xưởng</Link><LoadState {...state} retry={state.reload} /></section>;
  return <StudioProfile key={id} studio={state.data} products={products} page={page} onPageChange={setPage} />;
}

function StudioProfile({ studio: s, products, page, onPageChange }) {
  const root = useRef(null);
  const { user } = useApp();
  const photos = useMemo(() => [...new Set(s.images || [])].slice(0, 8), [s.images]);
  const certificates = useMemo(() => [...new Set(s.certificates || [])].slice(0, 8), [s.certificates]);
  const owned = useMemo(() => new Set(s.ownerPhotos || []), [s.ownerPhotos]);
  const [lightbox, setLightbox] = useState(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [fullStory, setFullStory] = useState(false);
  const paragraphs = (s.story || '').split(/\n\s*\n/).filter(text => text.trim());
  const longStory = (s.story || '').length > 1800;
  const storyParts = longStory && !fullStory ? (s.story.slice(0, 1100).trim() + '…').split(/\n\s*\n/).filter(text => text.trim()) : paragraphs;
  const isOwner = user?.role === 'artisan' && user.id === s.ownerId;
  const caption = src => owned.has(src) ? 'Ảnh do chủ xưởng chia sẻ' : 'Ảnh tư liệu trong hồ sơ xưởng';
  const scrollTo = key => document.getElementById(key)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  const openPhotos = index => setLightbox({ photos, index, title: s.name, captions: photos.map(caption) });
  useEffect(() => {
    const previous = document.title;
    document.title = `${s.name} · Không gian làm nghề | vCraft`;
    return () => { document.title = previous; };
  }, [s.name]);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    root.current.querySelectorAll('[data-sp-reveal]').forEach(element => observer.observe(element));
    root.current.dataset.ready = 'true';
    return () => observer.disconnect();
  }, []);

  return <article className="studio-profile" ref={root} data-motion={paused || reduced ? 'paused' : 'on'}>
    <section className="sp-hero">
      <div className="sp-grain" aria-hidden="true" /><StudioLotus className="sp-hero-lotus" />
      <div className="sp-shell">
        <div className="sp-topline"><Link to="/xuong">Nghệ nhân & xưởng <span>/ {s.name}</span></Link>
          <button type="button" className="sp-motion-toggle" disabled={reduced} onClick={() => setPaused(value => !value)} aria-label={reduced ? 'Đã giảm chuyển động theo thiết bị' : paused ? 'Bật chuyển động hồ sơ xưởng' : 'Tạm dừng chuyển động hồ sơ xưởng'}>
            {paused || reduced ? <Play size={14} /> : <Pause size={14} />}<span>{reduced ? 'Đã giảm chuyển động' : paused ? 'Bật chuyển động' : 'Tạm dừng chuyển động'}</span></button></div>
        <div className="sp-hero-grid">
          <div className="sp-hero-copy">
            <div className="sp-overline"><span /> MỘT KHÔNG GIAN GIỮ NGHỀ</div>
            <h1>{s.name}</h1>
            <div className="sp-verified"><ShieldCheck size={16} /><span>Hồ sơ xưởng đã được BQL duyệt</span></div>
            <p className="sp-intro">Nơi những câu chuyện được kể bằng bàn tay,<br className="sp-wide-only" /> và nét mộc được gửi vào từng bản tranh.</p>
            <div className="sp-hero-address"><MapPin size={18} /><span>{s.address || 'Xưởng đang cập nhật địa chỉ'}</span></div>
            <div className="sp-hero-actions"><button type="button" className="sp-button sp-button-cream" onClick={() => scrollTo('sp-story')}><BookOpen size={17} /> Câu chuyện của xưởng</button>
              <button type="button" className="sp-button sp-button-line" onClick={() => scrollTo('sp-gallery')}><Camera size={17} /> Xem ảnh xưởng{photos.length > 0 && <span>{photos.length}</span>}</button></div>
            <div className="sp-categories">{(s.categories || []).map(category => <span key={category}>{category}</span>)}</div>
          </div>
          <div className={'sp-visual' + (!photos.length ? ' is-empty' : '')}>
            <StudioRosette className="sp-visual-halo" /><div className="sp-cover-back" aria-hidden="true" />
            {photos.length ? <>
              <button type="button" className={'sp-cover' + (!owned.has(photos[0]) ? ' is-reference' : '')} onClick={() => openPhotos(0)} aria-label="Xem ảnh bìa xưởng phóng lớn">
                <WorkshopImage src={photos[0]} alt={`Ảnh bìa ${s.name}`} fetchPriority="high" />
                <span className="sp-cover-zoom"><ZoomIn size={17} /><span>Xem ảnh lớn</span></span>
              </button>
              {photos.length > 1 && <button type="button" className="sp-inset-photo" onClick={() => openPhotos(1)} aria-label="Xem ảnh thứ hai của xưởng phóng lớn"><WorkshopImage src={photos[1]} alt={`Một góc nhìn khác từ ${s.name}`} loading="lazy" /></button>}
              <div className="sp-cover-caption"><span>{caption(photos[0])}</span><span>ĐÔNG HỒ · VCRAFT</span></div>
            </> : <div className="sp-cover-placeholder"><StudioRosette /><span>MỘT NÉT MỘC<br /><em>Một câu chuyện.</em></span><p>Xưởng đang chuẩn bị những hình ảnh đầu tiên.</p></div>}
            <div className="sp-seal" aria-hidden="true"><span>ĐÔNG</span><span>HỒ</span></div>
          </div>
        </div>
      </div>
      <div className="sp-hero-bottom sp-shell"><span>GẶP NGƯỜI LÀM NGHỀ, HIỂU THÊM MỘT NÉT TRANH.</span><Leaf size={18} /></div>
    </section>

    <section className="sp-facts sp-shell" aria-label="Thông tin xưởng">
      <div><Camera size={20} /><strong>{photos.length}</strong><span>hình ảnh trong hồ sơ</span></div>
      <div><Palette size={20} /><strong>{products.data?.total ?? '—'}</strong><span>tác phẩm tại xưởng</span></div>
      <div><Clock size={20} /><strong>{s.openForVisits ? 'Đón khách' : 'Hẹn trước'}</strong><span>{s.visitingHours || 'Liên hệ xưởng trước khi ghé'}</span></div>
    </section>

    <section className="sp-story sp-shell" id="sp-story">
      <div className="sp-story-heading" data-sp-reveal><span className="sp-kicker">CÂU CHUYỆN NGƯỜI GIỮ NGHỀ</span><h2>Phía sau<br />{' '}một <em>nét mộc.</em></h2><StudioRosette className="sp-story-rosette" /></div>
      <div className="sp-story-copy" data-sp-reveal>
        <span className="sp-story-name">{s.name}</span>
        {storyParts.length ? storyParts.map((paragraph, i) => <p key={i}>{paragraph}</p>) : <p>Xưởng đang cập nhật câu chuyện làm nghề của mình.</p>}
        {longStory && <button className="sp-text-button" type="button" onClick={() => setFullStory(value => !value)}>{fullStory ? 'Thu gọn câu chuyện' : 'Đọc trọn câu chuyện'}</button>}
        <div className="sp-story-signature"><span /> Những câu chuyện do chính xưởng kể.</div>
      </div>
    </section>

    <section className="sp-gallery-section" id="sp-gallery">
      <StudioLotus className="sp-gallery-lotus" />
      <div className="sp-shell"><div className="sp-section-heading" data-sp-reveal><div><span className="sp-kicker">MỘT GÓC NHÌN GẦN HƠN</span><h2>Hình ảnh <em>từ xưởng.</em></h2></div><p>Khám phá những hình ảnh được xưởng<br className="sp-wide-only" /> lưu lại và chia sẻ trong hồ sơ.</p></div>
        {photos.length ? <div className={`sp-gallery sp-gallery-${Math.min(photos.length, 3)}`}>
          {photos.map((src, i) => <button type="button" className={'sp-gallery-photo' + (!owned.has(src) ? ' is-reference' : '')} key={src} onClick={() => openPhotos(i)} aria-label={`Xem ảnh ${i + 1} của ${s.name} phóng lớn`} data-sp-reveal>
            <WorkshopImage src={src} alt={`${s.name} · ${i === 0 ? 'Ảnh bìa' : 'Ảnh ' + (i + 1)}`} loading="lazy" />
            <span className="sp-photo-caption"><span>{i === 0 ? 'Ảnh bìa' : `Góc nhìn ${String(i + 1).padStart(2, '0')}`}<small>{caption(src)}</small></span><ZoomIn size={19} /></span>
          </button>)}
        </div> : <div className="sp-gallery-empty" data-sp-reveal><Camera size={36} strokeWidth={1} /><h3>Những góc xưởng đang được lưu lại.</h3><p>Chủ xưởng chưa thêm ảnh vào hồ sơ.</p>{isOwner && <Link className="sp-button" to="/workspace"><ImagePlus size={18} /> Thêm ảnh cho xưởng</Link>}</div>}
      </div>
    </section>

    {certificates.length > 0 && <section className="sp-documents sp-shell" data-sp-reveal><div><span className="sp-kicker">HỒ SƠ ĐƯỢC CHIA SẺ</span><h2>Giấy tờ & chứng nhận</h2><p>Tài liệu và hình ảnh chứng nhận được xưởng cung cấp trong hồ sơ.</p></div>
      <div className="sp-document-list">{certificates.map((src, i) => <button key={src} type="button" onClick={() => setLightbox({ photos: certificates, index: i, title: 'Giấy tờ & chứng nhận', captions: certificates.map(() => 'Tài liệu do xưởng cung cấp') })} aria-label={`Xem chứng nhận ${i + 1}`}><WorkshopImage src={src} alt={`Chứng nhận ${i + 1} do xưởng cung cấp`} loading="lazy" /><span>Tài liệu {i + 1}<ZoomIn size={15} /></span></button>)}</div>
    </section>}

    <section className="sp-catalog sp-shell" id="sp-artworks"><div className="sp-section-heading" data-sp-reveal><div><span className="sp-kicker">TỪ VÁN KHẮC ĐẾN BẢN IN</span><h2>Nét tranh <em>tại {s.name}.</em></h2></div><Link className="sp-text-link" to="/tranh">Khám phá bộ sưu tập</Link></div>
      <LoadState {...products} retry={products.reload} />
      {!products.error && products.data && (products.data.items.length ? <><div className="art-grid">{products.data.items.map(product => <ArtworkCard key={product._id} p={product} />)}</div><Pagination page={page} pages={products.data.pages} total={products.data.total} onPageChange={value => { onPageChange(value); scrollTo('sp-artworks'); }} /></> : <div className="sp-no-artworks"><Palette size={28} /><p>Xưởng chưa công khai tác phẩm. Bạn có thể quay lại để xem những bản in mới.</p></div>)}
    </section>

    <section className="sp-visit sp-shell" data-sp-reveal><div className="sp-visit-panel"><StudioRosette className="sp-visit-rosette" /><div className="sp-visit-copy"><span className="sp-kicker">HẸN MỘT CHUYẾN GHÉ THĂM</span><h2>Ghé xưởng,<br /><em>gặp người giữ nghề.</em></h2><p>{s.openForVisits ? 'Xưởng đang đón khách. Xem giờ ghé thăm để sắp xếp chuyến đi của bạn.' : 'Hãy sắp xếp hẹn với xưởng trước khi ghé để có thời gian trò chuyện và thưởng tranh.'}</p></div>
      <div className="sp-visit-details"><div><MapPin size={19} /><p><span>ĐỊA CHỈ XƯỞNG</span>{s.address}</p></div><div><Clock size={19} /><p><span>GIỜ GHÉ THĂM</span>{s.visitingHours}<small>{s.openForVisits ? 'Đang đón khách tham quan' : 'Vui lòng hẹn trước'}</small></p></div>
        <div className="sp-visit-actions"><Link className="sp-button sp-button-cream" to="/ban-do"><MapPin size={17} /> Xem bản đồ làng nghề</Link>{hasCoordinates(s) && <a className="sp-text-link" href={googleDirectionsUrl(s)} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Chỉ đường đến xưởng</a>}</div></div></div>
    </section>
    <div className="sp-colophon sp-shell"><Sparkles size={16} /><span>Mỗi không gian, một câu chuyện. Mỗi nét in, một dấu tay.</span></div>
    {lightbox && <WorkshopLightbox photos={lightbox.photos} initialIndex={lightbox.index} title={lightbox.title} captions={lightbox.captions} onClose={() => setLightbox(null)} />}
  </article>;
}
