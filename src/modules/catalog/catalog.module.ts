import { Module, Controller, Get, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { MongooseModule, InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, isObjectIdOrHexString } from 'mongoose';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Workshop {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ default: '' }) story: string;
  @Prop({ default: '' }) address: string;
  @Prop({ min: -90, max: 90 }) latitude: number;
  @Prop({ min: -180, max: 180 }) longitude: number;
  @Prop({ default: false }) openForVisits: boolean;
  @Prop({ default: false, index: true }) approved: boolean;
  @Prop({ type: [String], default: [] }) images: string[];
}
export const WorkshopSchema = SchemaFactory.createForClass(Workshop);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ required: true, index: true }) workshopId: string;
  @Prop({ required: true, index: true }) category: string;
  @Prop({ default: '' }) description: string;
  @Prop({ min: 0 }) price: number;
  @Prop({ default: 'VND' }) currency: string;
  @Prop({ default: false, index: true }) published: boolean;
  @Prop({ type: [String], default: [] }) images: string[];
}
export const ProductSchema = SchemaFactory.createForClass(Product);

function pageSize(raw?: string) {
  const value = raw === undefined ? 20 : Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new BadRequestException('limit must be an integer from 1 to 100');
  return value;
}
function objectId(value: string) {
  if (!isObjectIdOrHexString(value)) throw new BadRequestException('Invalid ID');
  return value;
}
@ApiTags('public catalog')
@Controller()
export class CatalogController {
  constructor(@InjectModel(Workshop.name) private readonly workshops: Model<Workshop>, @InjectModel(Product.name) private readonly products: Model<Product>) {}
  @Get('workshops')
  @ApiQuery({name: 'limit', required: false, type: Number})
  listWorkshops(@Query('limit') limit?: string) {
    return this.workshops.find({ approved: true }).sort({ _id: -1 }).limit(pageSize(limit)).lean();
  }
  @Get('workshops/:id')
  async workshop(@Param('id') id: string) {
    const result = await this.workshops.findOne({ _id: objectId(id), approved: true }).lean();
    if (!result) throw new NotFoundException('Workshop not found');
    return result;
  }
  @Get('products')
  @ApiQuery({name: 'limit', required: false, type: Number})
  @ApiQuery({name: 'category', required: false})
  async listProducts(@Query('limit') limit?: string, @Query('category') category?: string) {
    const size = pageSize(limit);
    if (category !== undefined && typeof category !== 'string') throw new BadRequestException('Invalid category');
    const ids = await this.workshops.find({ approved: true }).distinct('_id');
    return this.products.find({ published: true, workshopId: { $in: ids.map(String) }, ...(category ? { category } : {}) }).sort({ _id: -1 }).limit(size).lean();
  }
}
@Module({ imports: [MongooseModule.forFeature([{ name: Workshop.name, schema: WorkshopSchema }, { name: Product.name, schema: ProductSchema }])], controllers: [CatalogController] })
export class CatalogModule {}
