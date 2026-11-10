import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import { Model } from "mongoose";
import { role } from "../../common/authorization";
import { id, parse } from "../../common/validation";
import { Actor } from "../auth/interfaces/actor.interface";
import {
  accountInputSchema,
  adminArtworkInput,
  approvalInputSchema,
  createInputSchema,
  updateAdminArtworkInput,
} from "./dto/admin.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel("Account")
    private readonly usersModel: Model<Record<string, any>>,
    @InjectModel("Studio")
    private readonly workshopsModel: Model<Record<string, any>>,
    @InjectModel("Artwork")
    private readonly productsModel: Model<Record<string, any>>,
    @InjectModel("WorkshopProduct")
    private readonly workshopProductsModel: Model<Record<string, any>>,
  ) {}

  async users(actor: Actor) {
    role(actor, "admin");
    return this.usersModel.find().sort({ _id: -1 }).lean();
  }

  async workshops(actor: Actor) {
    role(actor, "admin");
    return this.workshopsModel.find().sort({ _id: -1 }).lean();
  }

  async create(actor: Actor, body: unknown) {
    role(actor, "admin");
    const data = parse(createInputSchema, body);
    let user: any;
    try {
      user = await this.usersModel.create({
        name: data.name,
        email: data.email,
        passwordHash: await hash(data.password, 12),
        role: "artisan",
      });
    } catch (e: any) {
      if (e.code === 11000) throw new ConflictException("Email đã tồn tại");
      throw e;
    }
    try {
      return await this.workshopsModel.create({
        ...data.workshop,
        ownerId: String(user._id),
        approved: false,
      });
    } catch (e) {
      await this.usersModel.deleteOne({ _id: user._id });
      throw e;
    }
  }

  async approval(actor: Actor, key: string, body: unknown) {
    role(actor, "admin");
    const data = parse(approvalInputSchema, body);
    const item = await this.workshopsModel.findByIdAndUpdate(
      parse(id, key),
      { $set: data },
      { new: true },
    );
    if (!item) throw new NotFoundException();
    return item;
  }

  async account(actor: Actor, key: string, body: unknown) {
    role(actor, "admin");
    const data = parse(accountInputSchema, body);
    if (key === actor.id)
      throw new ForbiddenException("Không thể tự khóa tài khoản");
    const item = await this.usersModel.findOneAndUpdate(
      { _id: parse(id, key), role: { $ne: "admin" } },
      { $set: data },
      { new: true },
    );
    if (!item) throw new NotFoundException();
    return item;
  }

  async artworks(actor: Actor) {
    role(actor, "admin");
    const items = await this.productsModel
      .find({ type: "general" })
      .sort({ _id: -1 })
      .lean();

    const counts = await this.workshopProductsModel.aggregate([
      { $group: { _id: "$productId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c: any) => [String(c._id), c.count]));

    return items.map((item: any) => ({
      ...item,
      workshopCount: countMap.get(String(item._id)) || 0,
    }));
  }

  async artworkListings(actor: Actor, key: string) {
    role(actor, "admin");
    const artId = parse(id, key);
    const listings = await this.workshopProductsModel
      .find({ productId: artId })
      .sort({ _id: -1 })
      .lean();
    if (!listings.length) return [];
    const studioIds = listings.map((l) => l.workshopId);
    const studios = await this.workshopsModel
      .find({ _id: { $in: studioIds } })
      .lean();
    const studioMap = new Map(studios.map((s: any) => [String(s._id), s]));
    return listings.map((l) => ({
      ...l,
      workshop: studioMap.get(String(l.workshopId)) || null,
    }));
  }

  async createArtwork(actor: Actor, body: unknown) {
    role(actor, "admin");
    const data = parse(adminArtworkInput, body);
    return this.productsModel.create({
      ...data,
      type: "general",
      workshopId: null,
      price: null,
    });
  }

  async editArtwork(actor: Actor, key: string, body: unknown) {
    role(actor, "admin");
    const data = parse(updateAdminArtworkInput, body);
    const item = await this.productsModel.findOneAndUpdate(
      { _id: parse(id, key), type: "general" },
      { $set: data },
      { new: true },
    );
    if (!item) throw new NotFoundException("Không tìm thấy tác phẩm di sản");
    return item;
  }

  async deleteArtwork(actor: Actor, key: string) {
    role(actor, "admin");
    const artId = parse(id, key);
    await this.workshopProductsModel.deleteMany({ productId: artId });
    const item = await this.productsModel.findOneAndDelete({
      _id: artId,
      type: "general",
    });
    if (!item) throw new NotFoundException("Không tìm thấy tác phẩm di sản");
    return { success: true };
  }
}
