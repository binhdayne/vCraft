import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { parse } from "../../common/validation";
import { Actor } from "../auth/interfaces/actor.interface";
import { notificationKey, notificationsQuery } from "./dto/notifications.dto";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel("Quotation") private readonly quotes: Model<Record<string, any>>,
    @InjectModel("Studio") private readonly studios: Model<Record<string, any>>,
    @InjectModel("Bulletin") private readonly bulletins: Model<Record<string, any>>,
    @InjectModel("Batch") private readonly batches: Model<Record<string, any>>,
    @InjectModel("NotificationRead") private readonly reads: Model<Record<string, any>>,
  ) {}

  async list(actor: Actor, input: unknown) {
    const query = parse(notificationsQuery, input);
    const pipeline = await this.feed(actor);
    const filter = query.unreadOnly === "true" ? [{ $match: { readAt: null } }] : [];
    pipeline.push({ $facet: {
      unread: [{ $match: { readAt: null } }, { $count: "count" }],
      items: [...filter, { $sort: { at: -1, key: -1 } }, { $skip: (query.page - 1) * query.limit }, { $limit: query.limit + 1 }],
    } });
    const [result] = await this.quotes.aggregate(pipeline);
    const items = result.items.slice(0, query.limit);
    return { items: await this.describe(items, actor), unreadCount: result.unread[0]?.count || 0,
      page: query.page, hasMore: result.items.length > query.limit };
  }

  async read(actor: Actor, input: string) {
    const key = parse(notificationKey, input);
    const pipeline = await this.feed(actor);
    pipeline.push({ $match: { key } }, { $limit: 1 });
    if (!(await this.quotes.aggregate(pipeline)).length) throw new NotFoundException("Không tìm thấy thông báo");
    try {
      await this.reads.updateOne({ recipientId: actor.id, key },
        { $setOnInsert: { recipientId: actor.id, key, readAt: new Date() } }, { upsert: true });
    } catch (error: any) { if (error.code !== 11000) throw error; }
    return { key, read: true };
  }

  async readAll(actor: Actor) {
    const pipeline = await this.feed(actor);
    pipeline.push({ $match: { readAt: null } }, { $project: { key: 1 } });
    const items = await this.quotes.aggregate(pipeline);
    if (items.length) {
      const readAt = new Date();
      try {
        await this.reads.bulkWrite(items.map(item => ({ updateOne: {
          filter: { recipientId: actor.id, key: item.key },
          update: { $setOnInsert: { recipientId: actor.id, key: item.key, readAt } }, upsert: true,
        } })), { ordered: false });
      } catch (error: any) {
        if (!error.writeErrors?.length || error.writeErrors.some((entry: any) => entry.code !== 11000)) throw error;
      }
    }
    return { marked: items.length };
  }

  // Notifications come from committed history, so failed/stale order writes cannot emit alerts.
  // The only extra storage is a recipient-scoped receipt; existing orders work without a migration.
  private async feed(actor: Actor): Promise<any[]> {
    let filter: any = { _id: { $in: [] } };
    let eventFilter: any = { "history.status": { $in: ["sent", "bidding", "accepted", "in_production", "delivered"] } };
    if (actor.role === "buyer") filter = { buyerId: actor.id, status: { $ne: "draft" } };
    if (actor.role === "artisan") {
      const studio = await this.studios.findOne({ ownerId: actor.id }).select("_id").lean();
      if (studio) {
        const studioId = String(studio._id);
        filter = { status: { $ne: "draft" }, $or: [
          { recipients: studioId }, { targetWorkshopId: studioId }, { "allocations.workshopId": studioId },
        ] };
        eventFilter = { $or: [
          { "history.status": "sent" },
          { "history.status": "bidding", "history.actor": actor.id },
          { "history.status": "accepted", "allocations.workshopId": studioId },
          { "history.status": "in_production", "history.actor": actor.id, "allocations.workshopId": studioId },
          { "history.status": "delivered", "allocations.workshopId": studioId,
            $or: [{ $expr: { $eq: ["$history.actor", "$buyerId"] } }, { "history.actor": actor.id }] },
        ] };
      }
    }
    return [
      { $match: filter },
      { $unwind: { path: "$history", includeArrayIndex: "eventIndex" } },
      { $match: eventFilter },
      { $project: {
        _id: 0, key: { $concat: ["order:", { $toString: "$_id" }, ":", { $toString: "$eventIndex" }] },
        source: { $literal: "order" }, quoteId: { $toString: "$_id" }, quoteTitle: "$title",
        at: { $ifNull: ["$history.at", "$updatedAt"] }, status: "$history.status", actorId: "$history.actor",
        eventType: "$history.eventType", batchId: "$history.batchId", workshopId: "$history.workshopId", note: "$history.note",
        allocations: { $map: { input: "$allocations", as: "a", in: { workshopId: "$$a.workshopId", batchId: "$$a.batchId", status: "$$a.status" } } },
      } },
      { $unionWith: { coll: this.bulletins.collection.name, pipeline: [
        { $match: { published: true } },
        { $project: { _id: 0, key: { $concat: ["announcement:", { $toString: "$_id" }] },
          source: { $literal: "announcement" }, title: 1, message: { $substrCP: [{ $ifNull: ["$body", ""] }, 0, 220] },
          at: "$createdAt", category: 1 } },
      ] } },
      { $lookup: { from: this.reads.collection.name, let: { notificationKey: "$key" }, pipeline: [
        { $match: { recipientId: actor.id, $expr: { $eq: ["$key", "$$notificationKey"] } } },
        { $project: { _id: 0, readAt: 1 } }, { $limit: 1 },
      ], as: "receipt" } },
      { $set: { readAt: { $ifNull: [{ $arrayElemAt: ["$receipt.readAt", 0] }, null] } } },
      { $unset: "receipt" },
    ];
  }

  private async describe(items: any[], actor: Actor) {
    const owners = await this.studios.find({ ownerId: { $in: items.map(item => item.actorId).filter(Boolean) } })
      .select("_id ownerId name").lean();
    const ownerMap = new Map(owners.map(studio => [studio.ownerId, studio]));
    const normalized = items.map(item => {
      if (item.source === "announcement") return { ...item, type: "announcement" };
      const inferred = item.status === "in_production"
        ? (/hoàn thành/i.test(item.note || "") ? "batch_completed" : "production_started")
        : ({ sent: "quote_sent", bidding: "bid_received", accepted: "quote_accepted", delivered: "order_delivered" } as Record<string, string>)[item.status];
      const eventType = item.eventType || inferred;
      const studio = ownerMap.get(item.actorId);
      const allocation = item.allocations?.find((entry: any) => entry.workshopId === (item.workshopId || String(studio?._id)));
      return { ...item, eventType, workshopName: studio?.name,
        batchId: eventType === "batch_completed" ? (item.batchId || allocation?.batchId) : undefined };
    });
    const batchIds = [...new Set(normalized.map(item => item.batchId).filter(Boolean))];
    const batches = await this.batches.find({ _id: { $in: batchIds } }).select("code quoteId workshopId published").lean();
    const approved = new Set((await this.studios.find({ _id: { $in: batches.map(batch => batch.workshopId) }, approved: true }).select("_id").lean()).map(studio => String(studio._id)));
    const batchMap = new Map(batches.map(batch => [String(batch._id), batch]));
    return normalized.map(item => {
      const common = { key: item.key, createdAt: item.at, readAt: item.readAt };
      if (item.source === "announcement") return { ...common, type: "announcement", title: item.title,
        message: item.message, category: item.category, path: "/tin-tuc" };
      const artisan = actor.role === "artisan";
      const labels: Record<string, string> = {
        quote_sent: artisan ? "Có yêu cầu đặt tranh mới" : "Yêu cầu đã gửi tới xưởng",
        bid_received: artisan ? "Đã gửi chào giá" : "Xưởng gửi chào giá cho bạn",
        quote_accepted: artisan ? "Bạn được chọn thực hiện đơn hàng" : "Đơn hàng đã được chấp nhận",
        production_started: "Xưởng đã bắt đầu sản xuất",
        batch_completed: item.batchId ? "Lô tranh đã hoàn thành · Có trang truy xuất" : "Xưởng đã hoàn thành phần việc",
        order_delivered: "Đơn hàng đã được xác nhận nhận đủ",
      };
      const batch = item.batchId && batchMap.get(item.batchId);
      const linked = batch && String(batch.quoteId) === item.quoteId && item.allocations?.some((entry: any) =>
        entry.batchId === item.batchId && entry.workshopId === batch.workshopId && entry.status === "ready");
      return { ...common, type: item.eventType === "batch_completed" ? "batch" : "order",
        eventType: item.eventType, title: labels[item.eventType] || "Đơn hàng có cập nhật mới",
        message: item.quoteTitle, workshopName: item.workshopName, quoteId: item.quoteId, path: "/quotes/" + item.quoteId,
        ...(batch ? { batchId: String(batch._id), batchCode: batch.code,
          traceAvailable: Boolean(linked && batch.published && approved.has(String(batch.workshopId))) } : {}),
      };
    });
  }
}
