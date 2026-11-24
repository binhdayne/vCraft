import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowUpRight, Palette, Layers, ClipboardList, Users, Newspaper, Home, Check, Edit3, Trash2, RefreshCw, Send, MapPin, ShieldCheck, X, Landmark, Search, Eye, User, Lock, Mail, Calendar, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { api, useApp, useLoad, LoadState, Empty, Badge, FormDialog, PageTitle, CATEGORIES, STATUS, money, date, ImageUpload, Pagination } from './shared';

import { BatchLandingDialog, BatchPageLinks } from './BatchLandingDialog';
import { ProductionJournal } from './ProductionJournal';
import { WorkshopBidDialog } from './WorkshopBidDialog';
import { ConfirmWorkshopModal } from './ConfirmWorkshopModal';
import { CompletionConfirmModal } from './CompletionConfirmModal';
const field=(name,label,type='text',extra={})=>({name,label,type,...extra});
const quoteFields=[field('title','Tên yêu cầu'),field('category','Phân loại','select',{options:CATEGORIES}),field('quantity','Số lượng bản tranh','number',{min:1,step:1}),field('deadline','Hạn giao hàng','date'),field('description','Mô tả yêu cầu / quy cách','textarea',{wide:true})];
const productFields=[field('name','Tên tranh'),field('category','Phân loại','select',{options:CATEGORIES}),field('price','Giá tham khảo (VNĐ)','number',{min:0}),field('dimensions','Kích thước'),field('material','Chất liệu'),field('published','Công khai sản phẩm','checkbox'),field('description','Câu chuyện bức tranh','textarea',{wide:true}),field('images','Ảnh sản phẩm','images',{wide:true})];
const studioFields=[field('name','Tên xưởng'),field('address','Địa chỉ'),field('location','Vị trí xưởng','map',{wide:true}),field('visitingHours','Giờ đón khách'),field('openForVisits','Mở cửa đón khách','checkbox'),field('story','Câu chuyện gia đình / lịch sử làm nghề','textarea',{wide:true}),field('categories','Phân loại nhận sản xuất','categories',{wide:true}),field('images','Ảnh xưởng (hiển thị trên bản đồ)','images',{wide:true}),field('certificates','Ảnh chứng nhận chất lượng','images',{wide:true,required:false})];
const newsFields=[field('title','Tiêu đề'),field('category','Chuyên mục','select',{options:['Thông báo','Làng nghề','Sự kiện']}),field('body','Nội dung','textarea',{wide:true,maxLength:15000}),field('pictures','Ảnh minh họa','images',{wide:true,required:false}),field('published','Công khai','checkbox')];
const pick=(obj,fields)=>Object.fromEntries(fields.map(f=>[f.name,obj[f.name]??(f.type==='images'||f.type==='categories'?[]:f.type==='checkbox'?false:'')]));
export function Dashboard(){const {user,loading}=useApp(),[tab,setTab]=useState('quotes');if(loading)return <LoadState loading/>;if(!user)return <Navigate to="/dang-nhap" replace/>;const items=user.role==='artisan'?[['quotes','Yêu cầu báo giá',ClipboardList],['studio','Hồ sơ xưởng',Home],['products','Tranh của xưởng',Palette],['batches','Lô tranh & nhật ký',Layers],['account','Hồ sơ tài khoản',UserCheck]]:user.role==='admin'?[['quotes','Thống kê đơn hàng',ClipboardList],['artworks','Quản lý tranh',Landmark],['artisans','Nghệ nhân & xưởng',Users],['users','Quản lý tài khoản',ShieldCheck],['news','Tin tức cộng đồng',Newspaper],['account','Hồ sơ tài khoản',UserCheck]]:[['quotes','Yêu cầu đặt tranh',ClipboardList],['account','Hồ sơ tài khoản',UserCheck]];return <section className="workspace wrap"><aside className="workspace-sidebar"><span className="eyebrow">KHÔNG GIAN LÀM VIỆC</span><h2>{user.name}</h2><span className="role-label">{user.role==='admin'?'Ban quản lý':user.role==='artisan'?'Nghệ nhân':'Khách hàng'}</span><nav>{items.map(([key,label,Icon])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><Icon size={18}/>{label}</button>)}</nav><div className="sidebar-note"><ShieldCheck/><p>Mỗi tác phẩm một câu chuyện. Mỗi đơn hàng một kết nối.</p></div></aside><div className="workspace-content" key={tab}>{tab==='quotes'&&<QuotesList/>}{tab==='studio'&&<StudioEditor/>}{tab==='products'&&<ProductsEditor/>}{tab==='batches'&&<BatchesEditor onOpenQuotes={()=>setTab('quotes')}/>}{tab==='artisans'&&<ArtisansAdmin/>}{(tab==='artworks'||tab==='heritage')&&<ArtworksAdmin/>}{tab==='news'&&<NewsEditor/>}{tab==='users'&&<UsersAdmin/>}{tab==='account'&&<AccountProfile/>}</div></section>;}
function QuotesList(){
  const {user}=useApp(),state=useLoad('/quotes'),studio=useLoad(user.role==='artisan'?'/studio':'/auth/me'),[dialog,setDialog]=useState(false),navigate=useNavigate(),[filter,setFilter]=useState('');
  const myStudioId=user.role==='artisan'?studio.data?._id:null;
  const isMyWorkshopQuote=q=>Boolean(myStudioId&&(q.acceptedWorkshopId===myStudioId||q.allocations?.some(a=>a.workshopId===myStudioId)));
  const isClosedStage=q=>['accepted','in_production','delivered'].includes(q.status);
  const data=(state.data||[]).filter(q=>!filter||q.status===filter);
  const inProdCount=(state.data||[]).filter(q=>q.status==='in_production'&&(user.role!=='artisan'||!myStudioId||isMyWorkshopQuote(q))).length;
  const deliveredCount=(state.data||[]).filter(q=>q.status==='delivered'&&(user.role!=='artisan'||!myStudioId||isMyWorkshopQuote(q))).length;
  return <>
    <PageTitle eyebrow="KẾT NỐI & HỢP TÁC" title={user.role==='buyer'?'Yêu cầu đặt tranh':user.role==='artisan'?'Yêu cầu báo giá':'Điều phối đơn hàng'} action={user.role==='buyer'&&<button className="btn" onClick={()=>setDialog(true)}><Plus size={18}/> Tạo yêu cầu</button>}>Theo dõi chào giá, phân bổ và tiến độ thực hiện.</PageTitle>
    {state.data&&<div className="stats-grid"><div><span>Tổng yêu cầu</span><strong>{state.data.length}</strong></div><div><span>Đang chào giá</span><strong>{state.data.filter(q=>['sent','bidding'].includes(q.status)).length}</strong></div><div><span>{user.role==='artisan'?'Xưởng đang sản xuất':'Đang sản xuất'}</span><strong>{inProdCount}</strong></div><div><span>{user.role==='artisan'?'Xưởng đã giao':'Đã giao'}</span><strong>{deliveredCount}</strong></div></div>}
    <div className="table-toolbar"><select aria-label="Lọc trạng thái đơn" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Mọi trạng thái</option>{Object.entries(STATUS).filter(([k])=>k!=='ready').map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><button className="text-link" onClick={state.reload}><RefreshCw size={16}/> Làm mới</button></div>
    <LoadState {...state}/>
    {state.data&&data.length===0&&<Empty title="Chưa có yêu cầu ở trạng thái này"><p>{user.role==='buyer'?'Bắt đầu bằng ý tưởng và số lượng tranh bạn muốn đặt.':'Yêu cầu phù hợp sẽ xuất hiện tại đây.'}</p></Empty>}
    <div className="quote-list">{data.map(q=>{
      const closed=isClosedStage(q);
      const mineWon=isMyWorkshopQuote(q);
      const otherWon=user.role==='artisan'&&closed&&!mineWon;
      const hasMyBid=Boolean(myStudioId&&q.bids?.some(b=>b.workshopId===myStudioId));
      return (
        <Link to={'/quotes/'+q._id} className={'quote-row '+(otherWon?'quote-row-other-won':'')} key={q._id}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4,flexWrap:'wrap'}}>
              {otherWon?(
                <span className="badge status-other-workshop">Đã giao xưởng khác</span>
              ):(
                <Badge status={q.status}/>
              )}
              {q.targetType==='direct'?<span className="badge-direct-tag">Chỉ định xưởng</span>:<span className="badge-bidding-tag">Đấu thầu</span>}
              {user.role==='artisan'&&mineWon&&<span className="badge-won-tag">Xưởng bạn đảm nhận</span>}
              {user.role==='artisan'&&!closed&&hasMyBid&&<span className="badge-bid-sent">Đã gửi báo giá</span>}
            </div>
            <h3>{q.title}</h3>
            <p>{q.category} · {q.items?.length?`${q.items.length} tác phẩm · `:''}{q.quantity.toLocaleString('vi-VN')} bản · Hạn giao {date(q.deadline)}</p>
          </div>
          <div>
            {otherWon?(
              <span className="quote-row-closed-meta">{hasMyBid?'Không trúng thầu':'Đã đóng chào giá'}</span>
            ):user.role==='artisan'&&mineWon?(
              <strong style={{color:'var(--green)'}}>Đơn của xưởng</strong>
            ):(
              <strong>{q.bids.length} chào giá</strong>
            )}
            <ArrowUpRight size={20}/>
          </div>
        </Link>
      );
    })}</div>
    {dialog&&<FormDialog title="Tạo yêu cầu đặt tranh" fields={quoteFields} initial={{category:CATEGORIES[0],quantity:100,deadline:'',description:'',title:''}} onClose={()=>setDialog(false)} submitLabel="Lưu bản nháp" onSubmit={async body=>{const q=await api('/quotes',{method:'POST',body});navigate('/quotes/'+q._id);}}/>}
  </>;
}
function StudioEditor(){const state=useLoad('/studio'),[edit,setEdit]=useState(false),{notify}=useApp();return <><PageTitle eyebrow="CÂU CHUYỆN CỦA BẠN" title="Hồ sơ xưởng" action={<button className="btn" onClick={()=>setEdit(true)} disabled={!state.data}><Edit3 size={17}/> Chỉnh sửa</button>}/><LoadState {...state}/>{state.data&&<div className="panel"><span className={'badge '+(state.data.approved?'status-delivered':'status-draft')}>{state.data.approved?'Đã được duyệt':'Đang chờ BQL duyệt'}</span><h2>{state.data.name}</h2><p className="prose">{state.data.story}</p><p><MapPin size={16}/> {state.data.address}</p><p>{state.data.visitingHours} · {state.data.openForVisits?'Đang mở cửa':'Hẹn trước'}</p><p className="muted">Ảnh xưởng bạn tải lên và lưu sẽ xuất hiện trong popup bản đồ khi xưởng đã được duyệt. Tối đa 8 ảnh; ảnh minh họa có sẵn không được tính là ảnh do chủ xưởng đăng.</p><div className="event-images">{state.data.images.map((src,i)=><img key={i} src={src} alt="Ảnh xưởng"/>)}</div><p>Phân loại: {state.data.categories.join(' · ')}</p><p>{state.data.certificates.length} ảnh chứng nhận</p></div>}{edit&&state.data&&<FormDialog title="Chỉnh sửa hồ sơ xưởng" fields={studioFields} initial={{...pick(state.data,studioFields),latitude:state.data.latitude??21.0606,longitude:state.data.longitude??106.0813}} onClose={()=>setEdit(false)} onSubmit={async values=>{const {location,...body}=values;await api('/studio',{method:'PATCH',body});state.reload();notify('Đã lưu hồ sơ xưởng');}}/>}</>;}


