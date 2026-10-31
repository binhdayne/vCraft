import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Schema, Model } from 'mongoose';
const opts = { timestamps: true, strict: true };
@Injectable()
export class Database {
  users: Model<Record<string, any>>; workshops: Model<Record<string, any>>; products: Model<Record<string, any>>; batches: Model<Record<string, any>>; quotes: Model<Record<string, any>>; news: Model<Record<string, any>>;
  constructor(@InjectConnection() connection: Connection) {
    const model = (name: string, shape: any) => connection.models[name] || connection.model(name, new Schema(shape, opts));
    this.users = model('Account', { name: String, email: {type:String,unique:true,index:true}, passwordHash: {type:String,select:false}, role: {type:String,enum:['buyer','artisan','admin']}, active: {type:Boolean,default:true} });
    this.workshops = model('Studio', { ownerId: {type:String,unique:true,index:true}, name:String, story:String, address:String, latitude:Number, longitude:Number, openForVisits:Boolean, visitingHours:String, categories:[String], images:[String], certificates:[String], approved:{type:Boolean,default:false,index:true} });
    this.products = model('Artwork', { workshopId:{type:String,index:true}, name:String, category:{type:String,index:true}, description:String, price:Number, dimensions:String, material:String, images:[String], published:{type:Boolean,default:false} });
    this.batches = model('Batch', { workshopId:String, productId:{type:String,index:true}, code:{type:String,unique:true}, quantity:Number, story:String, published:Boolean, events:[{title:String,date:String,note:String,images:[String]}] });
    this.quotes = model('Quotation', { buyerId:{type:String,index:true}, title:String, category:String, quantity:Number, deadline:String, description:String, status:{type:String,index:true}, recipients:[String], version:{type:Number,default:0}, bids:[{workshopId:String,artisanId:String,unitPrice:Number,quantity:Number,days:Number,note:String}], allocations:[{workshopId:String,quantity:Number,unitPrice:Number,status:String}], proposedAllocations:[{workshopId:String,quantity:Number}], history:[{status:String,at:Date,actor:String,note:String}] });
    this.news = model('Bulletin', { title:String, body:String, category:String, image:String, published:Boolean, authorId:String });
  }
}
