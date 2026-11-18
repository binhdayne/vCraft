import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bell, Check, CheckCheck, CheckCircle2, ClipboardList, Download, LoaderCircle, Megaphone, QrCode, RefreshCw, X } from 'lucide-react';
import { api } from './shared';
import './notifications.css';

function timeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa cập nhật';
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (!minutes) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
}

export function NotificationBell({ user, onOpen, closeSignal }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [readingAll, setReadingAll] = useState(false);
  const [position, setPosition] = useState({ top: 110, right: 12 });
  const button = useRef(null), panel = useRef(null), request = useRef(null), currentPage = useRef(1), reading = useRef(new Set());
  const panelId = useId();
  const location = useLocation();

  const load = useCallback(async (page = 1) => {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setLoading(true);
    try {
      const result = await api(`/notifications?page=${page}&limit=20&unreadOnly=${filter === 'unread'}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setItems(current => page === 1 ? result.items : [...new Map([...current, ...result.items].map(item => [item.key, item])).values()]);
      setUnreadCount(result.unreadCount); setHasMore(result.hasMore); currentPage.current = page; setError('');
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message || 'Chưa tải được thông báo.');
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, [filter]);

  useEffect(() => {
    setItems([]); void load();
    const refresh = () => { if (!document.hidden) void load(); };
    const timer = setInterval(refresh, 20000);
    window.addEventListener('focus', refresh);
    window.addEventListener('vcraft:updated', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      request.current?.abort(); clearInterval(timer);
      window.removeEventListener('focus', refresh); window.removeEventListener('vcraft:updated', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [load]);

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => { if (closeSignal) setOpen(false); }, [closeSignal]);
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = button.current.getBoundingClientRect();
    const width = Math.min(420, innerWidth - 24);
    setPosition({ top: anchor.bottom + 12, right: Math.min(Math.max(12, innerWidth - anchor.right), Math.max(12, innerWidth - width - 12)) });
    const openedAt = { x: window.scrollX, y: window.scrollY };
    panel.current?.focus({ preventScroll: true });
    const close = () => setOpen(false);
    const scroll = () => { if (Math.abs(window.scrollY - openedAt.y) > 2 || Math.abs(window.scrollX - openedAt.x) > 2) close(); };
    const outside = event => { if (!button.current?.contains(event.target) && !panel.current?.contains(event.target)) close(); };
    const keyboard = event => {
      if (event.key === 'Escape') { close(); button.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keyboard);
    window.addEventListener('resize', close); window.addEventListener('scroll', scroll);
    return () => {
      document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard);
      window.removeEventListener('resize', close); window.removeEventListener('scroll', scroll);
    };
  }, [open]);

  async function markRead(item) {
    if (item.readAt || reading.current.has(item.key)) return;
    reading.current.add(item.key);
    try {
      await api('/notifications/' + encodeURIComponent(item.key) + '/read', { method: 'PATCH' });
      setItems(current => current.map(entry => entry.key === item.key ? { ...entry, readAt: new Date().toISOString() } : entry)
        .filter(entry => filter !== 'unread' || !entry.readAt));
      setUnreadCount(value => Math.max(0, value - 1));
    } catch (failure) { setError(failure.message); }
    finally { reading.current.delete(item.key); }
  }

  async function readAll() {
    setReadingAll(true);
    try { await api('/notifications/read-all', { method: 'PATCH' }); await load(); }
    catch (failure) { setError(failure.message); }
    finally { setReadingAll(false); }
  }

  const navigate = item => { void markRead(item); setOpen(false); };
  return <div className="notification-shell">
    <button ref={button} type="button" className="notification-toggle" aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
      aria-expanded={open} aria-controls={panelId} title="Thông báo" onClick={() => {
        if (!open) { onOpen?.(); void load(); } setOpen(value => !value);
      }}>
      <Bell size={20} />{unreadCount > 0 && <span className="notification-count" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
    {open && createPortal(<section id={panelId} ref={panel} className="notification-panel" role="dialog" aria-label="Thông báo của bạn" tabIndex={-1}
      style={{ '--notifications-top': `${position.top}px`, right: `${position.right}px` }}>
      <div className="notification-head"><div><span className="notification-eyebrow">GỬI ĐẾN {user.role === 'artisan' ? 'XƯỞNG CỦA BẠN' : 'BẠN'}</span><h2>Thông báo <span>{unreadCount}</span></h2></div>
        <button type="button" className="notification-close" aria-label="Đóng thông báo" onClick={() => { setOpen(false); button.current?.focus(); }}><X size={19} /></button></div>
      <div className="notification-toolbar"><div className="notification-filters">
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</button>
        <button type="button" aria-pressed={filter === 'unread'} onClick={() => setFilter('unread')}>Chưa đọc</button></div>
        <button type="button" className="notification-read-all" disabled={!unreadCount || readingAll} onClick={readAll}><CheckCheck size={15} />{readingAll ? 'Đang lưu…' : 'Đọc tất cả'}</button></div>
      {error && <div className="notification-error" role="alert"><span>{error}</span><button type="button" onClick={() => load()}><RefreshCw size={14} /> Thử lại</button></div>}
      <div className="notification-list" aria-busy={loading}>
        {loading && !items.length && <div className="notification-empty" role="status"><LoaderCircle className="spin" size={23} /><p>Đang tải thông báo…</p></div>}
        {!loading && !error && !items.length && <div className="notification-empty"><Bell size={27} strokeWidth={1.2} /><h3>{filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo'}</h3><p>Tiến độ đơn hàng và tin từ BQL sẽ xuất hiện tại đây.</p></div>}
        {items.map(item => <NotificationItem key={item.key} item={item} onRead={() => markRead(item)} onNavigate={() => navigate(item)} />)}
        {hasMore && <button type="button" className="notification-more" disabled={loading} onClick={() => load(currentPage.current + 1)}>{loading ? 'Đang tải…' : 'Xem thông báo trước'}</button>}
      </div>
    </section>, document.body)}
  </div>;
}

function NotificationItem({ item, onRead, onNavigate }) {
  const [qrOpen, setQrOpen] = useState(false), [qrError, setQrError] = useState(false), [retry, setRetry] = useState(0);
  const Icon = item.type === 'announcement' ? Megaphone : item.type === 'batch' ? CheckCircle2 : ClipboardList;
  const qrUrl = item.batchId ? '/api/v1/trace/' + item.batchId + '/qr' : '';
  return <article className={`notification-entry${item.readAt ? '' : ' is-unread'}`}>
    <span className={`notification-icon notification-icon-${item.type}`}><Icon size={18} strokeWidth={1.6} /></span>
    <div className="notification-content"><div className="notification-title"><Link to={item.path} onClick={onNavigate}>{item.title}</Link>
      {!item.readAt && <button type="button" className="notification-mark-read" aria-label={`Đánh dấu đã đọc: ${item.title}`} title="Đánh dấu đã đọc" onClick={onRead}><Check size={14} /></button>}</div>
      <p>{item.message}</p>
      <div className="notification-meta">{item.workshopName && <span>{item.workshopName}</span>}<time dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString('vi-VN')}>{timeLabel(item.createdAt)}</time></div>
      <div className="notification-actions"><Link to={item.path} onClick={onNavigate}>{item.type === 'announcement' ? 'Đọc thông báo' : 'Xem đơn'} <ArrowUpRight size={12} /></Link>
        {item.traceAvailable && <>
          <a href={'/#/trace/' + item.batchId} target="_blank" rel="noopener noreferrer" onClick={onRead}>Landing page <ArrowUpRight size={12} /></a>
          <button type="button" aria-expanded={qrOpen} onClick={() => { setQrOpen(value => !value); void onRead(); }}><QrCode size={13} />{qrOpen ? 'Ẩn QR' : 'Xem QR'}</button>
          <a href={qrUrl} download={'QR-' + item.batchCode + '.png'} onClick={onRead} aria-label={'Tải QR lô ' + item.batchCode} title="Tải mã QR"><Download size={14} /></a>
        </>}
      </div>
      {item.batchId && !item.traceAvailable && <span className="notification-trace-unavailable">Trang truy xuất hiện chưa công khai.</span>}
      {item.traceAvailable && qrOpen && <div className="notification-qr">
        {qrError ? <div role="alert"><p>Chưa tải được mã QR.</p><button type="button" onClick={() => { setQrError(false); setRetry(value => value + 1); }}>Tải lại QR</button></div>
          : <a href={'/#/trace/' + item.batchId} target="_blank" rel="noopener noreferrer" aria-label={'Mở landing page lô ' + item.batchCode}><img src={qrUrl + (retry ? '?retry=' + retry : '')} width="160" height="160" alt={'Mã QR lô ' + item.batchCode} onError={() => setQrError(true)} /></a>}
        <span>{item.batchCode}</span><small>Quét để xem câu chuyện của lô tranh</small>
      </div>}
    </div>
  </article>;
}
