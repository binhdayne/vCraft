import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { role } from "../../common/authorization";
import { id, parse } from "../../common/validation";
import { Actor } from "../auth/interfaces/actor.interface";
import { productInput, workshopInput } from "../catalog/dto/catalog.dto";
import { productsInputSchema } from "./dto/catalog.dto";
@Injectable()
export class CatalogService {
  constructor(
    @InjectModel("Studio")
    private readonly workshopsModel: Model<Record<string, any>>,
    @InjectModel("Artwork")
    private readonly productsModel: Model<Record<string, any>>,
    @InjectModel("Batch")
    private readonly batchesModel: Model<Record<string, any>>,
    @InjectModel("MediaAsset")
    private readonly assetsModel: Model<Record<string, any>>,
  ) {}
  async workshops() {
    const studios = await this.workshopsModel
      .find({ approved: true })
      .sort({ name: 1 })
      .lean();
    return this.withOwnerPhotos(studios);
  }
  async workshop(key: string) {
    const item = await this.workshopsModel
      .findOne({ _id: parse(id, key), approved: true })
      .lean();
    if (!item) throw new NotFoundException("Không tìm thấy xưởng");
    return (await this.withOwnerPhotos([item]))[0];
  }
  async products(query: unknown) {
    const q = parse(productsInputSchema, query);
    const studios = await this.workshopsModel
      .find({ approved: true, ...(q.workshopId ? { _id: q.workshopId } : {}) })
      .distinct("_id");
    const filter: any = {
      published: true,
      workshopId: { $in: studios.map(String) },
    };
    if (q.category) filter.category = q.category;
    // Escape user input before constructing a search expression.
    if (q.search)
      filter.name = {
        $regex: q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    const [items, total] = await Promise.all([
      this.productsModel
        .find(filter)
        .sort({ _id: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      this.productsModel.countDocuments(filter),
    ]);
    return { items, total, page: q.page, pages: Math.ceil(total / q.limit) };
  }
  async product(key: string) {
    const item = await this.productsModel
      .findOne({ _id: parse(id, key), published: true })
      .lean();
    if (!item) throw new NotFoundException("Không tìm thấy tranh");
    const workshop = await this.workshopsModel
      .findOne({ _id: item.workshopId, approved: true })
      .lean();
    if (!workshop) throw new NotFoundException("Xưởng chưa công khai");
    const batches = await this.batchesModel
      .find({ productId: key, published: true })
      .lean();
    return { ...item, workshop, batches };
  }
  async studio(actor: Actor) {
    role(actor, "artisan");
    return (await this.withOwnerPhotos([await this.own(actor)]))[0];
  }
  async updateStudio(actor: Actor, body: unknown) {
    role(actor, "artisan");
    const data = parse(workshopInput, body);
    const studio = await this.own(actor);
    // Preserve unchanged legacy images, but new uploads must belong to this account.
    const existing = new Set(studio.images || []);
    const additions = [...new Set(data.images.filter(url => url.startsWith("/uploads/") && !existing.has(url)))];
    if (additions.length) {
      const owned = await this.assetsModel.countDocuments({ ownerId: actor.id, url: { $in: additions } });
      if (owned !== additions.length)
        throw new ForbiddenException("Chỉ được thêm ảnh do tài khoản xưởng của bạn tải lên");
    }
    return this.workshopsModel.findOneAndUpdate(
      { ownerId: actor.id },
      { $set: data },
      { new: true },
    );
  }
  async ownProducts(actor: Actor) {
    role(actor, "artisan");
    const studio = await this.own(actor);
    return this.productsModel
      .find({ workshopId: String(studio._id) })
      .sort({ _id: -1 })
      .lean();
  }
  async createProduct(actor: Actor, body: unknown) {
    role(actor, "artisan");
    const studio = await this.own(actor);
    if (!studio.approved) throw new ForbiddenException("Xưởng đang chờ duyệt");
    return this.productsModel.create({
      ...parse(productInput, body),
      workshopId: String(studio._id),
    });
  }
  async editProduct(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const studio = await this.own(actor);
    const item = await this.productsModel.findOneAndUpdate(
      { _id: parse(id, key), workshopId: String(studio._id) },
      { $set: parse(productInput, body) },
      { new: true },
    );
    if (!item) throw new NotFoundException();
    return item;
  }
  async own(user: Actor) {
    const studio = await this.workshopsModel
      .findOne({ ownerId: user.id })
      .lean();
    if (!studio) throw new NotFoundException("Chưa có hồ sơ xưởng");
    return studio;
  }

  private async withOwnerPhotos(studios: Record<string, any>[]) {
    const urls = [...new Set(studios.flatMap(studio => (studio.images || []) as string[]))]
      .filter(url => url.startsWith("/uploads/"));
    const assets = urls.length ? await this.assetsModel.find({
      url: { $in: urls }, ownerId: { $in: studios.map(studio => studio.ownerId) },
    }).select("url ownerId").lean() : [];
    const owned = new Set(assets.map(asset => `${asset.ownerId}:${asset.url}`));
    return studios.map(studio => ({
      ...studio,
      ownerPhotos: ((studio.images || []) as string[]).filter(url => owned.has(`${studio.ownerId}:${url}`)),
    }));
  }
}
