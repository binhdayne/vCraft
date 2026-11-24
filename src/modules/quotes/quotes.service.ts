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
import { productionJournalInput } from "./dto/production-journal.dto";
import {
  acceptSingleWorkshopSchema,
  allocationInput,
  bidInputSchema,
  editInputSchema,
  itemProgressInputSchema,
  productionInputSchema,
  quoteInput,
  versionInput,
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
    private readonly batchesService: BatchesService,
    @InjectModel("Artwork")
    private readonly artworkModel: Model<Record<string, any>>,
  ) {}

  async list(actor: Actor) {
    const u: Actor = actor;
    let filter: any = {};
    if (u.role === "buyer") filter = { buyerId: u.id };
    if (u.role === "artisan") {
      const s = await this.studio(u);
      const studioId = String(s._id);
      filter = {
        $or: [
          { recipients: studioId },
          { targetWorkshopId: studioId },
          { "allocations.workshopId": studioId },
        ],
        status: { $ne: "draft" },
      };
    }
    const quotes = await this.quotesModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return this.visibleJournals(quotes, actor);
  }

  async detail(actor: Actor, key: string) {
    const q = await this.load(key, actor);
    const recipientIds = [...(q.recipients || [])];
    if (q.targetWorkshopId && !recipientIds.includes(q.targetWorkshopId)) {
      recipientIds.push(q.targetWorkshopId);
    }
    const workshops = await this.workshopsModel
      .find({ _id: { $in: recipientIds } })
      .select("name images address categories")
      .lean();
    return this.visibleJournals({ ...q, workshops }, actor);
  }

  async create(actor: Actor, body: unknown) {
    role(actor, "buyer");
    const data = parse(quoteInput, body);
    this.deadline(data.deadline);

    let items: any[] = [];
    let computedQuantity = data.quantity || 0;
    let lotCategory = data.category || "";

    if (data.items && data.items.length > 0) {
      const productIds = data.items.map((i) => i.productId);
      const artworks = await this.artworkModel
        .find({ _id: { $in: productIds } })
        .lean();
      const artworkMap = new Map(artworks.map((a: any) => [String(a._id), a]));

      const workshopIds = artworks
        .map((a: any) => a.workshopId)
        .filter((wId: any) => Boolean(wId));
      const workshops = await this.workshopsModel
        .find({ _id: { $in: workshopIds } })
        .lean();
      const workshopMap = new Map(
        workshops.map((w: any) => [String(w._id), w]),
      );

      for (const item of data.items) {
        const art = artworkMap.get(item.productId);
        if (!art) {
          throw new NotFoundException(
            `Tác phẩm với ID ${item.productId} không tồn tại trên hệ thống`,
          );
        }
        const ws = art.workshopId
          ? workshopMap.get(String(art.workshopId))
          : null;
        items.push({
          productId: item.productId,
          artworkName: art.name,
          image:
            Array.isArray(art.images) && art.images.length > 0
              ? art.images[0]
              : item.image || "",
          category: art.category,
          dimensions: art.dimensions || item.dimensions || "26 × 37 cm",
          type: art.type || "general",
          workshopId: art.workshopId ? String(art.workshopId) : null,
          workshopName: ws?.name || "",
          quantity: item.quantity,
          note: item.note || "",
          productionStatus: "pending",
          completedAt: null,
        });
      }

      computedQuantity = items.reduce((s, i) => s + i.quantity, 0);

      const customItems = items.filter((i) => i.type === "custom");
      if (customItems.length > 0) {
        // STRICT COPYRIGHT RULE 1: CẤM BIDDING NẾU CÓ TRANH CUSTOM
        if (data.targetType === "bidding") {
          throw new BadRequestException(
            "Tranh độc bản không được phép đưa lên đấu thầu công khai. Yêu cầu bắt buộc gửi trực tiếp tới đúng xưởng sáng tác.",
          );
        }

        // STRICT COPYRIGHT RULE 2: CẤM GOM TRANH CUSTOM CỦA NHIỀU XƯỞNG
        const customWorkshops = Array.from(
          new Set(customItems.map((i) => i.workshopId).filter(Boolean)),
        );
        if (customWorkshops.length > 1) {
          throw new BadRequestException(
            "Không thể đặt tranh độc bản của nhiều xưởng trong cùng một đơn. Vui lòng tách đơn theo xưởng.",
          );
        }

        // Target workshop must match the custom artwork's workshop
        if (!data.targetWorkshopId) {
          throw new BadRequestException(
            "Vui lòng chọn xưởng nhận đặt tranh độc bản",
          );
        }
        if (
          customWorkshops.length === 1 &&
          customWorkshops[0] !== data.targetWorkshopId
        ) {
          throw new BadRequestException(
            "Tranh độc bản chỉ được phép giao cho chính xưởng sở hữu ván in chế tác",
          );
        }
      }

      if (!lotCategory) {
        const categories = Array.from(new Set(items.map((i) => i.category)));
        lotCategory = categories.length === 1 ? categories[0] : "Đa thể loại";
      }
    } else {
      if (!data.quantity || !data.category) {
        throw new BadRequestException(
          "Yêu cầu phải có danh sách tác phẩm hoặc số lượng và thể loại cụ thể",
        );
      }
      computedQuantity = data.quantity;
      lotCategory = data.category;
    }

    if (data.targetType === "direct") {
      if (!data.targetWorkshopId) {
        throw new BadRequestException("Đơn đặt trực tiếp yêu cầu chỉ định xưởng");
      }
      const studio = await this.workshopsModel.findOne({
        _id: data.targetWorkshopId,
        approved: true,
      });
      if (!studio) {
        throw new NotFoundException(
          "Xưởng được chỉ định không tồn tại hoặc chưa được phê duyệt",
        );
      }
    }

    return this.quotesModel.create({
      buyerId: actor.id,
      title: data.title,
      category: lotCategory,
      quantity: computedQuantity,
      deadline: data.deadline,
      description: data.description,
      targetType: data.targetType || "bidding",
      targetWorkshopId: data.targetWorkshopId || null,
      customerInfo: data.customerInfo || {},
      items,
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
          note: "Tạo yêu cầu đặt lô tranh",
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

    if (q.targetType === "direct") {
      if (!q.targetWorkshopId) {
        throw new BadRequestException(
          "Đơn đặt trực tiếp thiếu xưởng được chỉ định",
        );
      }
      const studio = await this.workshopsModel.findOne({
        _id: q.targetWorkshopId,
        approved: true,
      });
      if (!studio) {
        throw new BadRequestException(
          "Xưởng được chỉ định không tồn tại hoặc chưa được duyệt",
        );
      }
      const isOwnerActive = await this.usersModel.exists({
        _id: studio.ownerId,
        active: true,
      });
      if (!isOwnerActive) {
        throw new BadRequestException(
          "Nghệ nhân phụ trách xưởng hiện không hoạt động",
        );
      }

      return this.cas(
        q,
        version,
        { status: "sent", recipients: [String(studio._id)] },
        actor,
        "Gửi trực tiếp tới xưởng được chỉ định",
      );
    }

    // Target type: bidding
    const hasCustom = (q.items || []).some((i: any) => i.type === "custom");
    if (hasCustom) {
      throw new BadRequestException(
        "Tranh độc bản không được phép đưa lên đấu thầu công khai. Yêu cầu bắt buộc gửi trực tiếp tới đúng xưởng sáng tác.",
      );
    }

    const active = await this.usersModel
      .find({ role: "artisan", active: true })
      .distinct("_id");
    let studios = await this.workshopsModel
      .find({
        approved: true,
        categories: q.category,
        ownerId: { $in: active.map(String) },
      })
      .distinct("_id");

    if (!studios.length) {
      studios = await this.workshopsModel
        .find({
          approved: true,
          ownerId: { $in: active.map(String) },
        })
        .distinct("_id");
    }

    if (!studios.length)
      throw new BadRequestException("Chưa có xưởng phù hợp với yêu cầu này");

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

    if (
      q.targetType === "direct" &&
      q.targetWorkshopId &&
      String(studio._id) !== q.targetWorkshopId
    ) {
      throw new ForbiddenException(
        "Đơn hàng này được gửi đích danh cho xưởng khác",
      );
    }

    if (data.quantity > q.quantity)
      throw new BadRequestException("Số lượng chào vượt yêu cầu");
    const deadlineTime = new Date(q.deadline + "T23:59:59Z").getTime();
    const remainingDays = Math.max(1, Math.floor((deadlineTime - Date.now()) / 86400000));
    if (Date.now() + data.days * 86400000 > deadlineTime) {
      throw new BadRequestException(
        `Thời gian hoàn thành (${data.days} ngày) vượt quá hạn giao hàng (${q.deadline}). Vui lòng rút ngắn thời gian hoặc chọn tối đa ${remainingDays} ngày.`,
      );
    }

    let unitPrice = data.unitPrice || 0;
    let totalPrice = data.totalPrice || 0;
    const itemPrices = data.itemPrices || [];

    if (itemPrices.length > 0) {
      const itemMap = new Map<string, number>(
        (q.items || []).map((i: any) => [String(i.productId), Number(i.quantity) || 0]),
      );
      let calculatedTotal = 0;
      for (const ip of itemPrices) {
        const qty = Number(itemMap.get(String(ip.productId)) || 0);
        calculatedTotal += Number(ip.unitPrice) * qty;
      }
      totalPrice = calculatedTotal;
      unitPrice = q.quantity > 0 ? Math.round(totalPrice / q.quantity) : unitPrice;
    } else if (totalPrice > 0 && !unitPrice) {
      unitPrice = q.quantity > 0 ? Math.round(totalPrice / q.quantity) : 0;
    } else if (unitPrice > 0 && !totalPrice) {
      totalPrice = unitPrice * q.quantity;
    }

    const { version, ...offer } = data;
    const isUpdate = (q.bids || []).some((b: any) => b.workshopId === String(studio._id));
    const historyNote = isUpdate ? "Xưởng cập nhật chào giá" : "Xưởng gửi chào giá";
    const bids = q.bids.filter((b: any) => b.workshopId !== String(studio._id));
    bids.push({
      ...offer,
      unitPrice,
      totalPrice,
      itemPrices,
      workshopId: String(studio._id),
      artisanId: actor.id,
      createdAt: new Date(),
    });
    return this.cas(
      q,
      version,
      { status: "bidding", bids },
      actor,
      historyNote,
    );
  }

  async itemProgress(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const data = parse(itemProgressInputSchema, body);
    const q = await this.load(key, actor);
    this.state(q, ["accepted", "in_production"]);
    const studio = await this.studio(actor);
    const studioId = String(studio._id);

    if (q.acceptedWorkshopId && q.acceptedWorkshopId !== studioId) {
      throw new ForbiddenException("Xưởng không đảm nhận đơn hàng này");
    }
    const isAllocated = (q.allocations || []).some(
      (a: any) => a.workshopId === studioId,
    );
    if (!isAllocated && q.acceptedWorkshopId !== studioId) {
      throw new ForbiddenException("Xưởng không đảm nhận đơn hàng này");
    }

    const items = (q.items || []).map((it: any) => ({ ...it }));
    const targetItem = items.find(
      (it: any) => String(it.productId) === String(data.productId),
    );
    if (!targetItem) {
      throw new NotFoundException("Tác phẩm không nằm trong đơn hàng");
    }

    targetItem.productionStatus = data.status;
    targetItem.completedAt = data.status === "completed" ? new Date() : null;

    const statusLabel =
      data.status === "completed"
        ? "Đã in xong"
        : data.status === "in_progress"
          ? "Đang in"
          : "Chờ in";

    return this.cas(
      q,
      data.version,
      { items },
      actor,
      `Xưởng cập nhật tiến độ tác phẩm "${targetItem.artworkName}": ${statusLabel}`,
      { eventType: "log_only" },
    );
  }

  async accept(actor: Actor, key: string, body: unknown) {
    const q = await this.load(key, actor);
    this.buyer(q, actor);
    this.state(q, ["sent", "bidding"]);
    this.deadline(q.deadline);

    // Support single workshop winning selection (Spec 002)
    const single = acceptSingleWorkshopSchema.safeParse(body);
    if (single.success) {
      const { workshopId, version } = single.data;
      const studio = await this.workshopsModel.findOne({
        _id: workshopId,
        approved: true,
      });
      if (
        !studio ||
        !(await this.usersModel.exists({ _id: studio.ownerId, active: true }))
      ) {
        throw new BadRequestException("Xưởng không còn đủ điều kiện");
      }
      const bid = (q.bids || []).find((b: any) => b.workshopId === workshopId);
      const unitPrice = bid ? bid.unitPrice : 0;
      const allocations = [
        {
          workshopId: String(workshopId),
          quantity: q.quantity,
          unitPrice,
          status: "accepted",
        },
      ];
      return this.cas(
        q,
        version,
        {
          status: "accepted",
          acceptedWorkshopId: String(workshopId),
          allocations,
        },
        actor,
        "Khách hàng chấp thuận xưởng sản xuất trọn gói",
      );
    }

    // Support legacy multi-allocation input for backward compatibility
    const data = parse(allocationInput, body);
    const allocations = await this.allocations(q, data.allocations);
    return this.cas(
      q,
      data.version,
      { status: "accepted", allocations },
      actor,
      "Khách hàng chấp nhận và phân bổ đơn",
    );
  }

  async saveProductionJournal(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const data = parse(productionJournalInput, body);
    const q = await this.load(key, actor);
    this.state(q, ["in_production"]);
    const studio = await this.studio(actor);
    const index = q.allocations.findIndex((entry: any) => entry.workshopId === String(studio._id));
    if (index < 0) throw new ForbiddenException("Xưởng không được phân bổ đơn này");
    const own = q.allocations[index];
    if (own.status !== "in_production" || own.batchId)
      throw new ConflictException("Chỉ được lưu nhật ký khi phần việc đang sản xuất");
    if (q.version !== data.version) throw new ConflictException("Đơn đã thay đổi. Tải lại dữ liệu và lưu lại bản nháp.");
    if (data.journal.productId && q.items?.length && !q.items.some((item: any) => item.productId === data.journal.productId))
      throw new BadRequestException("Tác phẩm đại diện phải nằm trong đơn hàng");
    await this.batchesService.assertOwnedImages(actor.id,
      [...data.journal.coverImages, ...data.journal.events.flatMap(event => event.images)]);
    const updated = await this.quotesModel.findOneAndUpdate(
      { _id: q._id, version: data.version, status: "in_production" },
      { $set: { [`allocations.${index}.journalDraft`]: { ...data.journal, savedAt: new Date() } }, $inc: { version: 1 } },
      { new: true },
    );
    if (!updated) throw new ConflictException("Có cập nhật đồng thời. Vui lòng tải lại rồi lưu nháp.");
    // A private draft does not create a public batch, customer history entry or notification.
    return this.visibleJournals(updated, actor);
  }

  async production(actor: Actor, key: string, body: unknown) {
    role(actor, "artisan");
    const data = parse(productionInputSchema, body);
    const q = await this.load(key, actor);
    this.state(q, data.action === "ready" ? ["in_production", "delivered"] : ["accepted", "in_production"]);
    const s = await this.studio(actor);
    const allocations = q.allocations.map((a: any) => ({ ...a }));
    const own = allocations.find((a: any) => a.workshopId === String(s._id));
    if (!own) throw new ForbiddenException("Xưởng không được phân bổ đơn này");
    if (
      (data.action === "start" && own.status !== "accepted") ||
      (data.action === "ready" && (own.batchId || !["in_production", "ready"].includes(own.status)))
    )
      throw new ConflictException("Trạng thái phần việc không phù hợp");
    if (q.version !== data.version) throw new ConflictException("Dữ liệu đã thay đổi. Vui lòng tải lại.");
    let batch: any;
    if (data.action === "ready") {
      const saved = own.journalDraft;
      const landingPage = data.landingPage || (saved ? {
        productId: saved.productId, story: saved.story, workshopStory: saved.workshopStory,
        coverImages: saved.coverImages, events: saved.events,
      } : undefined);
      if (!landingPage)
        throw new BadRequestException(
          "Điền thông tin landing page trước khi hoàn thành lô tranh",
        );
      batch = await this.batchesService.prepareCompletion(
        actor,
        String(q._id),
        own.quantity,
        q.category,
        landingPage,
        q.items || [],
      );
      own.batchId = String(batch._id);
    }
    own.status = data.action === "start" ? "in_production" : "ready";
    try {
      return await this.cas(q, data.version,
        { status: q.status === "delivered" ? "delivered" : "in_production", allocations }, actor,
        data.action === "start" ? "Xưởng bắt đầu sản xuất" : "Xưởng hoàn thành phần việc và tạo trang truy xuất lô tranh",
        { eventType: data.action === "start" ? "production_started" : "batch_completed",
          workshopId: String(s._id), ...(batch ? { batchId: String(batch._id) } : {}) });
    } catch (error) {
      if (batch) await this.batchesService.discardUnlinked(batch);
      throw error;
    }
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
      throw new ForbiddenException("Không có quyền truy cập yêu cầu này");
    if (user.role === "artisan") {
      const s = await this.studio(user);
      const studioId = String(s._id);
      if (
        q.status === "draft" ||
        (!q.recipients?.includes(studioId) &&
          q.targetWorkshopId !== studioId &&
          !q.allocations?.some((a: any) => a.workshopId === studioId))
      )
        throw new ForbiddenException("Không có quyền truy cập yêu cầu này");
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
    event: { eventType?: string; workshopId?: string; batchId?: string } = {},
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
            eventType: event.eventType || ({ sent: "quote_sent", bidding: "bid_received", accepted: "quote_accepted", delivered: "order_delivered" } as Record<string, string>)[changes.status],
            ...(event.workshopId ? { workshopId: event.workshopId } : {}),
            ...(event.batchId ? { batchId: event.batchId } : {}),
          },
        },
      },
      { new: true },
    );
    if (!updated)
      throw new ConflictException("Có cập nhật đồng thời. Vui lòng tải lại.");
    return this.visibleJournals(updated, user);
  }

  private async visibleJournals(value: any, actor: Actor) {
    const studio = actor.role === "artisan"
      ? await this.workshopsModel.findOne({ ownerId: actor.id }).select("_id").lean() : null;
    const studioId = studio ? String(studio._id) : null;
    const clean = (quote: any) => {
      const record = typeof quote.toObject === "function" ? quote.toObject() : quote;
      return { ...record, allocations: (record.allocations || []).map((allocation: any) => {
        const { journalDraft, ...rest } = allocation;
        return studioId && allocation.workshopId === studioId ? allocation : rest;
      }) };
    };
    return Array.isArray(value) ? value.map(clean) : clean(value);
  }
}