function ProductsEditor() {
  const [tab, setTab] = useState('heritage');
  const heritageState = useLoad('/studio/workshop-products');
  const customState = useLoad('/studio/products');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editHeritage, setEditHeritage] = useState(null);
  const [editCustom, setEditCustom] = useState(null);
  const [heritagePage, setHeritagePage] = useState(1);
  const [customPage, setCustomPage] = useState(1);
  const { notify } = useApp();

  const PAGE_SIZE = 8;

  async function removeHeritage(item) {
    if (!window.confirm('Xưởng ngừng nhận in tác phẩm “' + (item.product?.name || 'này') + '”?')) return;
    try {
      await api('/studio/workshop-products/' + item._id, { method: 'DELETE' });
      heritageState.reload();
      notify('Đã ngừng nhận in tác phẩm');
    } catch (e) {
      notify(e.message);
    }
  }

  const heritageList = heritageState.data || [];
  const customList = customState.data || [];
  const heritageCount = heritageList.length;
  const customCount = customList.length;

  const heritagePages = Math.ceil(heritageCount / PAGE_SIZE) || 1;
  const pagedHeritage = heritageList.slice((heritagePage - 1) * PAGE_SIZE, heritagePage * PAGE_SIZE);

  const customPages = Math.ceil(customCount / PAGE_SIZE) || 1;
  const pagedCustom = customList.slice((customPage - 1) * PAGE_SIZE, customPage * PAGE_SIZE);

  return (
    <>
      <PageTitle
        eyebrow="TÁC PHẨM & DỊCH VỤ IN ẤN"
        title="Tranh của xưởng"
        action={
          tab === 'heritage' ? (
            <button className="btn" onClick={() => setPickerOpen(true)}>
              <Plus size={18} /> Nhận in Tranh Di sản
            </button>
          ) : (
            <button
              className="btn"
              onClick={() =>
                setEditCustom({
                  category: CATEGORIES[0],
                  price: 250000,
                  material: 'Giấy điệp thủ công, màu tự nhiên',
                  dimensions: '30 × 40 cm',
                  images: [],
                  published: true,
                })
              }
            >
              <Plus size={18} /> Đăng Tranh Độc bản
            </button>
          )
        }
      >
        Quản lý các tác phẩm di sản làng xưởng nhận in và các tác phẩm sáng tạo độc bản riêng của xưởng.
      </PageTitle>

      <div className="workspace-tabs-shell">
        <div className="type-tabs" role="tablist">
          <button
            type="button"
            className={tab === 'heritage' ? 'selected' : ''}
            onClick={() => setTab('heritage')}
          >
            Tranh Di sản đang nhận in ({heritageCount})
          </button>
          <button
            type="button"
            className={tab === 'custom' ? 'selected' : ''}
            onClick={() => setTab('custom')}
          >
            Tranh Độc bản của xưởng ({customCount})
          </button>
        </div>
      </div>

      {tab === 'heritage' && (
        <div className="tab-pane">
          <div className="pane-intro">
            <p>
              Tác phẩm thuộc kho di sản làng Đông Hồ lưu truyền qua nhiều thế hệ. Xưởng của bạn nhận in theo đơn đặt hàng, tự thiết lập mức giá, quy cách bồi tranh và cập nhật ảnh chụp thành phẩm thực tế để khách hàng lựa chọn xưởng của bạn.
            </p>
          </div>
          <LoadState {...heritageState} />
          {heritageState.data && heritageState.data.length === 0 && (
            <Empty title="Chưa có tranh di sản nào trong danh sách nhận in">
              <p>Xưởng chưa đăng ký nhận in tranh di sản nào từ kho làng Đông Hồ.</p>
              <button className="btn" style={{ marginTop: 12 }} onClick={() => setPickerOpen(true)}>
                <Plus size={16} /> Chọn tranh di sản nhận in ngay
              </button>
            </Empty>
          )}
          <div className="management-grid">
            {pagedHeritage.map(item => (
              <article className="manage-card heritage-manage-card" key={item._id}>
                <div className="manage-card-img-wrap">
                  <img
                    src={item.images?.[0] || item.product?.images?.[0]}
                    alt={item.product?.name || 'Tranh di sản'}
                  />
                  <span className={'stock-pill ' + (item.inStock ? 'in-stock' : 'out-of-stock')}>
                    {item.inStock ? 'Sẵn sàng in' : 'Tạm hết phôi'}
                  </span>
                </div>
                <div className="manage-card-content">
                  <div className="card-top-meta">
                    <span className="eyebrow">{item.product?.category || 'Di sản làng'}</span>
                    <span className="meta-dim">{item.product?.dimensions}</span>
                  </div>
                  <h3>{item.product?.name || 'Tranh di sản'}</h3>
                  <div className="card-price-row">
                    <span className="price-label">Giá xưởng in:</span>
                    <strong className="price-value">{money(item.price)}</strong>
                  </div>
                  {item.description ? (
                    <p className="card-desc-snippet">{item.description}</p>
                  ) : (
                    <p className="card-desc-snippet muted">Chưa có ghi chú quy cách riêng của xưởng.</p>
                  )}
                  <div className="manage-card-actions">
                    <button className="btn outline small" onClick={() => setEditHeritage(item)}>
                      <Edit3 size={15} /> Chỉnh sửa
                    </button>
                    <button className="text-link danger small" onClick={() => removeHeritage(item)}>
                      <Trash2 size={15} /> Ngừng nhận in
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            page={heritagePage}
            pages={heritagePages}
            onPageChange={p => {
              setHeritagePage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={heritageCount}
          />
        </div>
      )}

      {tab === 'custom' && (
        <div className="tab-pane">
          <div className="pane-intro">
            <p>
              Tác phẩm sáng tạo riêng biệt, độc bản mang đậm dấu ấn nghệ thuật của xưởng. Tranh sẽ gắn liền với thương hiệu của xưởng và hiển thị nhãn "Độc bản" trong Triển lãm.
            </p>
          </div>
          <LoadState {...customState} />
          {customState.data && customState.data.length === 0 && (
            <Empty title="Chưa có tác phẩm độc bản nào">
              <p>Xưởng chưa đăng tải tranh độc bản nào. Hãy giới thiệu các sáng tác mới của xưởng.</p>
              <button
                className="btn"
                style={{ marginTop: 12 }}
                onClick={() =>
                  setEditCustom({
                    category: CATEGORIES[0],
                    price: 250000,
                    material: 'Giấy điệp thủ công, màu tự nhiên',
                    dimensions: '30 × 40 cm',
                    images: [],
                    published: true,
                  })
                }
              >
                <Plus size={16} /> Đăng tranh độc bản đầu tiên
              </button>
            </Empty>
          )}
          <div className="management-grid">
            {pagedCustom.map(p => {
              const status = p.approvalStatus || 'pending';
              return (
                <article className="manage-card custom-artisan-card" key={p._id}>
                  <div className="manage-card-img-wrap">
                    <img src={p.images?.[0]} alt={p.name} />
                    <span className="custom-tag">Độc bản</span>
                  </div>
                  <div className="manage-card-content">
                    <div className="card-top-meta">
                      <span className="eyebrow">{p.category}</span>
                      <span
                        className={
                          'badge ' +
                          (status === 'approved'
                            ? 'status-delivered'
                            : status === 'rejected'
                            ? 'status-draft'
                            : 'status-bidding')
                        }
                      >
                        {status === 'approved'
                          ? 'Đã duyệt'
                          : status === 'rejected'
                          ? 'Bị từ chối'
                          : 'Chờ duyệt'}
                      </span>
                    </div>
                    <h3>{p.name}</h3>
                    <div className="card-top-meta" style={{ marginBottom: 6 }}>
                      <span className="meta-dim">{p.dimensions}</span>
                    </div>
                    <div className="card-price-row">
                      <span className="price-label">Giá tham khảo:</span>
                      <strong className="price-value">{money(p.price)}</strong>
                    </div>

                    {status === 'approved' && (
                      <p className="card-desc-snippet status-note-approved">
                        {p.published ? 'Đang công khai trên Triển lãm' : 'Tạm ẩn (chưa bật hiển thị)'}
                      </p>
                    )}

                    {status === 'pending' && (
                      <p className="card-desc-snippet status-note-pending">
                        Đang chờ Ban quản lý phê duyệt để xuất hiện trong bộ sưu tập.
                      </p>
                    )}

                    {status === 'rejected' && (
                      <div className="custom-reject-callout">
                        <div className="reject-callout-header">
                          <AlertCircle size={14} />
                          <strong>Lý do từ chối:</strong>
                        </div>
                        <p>{p.rejectedReason || 'Chưa có ghi chú cụ thể. Vui lòng chỉnh sửa lại thông tin.'}</p>
                      </div>
                    )}

                    <div className="manage-card-actions">
                      <button className="btn outline small" onClick={() => setEditCustom(p)}>
                        <Edit3 size={15} /> {status === 'rejected' ? 'Sửa & Gửi duyệt lại' : 'Chỉnh sửa'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination
            page={customPage}
            pages={customPages}
            onPageChange={p => {
              setCustomPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={customCount}
          />
        </div>
      )}

      {pickerOpen && (
        <HeritagePickerModal
          onClose={() => setPickerOpen(false)}
          listedIds={new Set((heritageState.data || []).map(item => String(item.productId)))}
          onSuccess={() => {
            setPickerOpen(false);
            heritageState.reload();
          }}
        />
      )}

      {editHeritage && (
        <FormDialog
          title={'Chỉnh sửa thông tin in: ' + (editHeritage.product?.name || 'Tranh di sản')}
          fields={[
            field('price', 'Giá xưởng nhận in (VNĐ)', 'number', { min: 0, step: 1000 }),
            field('description', 'Quy cách & chất liệu của xưởng', 'textarea', { wide: true }),
            field('images', 'Ảnh chụp thành phẩm thực tế của xưởng', 'images', { wide: true }),
            field('inStock', 'Sẵn sàng in (còn phôi)', 'checkbox'),
          ]}
          initial={{
            price: editHeritage.price,
            description: editHeritage.description || '',
            images: editHeritage.images || (editHeritage.product?.images ? [editHeritage.product.images[0]] : []),
            inStock: editHeritage.inStock ?? true,
          }}
          onClose={() => setEditHeritage(null)}
          onSubmit={async body => {
            await api('/studio/workshop-products/' + editHeritage._id, { method: 'PATCH', body });
            heritageState.reload();
            notify('Đã cập nhật thông tin in tranh');
          }}
        />
      )}

      {editCustom && (
        <FormDialog
          title={editCustom._id ? 'Chỉnh sửa tranh độc bản' : 'Đăng tranh độc bản mới'}
          fields={productFields}
          initial={pick(editCustom, productFields)}
          onClose={() => setEditCustom(null)}
          onSubmit={async body => {
            await api('/studio/products' + (editCustom._id ? '/' + editCustom._id : ''), {
              method: editCustom._id ? 'PATCH' : 'POST',
              body,
            });
            customState.reload();
            notify(
              editCustom._id
                ? 'Đã cập nhật tác phẩm và gửi lại để Ban quản lý duyệt'
                : 'Đã đăng tác phẩm độc bản. Ban quản lý sẽ sớm phê duyệt.'
            );
          }}
        />
      )}
    </>
  );
}


function HeritagePickerModal({ onClose, listedIds, onSuccess }) {
  const state = useLoad('/products?type=general&limit=100');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedArt, setSelectedArt] = useState(null);
  const [formValues, setFormValues] = useState({
    price: 200000,
    description: '',
    images: [],
    inStock: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useApp();

  function handleSelectArt(art) {
    setSelectedArt(art);
    setFormValues({
      price: 200000,
      description: 'In thủ công trên giấy điệp truyền thống, màu khoáng tự nhiên theo quy chuẩn làng Đông Hồ.',
      images: art.images?.length ? [art.images[0]] : [],
      inStock: true,
    });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedArt || busy) return;
    if (formValues.price < 0) {
      setError('Đơn giá không được âm');
      return;
    }
    if (!formValues.images || formValues.images.length === 0) {
      setError('Cần ít nhất một ảnh minh họa thành phẩm của xưởng');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api('/studio/workshop-products', {
        method: 'POST',
        body: {
          productId: selectedArt._id,
          price: Number(formValues.price),
          description: formValues.description,
          images: formValues.images,
          inStock: formValues.inStock,
        },
      });
      notify('Đã đăng ký nhận in tác phẩm “' + selectedArt.name + '”');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const items = state.data?.items || [];
  const filtered = items.filter(a => {
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !category || a.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="modal-backdrop">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        className="modal heritage-picker-modal"
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">KHO DI SẢN LÀNG ĐÔNG HỒ</span>
            <h2 id="picker-title">
              {selectedArt ? 'Thiết lập in: ' + selectedArt.name : 'Chọn Tranh Di sản để nhận in'}
            </h2>
          </div>
          <button className="icon-btn" aria-label="Đóng" onClick={onClose} disabled={busy}>
            <X />
          </button>
        </div>

        {selectedArt ? (
          <form onSubmit={handleSubmit} className="picker-config-form">
            <div className="picker-art-summary">
              <img src={selectedArt.images?.[0]} alt={selectedArt.name} />
              <div className="summary-info">
                <span className="eyebrow">{selectedArt.category} · {selectedArt.dimensions}</span>
                <h3>{selectedArt.name}</h3>
                {selectedArt.material && <p className="art-meta-tag">Chất liệu di sản: {selectedArt.material}</p>}
                {selectedArt.story && (
                  <p className="art-story-snippet prose">
                    {selectedArt.story.slice(0, 220)}…
                  </p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <label>
                <span>Giá xưởng nhận in (VNĐ) *</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={formValues.price}
                  onChange={e => setFormValues({ ...formValues, price: Number(e.target.value) })}
                />
              </label>

              <label className="checkbox-label">
                <span>Trạng thái phôi / in</span>
                <div className="check-row">
                  <input
                    type="checkbox"
                    id="instock-check"
                    checked={formValues.inStock}
                    onChange={e => setFormValues({ ...formValues, inStock: e.target.checked })}
                  />
                  <label htmlFor="instock-check">Còn phôi giấy, sẵn sàng in cho khách</label>
                </div>
              </label>

              <label className="wide">
                <span>Quy cách in ấn & chất liệu riêng của xưởng</span>
                <textarea
                  rows={3}
                  maxLength={5000}
                  value={formValues.description}
                  placeholder="Mô tả kỹ thuật bồi tranh, phôi giấy điệp, độ dày, màu khoáng tự nhiên hoặc bảo hành của xưởng..."
                  onChange={e => setFormValues({ ...formValues, description: e.target.value })}
                />
              </label>

              <label className="wide">
                <span>Ảnh chụp thành phẩm của xưởng (mặc định lấy ảnh di sản hoặc tải ảnh thật của xưởng) *</span>
                <ImageUpload
                  value={formValues.images}
                  onChange={imgs => setFormValues({ ...formValues, images: imgs })}
                />
              </label>
            </div>

            {error && <p className="error" role="alert">{error}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn ghost"
                disabled={busy}
                onClick={() => setSelectedArt(null)}
              >
                Quay lại chọn tranh khác
              </button>
              <button className="btn" disabled={busy}>
                {busy ? 'Đang lưu…' : 'Xác nhận nhận in tác phẩm'}
              </button>
            </div>
          </form>
        ) : (
          <div className="picker-browse-body">
            <div className="picker-toolbar">
              <div className="picker-search">
                <input
                  type="search"
                  placeholder="Tìm theo tên tranh di sản…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="category-pills">
                <button
                  type="button"
                  className={!category ? 'active' : ''}
                  onClick={() => setCategory('')}
                >
                  Tất cả ({items.length})
                </button>
                {CATEGORIES.map(cat => {
                  const count = items.filter(a => a.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={category === cat ? 'active' : ''}
                      onClick={() => setCategory(cat)}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <LoadState {...state} />

            <div className="heritage-picker-grid">
              {filtered.map(art => {
                const isListed = listedIds.has(String(art._id));
                return (
                  <div
                    key={art._id}
                    className={'picker-item-card ' + (isListed ? 'is-listed' : '')}
                  >
                    <div className="picker-item-img">
                      <img loading="lazy" src={art.images?.[0]} alt={art.name} />
                      {isListed && <span className="listed-tag">✓ Đang nhận in</span>}
                    </div>
                    <div className="picker-item-info">
                      <span className="eyebrow">{art.category}</span>
                      <h4>{art.name}</h4>
                      <small className="muted">{art.dimensions}</small>
                    </div>
                    <div className="picker-item-action">
                      {isListed ? (
                        <button className="btn outline small full" disabled>
                          Đã có trong xưởng
                        </button>
                      ) : (
                        <button
                          className="btn small full"
                          onClick={() => handleSelectArt(art)}
                        >
                          <Plus size={15} /> Nhận in tranh này
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && !state.loading && (
                <div className="empty-search">
                  <p>Không tìm thấy tranh di sản phù hợp với từ khóa tìm kiếm.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


function BatchesEditor({ onOpenQuotes }) {
  const state = useLoad('/studio/batches'), products = useLoad('/studio/products'), workshopProducts = useLoad('/studio/workshop-products');
  const [dialog, setDialog] = useState(null), { notify } = useApp();
  const name = batch => batch.productName || products.data?.find(p => p._id === batch.productId)?.name
    || workshopProducts.data?.find(wp => wp.productId === batch.productId)?.product?.name || 'Lô tranh';
  const eventFields = [field('title', 'Công đoạn / mốc sản xuất'), field('date', 'Ngày thực hiện', 'date'),
    field('note', 'Mô tả công đoạn', 'textarea', { wide: true }), field('images', 'Ảnh bằng chứng', 'images', { wide: true })];
  return <><PageTitle eyebrow="MINH BẠCH TỪNG CÔNG ĐOẠN" title="Lô tranh & nhật ký">
    Lô tranh và landing page được tạo khi xưởng hoàn thành phần việc trong yêu cầu đặt tranh.</PageTitle>
    <button type="button" className="text-link" onClick={onOpenQuotes}>Mở mục Yêu cầu báo giá để hoàn thành lô →</button>
    <LoadState {...state} />
    {state.data?.length === 0 && <Empty title="Chưa có lô tranh"><p>Hoàn thành phần việc, điền câu chuyện và nhật ký để tạo trang truy xuất.</p></Empty>}
    <div className="batch-manage">{state.data?.map(batch => <article className="panel" key={batch._id}>
      <div className="section-head"><div><span className="eyebrow">{batch.code}</span><h3>{name(batch)}</h3>
        <p>{batch.quantity} bản · {batch.published ? 'Đang công khai' : 'Chưa công khai'}</p></div>
        {batch.quoteId && <Link className="text-link" to={'/quotes/' + batch.quoteId}>Yêu cầu gốc ↗</Link>}</div>
      <p className="prose">{batch.story}</p>
      {batch.published && <BatchPageLinks batchId={batch._id} />}
      <div className="mini-timeline">{batch.events.map((event, index) => <div key={event._id || index}><Check size={15} /><span>{date(event.date)}</span><strong>{event.title}</strong></div>)}</div>
      <div className="button-row">{!batch.quoteId && <button className="btn outline small" onClick={() => setDialog({ type: 'event', batch })}><Plus size={16} /> Thêm mốc nhật ký</button>}
        <button className="text-link" onClick={() => setDialog({ type: batch.quoteId ? 'landing' : 'edit', batch })}>Chỉnh sửa {batch.quoteId ? 'landing page' : 'lô'}</button></div>
    </article>)}</div>
    {dialog?.type === 'landing' && <BatchLandingDialog batch={dialog.batch} onClose={() => setDialog(null)} onSubmit={async body => {
      await api('/studio/batches/' + dialog.batch._id, { method: 'PATCH', body }); state.reload(); notify('Đã cập nhật landing page, giữ nguyên mã QR');
    }} />}
    {dialog && dialog.type !== 'landing' && <FormDialog title={dialog.type === 'event' ? 'Thêm mốc sản xuất' : 'Chỉnh sửa lô tranh'}
      fields={dialog.type === 'event' ? eventFields : [field('story', 'Câu chuyện lô tranh', 'textarea', { wide: true }), field('published', 'Công khai trang truy xuất', 'checkbox')]}
      initial={dialog.type === 'event' ? { date: new Date().toISOString().slice(0, 10), images: [] } : { story: dialog.batch.story, published: dialog.batch.published }}
      onClose={() => setDialog(null)} onSubmit={async body => {
        await api('/studio/batches/' + dialog.batch._id + (dialog.type === 'event' ? '/events' : ''), { method: dialog.type === 'edit' ? 'PATCH' : 'POST', body });
        state.reload(); notify('Đã lưu thông tin lô tranh');
      }} />}
  </>;
}


const heritageAdminFields = [
  field('name', 'Tên tranh di sản'),
  field('category', 'Phân loại', 'select', { options: CATEGORIES }),
  field('dimensions', 'Kích thước chuẩn (ví dụ: 26 × 37 cm)'),
  field('material', 'Chất liệu chuẩn (ví dụ: Giấy điệp thủ công, màu tự nhiên)'),
  field('published', 'Công khai trên triển lãm', 'checkbox'),
  field('story', 'Câu chuyện văn hóa & ý nghĩa biểu tượng (hiển thị cho khách xem)', 'textarea', { wide: true, maxLength: 20000 }),
  field('description', 'Mô tả chi tiết / Tích truyện', 'textarea', { wide: true, maxLength: 10000 }),
  field('images', 'Ảnh tư liệu tranh di sản', 'images', { wide: true }),
];


function HeritageWorkshopsModal({ art, onClose }) {
  const state = useLoad('/admin/artworks/' + art._id + '/listings');
  const listings = state.data || [];

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workshops-modal-title"
        className="modal heritage-workshops-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">LIÊN KẾT XƯỞNG SẢN XUẤT</span>
            <h2 id="workshops-modal-title">Xưởng nhận in: {art.name}</h2>
          </div>
          <button className="icon-btn" aria-label="Đóng" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="art-summary-banner">
          <img src={art.images?.[0]} alt={art.name} className="banner-art-thumb" />
          <div className="banner-art-info">
            <span className="eyebrow">{art.category}</span>
            <h3>{art.name}</h3>
            <p className="dim-text">{art.dimensions} · {art.material}</p>
            <p className="prose art-story-preview">
              {art.story ? art.story.slice(0, 160) + '…' : 'Chưa có câu chuyện văn hóa.'}
            </p>
          </div>
          <div className="banner-stat">
            <span>Số xưởng nhận in</span>
            <strong>{listings.length}</strong>
          </div>
        </div>

        <LoadState {...state} />

        {state.data && listings.length === 0 && (
          <Empty title="Chưa có xưởng nào nhận in tác phẩm này">
            <p>
              Tác phẩm hiện đang lưu giữ trong kho di sản chung. Các xưởng nghệ nhân có thể đăng ký nhận in từ không gian làm việc của xưởng.
            </p>
          </Empty>
        )}

        <div className="admin-workshop-listings-grid">
          {listings.map(item => (
            <article className="panel admin-workshop-item" key={item._id}>
              <div className="workshop-item-visual">
                <img
                  src={item.images?.[0] || art.images?.[0]}
                  alt={item.workshop?.name || 'Thành phẩm xưởng'}
                />
                <span className={'stock-pill ' + (item.inStock ? 'in-stock' : 'out-of-stock')}>
                  {item.inStock ? 'Sẵn sàng in' : 'Tạm hết phôi'}
                </span>
              </div>
              <div className="workshop-item-body">
                <div className="workshop-item-head">
                  <div>
                    <h4>{item.workshop?.name || 'Xưởng nghệ nhân'}</h4>
                    <p className="workshop-item-address">
                      <MapPin size={13} /> {item.workshop?.address || 'Làng Đông Hồ, Thuận Thành, Bắc Ninh'}
                    </p>
                  </div>
                  <div className="workshop-item-price">
                    <span className="price-label">Giá xưởng in:</span>
                    <strong>{money(item.price)}</strong>
                  </div>
                </div>

                {item.description ? (
                  <p className="workshop-item-note prose">{item.description}</p>
                ) : (
                  <p className="workshop-item-note muted italic">Xưởng chưa bổ sung mô tả quy cách riêng.</p>
                )}

                <div className="workshop-item-actions">
                  {item.workshop?._id && (
                    <Link
                      to={'/xuong/' + item.workshop._id}
                      target="_blank"
                      className="btn outline small"
                    >
                      Hồ sơ xưởng <ArrowUpRight size={14} />
                    </Link>
                  )}
                  <Link
                    to={'/tranh/' + art._id}
                    target="_blank"
                    className="text-link small"
                  >
                    Xem trên triển lãm <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Đóng
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

function HeritageArtworksTab() {
  const state = useLoad('/admin/artworks');
  const [edit, setEdit] = useState(null);
  const [viewingWorkshopsArt, setViewingWorkshopsArt] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const { notify } = useApp();

  const PAGE_SIZE = 8;

  async function remove(art) {
    if (!window.confirm('Xóa tác phẩm di sản “' + art.name + '” khỏi kho làng? Mọi bản ghi nhận in liên quan tại các xưởng cũng sẽ bị xóa.')) return;
    try {
      await api('/admin/artworks/' + art._id, { method: 'DELETE' });
      state.reload();
      notify('Đã xóa tranh di sản khỏi kho làng');
    } catch (e) {
      setError(e.message);
    }
  }

  const items = state.data || [];
  const filtered = items.filter(a => {
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !category || a.category === category;
    return matchesSearch && matchesCat;
  });

  const totalListings = items.reduce((sum, a) => sum + (a.workshopCount || 0), 0);
  const pages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pagedItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="heritage-artworks-tab">
      {state.data && (
        <div className="compact-stats-row">
          <div className="compact-stat-card">
            <span>Tổng tranh di sản:</span>
            <strong>{items.length}</strong>
          </div>
          <div className="compact-stat-card">
            <span>Lượt xưởng nhận in:</span>
            <strong>{totalListings}</strong>
          </div>
        </div>
      )}

      <div className="heritage-admin-toolbar">
        <div className="toolbar-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            placeholder="Tìm kiếm tranh di sản theo tên tác phẩm…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="toolbar-select-wrap">
          <select
            aria-label="Lọc dòng tranh"
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả dòng tranh</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn outline small" onClick={state.reload}>
          <RefreshCw size={15} /> Làm mới
        </button>
        <button
          type="button"
          className="btn small"
          onClick={() =>
            setEdit({
              name: '',
              category: CATEGORIES[0],
              dimensions: '26 × 37 cm',
              material: 'Giấy điệp thủ công, màu tự nhiên',
              images: [],
              published: true,
              story: '',
              description: '',
            })
          }
        >
          <Plus size={16} /> Thêm Tranh Di sản
        </button>
      </div>

      <LoadState {...state} />
      {error && <p className="error">{error}</p>}

      {state.data && filtered.length === 0 && (
        <Empty title="Không tìm thấy tranh di sản phù hợp" />
      )}

      <div className="heritage-admin-grid">
        {pagedItems.map(art => (
          <article className="panel heritage-admin-card" key={art._id}>
            <div
              className="card-clickable-area"
              onClick={() => setViewingWorkshopsArt(art)}
              title="Bấm vào tranh để xem danh sách xưởng nhận in"
            >
              <img
                src={art.images?.[0]}
                alt={art.name}
                className="heritage-admin-thumb"
              />
              <div className="heritage-admin-info">
                <div className="heritage-admin-meta">
                  <span className="eyebrow">{art.category}</span>
                  <span
                    className={
                      'badge ' +
                      (art.published ? 'status-delivered' : 'status-draft')
                    }
                  >
                    {art.published ? 'Công khai' : 'Tạm ẩn'}
                  </span>
                </div>
                <h3>{art.name}</h3>
                <p className="dim-text">
                  {art.dimensions} · {art.material}
                </p>
                <div className="workshop-coverage">
                  <button
                    type="button"
                    className="badge-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setViewingWorkshopsArt(art);
                    }}
                    title="Bấm xem danh sách xưởng nhận in"
                  >
                    <span
                      className={
                        'badge ' +
                        (art.workshopCount > 0
                          ? 'status-in_production'
                          : 'status-draft')
                      }
                    >
                      {art.workshopCount > 0
                        ? art.workshopCount + ' xưởng nhận in'
                        : 'Chưa có xưởng nhận in'}
                      <Eye size={12} style={{ marginLeft: 4 }} />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="heritage-admin-story">
              {art.story ? (
                <p className="prose">{art.story.slice(0, 180)}…</p>
              ) : (
                <p className="prose muted italic">
                  Chưa có câu chuyện văn hóa cho tác phẩm này. Bấm chỉnh sửa để bổ sung.
                </p>
              )}
            </div>

            <div className="button-row">
              <button
                className="btn outline small"
                onClick={() => setEdit(art)}
              >
                <Edit3 size={15} /> Chỉnh sửa di sản
              </button>
              <button
                className="btn outline small"
                onClick={() => setViewingWorkshopsArt(art)}
              >
                <Eye size={15} /> Xem xưởng in ({art.workshopCount})
              </button>
              <button
                className="text-link danger small"
                onClick={() => remove(art)}
              >
                <Trash2 size={15} /> Xóa khỏi kho
              </button>
            </div>
          </article>
        ))}
      </div>

      <Pagination
        page={page}
        pages={pages}
        onPageChange={p => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        total={filtered.length}
      />

      {viewingWorkshopsArt && (
        <HeritageWorkshopsModal
          art={viewingWorkshopsArt}
          onClose={() => setViewingWorkshopsArt(null)}
        />
      )}

      {edit && (
        <FormDialog
          title={edit._id ? 'Chỉnh sửa tranh di sản: ' + edit.name : 'Thêm tranh di sản mới vào kho làng'}
          fields={heritageAdminFields}
          initial={pick(edit, heritageAdminFields)}
          onClose={() => setEdit(null)}
          onSubmit={async values => {
            await api('/admin/artworks' + (edit._id ? '/' + edit._id : ''), {
              method: edit._id ? 'PATCH' : 'POST',
              body: values,
            });
            state.reload();
            notify('Đã lưu tranh di sản');
          }}
        />
      )}
    </div>
  );
}

function InspectArtworkModal({ art, onClose, onApprove, onReject }) {
  const [selectedImg, setSelectedImg] = useState(art.images?.[0] || '');

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="modal artwork-inspect-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">{art.category} · Tranh độc bản xưởng</span>
            <h2>{art.name}</h2>
          </div>
          <button className="icon-btn" aria-label="Đóng" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="artwork-inspect-body">
          <div className="inspect-media-col">
            <div className="inspect-main-img-wrap">
              <img src={selectedImg || art.images?.[0]} alt={art.name} />
            </div>
            {art.images?.length > 1 && (
              <div className="inspect-thumbs-row">
                {art.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={'inspect-thumb-btn ' + (img === selectedImg ? 'active' : '')}
                    onClick={() => setSelectedImg(img)}
                  >
                    <img src={img} alt={`${art.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="inspect-info-col">
            <div className="inspect-status-row">
              <span className="status-label">Trạng thái phê duyệt:</span>
              <span
                className={
                  'badge ' +
                  (art.approvalStatus === 'approved'
                    ? 'status-delivered'
                    : art.approvalStatus === 'rejected'
                    ? 'status-draft'
                    : 'status-bidding')
                }
              >
                {art.approvalStatus === 'approved'
                  ? 'Đã duyệt'
                  : art.approvalStatus === 'rejected'
                  ? 'Bị từ chối'
                  : 'Chờ duyệt'}
              </span>
            </div>

            {art.workshop && (
              <div className="inspect-workshop-box">
                <span className="inspect-section-title">Xưởng chế tác</span>
                <h4>{art.workshop.name}</h4>
                <p className="dim-text">{art.workshop.address}</p>
                {art.workshop.ownerName && (
                  <p className="dim-text">
                    Nghệ nhân: {art.workshop.ownerName} ({art.workshop.ownerEmail})
                  </p>
                )}
              </div>
            )}

            <div className="inspect-specs-grid">
              <div>
                <span className="spec-label">Kích thước</span>
                <strong>{art.dimensions || '—'}</strong>
              </div>
              <div>
                <span className="spec-label">Chất liệu</span>
                <strong>{art.material || '—'}</strong>
              </div>
              <div>
                <span className="spec-label">Giá đề xuất</span>
                <strong className="spec-price">{art.price ? money(art.price) : 'Chưa định giá'}</strong>
              </div>
            </div>

            {art.story && (
              <div className="inspect-prose-block">
                <span className="inspect-section-title">Câu chuyện tác phẩm</span>
                <p className="prose">{art.story}</p>
              </div>
            )}

            {art.description && (
              <div className="inspect-prose-block">
                <span className="inspect-section-title">Mô tả quy cách / Tích truyện</span>
                <p className="prose">{art.description}</p>
              </div>
            )}

            {art.approvalStatus === 'rejected' && art.rejectedReason && (
              <div className="rejection-reason-box">
                <span className="reason-label">Lý do từ chối:</span>
                <p>{art.rejectedReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions-bar">
          <button type="button" className="btn outline" onClick={onClose}>
            Đóng
          </button>
          {art.approvalStatus === 'pending' && (
            <>
              <button
                type="button"
                className="btn outline danger"
                onClick={() => {
                  onClose();
                  onReject(art);
                }}
              >
                <X size={16} /> Từ chối duyệt
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  onClose();
                  onApprove(art);
                }}
              >
                <Check size={16} /> Phê duyệt tác phẩm
              </button>
            </>
          )}
          {art.approvalStatus === 'rejected' && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                onClose();
                onApprove(art);
              }}
            >
              <Check size={16} /> Phê duyệt lại
            </button>
          )}
          {art.approvalStatus === 'approved' && (
            <button
              type="button"
              className="btn outline danger"
              onClick={() => {
                onClose();
                onReject(art);
              }}
            >
              Hủy phê duyệt
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function RejectArtworkModal({ art, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isRevoke = art?.approvalStatus === 'approved';

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(art, reason.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="modal reject-artwork-dialog"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">BAN QUẢN LÝ LÀNG NGHỀ</span>
            <h2>{isRevoke ? 'Hủy phê duyệt tác phẩm' : 'Từ chối duyệt tác phẩm'}</h2>
          </div>
          <button className="icon-btn" aria-label="Đóng" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reject-form">
          <p className="reject-prompt">
            {isRevoke ? (
              <>
                Ghi rõ lý do hủy phê duyệt tác phẩm <strong>“{art.name}”</strong> của xưởng{' '}
                <strong>{art.workshop?.name || 'chế tác'}</strong>. Tác phẩm sẽ bị tạm ẩn khỏi Triển lãm và nghệ nhân sẽ nhận được lý do này.
              </>
            ) : (
              <>
                Ghi rõ lý do từ chối tác phẩm <strong>“{art.name}”</strong> của xưởng{' '}
                <strong>{art.workshop?.name || 'chế tác'}</strong> để nghệ nhân điều chỉnh và nộp duyệt lại.
              </>
            )}
          </p>

          <label className="field-label" htmlFor="reject-reason-input">
            {isRevoke ? 'Lý do hủy phê duyệt (tối đa 500 ký tự):' : 'Lý do từ chối (tối đa 500 ký tự):'}
          </label>
          <textarea
            id="reject-reason-input"
            className="reject-reason-textarea"
            rows={4}
            maxLength={500}
            required
            placeholder={
              isRevoke
                ? 'Ví dụ: Phát hiện sai quy cách bồi tranh; Cần bổ sung nguồn gốc mộc bản; Tạm ẩn để đối chiếu chất lượng…'
                : 'Ví dụ: Ảnh chụp bị mờ; Cần bổ sung câu chuyện văn hóa; Kích thước chưa chuẩn theo văn hóa Đông Hồ…'
            }
            value={reason}
            onChange={e => setReason(e.target.value)}
          />

          <div className="button-row" style={{ marginTop: 16 }}>
            <button type="button" className="btn outline" onClick={onClose} disabled={submitting}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn danger" disabled={submitting || !reason.trim()}>
              {submitting ? 'Đang xử lý…' : isRevoke ? 'Xác nhận hủy phê duyệt' : 'Xác nhận từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function CustomArtworksTab() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [inspectArt, setInspectArt] = useState(null);
  const [rejectingArt, setRejectingArt] = useState(null);
  const [busyId, setBusyId] = useState('');
  const { notify } = useApp();

  const queryParams = new URLSearchParams();
  queryParams.set('type', 'custom');
  if (statusFilter && statusFilter !== 'all') queryParams.set('approvalStatus', statusFilter);
  if (category) queryParams.set('category', category);
  if (search.trim()) queryParams.set('search', search.trim());
  queryParams.set('page', String(page));
  queryParams.set('limit', '8');

  const state = useLoad('/admin/artworks?' + queryParams.toString());
  const data = state.data || {};
  const items = data.items || [];
  const stats = data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const total = data.total || 0;
  const pages = data.pages || 1;

  async function handleApprove(art) {
    setBusyId(art._id);
    try {
      await api('/admin/artworks/' + art._id + '/approval', {
        method: 'PATCH',
        body: { status: 'approved' },
      });
      state.reload();
      notify('Đã phê duyệt tác phẩm “' + art.name + '”');
    } catch (e) {
      notify(e.message);
    } finally {
      setBusyId('');
    }
  }

  async function handleRejectSubmit(art, reason) {
    setBusyId(art._id);
    const isRevoking = art.approvalStatus === 'approved';
    try {
      await api('/admin/artworks/' + art._id + '/approval', {
        method: 'PATCH',
        body: { status: 'rejected', reason },
      });
      state.reload();
      notify(isRevoking ? 'Đã hủy phê duyệt tác phẩm “' + art.name + '”' : 'Đã từ chối tác phẩm “' + art.name + '”');
    } catch (e) {
      notify(e.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="custom-artworks-tab">
      {state.data && (
        <div className="compact-stats-row">
          <div
            className={'compact-stat-card ' + (statusFilter === 'all' ? 'active' : '')}
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
            style={{ cursor: 'pointer' }}
            title="Xem tất cả tranh độc bản"
          >
            <span>Tổng tranh:</span>
            <strong>{stats.total}</strong>
          </div>
          <div
            className={'compact-stat-card ' + (statusFilter === 'pending' ? 'active' : '')}
            onClick={() => {
              setStatusFilter('pending');
              setPage(1);
            }}
            style={{ cursor: 'pointer' }}
            title="Lọc tranh chờ duyệt"
          >
            <span>Chờ duyệt:</span>
            <strong>{stats.pending}</strong>
          </div>
          <div
            className={'compact-stat-card ' + (statusFilter === 'approved' ? 'active' : '')}
            onClick={() => {
              setStatusFilter('approved');
              setPage(1);
            }}
            style={{ cursor: 'pointer' }}
            title="Lọc tranh đã duyệt"
          >
            <span>Đã duyệt:</span>
            <strong>{stats.approved}</strong>
          </div>
          <div
            className={'compact-stat-card ' + (statusFilter === 'rejected' ? 'active' : '')}
            onClick={() => {
              setStatusFilter('rejected');
              setPage(1);
            }}
            style={{ cursor: 'pointer' }}
            title="Lọc tranh bị từ chối"
          >
            <span>Bị từ chối:</span>
            <strong>{stats.rejected}</strong>
          </div>
        </div>
      )}

      <div className="heritage-admin-toolbar">
        <div className="toolbar-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            placeholder="Tìm theo tên tranh hoặc tên xưởng chế tác…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="toolbar-select-wrap">
          <select
            aria-label="Lọc trạng thái phê duyệt"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Bị từ chối</option>
          </select>
        </div>
        <div className="toolbar-select-wrap">
          <select
            aria-label="Lọc dòng tranh"
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả dòng tranh</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn outline small" onClick={state.reload}>
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      <LoadState {...state} />

      {state.data && items.length === 0 && (
        <Empty title="Không có tác phẩm độc bản nào phù hợp">
          <p>Thử điều chỉnh bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
        </Empty>
      )}

      <div className="custom-admin-grid">
        {items.map(art => {
          const isBusy = busyId === art._id;
          return (
            <article className="panel custom-admin-card" key={art._id}>
              <div className="card-top-layout">
                <div
                  className="custom-admin-thumb-wrap"
                  onClick={() => setInspectArt(art)}
                  title="Bấm để xem chi tiết tác phẩm"
                >
                  <img
                    src={art.images?.[0]}
                    alt={art.name}
                    className="custom-admin-thumb"
                  />
                  <span className="custom-tag">Độc bản</span>
                </div>
                <div className="custom-admin-info">
                  <div className="card-top-meta">
                    <span className="eyebrow">{art.category}</span>
                    <span
                      className={
                        'badge ' +
                        (art.approvalStatus === 'approved'
                          ? 'status-delivered'
                          : art.approvalStatus === 'rejected'
                          ? 'status-draft'
                          : 'status-bidding')
                      }
                    >
                      {art.approvalStatus === 'approved'
                        ? 'Đã duyệt'
                        : art.approvalStatus === 'rejected'
                        ? 'Từ chối'
                        : 'Chờ duyệt'}
                    </span>
                  </div>

                  <h3
                    className="clickable-title"
                    onClick={() => setInspectArt(art)}
                    title="Bấm để xem chi tiết"
                  >
                    {art.name}
                  </h3>

                  <div className="workshop-origin-tag">
                    <Home size={13} />
                    <span>{art.workshop?.name || 'Xưởng Đông Hồ'}</span>
                  </div>

                  <p className="dim-text specs-row">
                    {art.dimensions} · {art.material}
                  </p>

                  <div className="card-price-row">
                    <span className="price-label">Giá đề xuất:</span>
                    <strong className="price-value">{art.price ? money(art.price) : 'Chưa định giá'}</strong>
                  </div>
                </div>
              </div>

              {art.approvalStatus === 'rejected' && (
                <div className="rejection-reason-box">
                  <span className="reason-label">Lý do từ chối:</span>
                  <p>{art.rejectedReason || 'Chưa có ghi chú cụ thể.'}</p>
                </div>
              )}

              {art.story && (
                <div className="custom-story-snippet">
                  <p className="prose">{art.story.slice(0, 130)}…</p>
                </div>
              )}

              <div className="button-row custom-card-actions">
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => setInspectArt(art)}
                >
                  <Eye size={15} /> Chi tiết
                </button>

                {art.approvalStatus === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="btn outline small danger"
                      disabled={isBusy}
                      onClick={() => setRejectingArt(art)}
                    >
                      <X size={15} /> Từ chối
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      disabled={isBusy}
                      onClick={() => handleApprove(art)}
                    >
                      <Check size={15} /> Phê duyệt
                    </button>
                  </>
                )}

                {art.approvalStatus === 'approved' && (
                  <button
                    type="button"
                    className="text-link danger small"
                    disabled={isBusy}
                    onClick={() => setRejectingArt(art)}
                  >
                    Hủy phê duyệt
                  </button>
                )}

                {art.approvalStatus === 'rejected' && (
                  <button
                    type="button"
                    className="btn outline small"
                    disabled={isBusy}
                    onClick={() => handleApprove(art)}
                  >
                    <Check size={15} /> Phê duyệt lại
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Pagination
        page={page}
        pages={pages}
        onPageChange={p => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        total={total}
      />

      {inspectArt && (
        <InspectArtworkModal
          art={inspectArt}
          onClose={() => setInspectArt(null)}
          onApprove={handleApprove}
          onReject={art => setRejectingArt(art)}
        />
      )}

      {rejectingArt && (
        <RejectArtworkModal
          art={rejectingArt}
          onClose={() => setRejectingArt(null)}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}

function ArtworksAdmin() {
  const [tab, setTab] = useState('heritage');

  return (
    <div className="artworks-admin-wrap">
      <div className="artworks-header">
        <div className="artworks-header-top">
          <div>
            <span className="eyebrow">BAN QUẢN LÝ LÀNG NGHỀ</span>
            <h1 className="artworks-page-title">Quản lý tranh</h1>
          </div>
          <div className="type-tabs" role="tablist">
            <button
              type="button"
              className={tab === 'heritage' ? 'selected' : ''}
              onClick={() => setTab('heritage')}
            >
              Tranh Di sản Làng
            </button>
            <button
              type="button"
              className={tab === 'custom' ? 'selected' : ''}
              onClick={() => setTab('custom')}
            >
              Tranh Độc bản Xưởng
            </button>
          </div>
        </div>
      </div>

      {tab === 'heritage' ? <HeritageArtworksTab /> : <CustomArtworksTab />}
    </div>
  );
}

const HeritageAdmin = ArtworksAdmin;


function ArtisansAdmin(){const state=useLoad('/admin/workshops'),users=useLoad('/admin/users'),[create,setCreate]=useState(false),[editWorkshop,setEditWorkshop]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),{notify}=useApp();async function action(url,body){setBusy(true);setError('');try{await api(url,{method:'PATCH',body});state.reload();users.reload();notify('Đã cập nhật');}catch(e){setError(e.message);}finally{setBusy(false);}}return <><PageTitle eyebrow="BAN QUẢN LÝ LÀNG NGHỀ" title="Nghệ nhân & kiểm duyệt" action={<button className="btn" onClick={()=>setCreate(true)}><Plus size={18}/> Cấp tài khoản</button>}/><LoadState {...state}/>{error&&<p className="error">{error}</p>}<div className="admin-studios">{state.data?.map(s=>{const u=users.data?.find(u=>u._id===s.ownerId);return <article className="panel" key={s._id}><span className={'badge '+(s.approved?'status-delivered':'status-draft')}>{s.approved?'Đã duyệt':'Chờ kiểm duyệt'}</span><h3>{s.name}</h3><p>{u?.name} · {u?.email}</p><p>{s.address}</p><p className="prose">{s.story}</p><div className="thumbnails">{s.images.map((src,i)=><a href={src} target="_blank" rel="noreferrer" key={i}><img src={src} alt="Hồ sơ xưởng"/></a>)}{s.certificates.map((src,i)=><a href={src} target="_blank" rel="noreferrer" key={'c'+i}><img src={src} alt="Chứng nhận"/></a>)}</div><div className="button-row"><button className="btn outline small" disabled={busy} onClick={()=>setEditWorkshop(s)}><Edit3 size={15}/> Sửa xưởng</button><button className="btn outline small" disabled={busy} onClick={()=>action('/admin/workshops/'+s._id+'/approval',{approved:!s.approved})}>{s.approved?'Thu hồi công khai':'Duyệt xưởng'}</button>{u&&<button className="text-link" disabled={busy} onClick={()=>action('/admin/users/'+u._id,{active:!u.active})}>{u.active?'Khóa tài khoản':'Mở lại tài khoản'}</button>}</div></article>;})}</div>{create&&<FormDialog title="Cấp tài khoản nghệ nhân" fields={[field('accountName','Họ tên nghệ nhân','text',{autoComplete:'off'}),field('email','Email đăng nhập','email',{autoComplete:'new-email'}),field('password','Mật khẩu ban đầu (10–72 ký tự)','password',{autoComplete:'new-password'}),...studioFields]} initial={{accountName:'',email:'',password:'',name:'',address:'',story:'',categories:CATEGORIES,images:[],certificates:[],latitude:21.0606,longitude:106.0813,visitingHours:'08:00–17:00',openForVisits:false}} onClose={()=>setCreate(false)} submitLabel="Cấp tài khoản" onSubmit={async values=>{const {accountName,email,password,location,...workshop}=values;await api('/admin/artisans',{method:'POST',body:{name:accountName,email,password,workshop}});state.reload();users.reload();notify('Đã cấp tài khoản và công khai xưởng ngay.');}}/>}{editWorkshop&&<FormDialog title={'Chỉnh sửa xưởng: '+editWorkshop.name} fields={studioFields} initial={{...pick(editWorkshop,studioFields),latitude:editWorkshop.latitude??21.0606,longitude:editWorkshop.longitude??106.0813}} onClose={()=>setEditWorkshop(null)} submitLabel="Lưu thông tin xưởng" onSubmit={async values=>{const {location,...body}=values;await api('/admin/workshops/'+editWorkshop._id,{method:'PATCH',body});state.reload();notify('Đã cập nhật thông tin xưởng');}}/>}</>;}
function NewsEditor(){const state=useLoad('/news/manage'),[edit,setEdit]=useState(null),[error,setError]=useState(''),{notify}=useApp();async function remove(n){if(!window.confirm('Xóa tin “'+n.title+'”?'))return;try{await api('/news/'+n._id,{method:'DELETE'});state.reload();notify('Đã xóa tin');}catch(e){setError(e.message);}}return <><PageTitle eyebrow="NHỊP SỐNG CỘNG ĐỒNG" title="Quản lý tin tức" action={<button className="btn" onClick={()=>setEdit({category:'Thông báo',pictures:[],published:false})}><Plus size={17}/> Viết tin</button>}/><LoadState {...state}/>{error&&<p className="error">{error}</p>}{state.data?.length===0&&<Empty title="Chưa có tin tức"/>}{state.data?.map(n=><article className="panel" key={n._id}><span className="eyebrow">{n.category} · {n.published?'Công khai':'Bản nháp'}</span><h3>{n.title}</h3><p>{n.body.slice(0,180)}…</p><div className="button-row"><button className="btn outline small" onClick={()=>setEdit({...n,pictures:n.image?[n.image]:[]})}><Edit3 size={15}/> Chỉnh sửa</button><button className="text-link danger" onClick={()=>remove(n)}><Trash2 size={15}/> Xóa tin</button></div></article>)}{edit&&<FormDialog title={edit._id?'Chỉnh sửa tin':'Viết tin cộng đồng'} fields={newsFields} initial={pick(edit,newsFields)} onClose={()=>setEdit(null)} onSubmit={async values=>{const {pictures,...body}=values;body.image=pictures[0]||'';await api('/news'+(edit._id?'/'+edit._id:''),{method:edit._id?'PATCH':'POST',body});state.reload();notify('Đã lưu tin tức');}}/>}</>;}
function UsersAdmin(){const state=useLoad('/admin/users'),[search,setSearch]=useState(''),[roleFilter,setRoleFilter]=useState(''),[statusFilter,setStatusFilter]=useState(''),[busyId,setBusyId]=useState(''),{user:currentAdmin,notify}=useApp();const allUsers=state.data||[];const buyersCount=allUsers.filter(u=>u.role==='buyer').length,artisansCount=allUsers.filter(u=>u.role==='artisan').length,adminsCount=allUsers.filter(u=>u.role==='admin').length;const filteredUsers=allUsers.filter(u=>{if(roleFilter&&u.role!==roleFilter)return false;if(statusFilter==='active'&&!u.active)return false;if(statusFilter==='inactive'&&u.active)return false;if(search){const q=search.toLowerCase();return u.name?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q)||u.phone?.toLowerCase().includes(q);}return true;});async function toggleStatus(targetUser){if(targetUser._id===currentAdmin?.id){alert('Không thể tự khóa tài khoản của chính mình!');return;}const act=targetUser.active?'khóa':'mở khóa';if(!window.confirm(`Bạn có chắc muốn ${act} tài khoản “${targetUser.name||targetUser.email}”?`))return;setBusyId(targetUser._id);try{await api('/admin/users/'+targetUser._id,{method:'PATCH',body:{active:!targetUser.active}});state.reload();notify(`Đã ${act} tài khoản thành công`);}catch(err){notify(err.message);}finally{setBusyId('');}}return <><PageTitle eyebrow="BAN QUẢN LÝ LÀNG NGHỀ" title="Quản lý tài khoản người dùng">Theo dõi toàn bộ tài khoản khách hàng, nghệ nhân và ban quản lý trên nền tảng vCraft Đông Hồ.</PageTitle><div className="stats-grid"><div><span>Tổng người dùng</span><strong>{allUsers.length}</strong></div><div><span>Khách hàng</span><strong>{buyersCount}</strong></div><div><span>Nghệ nhân</span><strong>{artisansCount}</strong></div><div><span>Ban quản lý</span><strong>{adminsCount}</strong></div></div><div className="table-toolbar"><div className="search-box"><Search size={16}/><input type="search" placeholder="Tìm theo tên, email, số điện thoại…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button type="button" onClick={()=>setSearch('')}>Xóa</button>}</div><div className="filter-selects"><select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} aria-label="Lọc theo vai trò"><option value="">Mọi vai trò</option><option value="buyer">Khách hàng</option><option value="artisan">Nghệ nhân</option><option value="admin">Ban quản lý</option></select><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Lọc trạng thái"><option value="">Mọi trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Đã bị khóa</option></select><button className="text-link" onClick={state.reload}><RefreshCw size={15}/> Làm mới</button></div></div><LoadState {...state}/>{state.data&&filteredUsers.length===0&&<Empty title="Không tìm thấy tài khoản phù hợp"><p>Thử đổi từ khóa tìm kiếm hoặc bỏ bộ lọc vai trò/trạng thái.</p></Empty>}{state.data&&filteredUsers.length>0&&<div className="users-table-shell"><table className="users-table"><thead><tr><th>Thành viên</th><th>Liên hệ</th><th>Vai trò</th><th>Ngày tham gia</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{filteredUsers.map(u=>{const isMe=u._id===currentAdmin?.id;return <tr key={u._id} className={!u.active?'row-inactive':''}><td><div className="user-table-cell"><span className="user-table-avatar">{u.name?.charAt(0).toUpperCase()||'U'}</span><div><strong>{u.name||'(Chưa đặt tên)'} {isMe&&<span className="me-pill">Bạn</span>}</strong><span className="user-table-email">{u.email}</span></div></div></td><td><div className="user-contact-cell"><span>{u.phone||'—'}</span>{u.address&&<small title={u.address}>{u.address}</small>}</div></td><td><span className={'badge role-badge status-'+(u.role==='admin'?'delivered':u.role==='artisan'?'in_production':'bidding')}>{u.role==='admin'?'Ban quản lý':u.role==='artisan'?'Nghệ nhân':'Khách hàng'}</span></td><td><span className="user-date-cell">{date(u.createdAt)||'—'}</span></td><td><span className={'badge '+(u.active?'status-delivered':'status-draft')}>{u.active?'Hoạt động':'Đã khóa'}</span></td><td>{isMe?<span className="muted">Tài khoản này</span>:u.role==='admin'?<span className="muted">Quản trị viên</span>:<button className={'btn small '+(u.active?'outline danger':'')} disabled={busyId===u._id} onClick={()=>toggleStatus(u)}>{busyId===u._id?'Xử lý…':u.active?'Khóa tài khoản':'Mở khóa'}</button>}</td></tr>;})}</tbody></table></div>}</>;}

function AccountProfile(){const {user,setUser,notify}=useApp(),state=useLoad('/auth/me');const [name,setName]=useState(''),[phone,setPhone]=useState(''),[address,setAddress]=useState(''),[savingProfile,setSavingProfile]=useState(false),[profileMsg,setProfileMsg]=useState({text:'',type:''});const [curPass,setCurPass]=useState(''),[newPass,setNewPass]=useState(''),[cfmPass,setCfmPass]=useState(''),[savingPass,setSavingPass]=useState(false),[passMsg,setPassMsg]=useState({text:'',type:''});useEffect(()=>{if(state.data){setName(state.data.name||'');setPhone(state.data.phone||'');setAddress(state.data.address||'');}},[state.data]);async function handleProfile(e){e.preventDefault();setSavingProfile(true);setProfileMsg({text:'',type:''});try{const updated=await api('/auth/profile',{method:'PATCH',body:{name,phone,address}});setUser(current=>({...current,...updated}));state.reload();setProfileMsg({text:'Đã lưu thông tin tài khoản thành công',type:'success'});notify('Đã cập nhật thông tin cá nhân');}catch(err){setProfileMsg({text:err.message,type:'error'});}finally{setSavingProfile(false);}}async function handlePassword(e){e.preventDefault();setPassMsg({text:'',type:''});if(newPass!==cfmPass){setPassMsg({text:'Mật khẩu xác nhận không khớp với mật khẩu mới',type:'error'});return;}if(newPass.length<10){setPassMsg({text:'Mật khẩu mới phải có tối thiểu 10 ký tự',type:'error'});return;}setSavingPass(true);try{await api('/auth/change-password',{method:'POST',body:{currentPassword:curPass,newPassword:newPass}});setCurPass('');setNewPass('');setCfmPass('');setPassMsg({text:'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.',type:'success'});notify('Đã đổi mật khẩu thành công');}catch(err){setPassMsg({text:err.message,type:'error'});}finally{setSavingPass(false);}}const roleTitle=user?.role==='admin'?'Ban quản lý':user?.role==='artisan'?'Nghệ nhân':'Khách hàng';return <><PageTitle eyebrow="THÔNG TIN CÁ NHÂN & BẢO MẬT" title="Hồ sơ tài khoản">Quản lý thông tin định danh, số điện thoại liên hệ, địa chỉ nhận hàng và mật khẩu đăng nhập.</PageTitle><LoadState {...state}/>{state.data&&<div className="account-container"><div className="panel account-hero-card"><div className="account-avatar-circle">{state.data.name?.charAt(0).toUpperCase()||'U'}</div><div className="account-hero-info"><h2>{state.data.name}</h2><div className="account-hero-meta"><span className={'badge status-'+(state.data.role==='admin'?'delivered':state.data.role==='artisan'?'in_production':'bidding')}>{roleTitle}</span><span className="meta-item"><Mail size={14}/> {state.data.email}</span>{state.data.createdAt&&<span className="meta-item"><Calendar size={14}/> Thành viên từ {date(state.data.createdAt)}</span>}<span className="meta-item active-status"><CheckCircle2 size={14}/> Tài khoản hoạt động</span></div></div></div><div className="account-sections-grid"><div className="panel"><h3><User size={18}/> Thông tin cá nhân & Liên hệ</h3><p className="muted">Thông tin này được dùng khi liên hệ trao đổi báo giá và giao nhận tranh.</p>{profileMsg.text&&<div className={'account-feedback feedback-'+profileMsg.type}>{profileMsg.type==='success'?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{profileMsg.text}</span></div>}<form onSubmit={handleProfile} className="account-form-grid"><label><span>Họ và tên *</span><input required maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Họ và tên"/></label><label><span>Số điện thoại liên hệ</span><input type="tel" maxLength={20} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0912 345 678"/></label><label><span>Email đăng nhập (cố định)</span><input disabled value={state.data.email} className="disabled-input" title="Email định danh không thể thay đổi"/></label><label><span>Vai trò tài khoản</span><input disabled value={roleTitle} className="disabled-input" title="Vai trò được cấp bởi hệ thống"/></label><label className="wide"><span>Địa chỉ nhận hàng / Liên hệ mặc định</span><textarea rows={3} maxLength={300} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Số nhà, đường/phố, thôn/xã, quận/huyện, tỉnh/thành phố"/></label><div className="wide button-row"><button className="btn" disabled={savingProfile}>{savingProfile?'Đang lưu…':'Lưu thay đổi'}</button></div></form></div><div className="panel"><h3><Lock size={18}/> Đổi mật khẩu</h3><p className="muted">Mật khẩu mới yêu cầu tối thiểu 10 ký tự để đảm bảo an toàn.</p>{passMsg.text&&<div className={'account-feedback feedback-'+passMsg.type}>{passMsg.type==='success'?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{passMsg.text}</span></div>}<form onSubmit={handlePassword} className="account-form-grid"><label className="wide"><span>Mật khẩu hiện tại *</span><input type="password" required value={curPass} onChange={e=>setCurPass(e.target.value)} placeholder="Nhập mật khẩu hiện tại"/></label><label className="wide"><span>Mật khẩu mới * (tối thiểu 10 ký tự)</span><input type="password" required minLength={10} maxLength={72} value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Nhập mật khẩu mới"/></label><label className="wide"><span>Xác nhận mật khẩu mới *</span><input type="password" required minLength={10} maxLength={72} value={cfmPass} onChange={e=>setCfmPass(e.target.value)} placeholder="Nhập lại mật khẩu mới"/></label><div className="wide button-row"><button className="btn outline" disabled={savingPass}>{savingPass?'Đang xử lý…':'Cập nhật mật khẩu'}</button></div></form></div></div></div>}</>;}

export function QuoteDetail(){const {user,loading}=useApp();if(loading)return <LoadState loading/>;if(!user)return <Navigate to="/dang-nhap" replace/>;return <QuoteContent/>;}
function QuoteContent(){
  const {id}=useParams(),{user,notify}=useApp(),state=useLoad('/quotes/'+id),[dialog,setDialog]=useState(null),[confirmingBid,setConfirmingBid]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const studio=useLoad(user.role==='artisan'?'/studio':'/auth/me');
  const q=state.data,own=!!q&&user.role==='buyer'&&q.buyerId===user.id;

  async function act(action,body={}){
    setBusy(true);setError('');
    try{
      await api('/quotes/'+id+'/'+action,{method:'POST',body:{version:q.version,...body}});
      state.reload();
      notify('Đã cập nhật yêu cầu');
    }catch(e){
      setError(e.message);
      state.reload();
    }finally{
      setBusy(false);
    }
  }

  if(!q)return <section className="wrap page"><LoadState {...state}/></section>;

  const studioName=key=>q.workshops?.find(s=>s._id===key)?.name||'Xưởng';
  const mine=q.allocations?.find(a=>a.workshopId===studio.data?._id);
  const sequence=['draft','sent','bidding','accepted','in_production','delivered'];
  const isDirect=q.targetType==='direct';
  const isTargetArtisan=!q.targetWorkshopId||studio.data?._id===q.targetWorkshopId;
  const mineBid=q.bids?.find(b=>b.workshopId===studio.data?._id);

  const isClosedStage = ['accepted', 'in_production', 'delivered'].includes(q.status);
  const isWinningWorkshop = Boolean(studio.data?._id && (q.acceptedWorkshopId === studio.data._id || q.allocations?.some(a => a.workshopId === studio.data._id)));
  const isAssignedToOtherWorkshop = user.role === 'artisan' && isClosedStage && !isWinningWorkshop;
  const acceptedWorkshopId = q.acceptedWorkshopId || q.allocations?.[0]?.workshopId;

  const cleanDesc = q.description && q.description.trim() && q.description.trim().toLowerCase() !== 'không' ? q.description.trim() : '';
  const cleanPkgNote = q.customerInfo?.packagingNote && q.customerInfo.packagingNote.trim() && q.customerInfo.packagingNote.trim().toLowerCase() !== 'không' ? q.customerInfo.packagingNote.trim() : '';
  const hasActionButtons =
    (own && q.status === 'draft') ||
    (user.role === 'artisan' && ['sent', 'bidding'].includes(q.status) && isTargetArtisan) ||
    mine?.status === 'accepted' ||
    mine?.status === 'in_production' ||
    (mine?.status === 'ready' && !mine.batchId) ||
    (own && q.status === 'in_production');

  const handleConfirmWorkshop = async () => {
    if (!confirmingBid) return;
    await act('accept', { workshopId: confirmingBid.workshopId });
    setConfirmingBid(null);
  };

  return (
    <section className="wrap page">
      <Link className="back-link" to="/workspace">← Không gian làm việc</Link>
      <PageTitle
        eyebrow="YÊU CẦU ĐẶT TRANH ĐA TÁC PHẨM"
        title={q.title}
        action={<button className="btn outline" onClick={state.reload}><RefreshCw size={16}/> Làm mới</button>}
      />

      {!isAssignedToOtherWorkshop && (
        <div className="status-steps">
          {sequence.map((s,i)=>(
            <div className={sequence.indexOf(q.status)>=i?'reached':''} key={s}>
              <span>{i+1}</span>{STATUS[s]}
            </div>
          ))}
        </div>
      )}

      {error&&<p className="error" role="alert">{error}</p>}

      {isAssignedToOtherWorkshop ? (
        <div className="quote-notice-banner notice-other-workshop" style={{margin:'0 0 20px'}}>
          <AlertCircle size={18}/>
          <div>
            <strong>Đơn hàng đã có xưởng đảm nhận:</strong> Khách hàng đã lựa chọn <strong>{studioName(acceptedWorkshopId)}</strong> thực hiện trọn gói lô tranh này. Phiên chào giá đã kết thúc.
          </div>
        </div>
      ) : user.role === 'artisan' && isClosedStage && isWinningWorkshop ? (
        <div className="quote-notice-banner notice-won-workshop" style={{margin:'0 0 20px'}}>
          <CheckCircle2 size={18}/>
          <div>
            <strong>Xưởng bạn đảm nhận đơn hàng này:</strong> Khách hàng đã lựa chọn xưởng của bạn thực hiện trọn gói 100% lô tranh ({q.quantity?.toLocaleString('vi-VN')} bản in).
          </div>
        </div>
      ) : isDirect ? (
        <div className="cart-copyright-banner banner-direct" style={{margin:'0 0 20px'}}>
          <ShieldCheck size={18}/>
          <div><strong>Đơn hàng gửi trực tiếp xưởng:</strong> Lô tranh được gửi chỉ định tới <strong>{studioName(q.targetWorkshopId)}</strong> sở hữu ván in chế tác độc bản.</div>
        </div>
      ) : (
        <div className="bidding-mode-notice" style={{margin:'0 0 20px'}}>
          <Layers size={18}/>
          <div><strong>Đấu thầu công khai:</strong> Các xưởng làng nghề tham gia chào giá cạnh tranh. Khách hàng lựa chọn 1 xưởng duy nhất để nhận trọn gói 100% lô tranh.</div>
        </div>
      )}

      <div className="quote-detail-grid">
        <div>
          {mine?.status === 'in_production' && studio.data && <ProductionJournal quote={q} allocation={mine} studio={studio.data} onSaved={state.reload} />}
          {/* Panel Thông tin đơn đặt lô & Giao nhận: Lưới 6 ô cân xứng tuyệt đối */}
          <div className="panel quote-overview-panel">
            <div className="quote-overview-head">
              <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                {isAssignedToOtherWorkshop ? (
                  <span className="badge status-other-workshop">Đã giao xưởng khác</span>
                ) : (
                  <Badge status={q.status}/>
                )}
                <h2 style={{margin:0,fontSize:'21px',fontFamily:'var(--serif)'}}>Thông tin đơn đặt lô</h2>
              </div>
              <span className="quote-mode-pill">
                {isDirect ? `Chỉ định: ${studioName(q.targetWorkshopId)}` : 'Đấu thầu công khai'}
              </span>
            </div>

            <div className="quote-info-section">
              <div className="quote-info-col">
                <h3 className="quote-info-heading">Quy cách & Kế hoạch chế tác</h3>
                <div className="quote-info-list">
                  <div className="quote-info-row">
                    <span className="quote-info-label">Tổng số lượng in</span>
                    <span className="quote-info-val">
                      <strong className="quote-qty-val">{q.quantity?.toLocaleString('vi-VN')} bản</strong>
                      <span className="quote-qty-sub">({q.items?.length || 1} tác phẩm)</span>
                    </span>
                  </div>
                  <div className="quote-info-row">
                    <span className="quote-info-label">Hạn hoàn thành</span>
                    <span className="quote-info-val">
                      <strong>{date(q.deadline)}</strong>
                    </span>
                  </div>
                  <div className="quote-info-row">
                    <span className="quote-info-label">Phân loại tranh</span>
                    <span className="quote-info-val">{q.category || 'Tranh Đông Hồ'}</span>
                  </div>
                  <div className="quote-info-row">
                    <span className="quote-info-label">Hình thức đặt</span>
                    <span className="quote-info-val">
                      {isDirect ? `Chỉ định (${studioName(q.targetWorkshopId)})` : 'Đấu thầu công khai toàn làng nghề'}
                    </span>
                  </div>
                  {cleanDesc && (
                    <div className="quote-info-row">
                      <span className="quote-info-label">Yêu cầu chế tác</span>
                      <span className="quote-info-val">{cleanDesc}</span>
                    </div>
                  )}
                </div>
              </div>

              {isAssignedToOtherWorkshop ? (
                <div className="quote-info-col">
                  <h3 className="quote-info-heading">Xưởng nhận chế tác</h3>
                  <div className="quote-info-list">
                    <div className="quote-info-row">
                      <span className="quote-info-label">Đơn vị trúng thầu</span>
                      <span className="quote-info-val">
                        <strong>{studioName(acceptedWorkshopId)}</strong>
                      </span>
                    </div>
                    <div className="quote-info-row">
                      <span className="quote-info-label">Trạng thái</span>
                      <span className="quote-info-val">Đã giao xưởng chế tác</span>
                    </div>
                    <div className="quote-info-row">
                      <span className="quote-info-label">Chào giá của bạn</span>
                      <span className="quote-info-val">Không trúng thầu</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="quote-info-col">
                  <h3 className="quote-info-heading">Thông tin giao nhận</h3>
                  <div className="quote-info-list">
                    <div className="quote-info-row">
                      <span className="quote-info-label">Người nhận hàng</span>
                      <span className="quote-info-val">
                        <strong>{q.customerInfo?.fullName || '—'}</strong>
                      </span>
                    </div>
                    <div className="quote-info-row">
                      <span className="quote-info-label">Số điện thoại</span>
                      <span className="quote-info-val">
                        <strong>{q.customerInfo?.phoneNumber || '—'}</strong>
                      </span>
                    </div>
                    <div className="quote-info-row">
                      <span className="quote-info-label">Địa chỉ nhận hàng</span>
                      <span className="quote-info-val">{q.customerInfo?.shippingAddress || '—'}</span>
                    </div>
                    {cleanPkgNote && (
                      <div className="quote-info-row">
                        <span className="quote-info-label">Ghi chú đóng gói</span>
                        <span className="quote-info-val">{cleanPkgNote}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {hasActionButtons && (
              <div className="button-row quote-action-bar">
                {own&&q.status==='draft'&&(
                  <>
                    <button className="btn" disabled={busy} onClick={()=>act('send')}><Send size={16}/> Gửi yêu cầu tới xưởng</button>
                    <button className="text-link" onClick={()=>setDialog('edit')}>Sửa bản nháp</button>
                  </>
                )}
                {user.role==='artisan'&&['sent','bidding'].includes(q.status)&&isTargetArtisan&&(
                  <button className="btn" onClick={()=>setDialog('bid')}>{mineBid?'Cập nhật chào giá':'Gửi chào giá lô tranh'}</button>
                )}
                {mine?.status==='accepted'&&(
                  <button className="btn" disabled={busy} onClick={()=>act('production',{action:'start'})}>Bắt đầu sản xuất toàn bộ lô</button>
                )}
                {mine?.status==='in_production'&&(
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={()=>setDialog('confirm_complete')}
                  >
                    Báo hoàn thành lô tranh
                  </button>
                )}
                {mine?.status==='ready'&&!mine.batchId&&<button className="btn" disabled={busy} onClick={()=>setDialog('complete')}>Tạo landing page cho lô đã hoàn thành</button>}
                {own&&q.status==='in_production'&&(
                  <button className="btn" disabled={busy||q.allocations?.some(a=>a.status!=='ready')} onClick={()=>act('deliver')}>Xác nhận đã nhận đủ hàng</button>
                )}
              </div>
            )}
          </div>

          {/* Panel Danh sách tác phẩm thành phần trong lô */}
          {q.items&&q.items.length>0&&(
            <div className="panel quote-items-panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow" style={{marginBottom:4}}>DANH SÁCH TÁC PHẨM TRONG LÔ ({q.items.length})</span>
                  <h2 style={{margin:0,fontSize:'21px'}}>Các bức tranh chế tác</h2>
                </div>
                <span className="badge" style={{fontSize:'13px',padding:'4px 12px'}}>Tổng {q.quantity?.toLocaleString('vi-VN')} bản in</span>
              </div>
              <div className="cart-table-shell">
                <table className="cart-table quote-art-table">
                  <thead>
                    <tr>
                      <th style={{width:54}}>Ảnh</th>
                      <th>Tác phẩm</th>
                      <th style={{width:140}}>Kích thước</th>
                      <th style={{width:110,textAlign:'center'}}>Số lượng</th>
                      <th>Ghi chú in ấn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.items.map((it,idx)=>(
                      <tr key={it.productId||idx}>
                        <td>
                          <Link to={'/tranh/' + it.productId} title="Xem chi tiết tác phẩm" style={{display:'block'}}>
                            <img src={it.image||'/art/in-tranh.jpg'} alt={it.artworkName} className="cart-thumbnail" style={{width:48,height:48}}/>
                          </Link>
                        </td>
                        <td>
                          <div className="quote-item-info">
                            <Link to={'/tranh/' + it.productId} title="Xem chi tiết tác phẩm" style={{textDecoration:'none',color:'inherit'}}>
                              <h4 style={{margin:'0 0 4px',fontFamily:'var(--serif)',fontSize:'15.5px',color:'var(--ink)'}}>{it.artworkName}</h4>
                            </Link>
                            <div className="cart-item-tags">
                              <span>{it.category}</span>
                              {it.type==='custom'?(
                                <span className="cart-tag-custom">Độc bản · {it.workshopName||'Xưởng'}</span>
                              ):(
                                <span className="cart-tag-general">Di sản</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{fontSize:'13.5px',color:'var(--ink)'}}>{it.dimensions||'Tiêu chuẩn'}</td>
                        <td style={{textAlign:'center'}}>
                          <strong style={{fontSize:'15px',color:'var(--ink)'}}>{it.quantity?.toLocaleString('vi-VN')}</strong>{' '}
                          <span style={{fontSize:'12.5px',color:'var(--muted)'}}>bản</span>
                        </td>
                        <td style={{fontSize:'13px',color:it.note?'var(--ink)':'var(--muted)'}}>{it.note||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Khi ĐÃ CHẤP NHẬN XƯỞNG: Thay thế hoàn toàn phần Chào giá bằng 1 Panel duy nhất của Xưởng đảm nhận */}
          {isClosedStage ? (
            <div className="panel quote-contract-panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow" style={{marginBottom:4}}>ĐƠN VỊ THỰC HIỆN</span>
                  <h2 style={{margin:0,fontSize:'21px'}}>Xưởng đảm nhận sản xuất trọn gói</h2>
                </div>
                {isWinningWorkshop && (
                  <span className="badge-won-tag">Xưởng của bạn</span>
                )}
              </div>

              {(q.allocations?.length ? q.allocations : [{ workshopId: acceptedWorkshopId, quantity: q.quantity, unitPrice: q.bids?.find(b=>b.workshopId===acceptedWorkshopId)?.unitPrice || 0, status: q.status }]).map(a => {
                const winningBid = q.bids?.find(b => b.workshopId === a.workshopId);
                const unitPrice = a.unitPrice || winningBid?.unitPrice || 0;
                const contractTotal = winningBid?.totalPrice || (unitPrice * (a.quantity || q.quantity));
                return (
                  <div className="contract-workshop-card" key={a.workshopId}>
                    <div className="contract-card-main">
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:6}}>
                          <h3 style={{margin:0,fontFamily:'var(--serif)',fontSize:'18px'}}>{studioName(a.workshopId)}</h3>
                          <Badge status={q.status==='delivered'?'delivered':(a.status||q.status)}/>
                        </div>
                        <p className="contract-meta-line">
                          Nhận trọn gói 100% lô (<strong>{(a.quantity || q.quantity)?.toLocaleString('vi-VN')} bản in</strong>)
                          {winningBid?.days ? <> · Thời gian cam kết: <strong>{winningBid.days} ngày</strong></> : null}
                        </p>
                        {winningBid?.note && (
                          <p className="contract-note-line">Cam kết chế tác: &ldquo;{winningBid.note}&rdquo;</p>
                        )}
                      </div>

                      {!isAssignedToOtherWorkshop && unitPrice > 0 && (
                        <div className="contract-price-col">
                          <span className="contract-unit-price">Đơn giá BQ: <strong>{money(unitPrice)}</strong> / bản</span>
                          <strong className="contract-total-price">{money(contractTotal)} <small>/ trọn gói</small></strong>
                        </div>
                      )}
                    </div>

                    {!isAssignedToOtherWorkshop && winningBid?.itemPrices?.length > 0 && (
                      <div className="contract-itemized-section">
                        <span className="contract-itemized-title">Bảng đơn giá thỏa thuận theo từng tác phẩm:</span>
                        <div className="contract-itemized-list">
                          {winningBid.itemPrices.map(ip => {
                            const item = q.items?.find(it => it.productId === ip.productId);
                            const qty = item?.quantity || 1;
                            return (
                              <div key={ip.productId} className="contract-itemized-row">
                                <span>{item?.artworkName || ip.productId} <small style={{color:'var(--muted)'}}>({qty} bản)</small></span>
                                <span>{money(ip.unitPrice)} / bản · <strong>{money(ip.unitPrice * qty)}</strong></span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {a.batchId && (
                      <div className="contract-batch-footer">
                        <span>Trang truy xuất nguồn gốc & Mã QR của lô tranh đã hoàn thành:</span>
                        <BatchPageLinks batchId={a.batchId}/>
                      </div>
                    )}
                  </div>
                );
              })}

              {isAssignedToOtherWorkshop && mineBid && (
                <div className="other-artisan-bid-summary">
                  <div>
                    <span className="eyebrow" style={{marginBottom:2}}>ĐỀ NGHỊ BÁO GIÁ XƯỞNG BẠN ĐÃ GỬI</span>
                    <p style={{margin:0,fontSize:'13.5px',color:'var(--ink)'}}>
                      Tổng báo giá: <strong>{money(mineBid.totalPrice || (mineBid.unitPrice * q.quantity))}</strong> (Đơn giá BQ: {money(mineBid.unitPrice)} / bản) · Thời gian: <strong>{mineBid.days} ngày</strong>
                    </p>
                  </div>
                  <span className="badge status-other-workshop">Không trúng thầu</span>
                </div>
              )}
            </div>
          ) : (
            /* Khi CHƯA CHẤP NHẬN XƯỞNG: Hiển thị danh sách chào giá từ các xưởng */
            <div className="panel quote-bids-panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow" style={{marginBottom:4}}>ĐỀ NGHỊ BÁO GIÁ</span>
                  <h2 style={{margin:0,fontSize:'21px'}}>Chào giá từ các xưởng</h2>
                </div>
                <span className="badge" style={{fontSize:'13px',padding:'4px 12px'}}>{q.bids?.length||0} chào giá</span>
              </div>
              {!q.bids?.length&&(
                <Empty title="Chưa có chào giá nào">
                  <p>{isDirect?'Đang chờ xưởng chế tác phản hồi và gửi chào giá.':'Các xưởng phù hợp sẽ gửi chào giá trọn gói sau khi yêu cầu được chuyển tới.'}</p>
                </Empty>
              )}
              {q.bids?.map(b=>{
                const totalPrice=b.totalPrice || (b.unitPrice*q.quantity);
                const isMyBid=studio.data?._id===b.workshopId;
                return (
                  <article className={'bid-card '+(isMyBid?'bid-card-mine':'')} key={b.workshopId}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                        <h3 style={{margin:0,fontFamily:'var(--serif)',fontSize:'17px'}}>{studioName(b.workshopId)}</h3>
                        {isMyBid&&<span className="badge-bid-sent">Báo giá của xưởng bạn</span>}
                      </div>
                      <p style={{margin:'4px 0',fontSize:'13.5px',color:'var(--ink)'}}>
                        Thời gian hoàn thành: <strong>{b.days} ngày</strong> · Nhận trọn gói {b.quantity?.toLocaleString('vi-VN')} bản
                      </p>
                      {b.note&&<p style={{margin:'4px 0',fontSize:'13.5px',color:'var(--muted)',fontStyle:'italic'}}>&ldquo;{b.note}&rdquo;</p>}
                      {b.itemPrices&&b.itemPrices.length>0&&(
                        <details className="bid-itemized-dropdown">
                          <summary style={{fontSize:'12.5px',cursor:'pointer',color:'var(--ink)',fontWeight:500}}>
                            Chi tiết đơn giá từng tác phẩm ({b.itemPrices.length} tranh)
                          </summary>
                          <div className="bid-itemized-grid">
                            {b.itemPrices.map(ip=>{
                              const item=q.items?.find(it=>it.productId===ip.productId);
                              return (
                                <div key={ip.productId} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'4px 8px',background:'var(--bg)',borderRadius:4}}>
                                  <span>{item?.artworkName || ip.productId} ({item?.quantity || 1} bản)</span>
                                  <strong>{money(ip.unitPrice)} <small style={{fontWeight:400,color:'var(--muted)'}}>/ bản</small></strong>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      )}
                    </div>
                    <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                      <div style={{fontSize:'13px',color:'var(--muted)'}}>Đơn giá BQ: <strong style={{color:'var(--ink)'}}>{money(b.unitPrice)}</strong> / bản</div>
                      <strong style={{fontSize:'22px',color:'var(--red)'}}>{money(totalPrice)}<small style={{fontSize:'12px',fontWeight:400,color:'var(--muted)'}}> / trọn gói</small></strong>
                      {own&&['sent','bidding'].includes(q.status)&&(
                        <button
                          type="button"
                          className="btn small"
                          disabled={busy}
                          onClick={()=>setConfirmingBid(b)}
                        >
                          Chọn xưởng này
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Cột bên phải: Lịch sử mốc cập nhật */}
        <aside className="panel history-panel">
          <span className="eyebrow">NHẬT KÝ YÊU CẦU</span>
          <h2>Các mốc cập nhật</h2>
          {[...(q.history||[])].reverse().map((h,i)=>(
            <div className="history-item" key={i}>
              <span/>
              <div>
                <strong>{h.note}</strong>
                <p>{new Date(h.at).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          ))}
          <p className="muted">Mọi thay đổi trạng thái được lưu lại minh bạch trên hệ thống.</p>
        </aside>
      </div>

      {dialog==='edit'&&<FormDialog title="Sửa bản nháp" fields={quoteFields} initial={pick(q,quoteFields)} onClose={()=>setDialog(null)} onSubmit={async body=>{await api('/quotes/'+id,{method:'PATCH',body:{...body,version:q.version}});state.reload();notify('Đã lưu bản nháp');}}/>}
      {dialog==='confirm_complete'&&(
        <CompletionConfirmModal
          quote={q}
          onClose={()=>setDialog(null)}
          onConfirm={()=>setDialog('complete')}
          busy={busy}
        />
      )}
      {dialog==='complete'&&mine&&studio.data&&<BatchLandingDialog quote={q} allocation={mine} studio={studio.data} initialDraft={mine.journalDraft} onClose={()=>setDialog(null)} onRefresh={state.reload} onSubmit={async (landingPage,version)=>{await api('/quotes/'+id+'/production',{method:'POST',body:{version,action:'ready',landingPage}});state.reload();notify('Đã hoàn thành lô tranh và tạo landing page cùng mã QR');}}/>}
      {dialog==='bid'&&(
        <WorkshopBidDialog
          quote={q}
          initialBid={mineBid}
          onClose={()=>setDialog(null)}
          onSubmit={async body=>{
            await api('/quotes/'+id+'/bids',{method:'POST',body:{...body,version:q.version}});
            state.reload();
            notify(mineBid ? 'Đã cập nhật chào giá lô tranh' : 'Đã gửi chào giá lô tranh');
          }}
        />
      )}
      {confirmingBid && (
        <ConfirmWorkshopModal
          quote={q}
          bid={confirmingBid}
          studioName={studioName(confirmingBid.workshopId)}
          onClose={()=>setConfirmingBid(null)}
          onConfirm={handleConfirmWorkshop}
          busy={busy}
        />
      )}
    </section>
  );
}


