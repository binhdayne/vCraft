require('reflect-metadata');
const {test}=require('node:test');const assert=require('node:assert/strict');const {NestFactory}=require('@nestjs/core');const {getConnectionToken}=require('@nestjs/mongoose');const {hash}=require('bcryptjs');const sharp=require('sharp');const fs=require('node:fs/promises');const path=require('node:path');
process.env.MONGODB_URI='mongodb://127.0.0.1:27017/vcraft_test_'+Date.now();process.env.JWT_SECRET='test-secret-only-'.repeat(4);process.env.NODE_ENV='test';
const {AppModule}=require('../dist/app.module');const {Database}=require('../dist/domain/database');
test('end-to-end workflows against isolated MongoDB database',async t=>{
 const app=await NestFactory.create(AppModule,{logger:false});app.setGlobalPrefix('api/v1');await app.listen(0,'127.0.0.1');const base=await app.getUrl();const db=app.get(Database);const conn=app.get(getConnectionToken());const uploads=[];
 async function req(url,method='GET',body,token){const r=await fetch(base+'/api/v1'+url,{method,headers:{...(body instanceof FormData?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},body:body?(body instanceof FormData?body:JSON.stringify(body)):undefined});return {status:r.status,data:r.headers.get('content-type')?.includes('json')?await r.json():Buffer.from(await r.arrayBuffer())};}
 async function ok(url,method,body,token,status){const r=await req(url,method,body,token);assert.equal(r.status,status|| (method==='POST'?201:200),JSON.stringify(r.data));return r.data;}
 let admin,buyer,other,art1,art2,studio1,studio2,p1,batch,q;const password='TestPassword123!';const categories=['Chúc tụng'];
 try{
 await Promise.all([db.users.init(),db.workshops.init(),db.batches.init()]);
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
  const accounts=await ok('/admin/users','GET',undefined,admin);assert.ok(accounts.every(u=>!u.passwordHash));
 });
 await t.test('admin creates pending artisans and explicitly approves their studios',async()=>{
  studio1=await ok('/admin/artisans','POST',{name:'Artisan A',email:'a@test.local',password,workshop:studio},admin);
  studio2=await ok('/admin/artisans','POST',{name:'Artisan B',email:'b@test.local',password,workshop:{...studio,name:'Studio B'}},admin);
  assert.equal((await ok('/workshops','GET')).length,0);
  art1=(await ok('/auth/login','POST',{email:'a@test.local',password})).token;art2=(await ok('/auth/login','POST',{email:'b@test.local',password})).token;
  const draft={name:'Painting A',category:'Chúc tụng',description:'Test artwork',price:100000,dimensions:'30x40',material:'Giấy điệp',images:['/art/dai-cat.jpg'],published:true};
  assert.equal((await req('/studio/products','POST',draft,art1)).status,403);
  await ok('/admin/workshops/'+studio1._id+'/approval','PATCH',{approved:true},admin);await ok('/admin/workshops/'+studio2._id+'/approval','PATCH',{approved:true},admin);
  p1=await ok('/studio/products','POST',draft,art1);
  assert.equal((await req('/studio/products/'+p1._id,'PATCH',draft,art2)).status,404);
  assert.equal((await ok('/products?search=Painting','GET')).total,1);
  assert.equal((await ok('/products?search=%5B.*','GET')).total,0);
  assert.equal((await req('/products/invalid')).status,400);
 });
 await t.test('uploads optimize valid images and reject disguised files',async()=>{
  const data=new FormData();data.append('files',new Blob([await sharp({create:{width:2000,height:1000,channels:3,background:'#ad422e'}}).png().toBuffer()],{type:'image/png'}),'test.png');
  const result=await ok('/media','POST',data,art1);assert.match(result.urls[0],/^\/uploads\/.*\.webp$/);uploads.push(...result.urls);const info=await sharp(path.join(process.cwd(),'.local',result.urls[0])).metadata();assert.equal(info.width,1600);assert.equal(info.format,'webp');
  const fake=new FormData();fake.append('files',new Blob(['not an image'],{type:'image/png'}),'fake.png');assert.equal((await req('/media','POST',fake,art1)).status,400);
  assert.equal((await req('/media','POST',data,buyer)).status,403);
 });
 await t.test('batch ownership, chronology and public QR provenance',async()=>{
  const input={productId:p1._id,quantity:100,story:'Batch provenance test',published:true};
  assert.equal((await req('/studio/batches','POST',input,art2)).status,403);
  batch=await ok('/studio/batches','POST',input,art1);
  await ok('/studio/batches/'+batch._id+'/events','POST',{title:'In nét',date:'2026-10-01',note:'Test milestone',images:['/art/dai-cat.jpg']},art1);
  assert.equal((await ok('/trace/'+batch._id,'GET')).events.length,1);
  const qr=await ok('/trace/'+batch._id+'/qr','GET');assert.equal(qr.subarray(1,4).toString(),'PNG');
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
 await t.test('allocation validates total, capacity and duplicate studios; admin can propose',async()=>{
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:[{workshopId:studio1._id,quantity:50}]},buyer)).status,400);
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:[{workshopId:studio1._id,quantity:100}]},buyer)).status,400);
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:[{workshopId:studio1._id,quantity:50},{workshopId:studio1._id,quantity:50}]},buyer)).status,400);
  q=await ok('/quotes/'+q._id+'/plan','POST',{version:q.version,allocations:allocation()},admin);assert.equal(q.status,'bidding');assert.equal(q.proposedAllocations.length,2);
  assert.equal((await req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:allocation()},admin)).status,403);
 });
 await t.test('simultaneous accepts yield exactly one success and one conflict',async()=>{
  const result=await Promise.all([req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:allocation()},buyer),req('/quotes/'+q._id+'/accept','POST',{version:q.version,allocations:allocation()},buyer)]);
  assert.deepEqual(result.map(r=>r.status).sort(),[201,409]);q=result.find(r=>r.status===201).data;assert.equal(q.status,'accepted');assert.equal(q.allocations.length,2);
 });
 await t.test('production requires each assigned artisan; buyer confirms delivery after all complete',async()=>{
  assert.equal((await req('/quotes/'+q._id+'/production','POST',{version:q.version,action:'ready'},art1)).status,409);
  q=await ok('/quotes/'+q._id+'/production','POST',{version:q.version,action:'start'},art1);
  assert.equal((await req('/quotes/'+q._id+'/deliver','POST',{version:q.version},buyer)).status,409);
  q=await ok('/quotes/'+q._id+'/production','POST',{version:q.version,action:'ready'},art1);
  q=await ok('/quotes/'+q._id+'/production','POST',{version:q.version,action:'start'},art2);
  q=await ok('/quotes/'+q._id+'/production','POST',{version:q.version,action:'ready'},art2);
  q=await ok('/quotes/'+q._id+'/deliver','POST',{version:q.version},buyer);assert.equal(q.status,'delivered');assert.equal(q.allocations.reduce((s,a)=>s+a.quantity,0),100);
  assert.equal((await req('/quotes/'+q._id+'/production','POST',{version:q.version,action:'start'},art1)).status,409);
 });
 await t.test('admin news CRUD and unapproved workshop visibility',async()=>{
  const news={title:'News test',body:'Test bulletin',category:'Thông báo',image:'',published:false};assert.equal((await req('/news','POST',news,buyer)).status,403);
  const item=await ok('/news','POST',news,admin);assert.equal((await ok('/news','GET')).length,0);await ok('/news/'+item._id,'PATCH',{...news,published:true},admin);assert.equal((await ok('/news','GET')).length,1);await ok('/news/'+item._id,'DELETE',undefined,admin);assert.equal((await ok('/news','GET')).length,0);
  await ok('/admin/workshops/'+studio1._id+'/approval','PATCH',{approved:false},admin);assert.equal((await req('/trace/'+batch._id)).status,404);assert.equal((await ok('/products','GET')).total,0);
 });
 await t.test('deactivated account tokens stop working immediately',async()=>{
  const u=await db.users.findOne({email:'a@test.local'});await ok('/admin/users/'+u._id,'PATCH',{active:false},admin);assert.equal((await req('/auth/me','GET',undefined,art1)).status,401);
 });
 }finally{
  for(const url of uploads)await fs.unlink(path.join(process.cwd(),'.local',url)).catch(()=>{});
  assert.match(conn.name,/^vcraft_test_\d+$/);await conn.dropDatabase();await app.close();
 }
});
