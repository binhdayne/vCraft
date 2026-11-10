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
  createInputSchema,
  editInputSchema,
  eventInputSchema,
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
    private readonly config: ConfigService,
  ) {}
  async trace(key: string) {
    const batch = await this.batchesModel
      .findOne({ _id: parse(id, key), published: true })
      .lean();
    if (!batch) throw new NotFoundException("Lô tranh chưa công khai");
    const workshop = await this.workshopsModel
      .findOne({ _id: batch.workshopId, approved: true })
      .lean();
    const product = await this.productsModel
      .findOne({ _id: batch.productId, published: true })
      .lean();
    if (!workshop || !product)
      throw new NotFoundException("Lô tranh chưa công khai");
    return { ...batch, workshop, product, traceUrl: this.url(key) };
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
    return this.batchesModel
      .find({ workshopId: String(s._id) })
      .sort({ _id: -1 })
      .lean();
  }
  async create(actor: Actor, body: unknown) {
    role(actor, "artisan");
    const d = parse(createInputSchema, body);
    const s = await this.studio(actor.id);
    const isCustom = await this.productsModel.exists({
      _id: d.productId,
      workshopId: String(s._id),
    });
    const isHeritage = await this.workshopProductsModel.exists({
      productId: d.productId,
      workshopId: String(s._id),
    });
    if (!isCustom && !isHeritage)
      throw new ForbiddenException("Sản phẩm không thuộc xưởng");
    return this.batchesModel.create({
      ...d,
      workshopId: String(s._id),
      code: "DH-" + randomUUID().slice(0, 8).toUpperCase(),
      events: [],
    });
  }
  async edit(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const d = parse(editInputSchema, body);
    const s = await this.studio(actor.id);
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
}
