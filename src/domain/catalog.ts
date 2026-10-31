import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { Database } from './database';
import { AuthGuard, role, Actor } from './auth';
import { parse, id, text, workshopInput, productInput } from './validation';
@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly db:Database) {}
  @Get('workshops') async workshops(){return this.db.workshops.find({approved:true}).sort({name:1}).lean();}
  @Get('workshops/:id') async workshop(@Param('id') key:string){const item=await this.db.workshops.findOne({_id:parse(id,key),approved:true}).lean();if(!item)throw new NotFoundException('Không tìm thấy xưởng');return item;}
  @Get('products') async products(@Query() query:unknown){
    const q=parse(z.object({category:z.string().max(80).optional(),workshopId:id.optional(),search:z.string().max(100).optional(),page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(60).default(12)}).strict(),query);
    const studios=await this.db.workshops.find({approved:true,...(q.workshopId?{_id:q.workshopId}:{})}).distinct('_id');
    const filter:any={published:true,workshopId:{$in:studios.map(String)}};
    if(q.category)filter.category=q.category;
    // Escape user input before constructing a search expression.
    if(q.search)filter.name={$regex:q.search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'};
    const [items,total]=await Promise.all([this.db.products.find(filter).sort({_id:-1}).skip((q.page-1)*q.limit).limit(q.limit).lean(),this.db.products.countDocuments(filter)]);
    return {items,total,page:q.page,pages:Math.ceil(total/q.limit)};
  }
  @Get('products/:id') async product(@Param('id') key:string){
    const item=await this.db.products.findOne({_id:parse(id,key),published:true}).lean();if(!item)throw new NotFoundException('Không tìm thấy tranh');
    const workshop=await this.db.workshops.findOne({_id:item.workshopId,approved:true}).lean();if(!workshop)throw new NotFoundException('Xưởng chưa công khai');
    const batches=await this.db.batches.find({productId:key,published:true}).lean();return {...item,workshop,batches};
  }
  @Get('studio') @UseGuards(AuthGuard) async studio(@Req() req:any){role(req.user,'artisan');return this.own(req.user);}
  @Patch('studio') @UseGuards(AuthGuard) async updateStudio(@Req() req:any,@Body() body:unknown){role(req.user,'artisan');const data=parse(workshopInput,body);return this.db.workshops.findOneAndUpdate({ownerId:req.user.id},{$set:data},{new:true});}
  @Get('studio/products') @UseGuards(AuthGuard) async ownProducts(@Req() req:any){role(req.user,'artisan');const studio=await this.own(req.user);return this.db.products.find({workshopId:String(studio._id)}).sort({_id:-1}).lean();}
  @Post('studio/products') @UseGuards(AuthGuard) async createProduct(@Req() req:any,@Body() body:unknown){role(req.user,'artisan');const studio=await this.own(req.user);if(!studio.approved)throw new ForbiddenException('Xưởng đang chờ duyệt');return this.db.products.create({...parse(productInput,body),workshopId:String(studio._id)});}
  @Patch('studio/products/:id') @UseGuards(AuthGuard) async editProduct(@Req() req:any,@Param('id') key:string,@Body() body:unknown){role(req.user,'artisan');const studio=await this.own(req.user);const item=await this.db.products.findOneAndUpdate({_id:parse(id,key),workshopId:String(studio._id)},{$set:parse(productInput,body)},{new:true});if(!item)throw new NotFoundException();return item;}
  async own(user:Actor){const studio=await this.db.workshops.findOne({ownerId:user.id}).lean();if(!studio)throw new NotFoundException('Chưa có hồ sơ xưởng');return studio;}
}
@ApiTags('admin') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('admin')
export class AdminController {
  constructor(private readonly db:Database){}
  @Get('users') async users(@Req() req:any){role(req.user,'admin');return this.db.users.find().sort({_id:-1}).lean();}
  @Get('workshops') async workshops(@Req() req:any){role(req.user,'admin');return this.db.workshops.find().sort({_id:-1}).lean();}
  @Post('artisans') async create(@Req() req:any,@Body() body:unknown){
    role(req.user,'admin');const data=parse(z.object({name:text(100),email:z.string().email().max(254).transform(s=>s.toLowerCase()),password:z.string().min(10).max(72),workshop:workshopInput}).strict(),body);
    let user:any;try{user=await this.db.users.create({name:data.name,email:data.email,passwordHash:await hash(data.password,12),role:'artisan'});}catch(e:any){if(e.code===11000)throw new ConflictException('Email đã tồn tại');throw e;}
    try{return await this.db.workshops.create({...data.workshop,ownerId:String(user._id),approved:false});}catch(e){await this.db.users.deleteOne({_id:user._id});throw e;}
  }
  @Patch('workshops/:id/approval') async approval(@Req() req:any,@Param('id') key:string,@Body() body:unknown){role(req.user,'admin');const data=parse(z.object({approved:z.boolean()}).strict(),body);const item=await this.db.workshops.findByIdAndUpdate(parse(id,key),{$set:data},{new:true});if(!item)throw new NotFoundException();return item;}
  @Patch('users/:id') async account(@Req() req:any,@Param('id') key:string,@Body() body:unknown){role(req.user,'admin');const data=parse(z.object({active:z.boolean()}).strict(),body);if(key===req.user.id)throw new ForbiddenException('Không thể tự khóa tài khoản');const item=await this.db.users.findOneAndUpdate({_id:parse(id,key),role:{$ne:'admin'}},{$set:data},{new:true});if(!item)throw new NotFoundException();return item;}
}
