import React,{createContext,useContext,useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {X,Upload,ArrowUpRight,LoaderCircle,ChevronLeft,ChevronRight,ShoppingCart,Trash2,Plus,Minus,Check,ShieldCheck,AlertCircle} from 'lucide-react';
export const CATEGORIES=['Chúc tụng','Sinh hoạt','Lịch sử & dân gian','Tứ quý'];
export const STATUS={draft:'Bản nháp',sent:'Đã gửi tới xưởng',bidding:'Đang nhận chào giá',accepted:'Đã chấp nhận',in_production:'Đang sản xuất',delivered:'Đã giao hàng',ready:'Sẵn sàng giao'};
export const money=v=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(v||0);
export const date=v=>v?new Date(v).toLocaleDateString('vi-VN'):'';
export async function api(url,options={}){const token=sessionStorage.getItem('vcraft-token');const headers={...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{}),...options.headers};const res=await fetch('/api/v1'+url,{...options,headers,body:options.body&&!(options.body instanceof FormData)?JSON.stringify(options.body):options.body});let data;try{data=await res.json();}catch{data={message:'Không thể đọc phản hồi từ máy chủ'};}if(!res.ok)throw new Error(Array.isArray(data.message)?data.message.join(', '):data.message||'Không thể thực hiện thao tác');return data;}
const AppContext=createContext(null);
export function useApp(){return useContext(AppContext);}
export function AppProvider({children}){const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[toast,setToast]=useState('');useEffect(()=>{if(!sessionStorage.getItem('vcraft-token')){setLoading(false);return;}api('/auth/me').then(setUser).catch(()=>sessionStorage.removeItem('vcraft-token')).finally(()=>setLoading(false));},[]);useEffect(()=>{if(toast){const timer=setTimeout(()=>setToast(''),2500);return()=>clearTimeout(timer);}},[toast]);const login=data=>{sessionStorage.setItem('vcraft-token',data.token);setUser(data.user);};const logout=()=>{sessionStorage.removeItem('vcraft-token');setUser(null);};return <AppContext.Provider value={{user,setUser,loading,login,logout,notify:setToast,refreshUser:()=>api('/auth/me').then(setUser)}}>{children}{toast&&<div role="status" className="toast">{toast}<button aria-label="Đóng thông báo" onClick={()=>setToast('')}><X size={16}/></button></div>}</AppContext.Provider>;}
const CartContext=createContext(null);
export function useCart(){return useContext(CartContext);}
export function CartProvider({children}){
  const {user,notify}=useApp();
  const [cart,setCart]=useState(null);
  const [loading,setLoading]=useState(false);
  const [isMiniCartOpen,setIsMiniCartOpen]=useState(false);
  const [isCartDialogOpen,setIsCartDialogOpen]=useState(false);

  const loadCart=async()=>{
    if(!user||user.role!=='buyer'){setCart(null);return;}
    try{setLoading(true);const data=await api('/cart');setCart(data);}catch{setCart(null);}finally{setLoading(false);}
  };

  useEffect(()=>{loadCart();},[user]);

  const addToCart=async(productId,quantity=10,note='')=>{
    if(!user){notify('Vui lòng đăng nhập để thêm tranh vào giỏ hàng');return null;}
    if(user.role!=='buyer'){notify('Tài khoản nghệ nhân hoặc BQL không sử dụng giỏ hàng khách');return null;}
    try{
      const updated=await api('/cart/items',{method:'POST',body:{productId,quantity,note}});
      setCart(updated);
      notify('Đã thêm vào giỏ hàng');
      return updated;
    }catch(e){notify(e.message||'Không thể thêm vào giỏ hàng');throw e;}
  };

  const updateCartItem=async(productId,patchData)=>{
    try{
      const updated=await api('/cart/items/'+productId,{method:'PATCH',body:patchData});
      setCart(updated);
      return updated;
    }catch(e){notify(e.message||'Không thể cập nhật giỏ hàng');throw e;}
  };

  const removeCartItem=async(productId)=>{
    try{
      const updated=await api('/cart/items/'+productId,{method:'DELETE'});
      setCart(updated);
      notify('Đã bỏ tranh khỏi giỏ');
      return updated;
    }catch(e){notify(e.message||'Không thể xóa tranh');throw e;}
  };

  const clearCart=async(onlySelected=false)=>{
    try{
      const updated=await api('/cart/clear',{method:'POST',body:{onlySelected}});
      setCart(updated);
      return updated;
    }catch(e){notify(e.message||'Không thể dọn giỏ hàng');throw e;}
  };

  const cartCount=cart?.totalItems||(cart?.items?.length||0);

  return (
    <CartContext.Provider value={{
      cart,loading,cartCount,
      isMiniCartOpen,setIsMiniCartOpen,
      isCartDialogOpen,setIsCartDialogOpen,
      addToCart,updateCartItem,removeCartItem,clearCart,reloadCart:loadCart,
      openCart:()=>{setIsCartDialogOpen(true);setIsMiniCartOpen(false);},
      closeCart:()=>setIsCartDialogOpen(false),
      toggleMiniCart:()=>setIsMiniCartOpen(v=>!v),
      closeMiniCart:()=>setIsMiniCartOpen(false),
    }}>
      {children}
      <CartDialog isOpen={isCartDialogOpen} onClose={()=>setIsCartDialogOpen(false)}/>
    </CartContext.Provider>
  );
}

