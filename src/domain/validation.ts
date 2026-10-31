import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
export function parse<S extends z.ZodTypeAny>(schema:S,value:unknown):z.output<S>{const r=schema.safeParse(value);if(!r.success)throw new BadRequestException(r.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; '));return r.data;}
export const id=z.string().regex(/^[a-f0-9]{24}$/i,'ID không hợp lệ');
export const text=(max=200)=>z.string().trim().min(1).max(max);
export const imagePath=z.string().regex(/^\/(uploads|art)\/[a-zA-Z0-9_.-]+$/,'Ảnh phải được tải lên hệ thống');
export const images=z.array(imagePath).max(8);
export const category=z.enum(['Chúc tụng','Sinh hoạt','Lịch sử & dân gian','Tứ quý']);
export const isoDate=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Ngày không hợp lệ');
export const workshopInput=z.object({name:text(120),story:text(10000),address:text(300),latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),openForVisits:z.boolean(),visitingHours:text(200),categories:z.array(category).min(1).max(4),images,certificates:images}).strict();
export const productInput=z.object({name:text(120),category,description:text(10000),price:z.number().min(0).max(1e9),dimensions:text(100),material:text(200),images:images.min(1),published:z.boolean()}).strict();
export const quoteInput=z.object({title:text(150),category,quantity:z.number().int().min(1).max(1000000),deadline:isoDate,description:text(5000)}).strict();
export const versionInput=z.object({version:z.number().int().min(0)}).strict();
export const allocationInput=z.object({version:z.number().int().min(0),allocations:z.array(z.object({workshopId:id,quantity:z.number().int().min(1)}).strict()).min(1).max(100)}).strict();
export const newsInput=z.object({title:text(200),body:text(15000),category:z.enum(['Thông báo','Làng nghề','Sự kiện']),image:imagePath.or(z.literal('')),published:z.boolean()}).strict();
