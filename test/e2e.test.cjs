require('reflect-metadata');
const {test}=require('node:test');const assert=require('node:assert/strict');const {NestFactory}=require('@nestjs/core');const {getConnectionToken}=require('@nestjs/mongoose');const {hash}=require('bcryptjs');const sharp=require('sharp');const fs=require('node:fs/promises');const path=require('node:path');
process.env.MONGODB_URI='mongodb://127.0.0.1:27017/vcraft_test_'+Date.now();process.env.JWT_SECRET='test-secret-only-'.repeat(4);process.env.NODE_ENV='test';
const {AppModule}=require('../dist/app.module');const {createDatabase}=require('../scripts/database.cjs');
test('end-to-end workflows against isolated MongoDB database',async t=>{
 const app=await NestFactory.create(AppModule,{logger:false});app.setGlobalPrefix('api/v1');await app.listen(0,'127.0.0.1');const base=await app.getUrl();const conn=app.get(getConnectionToken());const db=createDatabase(conn);const uploads=[];
 async function req(url,method='GET',body,token){const r=await fetch(base+'/api/v1'+url,{method,headers:{...(body instanceof FormData?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},body:body?(body instanceof FormData?body:JSON.stringify(body)):undefined});return {status:r.status,data:r.headers.get('content-type')?.includes('json')?await r.json():Buffer.from(await r.arrayBuffer())};}
 async function ok(url,method,body,token,status){const r=await req(url,method,body,token);assert.equal(r.status,status|| (method==='POST'?201:200),JSON.stringify(r.data));return r.data;}
 let admin,buyer,other,art1,art2,studio1,studio2,p1,p2,batch,q;const password='TestPassword123!';const categories=['Chúc tụng'];
 try{
 await Promise.all([db.users.init(),db.workshops.init(),db.batches.init(),conn.models.NotificationRead.init()]);
 await db.users.create({name:'Admin test',email:'admin@test.local',passwordHash:await hash(password,10),role:'admin',active:true});
 const studio={name:'Studio test',story:'Story test',address:'Demo address',latitude:21.06,longitude:106.08,openForVisits:true,visitingHours:'8–17',categories,images:['/art/dai-cat.jpg'],certificates:[]};
 await t.test('registration restricts role and guards admin endpoints',async()=>{
  assert.equal((await req('/auth/register','POST',{name:'Attacker',email:'attacker@test.local',password,role:'admin'})).status,400);
  buyer=(await ok('/auth/register','POST',{name:'Buyer',email:'buyer@test.local',password})).token;
  other=(await ok('/auth/register','POST',{name:'Other',email:'other@test.local',password})).token;
  admin=(await ok('/auth/login','POST',{email:'admin@test.local',password})).token;
  assert.equal((await req('/admin/users','GET',undefined,buyer)).status,403);
  assert.equal((await req('/admin/users')).status,401);
  assert.equal((await req('/auth/login','POST',{email:'buyer@test.local',password:'wrong'})).status,401);
  assert.equal((await req('/notifications')).status,401);
  assert.deepEqual((await ok('/notifications','GET',undefined,buyer)).items,[]);
  const accounts=await ok('/admin/users','GET',undefined,admin);assert.ok(accounts.every(u=>!u.passwordHash));
 });
 await t.test('admin-created studios are approved immediately and suspension still guards artisan actions',async()=>{
  studio1=await ok('/admin/artisans','POST',{name:'Artisan A',email:'a@test.local',password,workshop:studio},admin);
  studio2=await ok('/admin/artisans','POST',{name:'Artisan B',email:'b@test.local',password,workshop:{...studio,name:'Studio B'}},admin);
  assert.equal(studio1.approved,true);assert.equal(studio2.approved,true);
  assert.equal((await ok('/workshops','GET')).length,2);
  await ok('/admin/workshops/'+studio1._id+'/approval','PATCH',{approved:false},admin);
  await ok('/admin/workshops/'+studio2._id+'/approval','PATCH',{approved:false},admin);
  assert.equal((await ok('/workshops','GET')).length,0);
  art1=(await ok('/auth/login','POST',{email:'a@test.local',password})).token;art2=(await ok('/auth/login','POST',{email:'b@test.local',password})).token;
  const draft={name:'Painting A',category:'Chúc tụng',description:'Test artwork',price:100000,dimensions:'30x40',material:'Giấy điệp',images:['/art/dai-cat.jpg'],published:true};
  assert.equal((await req('/studio/products','POST',draft,art1)).status,403);
  await ok('/admin/workshops/'+studio1._id+'/approval','PATCH',{approved:true},admin);await ok('/admin/workshops/'+studio2._id+'/approval','PATCH',{approved:true},admin);
  p1=await ok('/studio/products','POST',draft,art1);
  p2=await ok('/studio/products','POST',{...draft,name:'Painting B'},art2);
  assert.equal((await req('/studio/products/'+p1._id,'PATCH',draft,art2)).status,404);
  assert.equal((await ok('/products?search=Painting','GET')).total,2);
  assert.equal((await ok('/products?search=%5B.*','GET')).total,0);
  assert.equal((await req('/products/invalid')).status,400);
 });
 await t.test('uploads optimize valid images and reject disguised files',async()=>{
  const data=new FormData();data.append('files',new Blob([await sharp({create:{width:2000,height:1000,channels:3,background:'#ad422e'}}).png().toBuffer()],{type:'image/png'}),'test.png');
  const result=await ok('/media','POST',data,art1);assert.match(result.urls[0],/^\/uploads\/.*\.webp$/);uploads.push(...result.urls);const info=await sharp(path.join(process.cwd(),'.local',result.urls[0])).metadata();assert.equal(info.width,1600);assert.equal(info.format,'webp');
  const fake=new FormData();fake.append('files',new Blob(['not an image'],{type:'image/png'}),'fake.png');assert.equal((await req('/media','POST',fake,art1)).status,400);
  assert.equal((await req('/media','POST',data,buyer)).status,403);
  const second=await ok('/media','POST',data,art2);uploads.push(...second.urls);
 });
 await t.test('map photos require uploads from the studio owner and follow saved images',async()=>{
  const photo=uploads[0];assert.ok(photo);
  const asset=await conn.models.MediaAsset.findOne({url:photo}).lean();
  assert.equal(asset.ownerId,studio1.ownerId);
  assert.deepEqual((await ok('/workshops/'+studio1._id,'GET')).ownerPhotos,[]);
  // Uploading alone does not publish the photo. The owner must save it on their studio.
  await ok('/studio','PATCH',{...studio,images:[...studio.images,photo]},art1);
  assert.deepEqual((await ok('/studio','GET',undefined,art1)).ownerPhotos,[photo]);
  assert.deepEqual((await ok('/workshops/'+studio1._id,'GET')).ownerPhotos,[photo]);
  const listing=await ok('/workshops','GET');
  assert.deepEqual(listing.find(item=>item._id===studio1._id).ownerPhotos,[photo]);
  assert.deepEqual(listing.find(item=>item._id===studio2._id).ownerPhotos,[]);
  assert.equal((await req('/studio','PATCH',{...studio,images:[photo]},art2)).status,403);
  assert.equal((await req('/studio','PATCH',{...studio,images:['/uploads/unowned.webp']},art1)).status,403);
  assert.equal((await req('/studio','PATCH',{...studio,ownerId:studio2.ownerId},art1)).status,400);
  assert.equal((await req('/studio','PATCH',studio,buyer)).status,403);
  // Legacy images stay usable, but unknown upload ownership is never advertised in the popup.
  const legacy='/uploads/legacy-photo.webp';
  await db.workshops.updateOne({_id:studio1._id},{$set:{images:[legacy,photo]}});
  await ok('/studio','PATCH',{...studio,images:[legacy,photo]},art1);
  assert.deepEqual((await ok('/workshops/'+studio1._id,'GET')).ownerPhotos,[photo]);
  await ok('/studio','PATCH',studio,art1);
  assert.deepEqual((await ok('/workshops/'+studio1._id,'GET')).ownerPhotos,[]);
 });
 await t.test('batch ownership, chronology and public QR provenance',async()=>{
  const input={productId:p1._id,quantity:100,story:'Batch provenance test',published:true};
  assert.equal((await req('/studio/batches','POST',input,art1)).status,400);
  assert.equal((await req('/studio/batches','POST',{...input,published:false},art2)).status,400);
  // Pre-existing public batches remain readable; new publication goes through completion.
  batch=await db.batches.create({...input,workshopId:studio1._id,code:'DH-DEMO-TEST',events:[]});
  await ok('/studio/batches/'+batch._id+'/events','POST',{title:'In nét',date:'2026-10-01',note:'Test milestone',images:['/art/dai-cat.jpg']},art1);
  assert.equal((await ok('/trace/'+batch._id,'GET')).events.length,1);
  const qr=await ok('/trace/'+batch._id+'/qr','GET');assert.equal(qr.subarray(1,4).toString(),'PNG');
  assert.equal((await req('/studio/batches/'+batch._id+'/events','POST',{title:'Foreign',date:'2026-10-01',note:'Not owner',images:['/art/dai-cat.jpg']},art2)).status,404);
  await ok('/studio/batches/'+batch._id,'PATCH',{story:input.story,published:false},art1);
  await ok('/studio/batches/'+batch._id,'PATCH',{story:input.story,published:true},art1);
  assert.equal((await req('/studio/batches/'+batch._id+'/events','POST',{title:'Bad',date:'2099-01-01',note:'Future',images:['/art/dai-cat.jpg']},art1)).status,400);
 });
 await t.test('request ownership, matching, bidding and stale updates',async()=>{
  q=await ok('/quotes','POST',{title:'Order test',category:'Chúc tụng',quantity:100,deadline:new Date(Date.now()+40*86400000).toISOString().slice(0,10),description:'100 paintings'},buyer);
  assert.equal((await req('/quotes/'+q._id,'GET',undefined,other)).status,403);
  assert.equal((await req('/quotes/'+q._id+'/send','POST',{version:q.version},other)).status,403);
  q=await ok('/quotes/'+q._id+'/send','POST',{version:q.version},buyer);assert.equal(q.recipients.length,2);
  q=await ok('/quotes/'+q._id+'/bids','POST',{version:q.version,unitPrice:100000,quantity:60,days:7,note:'A offer'},art1);
  assert.equal((await req('/quotes/'+q._id+'/bids','POST',{version:0,unitPrice:110000,quantity:60,days:7,note:'stale'},art2)).status,409);
  q=await ok('/quotes/'+q._id+'/bids','POST',{version:q.version,unitPrice:110000,quantity:60,days:7,note:'B offer'},art2);
 });
 const allocation=()=>[{workshopId:studio1._id,quantity:50},{workshopId:studio2._id,quantity:50}];
 await t.test('legacy allocation validates quantities and removed admin proposals stay unavailable',async()=>{
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:[{workshopId:studio1._id,quantity:50}]},buyer)).status,400);
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:[{workshopId:studio1._id,quantity:100}]},buyer)).status,400);
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:[{workshopId:studio1._id,quantity:50},{workshopId:studio1._id,quantity:50}]},buyer)).status,400);
  assert.equal((await req('/quotes/'+q._id+'/plan','POST',{version:q.version,allocations:allocation()},admin)).status,404);
  assert.equal((await ok('/quotes/'+q._id,'GET',undefined,buyer)).proposedAllocations,undefined);
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:allocation()},admin)).status,403);
 });
 await t.test('simultaneous accepts yield exactly one success and one conflict',async()=>{
  const result=await Promise.all([req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:allocation()},buyer),req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:allocation()},buyer)]);
  assert.deepEqual(result.map(r=>r.status).sort(),[201,409]);q=result.find(r=>r.status===201).data;assert.equal(q.status,'accepted');assert.equal(q.allocations.length,2);
 });
 const landing=(productId,photo)=>({productId,story:'The story of this specific batch',workshopStory:'The makers of this batch',coverImages:[photo],events:[
  {title:'Prepare paper',date:'2026-10-01',note:'Paper for this batch',images:[photo]},
  {title:'Finished prints',date:'2026-10-02',note:'The completed batch',images:[photo]},
 ]});
 await t.test('completion requires full batch content, owned photos and a matching workshop product',async()=>{
  assert.equal((await req('/quotes/'+q._id+'/production','POST',{version:q.version,action:'ready'},art1)).status,409);
  q=await ok('/quotes/'+q._id+'/production','POST',{version:q.version,action:'start'},art1);
  assert.equal((await req('/quotes/'+q._id+'/deliver','POST',{version:q.version},buyer)).status,409);
  const payload=landing(p1._id,uploads[0]);
  const complete=body=>req('/quotes/'+q._id+'/production','POST',{version:q.version,action:'ready',landingPage:body},art1);
  assert.equal((await complete(undefined)).status,400);
  assert.equal((await complete({...payload,coverImages:[]})).status,400);
  assert.equal((await complete({...payload,events:[]})).status,400);
  assert.equal((await complete({...payload,events:[payload.events[1],payload.events[0]]})).status,400);
  assert.equal((await complete({...payload,events:[payload.events[0],{...payload.events[1],date:'2099-01-01'}]})).status,400);
  assert.equal((await complete({...payload,productId:p2._id})).status,403);
  assert.equal((await complete({...payload,quantity:999})).status,400);
  assert.equal((await complete({...payload,quoteId:'123'})).status,400);
  assert.equal((await complete(landing(p1._id,uploads[1]))).status,403);
  assert.equal((await complete(landing(p1._id,'/art/dai-cat.jpg'))).status,403);
  assert.equal((await ok('/quotes/'+q._id,'GET',undefined,art1)).allocations[0].status,'in_production');
  assert.equal(await db.batches.countDocuments({quoteId:q._id}),0);
 });
 await t.test('production journals save incomplete private drafts without publishing or notifying buyers',async()=>{
  const journal={productId:'',story:'Private journal first draft',workshopStory:'',coverImages:[],events:[
   {title:'Preparing paper',date:'2026-10-01',note:'',images:[uploads[0]]},
   {title:'',date:'',note:'',images:[]},
  ]};
  const historyLength=q.history.length,version=q.version;
  const notices=(await ok('/notifications?limit=50','GET',undefined,buyer)).unreadCount;
  const url='/quotes/'+q._id+'/production-journal';
  assert.equal((await req(url,'PATCH',{version,journal},buyer)).status,403);
  assert.equal((await req(url,'PATCH',{version,journal},admin)).status,403);
  assert.equal((await req(url,'PATCH',{version,journal},art2)).status,409);
  assert.equal((await req(url,'PATCH',{version,journal:{...journal,coverImages:[uploads[1]]}},art1)).status,403);
  assert.equal((await req(url,'PATCH',{version,journal:{...journal,coverImages:['/art/dai-cat.jpg']}},art1)).status,403);
  assert.equal((await req(url,'PATCH',{version,journal:{...journal,published:true}},art1)).status,400);
  assert.equal((await req(url,'PATCH',{version,journal:{...journal,events:[{...journal.events[0],date:'2099-01-01'}]}},art1)).status,400);
  assert.equal((await req(url,'PATCH',{version,journal:{...journal,events:Array(31).fill(journal.events[0])}},art1)).status,400);
  q=await ok(url,'PATCH',{version,journal},art1);
  const own=q.allocations.find(a=>a.workshopId===studio1._id);
  assert.equal(q.status,'in_production');assert.equal(own.status,'in_production');assert.equal(q.history.length,historyLength);assert.equal(q.version,version+1);
  assert.deepEqual(own.journalDraft.events,journal.events);assert.ok(own.journalDraft.savedAt);
  const reloaded=await ok('/quotes/'+q._id,'GET',undefined,art1);
  assert.equal(reloaded.allocations.find(a=>a.workshopId===studio1._id).journalDraft.story,journal.story);
  for(const token of [buyer,art2,admin]) {
   const detail=await ok('/quotes/'+q._id,'GET',undefined,token);
   assert.ok(detail.allocations.every(a=>!a.journalDraft));
   const list=await ok('/quotes','GET',undefined,token);
   assert.ok(list.find(item=>item._id===q._id).allocations.every(a=>!a.journalDraft));
  }
  assert.equal(await db.batches.countDocuments({quoteId:q._id}),0);
  assert.equal((await req('/trace/'+q._id)).status,404);
  assert.equal((await req('/trace/'+q._id+'/qr')).status,404);
  assert.equal((await ok('/notifications?limit=50','GET',undefined,buyer)).unreadCount,notices);
  assert.equal((await req(url,'PATCH',{version,journal:{...journal,story:'Stale overwrite'}},art1)).status,409);
  const input={version:q.version,journal};
  const concurrent=await Promise.all([req(url,'PATCH',{...input,journal:{...journal,story:'Concurrent draft A'}},art1),req(url,'PATCH',{...input,journal:{...journal,story:'Concurrent draft B'}},art1)]);
  assert.deepEqual(concurrent.map(result=>result.status).sort(),[200,409]);q=concurrent.find(result=>result.status===200).data;
  assert.equal(q.history.length,historyLength);
  assert.equal((await req('/quotes/'+q._id+'/production','POST',{version:q.version,action:'ready'},art1)).status,400);
 });
 await t.test('concurrent completions publish exactly one page per workshop allocation',async()=>{
  const payload={version:q.version,action:'ready',landingPage:landing(p1._id,uploads[0])};
  const results=await Promise.all([req('/quotes/'+q._id+'/production','POST',payload,art1),req('/quotes/'+q._id+'/production','POST',payload,art1)]);
  assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);q=results.find(r=>r.status===201).data;
  assert.equal(await db.batches.countDocuments({quoteId:q._id}),1);
  const own=q.allocations.find(a=>a.workshopId===studio1._id);
  assert.equal(own.status,'ready');assert.ok(own.batchId);
  const trace=await ok('/trace/'+own.batchId);
  assert.equal(trace.quantity,50);assert.equal(trace.quoteId,q._id);assert.equal(trace.workshop._id,studio1._id);
  assert.equal(trace.story,payload.landingPage.story);assert.deepEqual(trace.product.images,[uploads[0]]);
  assert.equal(trace.workshop.story,payload.landingPage.workshopStory);assert.equal(trace.events.length,2);
  assert.equal((await req('/quotes/'+q._id+'/production','POST',{...payload,version:q.version},art1)).status,409);
  assert.equal((await req('/studio/batches/'+own.batchId,'PATCH',{story:'Tampering',published:false},art2)).status,404);
  assert.equal((await req('/quotes/'+q._id+'/production','POST',{...payload,version:q.version},buyer)).status,403);
  const qr=await ok('/trace/'+own.batchId+'/qr');assert.equal(qr.subarray(1,4).toString(),'PNG');
 });
 await t.test('batch edits preserve URL and QR and do not change catalog or studio content',async()=>{
  const own=q.allocations.find(a=>a.workshopId===studio1._id);
  const before=await ok('/trace/'+own.batchId),qr=await ok('/trace/'+own.batchId+'/qr');
  const {productId,...content}=landing(p1._id,uploads[0]);
  const body={...content,story:'Updated batch story',published:true};
  await ok('/studio/batches/'+own.batchId,'PATCH',body,art1);
  const after=await ok('/trace/'+own.batchId);
  assert.equal(after.story,body.story);assert.equal(after.traceUrl,before.traceUrl);assert.equal(after.code,before.code);
  assert.deepEqual(await ok('/trace/'+own.batchId+'/qr'),qr);
  assert.equal((await ok('/studio','GET',undefined,art1)).story,studio.story);
  assert.deepEqual((await ok('/products/'+p1._id)).images,p1.images);
  assert.equal((await req('/studio/batches/'+own.batchId,'PATCH',{...body,events:[]},art1)).status,400);
  assert.equal((await req('/studio/batches/'+own.batchId,'PATCH',{...body,coverImages:[uploads[1]]},art1)).status,403);
  await ok('/studio/batches/'+own.batchId,'PATCH',{...body,published:false},art1);
  assert.equal((await req('/trace/'+own.batchId)).status,404);
  await ok('/studio/batches/'+own.batchId,'PATCH',body,art1);
  // Snapshots keep the completed batch intact even when catalog content changes.
  await conn.models.Artwork.updateOne({_id:p1._id},{$set:{name:'Changed catalog title',published:false}});
  assert.equal((await ok('/trace/'+own.batchId)).product.name,before.product.name);
  await conn.models.Artwork.updateOne({_id:p1._id},{$set:{name:p1.name,published:true}});
 });
 await t.test('unlinked staged pages stay private and legacy completed orders can add their page',async()=>{
  const staged=await db.batches.create({quoteId:q._id,workshopId:studio2._id,productId:p2._id,
   code:'PENDING-TEST',quantity:50,published:true,events:[]});
  assert.equal((await req('/trace/'+staged._id)).status,404);
  assert.equal((await ok('/studio/batches','GET',undefined,art2)).some(b=>b._id===String(staged._id)),false);
  assert.equal((await ok('/products/'+p2._id)).batches.some(b=>b._id===String(staged._id)),false);
  await db.batches.deleteOne({_id:staged._id});
  q=await ok('/quotes/'+q._id+'/production','POST',{version:q.version,action:'start'},art2);
  assert.equal(q.allocations.find(a=>a.workshopId===studio1._id).journalDraft,undefined);
  assert.ok((await conn.models.Quotation.findById(q._id).lean()).allocations.find(a=>a.workshopId===studio1._id).journalDraft);
  // Simulate a completion made by the previous app version, which had no landing page.
  await conn.models.Quotation.updateOne({_id:q._id,'allocations.workshopId':studio2._id},{$set:{'allocations.$.status':'ready'}});
  q=await ok('/quotes/'+q._id+'/deliver','POST',{version:q.version},buyer);assert.equal(q.status,'delivered');assert.equal(q.allocations.reduce((s,a)=>s+a.quantity,0),100);
  q=await ok('/quotes/'+q._id+'/production','POST',{version:q.version,action:'ready',landingPage:landing(p2._id,uploads[1])},art2);
  assert.equal(q.status,'delivered');assert.ok(q.allocations.every(a=>a.batchId));
  assert.notEqual(q.allocations[0].batchId,q.allocations[1].batchId);
  assert.equal((await ok('/trace/'+q.allocations.find(a=>a.workshopId===studio2._id).batchId)).quantity,50);
  assert.equal((await req('/quotes/'+q._id+'/production','POST',{version:q.version,action:'start'},art1)).status,409);
  assert.equal((await req('/quotes/'+q._id+'/production-journal','PATCH',{version:q.version,journal:{}},art1)).status,409);
 });
 await t.test('a complete saved journal becomes the batch only after explicit completion',async()=>{
  let order=await ok('/quotes','POST',{title:'Journal-to-batch workflow',category:'Chúc tụng',quantity:10,description:'A journal saved during production',deadline:new Date(Date.now()+40*86400000).toISOString().slice(0,10)},buyer);
  order=await ok('/quotes/'+order._id+'/send','POST',{version:order.version},buyer);
  order=await ok('/quotes/'+order._id+'/bids','POST',{version:order.version,unitPrice:100000,quantity:10,days:7,note:'Journal order'},art1);
  order=await ok('/quotes/'+order._id+'/accept','POST',{version:order.version,workshopId:studio1._id},buyer);
  assert.equal((await req('/quotes/'+order._id+'/production-journal','PATCH',{version:order.version,journal:{}},art1)).status,409);
  order=await ok('/quotes/'+order._id+'/production','POST',{version:order.version,action:'start'},art1);
  assert.equal((await req('/quotes/'+order._id+'/production-journal','PATCH',{version:order.version,journal:{}},art2)).status,403);
  const content=landing(p1._id,uploads[0]);
  order=await ok('/quotes/'+order._id+'/production-journal','PATCH',{version:order.version,journal:content},art1);
  assert.equal(await db.batches.countDocuments({quoteId:order._id}),0);
  assert.equal((await req('/trace/'+order._id)).status,404);
  order=await ok('/quotes/'+order._id+'/production','POST',{version:order.version,action:'ready'},art1);
  const trace=await ok('/trace/'+order.allocations[0].batchId);
  assert.equal(trace.story,content.story);assert.equal(trace.quantity,10);
  assert.deepEqual(trace.events.map(({title,date,note,images})=>({title,date,note,images})),content.events);
  assert.equal(trace.journalDraft,undefined);assert.equal(trace.allocations,undefined);
  assert.equal((await req('/quotes/'+order._id+'/production-journal','PATCH',{version:order.version,journal:{}},art1)).status,409);
 });
 await t.test('heritage listings supply published artwork choices for batch completion',async()=>{
  const artwork=await conn.models.Artwork.create({name:'Heritage test',category:'Chúc tụng',type:'general',workshopId:null,published:true,images:['/art/dai-cat.jpg']});
  await ok('/studio/workshop-products','POST',{productId:String(artwork._id),price:200000,description:'Workshop printing service',images:['/art/dai-cat.jpg'],published:true},art1);
  const listings=await ok('/studio/workshop-products','GET',undefined,art1);
  assert.equal(listings.find(p=>p.productId===String(artwork._id)).product.published,true);
  const order=await conn.models.Quotation.create({buyerId:'a'.repeat(24),category:'Chúc tụng',quantity:20,status:'in_production',version:0,
   recipients:[studio1._id],allocations:[{workshopId:studio1._id,quantity:20,status:'in_production'}]});
  const result=await ok('/quotes/'+order._id+'/production','POST',{version:0,action:'ready',landingPage:landing(String(artwork._id),uploads[0])},art1);
  assert.equal((await ok('/trace/'+result.allocations[0].batchId)).product.name,'Heritage test');
  await conn.models.Artwork.updateOne({_id:artwork._id},{$set:{published:false}});
 });
 await t.test('multi-item orders complete with one page containing the full ordered lot',async()=>{
  const artworks=await conn.models.Artwork.insertMany([
   {name:'Ordered heritage A',category:'Chúc tụng',type:'general',published:true,images:['/art/dai-cat.jpg']},
   {name:'Ordered heritage B',category:'Sinh hoạt',type:'general',published:true,images:['/art/dam-cuoi-chuot.jpg']},
  ]);
  let order=await ok('/quotes','POST',{title:'Mixed artwork lot',deadline:new Date(Date.now()+40*86400000).toISOString().slice(0,10),
   description:'Two artworks, one order',items:artworks.map((art,index)=>({productId:String(art._id),quantity:index?70:30,note:'Private buyer note'})),
   customerInfo:{fullName:'Private customer',shippingAddress:'Private shipping address'}},buyer);
  assert.equal(order.category,'Đa thể loại');assert.equal(order.quantity,100);
  order=await ok('/quotes/'+order._id+'/send','POST',{version:order.version},buyer);
  order=await ok('/quotes/'+order._id+'/bids','POST',{version:order.version,unitPrice:100000,quantity:100,days:7,note:'Whole lot'},art1);
  order=await ok('/quotes/'+order._id+'/accept','POST',{version:order.version,workshopId:studio1._id},buyer);
  assert.equal(order.acceptedWorkshopId,studio1._id);
  order=await ok('/quotes/'+order._id+'/production','POST',{version:order.version,action:'start'},art1);
  assert.equal((await req('/quotes/'+order._id+'/production','POST',{version:order.version,action:'ready',landingPage:landing(p1._id,uploads[0])},art1)).status,400);
  for(const artwork of artworks)order=await ok('/quotes/'+order._id+'/item-progress','POST',{version:order.version,productId:String(artwork._id),status:'completed'},art1);
  order=await ok('/quotes/'+order._id+'/production','POST',{version:order.version,action:'ready',landingPage:landing(String(artworks[1]._id),uploads[0])},art1);
  const trace=await ok('/trace/'+order.allocations[0].batchId);
  assert.equal(trace.quantity,100);assert.equal(trace.product.name,'Ordered heritage B');
  assert.deepEqual(trace.items.map(item=>[item.artworkName,item.quantity]),[['Ordered heritage A',30],['Ordered heritage B',70]]);
  assert.equal(trace.customerInfo,undefined);assert.ok(trace.items.every(item=>!('note' in item)));
  assert.equal((await req('/quotes/'+order._id+'/production','POST',{version:order.version,action:'ready',landingPage:landing(String(artworks[0]._id),uploads[0])},art1)).status,409);
  await conn.models.Artwork.updateMany({_id:{$in:artworks.map(art=>art._id)}},{$set:{published:false}});
 });
 await t.test('notifications scope order history, completion links and read receipts to each account',async()=>{
  const feed=await ok('/notifications?limit=50','GET',undefined,buyer);
  const own=q.allocations.find(a=>a.workshopId===studio1._id);
  const otherBatch=q.allocations.find(a=>a.workshopId===studio2._id);
  const completed=feed.items.find(item=>item.batchId===own.batchId);
  assert.ok(completed);assert.equal(completed.type,'batch');assert.equal(completed.traceAvailable,true);
  assert.equal(completed.path,'/quotes/'+q._id);assert.ok(completed.batchCode);assert.equal(completed.readAt,null);
  assert.equal(feed.items.filter(item=>item.batchId===own.batchId).length,1);
  assert.ok(feed.items.some(item=>item.batchId===otherBatch.batchId));
  assert.equal(new Set(feed.items.map(item=>item.key)).size,feed.items.length);
  const artisanFeed=await ok('/notifications?limit=50','GET',undefined,art1);
  assert.ok(artisanFeed.items.some(item=>item.key===completed.key));
  assert.ok(!artisanFeed.items.some(item=>item.batchId===otherBatch.batchId));
  const secondFeed=await ok('/notifications?limit=50','GET',undefined,art2);
  assert.ok(!secondFeed.items.some(item=>item.key===completed.key));
  assert.equal((await req('/notifications/'+encodeURIComponent(completed.key)+'/read','PATCH',undefined,art2)).status,404);
  assert.deepEqual((await ok('/notifications?limit=50','GET',undefined,other)).items,[]);
  for(const query of ['?limit=51','?page=0','?unreadOnly=yes','?recipientId='+studio2.ownerId])
   assert.equal((await req('/notifications'+query,'GET',undefined,buyer)).status,400);
  assert.equal((await req('/notifications/not-a-key/read','PATCH',undefined,buyer)).status,400);
  const pages=await Promise.all([ok('/notifications?limit=2&page=1','GET',undefined,buyer),ok('/notifications?limit=2&page=2','GET',undefined,buyer)]);
  assert.equal(pages[0].items.length,2);assert.equal(pages[0].hasMore,true);
  assert.equal(new Set([...pages[0].items,...pages[1].items].map(item=>item.key)).size,4);
  const reads=await Promise.all([req('/notifications/'+encodeURIComponent(completed.key)+'/read','PATCH',undefined,buyer),req('/notifications/'+encodeURIComponent(completed.key)+'/read','PATCH',undefined,buyer)]);
  assert.ok(reads.every(result=>result.status===200));
  const after=await ok('/notifications?limit=50','GET',undefined,buyer);
  assert.equal(after.unreadCount,feed.unreadCount-1);assert.ok(after.items.find(item=>item.key===completed.key).readAt);
  assert.equal((await ok('/notifications?limit=50','GET',undefined,art1)).items.find(item=>item.key===completed.key).readAt,null);
  const user=await db.users.findOne({email:'buyer@test.local'});
  assert.equal(await conn.models.NotificationRead.countDocuments({recipientId:String(user._id),key:completed.key}),1);
  await db.batches.updateOne({_id:own.batchId},{$set:{published:false}});
  assert.equal((await ok('/notifications?limit=50','GET',undefined,buyer)).items.find(item=>item.key===completed.key).traceAvailable,false);
  await db.batches.updateOne({_id:own.batchId},{$set:{published:true}});
  // Historical completions from before this feature still produce a working batch notification.
  const index=Number(completed.key.split(':').at(-1));
  await conn.models.Quotation.updateOne({_id:q._id},{$unset:{[`history.${index}.eventType`]:'',[`history.${index}.batchId`]:'',[`history.${index}.workshopId`]:''}});
  assert.equal((await ok('/notifications?limit=50','GET',undefined,buyer)).items.find(item=>item.key===completed.key).batchId,own.batchId);
  await ok('/notifications/read-all','PATCH',undefined,buyer);
  const allRead=await ok('/notifications?unreadOnly=true','GET',undefined,buyer);
  assert.equal(allRead.unreadCount,0);assert.deepEqual(allRead.items,[]);
  assert.ok((await ok('/notifications','GET',undefined,art1)).unreadCount>0);
  let next=await ok('/quotes','POST',{title:'A new notification after read-all',category:'Chúc tụng',quantity:10,description:'New order',deadline:new Date(Date.now()+40*86400000).toISOString().slice(0,10)},buyer);
  next=await ok('/quotes/'+next._id+'/send','POST',{version:next.version},buyer);
  assert.equal((await ok('/notifications?unreadOnly=true','GET',undefined,buyer)).unreadCount,1);
 });
 await t.test('published BQL announcements notify buyers and artisans without exposing draft news',async()=>{
  const input={title:'Important village announcement',body:'Upcoming power maintenance',category:'Thông báo',image:'',published:false};
  const notice=await ok('/news','POST',input,admin);
  const key='announcement:'+notice._id;
  assert.ok(!(await ok('/notifications?limit=50','GET',undefined,other)).items.some(item=>item.key===key));
  await ok('/news/'+notice._id,'PATCH',{...input,published:true},admin);
  for(const token of [buyer,other,art1,art2]) {
   const entry=(await ok('/notifications?limit=50','GET',undefined,token)).items.find(item=>item.key===key);
   assert.ok(entry);assert.equal(entry.type,'announcement');assert.equal(entry.path,'/tin-tuc');
  }
  await ok('/notifications/'+encodeURIComponent(key)+'/read','PATCH',undefined,other);
  assert.equal((await ok('/notifications?unreadOnly=true','GET',undefined,other)).items.length,0);
  await ok('/news/'+notice._id,'DELETE',undefined,admin);
  assert.ok(!(await ok('/notifications?limit=50','GET',undefined,buyer)).items.some(item=>item.key===key));
 });
 await t.test('admin news CRUD and unapproved workshop visibility',async()=>{
  const news={title:'News test',body:'Test bulletin',category:'Thông báo',image:'',published:false};assert.equal((await req('/news','POST',news,buyer)).status,403);
  const item=await ok('/news','POST',news,admin);assert.equal((await ok('/news','GET')).length,0);await ok('/news/'+item._id,'PATCH',{...news,published:true},admin);assert.equal((await ok('/news','GET')).length,1);await ok('/news/'+item._id,'DELETE',undefined,admin);assert.equal((await ok('/news','GET')).length,0);
  await ok('/admin/workshops/'+studio1._id+'/approval','PATCH',{approved:false},admin);assert.equal((await req('/trace/'+batch._id)).status,404);assert.equal((await ok('/products','GET')).total,1);
 });
 await t.test('deactivated account tokens stop working immediately',async()=>{
  const u=await db.users.findOne({email:'a@test.local'});await ok('/admin/users/'+u._id,'PATCH',{active:false},admin);assert.equal((await req('/auth/me','GET',undefined,art1)).status,401);
 });
 }finally{
  for(const url of uploads)await fs.unlink(path.join(process.cwd(),'.local',url)).catch(()=>{});
  assert.match(conn.name,/^vcraft_test_\d+$/);await conn.dropDatabase();await app.close();
 }
});
