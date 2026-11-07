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
import {
  allocationInput,
  quoteInput,
  versionInput,
} from "../quotes/dto/quotes.dto";
import {
  bidInputSchema,
  editInputSchema,
  productionInputSchema,
} from "./dto/quotes.dto";
@Injectable()
export class QuotesService {
  constructor(
    @InjectModel("Account")
    private readonly usersModel: Model<Record<string, any>>,
    @InjectModel("Studio")
    private readonly workshopsModel: Model<Record<string, any>>,
    @InjectModel("Quotation")
    private readonly quotesModel: Model<Record<string, any>>,
  ) {}
  async list(actor: Actor) {
    const u: Actor = actor;
    let filter: any = {};
    if (u.role === "buyer") filter = { buyerId: u.id };
    if (u.role === "artisan") {
      const s = await this.studio(u);
      filter = { recipients: String(s._id), status: { $ne: "draft" } };
    }
    return this.quotesModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
  }
  async detail(actor: Actor, key: string) {
    const q = await this.load(key, actor);
    const workshops = await this.workshopsModel
      .find({ _id: { $in: q.recipients } })
      .select("name images")
      .lean();
    return { ...q, workshops };
  }
  async create(actor: Actor, body: unknown) {
    role(actor, "buyer");
    const data = parse(quoteInput, body);
    this.deadline(data.deadline);
    return this.quotesModel.create({
      ...data,
      buyerId: actor.id,
      status: "draft",
      recipients: [],
      version: 0,
      bids: [],
      allocations: [],
      history: [
        {
          status: "draft",
          at: new Date(),
          actor: actor.id,
          note: "Tạo yêu cầu",
        },
      ],
    });
  }
  async edit(actor: Actor, key: string, body: unknown) {
    const data = parse(editInputSchema, body);
    const q = await this.load(key, actor);
    this.buyer(q, actor);
    this.state(q, ["draft"]);
    this.deadline(data.deadline);
    const { version, ...changes } = data;
    return this.cas(q, version, changes, actor, "Cập nhật bản nháp");
  }
  async send(actor: Actor, key: string, body: unknown) {
    const { version } = parse(versionInput, body);
    const q = await this.load(key, actor);
    this.buyer(q, actor);
    this.state(q, ["draft"]);
    this.deadline(q.deadline);
    const active = await this.usersModel
      .find({ role: "artisan", active: true })
      .distinct("_id");
    const studios = await this.workshopsModel
      .find({
        approved: true,
        categories: q.category,
        ownerId: { $in: active.map(String) },
      })
      .distinct("_id");
    if (!studios.length)
      throw new BadRequestException("Chưa có xưởng phù hợp với phân loại này");
    return this.cas(
      q,
      version,
      { status: "sent", recipients: studios.map(String) },
      actor,
      "Gửi tới các xưởng phù hợp",
    );
  }
  async bid(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const data = parse(bidInputSchema, body);
    const q = await this.load(key, actor);
    this.state(q, ["sent", "bidding"]);
    this.deadline(q.deadline);
    const studio = await this.studio(actor);
    if (!studio.approved) throw new ForbiddenException("Xưởng chưa được duyệt");
    if (data.quantity > q.quantity)
      throw new BadRequestException("Số lượng chào vượt yêu cầu");
    if (
      Date.now() + data.days * 86400000 >
      new Date(q.deadline + "T23:59:59Z").getTime()
    )
      throw new BadRequestException("Thời gian hoàn thành vượt hạn giao");
    const { version, ...offer } = data;
    const bids = q.bids.filter((b: any) => b.workshopId !== String(studio._id));
    bids.push({
      ...offer,
      workshopId: String(studio._id),
      artisanId: actor.id,
    });
    return this.cas(
      q,
      version,
      { status: "bidding", bids, proposedAllocations: [] },
      actor,
      "Xưởng gửi chào giá",
    );
  }
  async plan(actor: Actor, key: string, body: unknown) {
    role(actor, "admin");
    const data = parse(allocationInput, body);
    const q = await this.load(key, actor);
    this.state(q, ["bidding"]);
    await this.allocations(q, data.allocations);
    return this.cas(
      q,
      data.version,
      { proposedAllocations: data.allocations },
      actor,
      "BQL đề xuất phân bổ cho khách hàng",
    );
  }
  async accept(actor: Actor, key: string, body: unknown) {
    const data = parse(allocationInput, body);
    const q = await this.load(key, actor);
    this.buyer(q, actor);
    this.state(q, ["bidding"]);
    this.deadline(q.deadline);
    const allocations = await this.allocations(q, data.allocations);
    return this.cas(
      q,
      data.version,
      { status: "accepted", allocations },
      actor,
      "Khách hàng chấp nhận và phân bổ đơn",
    );
  }
  async production(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const data = parse(productionInputSchema, body);
    const q = await this.load(key, actor);
    this.state(q, ["accepted", "in_production"]);
    const s = await this.studio(actor);
    const allocations = q.allocations.map((a: any) => ({ ...a }));
    const own = allocations.find((a: any) => a.workshopId === String(s._id));
    if (!own) throw new ForbiddenException("Xưởng không được phân bổ đơn này");
    if (
      (data.action === "start" && own.status !== "accepted") ||
      (data.action === "ready" && own.status !== "in_production")
    )
      throw new ConflictException("Trạng thái phần việc không phù hợp");
    own.status = data.action === "start" ? "in_production" : "ready";
    return this.cas(
      q,
      data.version,
      { status: "in_production", allocations },
      actor,
      data.action === "start"
        ? "Xưởng bắt đầu sản xuất"
        : "Xưởng hoàn thành phần việc",
    );
  }
  async deliver(actor: Actor, key: string, body: unknown) {
    const { version } = parse(versionInput, body);
    const q = await this.load(key, actor);
    this.buyer(q, actor);
    this.state(q, ["in_production"]);
    if (
      !q.allocations.length ||
      q.allocations.some((a: any) => a.status !== "ready")
    )
      throw new ConflictException("Các xưởng chưa hoàn thành toàn bộ đơn");
    return this.cas(
      q,
      version,
      { status: "delivered" },
      actor,
      "Khách hàng xác nhận đã nhận đủ hàng",
    );
  }
  private async allocations(q: any, input: any[]) {
    if (new Set(input.map((a) => a.workshopId)).size !== input.length)
      throw new BadRequestException("Xưởng bị trùng");
    if (input.reduce((s, a) => s + a.quantity, 0) !== q.quantity)
      throw new BadRequestException("Tổng phân bổ phải bằng số lượng yêu cầu");
    const result = [];
    for (const a of input) {
      const bid = q.bids.find((b: any) => b.workshopId === a.workshopId);
      if (!bid || a.quantity > bid.quantity)
        throw new BadRequestException("Phân bổ vượt số lượng chào giá");
      const studio = await this.workshopsModel.findOne({
        _id: a.workshopId,
        approved: true,
      });
      if (
        !studio ||
        !(await this.usersModel.exists({ _id: studio.ownerId, active: true }))
      )
        throw new BadRequestException("Xưởng không còn đủ điều kiện");
      result.push({ ...a, unitPrice: bid.unitPrice, status: "accepted" });
    }
    return result;
  }
  private async load(key: string, user: Actor) {
    const q = await this.quotesModel.findById(parse(id, key)).lean();
    if (!q) throw new NotFoundException("Không tìm thấy yêu cầu");
    if (user.role === "buyer" && q.buyerId !== user.id)
      throw new ForbiddenException();
    if (user.role === "artisan") {
      const s = await this.studio(user);
      if (q.status === "draft" || !q.recipients.includes(String(s._id)))
        throw new ForbiddenException();
    }
    return q;
  }
  private async studio(user: Actor) {
    const s = await this.workshopsModel.findOne({ ownerId: user.id }).lean();
    if (!s) throw new ForbiddenException("Chưa có xưởng");
    return s;
  }
  private buyer(q: any, u: Actor) {
    if (u.role !== "buyer" || q.buyerId !== u.id)
      throw new ForbiddenException(
        "Chỉ khách hàng sở hữu yêu cầu được thực hiện",
      );
  }
  private state(q: any, allowed: string[]) {
    if (!allowed.includes(q.status))
      throw new ConflictException("Trạng thái yêu cầu không phù hợp");
  }
  private deadline(date: string) {
    if (new Date(date + "T23:59:59Z").getTime() < Date.now())
      throw new BadRequestException("Hạn giao hàng đã qua");
  }
  private async cas(
    q: any,
    version: number,
    changes: any,
    user: Actor,
    note: string,
  ) {
    if (q.version !== version)
      throw new ConflictException("Dữ liệu đã thay đổi. Vui lòng tải lại.");
    const updated = await this.quotesModel.findOneAndUpdate(
      { _id: q._id, version, status: q.status },
      {
        $set: changes,
        $inc: { version: 1 },
        $push: {
          history: {
            status: changes.status || q.status,
            at: new Date(),
            actor: user.id,
            note,
          },
        },
      },
      { new: true },
    );
    if (!updated)
      throw new ConflictException("Có cập nhật đồng thời. Vui lòng tải lại.");
    return updated;
  }
}
