import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { role } from "../../common/authorization";
import { id, parse } from "../../common/validation";
import { Actor } from "../auth/interfaces/actor.interface";
import { BatchesService } from "../batches/batches.service";
import {
  productInput,
  updateWorkshopProductInput,
  workshopInput,
  workshopProductInput,
} from "../catalog/dto/catalog.dto";
import { productsInputSchema } from "./dto/catalog.dto";

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel("Studio")
    private readonly workshopsModel: Model<Record<string, any>>,
    @InjectModel("Artwork")
    private readonly productsModel: Model<Record<string, any>>,
    @InjectModel("WorkshopProduct")
    private readonly workshopProductsModel: Model<Record<string, any>>,
    private readonly batchesService: BatchesService,
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
    const approvedStudioIds = studios.map(String);

    const filter: any = { published: true };
    if (q.category) filter.category = q.category;

    if (q.search) {
      filter.name = {
        $regex: q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (q.workshopId) {
      const listedProductIds = await this.workshopProductsModel
        .find({ workshopId: q.workshopId, published: true })
        .distinct("productId");
      filter.$or = [
        { workshopId: q.workshopId },
        { _id: { $in: listedProductIds } },
      ];
    } else if (q.type === "general") {
      filter.type = "general";
    } else if (q.type === "custom") {
      filter.type = "custom";
      filter.workshopId = { $in: approvedStudioIds };
    } else {
      filter.$or = [
        { type: "general" },
        { type: "custom", workshopId: { $in: approvedStudioIds } },
        { type: { $exists: false }, workshopId: { $in: approvedStudioIds } },
      ];
    }

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

    let workshop: any = null;
    if (item.type === "custom" || item.workshopId) {
      workshop = await this.workshopsModel
        .findOne({ _id: item.workshopId, approved: true })
        .lean();
      if (!workshop) throw new NotFoundException("Xưởng chưa công khai");
      workshop = (await this.withOwnerPhotos([workshop]))[0];
    }

    const listings = await this.workshopProductsModel
      .find({ productId: key, published: true, inStock: true })
      .sort({ price: 1 })
      .lean();

    let workshopProducts: any[] = [];
    if (listings.length) {
      const studioIds = [...new Set(listings.map((l) => l.workshopId))];
      const studios = await this.workshopsModel
        .find({ _id: { $in: studioIds }, approved: true })
        .lean();
      const studiosWithPhotos = await this.withOwnerPhotos(studios);
      const studioMap = new Map(
        studiosWithPhotos.map((s: any) => [String(s._id), s]),
      );

      workshopProducts = listings
        .filter((l) => studioMap.has(String(l.workshopId)))
        .map((l) => ({
          ...l,
          workshop: studioMap.get(String(l.workshopId)),
        }));
    }

    const batches = await this.batchesService.publicForProduct(key);

    return { ...item, workshop, workshopProducts, batches };
  }

  async studio(actor: Actor) {
    role(actor, "artisan");
    return (await this.withOwnerPhotos([await this.own(actor)]))[0];
  }

  async updateStudio(actor: Actor, body: unknown) {
    role(actor, "artisan");
    const data = parse(workshopInput, body);
    const studio = await this.own(actor);
    const existing = new Set(studio.images || []);
    const additions = [
      ...new Set(
        data.images.filter((url) => url.startsWith("/uploads/") && !existing.has(url)),
      ),
    ];
    if (additions.length) {
      const owned = await this.assetsModel.countDocuments({
        ownerId: actor.id,
        url: { $in: additions },
      });
      if (owned !== additions.length)
        throw new ForbiddenException(
          "Chỉ được thêm ảnh do tài khoản xưởng của bạn tải lên",
        );
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
    const data = parse(productInput, body);
    return this.productsModel.create({
      ...data,
      type: "custom",
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

  async ownWorkshopProducts(actor: Actor) {
    role(actor, "artisan");
    const studio = await this.own(actor);
    const listings = await this.workshopProductsModel
      .find({ workshopId: String(studio._id) })
      .sort({ _id: -1 })
      .lean();

    if (!listings.length) return [];

    const productIds = listings.map((l) => l.productId);
    const artworks = await this.productsModel
      .find({ _id: { $in: productIds } })
      .select("name category dimensions material images story description type published")
      .lean();
    const artMap = new Map(artworks.map((a: any) => [String(a._id), a]));

    return listings.map((l) => ({
      ...l,
      product: artMap.get(String(l.productId)) || null,
    }));
  }

  async createWorkshopProduct(actor: Actor, body: unknown) {
    role(actor, "artisan");
    const studio = await this.own(actor);
    if (!studio.approved) throw new ForbiddenException("Xưởng đang chờ duyệt");

    const data = parse(workshopProductInput, body);

    const product = await this.productsModel.findById(data.productId).lean();
    if (!product) throw new NotFoundException("Không tìm thấy tác phẩm di sản");
    if (product.type !== "general") {
      throw new BadRequestException("Chỉ được đăng ký nhận in tranh di sản làng");
    }

    const existing = await this.workshopProductsModel.findOne({
      productId: data.productId,
      workshopId: String(studio._id),
    });
    if (existing) {
      throw new ConflictException("Xưởng của bạn đã niêm yết tác phẩm này rồi");
    }

    const imagesToSave = data.images?.length ? data.images : product.images;

    return this.workshopProductsModel.create({
      ...data,
      workshopId: String(studio._id),
      images: imagesToSave,
      inStock: data.inStock ?? true,
      published: data.published ?? true,
    });
  }

  async editWorkshopProduct(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const studio = await this.own(actor);
    const data = parse(updateWorkshopProductInput, body);

    const item = await this.workshopProductsModel.findOneAndUpdate(
      { _id: parse(id, key), workshopId: String(studio._id) },
      { $set: data },
      { new: true },
    );
    if (!item) throw new NotFoundException("Không tìm thấy bản ghi nhận in");
    return item;
  }

  async deleteWorkshopProduct(actor: Actor, key: string) {
    role(actor, "artisan");
    const studio = await this.own(actor);

    const item = await this.workshopProductsModel.findOneAndDelete({
      _id: parse(id, key),
      workshopId: String(studio._id),
    });
    if (!item) throw new NotFoundException("Không tìm thấy bản ghi nhận in");
    return { success: true };
  }

  async own(user: Actor) {
    const studio = await this.workshopsModel
      .findOne({ ownerId: user.id })
      .lean();
    if (!studio) throw new NotFoundException("Chưa có hồ sơ xưởng");
    return studio;
  }

  private async withOwnerPhotos(studios: Record<string, any>[]) {
    const urls = [
      ...new Set(studios.flatMap((studio) => (studio.images || []) as string[])),
    ].filter((url) => url.startsWith("/uploads/"));
    const assets = urls.length
      ? await this.assetsModel
          .find({
            url: { $in: urls },
            ownerId: { $in: studios.map((studio) => studio.ownerId) },
          })
          .select("url ownerId")
          .lean()
      : [];
    const owned = new Set(assets.map((asset) => `${asset.ownerId}:${asset.url}`));
    return studios.map((studio) => ({
      ...studio,
      ownerPhotos: ((studio.images || []) as string[]).filter((url) =>
        owned.has(`${studio.ownerId}:${url}`),
      ),
    }));
  }
}
