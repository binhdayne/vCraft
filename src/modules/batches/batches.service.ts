import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { role } from "../../common/authorization";
import { id, parse } from "../../common/validation";
import { Actor } from "../auth/interfaces/actor.interface";
import {
  editInputSchema,
  eventInputSchema,
  landingContentSchema,
  landingEditSchema,
} from "./dto/batches.dto";
@Injectable()
export class BatchesService {
  constructor(
    @InjectModel("Studio")
    private readonly workshopsModel: Model<Record<string, any>>,
    @InjectModel("Artwork")
    private readonly productsModel: Model<Record<string, any>>,
    @InjectModel("Batch")
    private readonly batchesModel: Model<Record<string, any>>,
    @InjectModel("WorkshopProduct")
    private readonly workshopProductsModel: Model<Record<string, any>>,
    @InjectModel("Quotation")
    private readonly quotesModel: Model<Record<string, any>>,
    @InjectModel("MediaAsset")
    private readonly assetsModel: Model<Record<string, any>>,
    private readonly config: ConfigService,
  ) {}
  async trace(key: string) {
    const batch = await this.batchesModel
      .findOne({ _id: parse(id, key), published: true })
      .lean();
    if (!batch) throw new NotFoundException("Lô tranh chưa công khai");
    if (batch.quoteId && !(await this.isLinked(batch)))
      throw new NotFoundException("Lô tranh chưa hoàn thành");
    const workshop = await this.workshopsModel
      .findOne({ _id: batch.workshopId, approved: true })
      .lean();
    const product = await this.productsModel
      .findOne({ _id: batch.productId, ...(batch.quoteId ? {} : { published: true }) })
      .lean();
    if (!workshop || (!product && !batch.productName))
      throw new NotFoundException("Lô tranh chưa công khai");
    return { ...batch,
      workshop: { ...workshop, name: batch.workshopName || workshop.name,
        story: batch.workshopStory || workshop.story },
      product: { ...product, _id: batch.productId, name: batch.productName || product?.name,
        images: batch.coverImages?.length ? batch.coverImages : product?.images },
      traceUrl: this.url(key) };
  }
  async qr(key: string) {
    await this.trace(key);
    const buffer = await QRCode.toBuffer(this.url(key), {
      width: 480,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    return buffer;
  }
  private url(key: string) {
    return (
      this.config
        .get<string>("PUBLIC_URL", "http://localhost:3000")
        .replace(/\/$/, "") +
      "/#/trace/" +
      key
    );
  }
  async list(actor: Actor) {
    role(actor, "artisan");
    const s = await this.studio(actor.id);
    const batches = await this.batchesModel
      .find({ workshopId: String(s._id) })
      .sort({ _id: -1 })
      .lean();
    return this.linkedBatches(batches);
  }

  async publicForProduct(productId: string) {
    const studios = await this.workshopsModel.find({ approved: true }).distinct("_id");
    const batches = await this.batchesModel.find({ productId, published: true,
      workshopId: { $in: studios.map(String) } }).lean();
    return this.linkedBatches(batches);
  }

  private async linkedBatches(batches: Record<string, any>[]) {
    const quotes = await this.quotesModel.find({
      _id: { $in: batches.filter(b => b.quoteId).map(b => b.quoteId) },
    }).select("allocations").lean();
    const linked = new Set(quotes.flatMap(q => q.allocations.filter((a: any) => a.status === "ready")
      .map((a: any) => `${q._id}:${a.workshopId}:${a.batchId}`)));
    return batches.filter(b => !b.quoteId || linked.has(`${b.quoteId}:${b.workshopId}:${b._id}`));
  }
  async create(actor: Actor, _body: unknown) {
    role(actor, "artisan");
    throw new BadRequestException(
      "Hãy hoàn thành phần việc trong yêu cầu đặt tranh để tạo landing page và QR",
    );
  }
  async edit(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const s = await this.studio(actor.id);
    const existing = await this.batchesModel.findOne({ _id: parse(id, key), workshopId: String(s._id) }).lean();
    if (!existing) throw new NotFoundException();
    let d: Record<string, any>;
    if (existing.quoteId) {
      if (!(await this.isLinked(existing))) throw new NotFoundException();
      d = parse(landingEditSchema, body);
      const { published, ...content } = d;
      parse(landingContentSchema, { ...content, productId: existing.productId });
      await this.ownedImages(actor.id, [...d.coverImages, ...d.events.flatMap((e: any) => e.images)]);
    } else {
      d = parse(editInputSchema, body);
    }
    const item = await this.batchesModel.findOneAndUpdate(
      { _id: parse(id, key), workshopId: String(s._id) },
      { $set: d },
      { new: true },
    );
    if (!item) throw new NotFoundException();
    return item;
  }
  async event(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const d = parse(eventInputSchema, body);
    if (d.date > new Date().toISOString().slice(0, 10))
      throw new BadRequestException("Nhật ký không được ở tương lai");
    const s = await this.studio(actor.id);
    const batch = await this.batchesModel.findOne({ _id: parse(id, key), workshopId: String(s._id) }).lean();
    if (!batch) throw new NotFoundException();
    if (batch.quoteId) {
      if (!(await this.isLinked(batch))) throw new NotFoundException();
      await this.ownedImages(actor.id, d.images);
      if (batch.events.length >= 30 || batch.events.some((e: any) => e.date > d.date))
        throw new BadRequestException("Mốc mới phải sau nhật ký hiện có, tối đa 30 mốc");
    }
    const item = await this.batchesModel.findOneAndUpdate(
      { _id: parse(id, key), workshopId: String(s._id) },
      { $push: { events: d } },
      { new: true },
    );
    if (!item) throw new NotFoundException();
    return item;
  }
  private async studio(ownerId: string) {
    const s = await this.workshopsModel.findOne({ ownerId });
    if (!s) throw new NotFoundException();
    return s;
  }

  async prepareCompletion(actor: Actor, quoteId: string, quantity: number, category: string, input: unknown, orderItems: any[] = []) {
    const d = parse(landingContentSchema, input);
    const s = await this.studio(actor.id);
    if (!s.approved) throw new ForbiddenException("Xưởng chưa được duyệt");
    const product = await this.productsModel.findOne({ _id: d.productId, published: true }).lean();
    const listed = await this.workshopProductsModel.exists({ productId: d.productId,
      workshopId: String(s._id), published: true });
    if (orderItems.length && !orderItems.some(item => item.productId === d.productId))
      throw new BadRequestException("Tác phẩm đại diện phải nằm trong danh sách tranh của đơn hàng");
    if (orderItems.length && orderItems.reduce((sum, item) => sum + item.quantity, 0) !== quantity)
      throw new BadRequestException("Đơn nhiều tác phẩm cần một xưởng thực hiện toàn bộ lô");
    const assignedHeritage = orderItems.length && product?.type === "general" && !product.workshopId;
    if (!product || (product.workshopId !== String(s._id) && !listed && !assignedHeritage))
      throw new ForbiddenException("Hãy chọn tranh đang công khai do xưởng sở hữu hoặc nhận in");
    if (!orderItems.length && product.category !== category)
      throw new BadRequestException("Tác phẩm phải thuộc phân loại của yêu cầu đặt tranh");
    if (orderItems.some(item => item.type === "custom" && item.workshopId !== String(s._id)))
      throw new ForbiddenException("Tranh độc bản trong lô phải do chính xưởng sở hữu thực hiện");
    await this.ownedImages(actor.id, [...d.coverImages, ...d.events.flatMap(e => e.images)]);
    // Stage first; public reads also require the quotation's successful completion link.
    // This keeps publication safe on a standalone MongoDB without transactions.
    return this.batchesModel.create({ ...d, quoteId, quantity, workshopId: String(s._id),
      items: orderItems.map(item => ({ productId: item.productId, artworkName: item.artworkName,
        image: item.image, quantity: item.quantity, category: item.category, dimensions: item.dimensions })),
      productName: product.name, workshopName: s.name,
      code: "DH-" + randomUUID().slice(0, 8).toUpperCase(), published: true });
  }

  async discardUnlinked(batch: any) {
    if (!(await this.isLinked(batch))) await this.batchesModel.deleteOne({ _id: batch._id });
  }

  private async isLinked(batch: any) {
    return this.quotesModel.exists({ _id: batch.quoteId, allocations: { $elemMatch: {
      workshopId: batch.workshopId, batchId: String(batch._id), status: "ready",
    } } });
  }

  private async ownedImages(ownerId: string, urls: string[]) {
    const unique = [...new Set(urls)];
    const count = await this.assetsModel.countDocuments({ ownerId, url: { $in: unique } });
    if (count !== unique.length) throw new ForbiddenException(
      "Ảnh thành phẩm và nhật ký phải là ảnh do chính tài khoản xưởng tải lên",
    );
  }
}
