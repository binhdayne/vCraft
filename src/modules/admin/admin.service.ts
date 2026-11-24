import {
  BadRequestException,
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
  adminArtworksQuerySchema,
  approvalInputSchema,
  artworkApprovalInputSchema,
  createInputSchema,
  updateAdminArtworkInput,
  updateWorkshopInput,
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
        // Accounts created directly by the management board are already vetted.
        // The approval toggle remains available for later suspension/review.
        approved: true,
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

  async updateWorkshop(actor: Actor, key: string, body: unknown) {
    role(actor, "admin");
    const data = parse(updateWorkshopInput, body);
    const item = await this.workshopsModel.findByIdAndUpdate(
      parse(id, key),
      { $set: data },
      { new: true },
    );
    if (!item) throw new NotFoundException("Không tìm thấy xưởng");
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

  async artworks(actor: Actor, query?: unknown) {
    role(actor, "admin");
    const q = parse(adminArtworksQuerySchema, query || {});

    if (q.type === "custom") {
      const filter: Record<string, any> = { type: "custom" };
      if (q.approvalStatus && q.approvalStatus !== "all") {
        filter.approvalStatus = q.approvalStatus;
      }
      if (q.category) {
        filter.category = q.category;
      }
      if (q.search) {
        const sanitized = q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matchedWorkshops = await this.workshopsModel
          .find({ name: { $regex: sanitized, $options: "i" } })
          .distinct("_id");
        filter.$or = [
          { name: { $regex: sanitized, $options: "i" } },
          { workshopId: { $in: matchedWorkshops.map(String) } },
        ];
      }

      const [totalCustom, pendingCount, approvedCount, rejectedCount] =
        await Promise.all([
          this.productsModel.countDocuments({ type: "custom" }),
          this.productsModel.countDocuments({
            type: "custom",
            approvalStatus: "pending",
          }),
          this.productsModel.countDocuments({
            type: "custom",
            approvalStatus: "approved",
          }),
          this.productsModel.countDocuments({
            type: "custom",
            approvalStatus: "rejected",
          }),
        ]);

      const [items, total] = await Promise.all([
        this.productsModel
          .find(filter)
          .sort({ _id: -1 })
          .skip((q.page - 1) * q.limit)
          .limit(q.limit)
          .lean(),
        this.productsModel.countDocuments(filter),
      ]);

      const workshopIds = [
        ...new Set(items.map((i: any) => i.workshopId).filter(Boolean)),
      ];
      const workshops = await this.workshopsModel
        .find({ _id: { $in: workshopIds } })
        .lean();
      const ownerIds = [
        ...new Set(workshops.map((w: any) => w.ownerId).filter(Boolean)),
      ];
      const owners = await this.usersModel
        .find({ _id: { $in: ownerIds } })
        .select("name email")
        .lean();
      const ownerMap = new Map(owners.map((u: any) => [String(u._id), u]));
      const workshopMap = new Map(
        workshops.map((w: any) => {
          const owner = ownerMap.get(String(w.ownerId));
          return [
            String(w._id),
            {
              _id: String(w._id),
              name: w.name,
              address: w.address,
              ownerName: owner?.name || "",
              ownerEmail: owner?.email || "",
            },
          ];
        }),
      );

      const itemsWithWorkshop = items.map((item: any) => ({
        ...item,
        workshop: workshopMap.get(String(item.workshopId)) || null,
      }));

      return {
        items: itemsWithWorkshop,
        total,
        page: q.page,
        pages: Math.ceil(total / q.limit) || 1,
        stats: {
          total: totalCustom,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      };
    }

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

  async approveArtwork(actor: Actor, key: string, body: unknown) {
    role(actor, "admin");
    const data = parse(artworkApprovalInputSchema, body);
    const artId = parse(id, key);

    const artwork = await this.productsModel.findById(artId);
    if (!artwork) {
      throw new NotFoundException("Không tìm thấy tác phẩm");
    }
    if (artwork.type !== "custom") {
      throw new BadRequestException("Chỉ có thể phê duyệt tác phẩm độc bản của xưởng");
    }

    const updates: Record<string, any> = {
      approvalStatus: data.status,
      rejectedReason: data.status === "rejected" ? (data.reason || "") : "",
      approvedAt: data.status === "approved" ? new Date() : null,
      approvedBy: data.status === "approved" ? actor.id : null,
    };

    const updated = await this.productsModel.findByIdAndUpdate(
      artId,
      { $set: updates },
      { new: true },
    );

    return updated;
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
      approvalStatus: "approved",
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
