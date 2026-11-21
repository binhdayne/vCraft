const PRODUCT_KEY='vcraft-request-product-id';
const OPENED_KEY='vcraft-request-opened';

function currentProductId(){
  const match=window.location.hash.match(/^#\/tranh\/([^/?]+)/);
  return match?.[1]||'';
}

async function fillRequestCart(){
  const productId=sessionStorage.getItem(PRODUCT_KEY);
  const input=document.querySelector('input[aria-label="Tìm tranh"]');
  if(!productId||!input)return;
  try{
    const response=await fetch('/api/v1/products/'+encodeURIComponent(productId));
    const product=await response.json();
    const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
    setter?.call(input,product.name||productId);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    setTimeout(()=>{
      const result=[...document.querySelectorAll('.cart-result')].find(item=>item.textContent.includes(product.name))||document.querySelector('.cart-result');
      if(result){result.click();sessionStorage.removeItem(PRODUCT_KEY);}
    },1000);
  }catch{sessionStorage.removeItem(PRODUCT_KEY);}
}

function bridge(){
  const productId=currentProductId();
  if(productId){
    sessionStorage.setItem(PRODUCT_KEY,productId);
    sessionStorage.removeItem(OPENED_KEY);
    return;
  }
  if(!window.location.hash.startsWith('#/workspace')||!sessionStorage.getItem(PRODUCT_KEY)||sessionStorage.getItem(OPENED_KEY)==='1')return;
  const button=document.querySelector('.workspace-content .page-title .btn');
  if(!button)return;
  sessionStorage.setItem(OPENED_KEY,'1');
  button.click();
  setTimeout(fillRequestCart,300);
}

setInterval(bridge,250);

