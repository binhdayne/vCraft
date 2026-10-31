import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors, BadRequestException, NotFoundException, ForbiddenException, Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { Database } from './database';
import { AuthGuard, role } from './auth';
import { parse, id, text, images, isoDate, newsInput } from './validation';
@ApiTags('batches') @Controller()
export class BatchesController {
  constructor(private readonly db:Database,private readonly config:ConfigService){}
  @Get('trace/:id') async trace(@Param('id') key:string){const batch=await this.db.batches.findOne({_id:parse(id,key),published:true}).lean();if(!batch)throw new NotFoundException('Lô tranh chưa công khai');const workshop=await this.db.workshops.findOne({_id:batch.workshopId,approved:true}).lean();const product=await this.db.products.findOne({_id:batch.productId,published:true}).lean();if(!workshop||!product)throw new NotFoundException('Lô tranh chưa công khai');return {...batch,workshop,product,traceUrl:this.url(key)};}
  @Get('trace/:id/qr') async qr(@Param('id') key:string,@Res() res:any){await this.trace(key);const buffer=await QRCode.toBuffer(this.url(key),{width:480,margin:2,errorCorrectionLevel:'M'});res.type('png').send(buffer);}
  private url(key:string){return this.config.get<string>('PUBLIC_URL','http://localhost:3000').replace(/\/$/,'')+'/#/trace/'+key;}
  @Get('studio/batches') @UseGuards(AuthGuard) async list(@Req() req:any){role(req.user,'artisan');const s=await this.studio(req.user.id);return this.db.batches.find({workshopId:String(s._id)}).sort({_id:-1}).lean();}
  @Post('studio/batches') @UseGuards(AuthGuard) async create(@Req() req:any,@Body() body:unknown){role(req.user,'artisan');const d=parse(z.object({productId:id,quantity:z.number().int().min(1).max(1000000),story:text(5000),published:z.boolean()}).strict(),body);const s=await this.studio(req.user.id);if(!await this.db.products.exists({_id:d.productId,workshopId:String(s._id)}))throw new ForbiddenException('Sản phẩm không thuộc xưởng');return this.db.batches.create({...d,workshopId:String(s._id),code:'DH-'+randomUUID().slice(0,8).toUpperCase(),events:[]});}
  @Patch('studio/batches/:id') @UseGuards(AuthGuard) async edit(@Req() req:any,@Param('id') key:string,@Body() body:unknown){role(req.user,'artisan');const d=parse(z.object({story:text(5000),published:z.boolean()}).strict(),body);const s=await this.studio(req.user.id);const item=await this.db.batches.findOneAndUpdate({_id:parse(id,key),workshopId:String(s._id)},{$set:d},{new:true});if(!item)throw new NotFoundException();return item;}
  @Post('studio/batches/:id/events') @UseGuards(AuthGuard) async event(@Req() req:any,@Param('id') key:string,@Body() body:unknown){role(req.user,'artisan');const d=parse(z.object({title:text(150),date:isoDate,note:text(3000),images:images.min(1)}).strict(),body);if(d.date>new Date().toISOString().slice(0,10))throw new BadRequestException('Nhật ký không được ở tương lai');const s=await this.studio(req.user.id);const item=await this.db.batches.findOneAndUpdate({_id:parse(id,key),workshopId:String(s._id)},{$push:{events:d}},{new:true});if(!item)throw new NotFoundException();return item;}
  private async studio(ownerId:string){const s=await this.db.workshops.findOne({ownerId});if(!s)throw new NotFoundException();return s;}
}
@ApiTags('news') @Controller('news')
export class NewsController {
  constructor(private readonly db:Database){}
  @Get() list(){return this.db.news.find({published:true}).sort({createdAt:-1}).limit(100).lean();}
  @Get('manage') @UseGuards(AuthGuard) all(@Req() req:any){role(req.user,'admin');return this.db.news.find().sort({createdAt:-1}).lean();}
  @Post() @UseGuards(AuthGuard) create(@Req() req:any,@Body() body:unknown){role(req.user,'admin');return this.db.news.create({...parse(newsInput,body),authorId:req.user.id});}
  @Patch(':id') @UseGuards(AuthGuard) async edit(@Req() req:any,@Param('id') key:string,@Body() body:unknown){role(req.user,'admin');const result=await this.db.news.findByIdAndUpdate(parse(id,key),{$set:parse(newsInput,body)},{new:true});if(!result)throw new NotFoundException();return result;}
  @Delete(':id') @UseGuards(AuthGuard) async remove(@Req() req:any,@Param('id') key:string){role(req.user,'admin');const r=await this.db.news.findByIdAndDelete(parse(id,key));if(!r)throw new NotFoundException();return {deleted:true};}
}
@ApiTags('media') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('media')
export class MediaController {
  @Post() @UseInterceptors(FilesInterceptor('files',8,{limits:{fileSize:8*1024*1024,files:8}}))
  async upload(@Req() req:any,@UploadedFiles() files:Express.Multer.File[]){role(req.user,'artisan','admin');if(!files?.length)throw new BadRequestException('Chọn ít nhất một ảnh');
    const converted:Buffer[]=[];
    for(const file of files){try{const input=sharp(file.buffer,{limitInputPixels:40000000});const meta=await input.metadata();if(!['jpeg','png','webp'].includes(meta.format||'')||meta.pages&&meta.pages>1)throw new Error();converted.push(await input.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer());}catch{throw new BadRequestException('Chỉ nhận ảnh JPEG, PNG, WebP tĩnh, tối đa 40 megapixel');}}
    const dir=join(process.cwd(),'.local','uploads');await mkdir(dir,{recursive:true});const urls=[];for(const buffer of converted){const name=randomUUID()+'.webp';await writeFile(join(dir,name),buffer);urls.push('/uploads/'+name);}return {urls};
  }
}