export function CartDialog({isOpen,onClose}){
  const {cart,updateCartItem,removeCartItem,clearCart}=useCart();
  const {user,notify}=useApp();
  const [step,setStep]=useState('cart');
  const [busy,setBusy]=useState(false);
  const studios=useLoad('/workshops');
  const [checkoutData,setCheckoutData]=useState({title:'',deadline:'',fullName:'',phoneNumber:'',shippingAddress:'',packagingNote:'',targetType:'bidding',targetWorkshopId:''});

  useEffect(()=>{
    if(isOpen){
      setStep('cart');
      if(user){
        setCheckoutData({
          title:'Lô tranh đặt in - '+new Date().toLocaleDateString('vi-VN'),
          deadline:new Date(Date.now()+14*86400000).toISOString().slice(0,10),
          fullName:user.name||'',
          phoneNumber:user.phone||'',
          shippingAddress:user.address||'',
          packagingNote:'',
          targetType:'bidding',
          targetWorkshopId:'',
        });
      }
    }
  },[isOpen,user]);

  if(!isOpen)return null;
  const selectedItems=(cart?.items||[]).filter(i=>i.selected);
  const hasConflict=(cart?.customWorkshopCount||0)>1;

  const handleCheckoutSubmit=async(e)=>{
    e.preventDefault();
    if(busy)return;
    if(selectedItems.length===0){notify('Vui lòng chọn ít nhất 1 tác phẩm để tạo đơn');return;}
    if(hasConflict){notify('Không thể gộp tranh độc bản của nhiều xưởng vào cùng một đơn');return;}
    if(!cart.hasCustomArtwork&&checkoutData.targetType==='direct'&&!checkoutData.targetWorkshopId){
      notify('Vui lòng chọn xưởng chế tác nhận đơn');
      return;
    }
    try{
      setBusy(true);
      const isCustom=cart.hasCustomArtwork;
      const targetType=isCustom?'direct':checkoutData.targetType;
      const targetWorkshopId=isCustom?cart.targetWorkshopId:(checkoutData.targetType==='direct'?checkoutData.targetWorkshopId:null);

      const payload={
        title:checkoutData.title,
        deadline:checkoutData.deadline,
        description:checkoutData.packagingNote||'Yêu cầu đặt in lô tranh theo thỏa thuận',
        targetType,
        targetWorkshopId,
        customerInfo:{
          fullName:checkoutData.fullName,
          phoneNumber:checkoutData.phoneNumber,
          shippingAddress:checkoutData.shippingAddress,
          packagingNote:checkoutData.packagingNote,
        },
        items:selectedItems.map(i=>({productId:i.productId,quantity:i.quantity,note:i.note||''})),
      };
      const created=await api('/quotes',{method:'POST',body:payload});
      await clearCart(true);
      notify('Tạo yêu cầu đặt lô thành công!');
      onClose();
      window.location.hash='#/quotes/'+created._id;
    }catch(err){
      notify(err.message||'Không thể tạo đơn hàng');
    }finally{
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <section role="dialog" aria-modal="true" aria-labelledby="cart-dialog-title" className="modal cart-modal">
        <div className="modal-head">
          <h2 id="cart-dialog-title">{step==='cart'?`Giỏ hàng tác phẩm (${cart?.totalItems||0})`:'Xác nhận thông tin đặt lô'}</h2>
          <button className="icon-btn" aria-label="Đóng" onClick={onClose}><X size={20}/></button>
        </div>

        {step==='cart'?(
          <div className="cart-body">
            {!cart?.items?.length?(
              <div className="cart-empty-box">
                <div className="cart-empty-icon-wrap">
                  <ShoppingCart size={34} strokeWidth={1.3}/>
                </div>
                <h3>Giỏ hàng đang trống</h3>
                <p>Khám phá bộ sưu tập và chọn những tác phẩm bạn muốn đặt in.</p>
                <Link to="/tranh" className="btn outline" onClick={onClose}>Khám phá bộ sưu tập</Link>
              </div>
            ):(
              <>
                {cart.hasCustomArtwork&&(
                  <div className={'cart-copyright-banner '+(hasConflict?'banner-conflict':'banner-direct')}>
                    {hasConflict?(
                      <>
                        <AlertCircle size={17}/>
                        <div><strong>Xung đột xưởng chế tác:</strong> Không thể gộp tranh độc bản của nhiều xưởng trong cùng một đơn. Vui lòng bỏ tick chọn tranh để tách theo từng xưởng.</div>
                      </>
                    ):(
                      <>
                        <ShieldCheck size={17}/>
                        <div><strong>Tranh độc bản:</strong> Đơn hàng sẽ được gửi trực tiếp tới xưởng sở hữu ván in chế tác (không qua đấu thầu công khai).</div>
                      </>
                    )}
                  </div>
                )}

                <div className="cart-table-shell">
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th style={{width:44, textAlign:'center'}}>
                          <input type="checkbox" checked={cart.items.length>0&&cart.items.every(i=>i.selected)} onChange={e=>{
                            const checked=e.target.checked;
                            cart.items.forEach(i=>{if(i.selected!==checked)updateCartItem(i.productId,{selected:checked});});
                          }}/>
                        </th>
                        <th>Tác phẩm</th>
                        <th style={{width:160, textAlign:'center'}}>Số lượng</th>
                        <th style={{width:52, textAlign:'center'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map(item=>(
                        <tr key={item.productId} className={item.selected?'is-selected':''}>
                          <td style={{textAlign:'center'}}>
                            <input type="checkbox" checked={item.selected} onChange={e=>updateCartItem(item.productId,{selected:e.target.checked})}/>
                          </td>
                          <td>
                            <div className="cart-item-info-cell">
                              <Link
                                to={'/tranh/' + item.productId}
                                onClick={onClose}
                                className="cart-thumbnail-link"
                                title="Xem chi tiết tác phẩm"
                              >
                                <img src={item.image||'/art/in-tranh.jpg'} alt={item.artworkName} className="cart-thumbnail"/>
                              </Link>
                              <div>
                                <Link
                                  to={'/tranh/' + item.productId}
                                  onClick={onClose}
                                  className="cart-item-name-link"
                                  title="Xem chi tiết tác phẩm"
                                >
                                  <h4 className="cart-item-name">{item.artworkName}</h4>
                                </Link>
                                <div className="cart-item-tags">
                                  <span>{item.category}</span>
                                  <span>·</span>
                                  <span>{item.dimensions}</span>
                                  {item.type==='custom'?(
                                    <span className="cart-tag-custom">Độc bản · {item.workshopName||'Xưởng'}</span>
                                  ):(
                                    <span className="cart-tag-general">Di sản</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{textAlign:'center'}}>
                            <div className="cart-counter">
                              <button type="button" disabled={item.quantity<=1} onClick={()=>updateCartItem(item.productId,{quantity:Math.max(1,item.quantity-1)})}>
                                <Minus size={13}/>
                              </button>
                              <input type="number" min={1} max={1000000} value={item.quantity} onChange={e=>{
                                const val=Math.max(1,parseInt(e.target.value)||1);
                                updateCartItem(item.productId,{quantity:val});
                              }}/>
                              <button type="button" onClick={()=>updateCartItem(item.productId,{quantity:item.quantity+1})}>
                                <Plus size={13}/>
                              </button>
                            </div>
                          </td>
                          <td style={{textAlign:'center'}}>
                            <button type="button" className="icon-btn delete-btn" title="Bỏ tranh khỏi giỏ" onClick={()=>removeCartItem(item.productId)}>
                              <Trash2 size={16}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="cart-footer-bar">
                  <div className="cart-summary-text">
                    Đã chọn: <strong>{cart.selectedItems}</strong> tác phẩm · <strong>{cart.selectedQuantity}</strong> bản in
                  </div>
                  <div className="cart-actions-group">
                    <button
                      type="button"
                      className="btn ghost small"
                      disabled={cart.selectedItems===0}
                      onClick={()=>clearCart(true)}
                    >
                      <Trash2 size={13}/>
                      <span>Xóa khỏi giỏ hàng</span>
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      disabled={cart.selectedItems===0||hasConflict}
                      onClick={()=>setStep('checkout')}
                    >
                      Tiến hành đặt lô
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ):(
          <form className="cart-checkout-form" onSubmit={handleCheckoutSubmit}>
            <div className="checkout-summary-pill">
              Lô đặt in: <strong>{cart.selectedItems} tác phẩm</strong> (Tổng cộng <strong>{cart.selectedQuantity} bản in</strong>)
            </div>

            <div className="form-grid">
              <label className="wide">
                <span>Tiêu đề đơn yêu cầu đặt lô *</span>
                <input required maxLength={150} value={checkoutData.title} onChange={e=>setCheckoutData({...checkoutData,title:e.target.value})}/>
              </label>

              {cart.hasCustomArtwork?(
                <div className="direct-lock-notice wide">
                  <ShieldCheck size={16}/>
                  <span>Đơn hàng được gửi trực tiếp tới xưởng <strong>{cart.items.find(i=>i.type==='custom')?.workshopName||'chế tác'}</strong> (do có tác phẩm độc bản).</span>
                </div>
              ):(
                <>
                  <label className="wide">
                    <span>Phương thức điều phối sản xuất *</span>
                    <select value={checkoutData.targetType} onChange={e=>setCheckoutData({...checkoutData,targetType:e.target.value,targetWorkshopId:''})}>
                      <option value="bidding">Đấu thầu công khai (Các xưởng cùng chào giá cạnh tranh)</option>
                      <option value="direct">Gửi trực tiếp tới 1 xưởng chỉ định</option>
                    </select>
                  </label>
                  {checkoutData.targetType==='direct'&&(
                    <label className="wide">
                      <span>Chọn xưởng chế tác nhận đơn *</span>
                      <select required value={checkoutData.targetWorkshopId} onChange={e=>setCheckoutData({...checkoutData,targetWorkshopId:e.target.value})}>
                        <option value="">-- Chọn xưởng làng nghề --</option>
                        {studios.data?.map(s=>(
                          <option key={s._id} value={s._id}>{s.name} ({s.address||'Làng Đông Hồ'})</option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              )}

              <label>
                <span>Hạn giao hàng mong muốn *</span>
                <input type="date" required min={new Date().toISOString().slice(0,10)} value={checkoutData.deadline} onChange={e=>setCheckoutData({...checkoutData,deadline:e.target.value})}/>
              </label>

              <label>
                <span>Người liên hệ / nhận hàng *</span>
                <input required maxLength={100} value={checkoutData.fullName} onChange={e=>setCheckoutData({...checkoutData,fullName:e.target.value})}/>
              </label>

              <label>
                <span>Số điện thoại liên hệ *</span>
                <input required type="tel" maxLength={20} value={checkoutData.phoneNumber} onChange={e=>setCheckoutData({...checkoutData,phoneNumber:e.target.value})}/>
              </label>

              <label className="wide">
                <span>Địa chỉ nhận hàng mặc định *</span>
                <input required maxLength={300} value={checkoutData.shippingAddress} onChange={e=>setCheckoutData({...checkoutData,shippingAddress:e.target.value})}/>
              </label>

              <label className="wide">
                <span>Ghi chú chung cho toàn bộ đơn lô</span>
                <textarea rows={3} maxLength={1000} placeholder="Yêu cầu về bao gói, hộp quà, chứng chỉ xuất xưởng, vận chuyển..." value={checkoutData.packagingNote} onChange={e=>setCheckoutData({...checkoutData,packagingNote:e.target.value})}/>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn ghost" disabled={busy} onClick={()=>setStep('cart')}>Quay lại giỏ hàng</button>
              <button type="submit" className="btn" disabled={busy}>{busy?'Đang gửi yêu cầu…':'Gửi yêu cầu đặt tranh'}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
export function useLoad(url){const [data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);useEffect(()=>{let alive=true;setLoading(true);setError('');api(url).then(v=>{if(alive)setData(v);}).catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[url,revision]);return {data,error,loading,reload:()=>setRevision(x=>x+1)};}
export function LoadState({loading,error,retry}){if(error)return <div className="empty" role="alert"><h3>Chưa tải được dữ liệu</h3><p>{error}</p>{retry&&<button className="btn" onClick={retry}>Thử lại</button>}</div>;if(loading)return <div className="loading"><LoaderCircle className="spin"/> Đang tải…</div>;return null;}
export function Empty({title='Chưa có dữ liệu',children}){return <div className="empty"><span className="empty-mark">✳</span><h3>{title}</h3>{children}</div>;}
export function Badge({status}){return <span className={'badge status-'+status}>{STATUS[status]||status}</span>;}
export function ArtworkCard({p}){
  const {addToCart}=useCart();
  const [adding,setAdding]=useState(false);

  const handleQuickAdd=async(e)=>{
    e.preventDefault();
    e.stopPropagation();
    if(adding)return;
    setAdding(true);
    try{
      await addToCart(p._id,10);
    }finally{
      setAdding(false);
    }
  };

  return (
    <Link className="art-card" to={'/tranh/'+p._id}>
      <div className="art-image">
        <img loading="lazy" src={p.images?.[0]||'/art/in-tranh.jpg'} alt={p.name}/>
        <span className="art-arrow"><ArrowUpRight size={18}/></span>
      </div>
      <div className="art-card-body">
        <div className="art-meta">
          <span>{p.category}</span>
          <span>·</span>
          <span>{p.dimensions}</span>
          {p.type==='custom'&&<span className="custom-tag">Độc bản</span>}
        </div>
        <h3 title={p.name}>{p.name}</h3>
        <div className="art-card-footer">
          <div className="art-card-sub">
            {p.type==='custom'?(
              <span className="art-custom-note">Độc bản xưởng</span>
            ):(
              <span className="art-general-note">Di sản làng nghề</span>
            )}
          </div>
          <button
            type="button"
            className="art-quick-add-btn"
            title="Thêm vào giỏ hàng (10 bản)"
            aria-label="Thêm vào giỏ"
            disabled={adding}
            onClick={handleQuickAdd}
          >
            <ShoppingCart size={13}/>
            <span>{adding?'Đang thêm…':'+ Giỏ'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
export function PageTitle({eyebrow,title,children,action}){return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children&&<p>{children}</p>}</div>{action}</div>;}
export function ImageUpload({value=[],onChange,onBusyChange}){const [busy,setBusy]=useState(false),[error,setError]=useState('');async function upload(e){const files=Array.from(e.target.files||[]);if(!files.length)return;setError('');if(files.length+value.length>8){setError('Tối đa 8 ảnh.');e.target.value='';return;}setBusy(true);onBusyChange?.(true);try{const body=new FormData();files.forEach(f=>body.append('files',f));const result=await api('/media',{method:'POST',body});onChange([...value,...result.urls]);}catch(e){setError(e.message);}finally{setBusy(false);onBusyChange?.(false);e.target.value='';}}return <div className="upload"><div className="upload-previews">{value.map((src,i)=><div key={src+i}><img src={src} alt={'Ảnh '+(i+1)}/><button type="button" aria-label={'Xóa ảnh '+(i+1)} disabled={busy} onClick={()=>onChange(value.filter((_,j)=>j!==i))}><X size={14}/></button></div>)}</div><label className="upload-button"><Upload size={18}/>{busy?'Đang tối ưu ảnh…':'Thêm ảnh'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={upload}/></label><small>JPEG, PNG, WebP · tối đa 8 MB/ảnh · tối đa 8 ảnh</small>{error&&<p className="error">{error}</p>}</div>;}
export function FormDialog({title,fields,initial={},onSubmit,onClose,submitLabel='Lưu thay đổi'}){const [values,setValues]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uploads,setUploads]=useState({});const uploading=Object.values(uploads).some(Boolean);useEffect(()=>{const handler=e=>{if(e.key==='Escape'&&!busy&&!uploading)onClose();};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler);},[busy,uploading,onClose]);const change=(name,value)=>setValues(v=>({...v,[name]:value}));async function submit(e){e.preventDefault();if(busy||uploading)return;setBusy(true);setError('');try{await onSubmit(values);onClose();}catch(e){setError(e.message);}finally{setBusy(false);}}return <div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="modal"><div className="modal-head"><h2 id="dialog-title">{title}</h2><button className="icon-btn" aria-label="Đóng" disabled={busy||uploading} onClick={onClose}><X/></button></div><form onSubmit={submit}><div className="form-grid">{fields.map((f,i)=><label key={f.name} className={f.wide?'wide':''}><span>{f.label}{f.required!==false&&f.type!=='checkbox'&&' *'}</span>{f.type==='images'?<ImageUpload value={values[f.name]||[]} onChange={v=>change(f.name,v)} onBusyChange={active=>setUploads(current=>({...current,[f.name]:active}))}/>:f.type==='textarea'?<textarea autoFocus={i===0} required={f.required!==false} maxLength={f.maxLength||10000} rows={4} value={values[f.name]||''} onChange={e=>change(f.name,e.target.value)}/>:f.type==='select'?<select required={f.required!==false} value={values[f.name]||''} onChange={e=>change(f.name,e.target.value)}><option value="">Chọn…</option>{f.options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>:f.type==='categories'?<div className="checks">{CATEGORIES.map(c=><label key={c}><input type="checkbox" checked={(values[f.name]||[]).includes(c)} onChange={e=>change(f.name,e.target.checked?[...(values[f.name]||[]),c]:(values[f.name]||[]).filter(x=>x!==c))}/>{c}</label>)}</div>:f.type==='checkbox'?<input type="checkbox" checked={!!values[f.name]} onChange={e=>change(f.name,e.target.checked)}/>:<input autoFocus={i===0} type={f.type||'text'} required={f.required!==false} min={f.min} max={f.max} step={f.step|| (f.type==='number'?'any':undefined)} maxLength={f.maxLength||500} value={values[f.name]??''} onChange={e=>change(f.name,f.type==='number'?Number(e.target.value):e.target.value)}/>}</label>)}</div>{error&&<p className="error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="btn ghost" disabled={busy||uploading} onClick={onClose}>Hủy</button><button className="btn" disabled={busy||uploading}>{busy?'Đang lưu…':uploading?'Đang tải ảnh…':submitLabel}</button></div></form></section></div>;}
export function Pagination({page,pages,onPageChange,total}){if(!pages||pages<=1)return null;function getPageItems(c,t){if(t<=7)return Array.from({length:t},(_,i)=>i+1);if(c<=4)return [1,2,3,4,5,'...',t];if(c>=t-3)return [1,'...',t-4,t-3,t-2,t-1,t];return [1,'...',c-1,c,c+1,'...',t];}const items=getPageItems(page,pages);return <nav className="pagination-shell" aria-label="Phân trang"><div className="pagination"><button type="button" className="page-nav-btn" aria-label="Trang trước" disabled={page<=1} onClick={()=>onPageChange(page-1)}><ChevronLeft size={17}/></button>{items.map((item,idx)=>item==='...'?<span key={'el-'+idx} className="page-ellipsis">…</span>:<button key={'p-'+item} type="button" className={'page-num-btn '+(page===item?'active':'')} aria-current={page===item?'page':undefined} onClick={()=>onPageChange(item)}>{item}</button>)}<button type="button" className="page-nav-btn" aria-label="Trang sau" disabled={page>=pages} onClick={()=>onPageChange(page+1)}><ChevronRight size={17}/></button></div>{typeof total==='number'&&<span className="pagination-info">Trang <strong>{page}</strong> / {pages} (Tổng {total} tranh)</span>}</nav>;}
