import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { role } from "../../common/authorization";
import { id, parse } from "../../common/validation";
import { Actor } from "../auth/interfaces/actor.interface";
import {
  addToCartInputSchema,
  clearCartInputSchema,
  updateCartItemInputSchema,
} from "./dto/cart.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectModel("Cart")
    private readonly cartModel: Model<Record<string, any>>,
    @InjectModel("Artwork")
    private readonly artworkModel: Model<Record<string, any>>,
    @InjectModel("Studio")
    private readonly workshopModel: Model<Record<string, any>>,
  ) {}

  async getCart(actor: Actor) {
    role(actor, "buyer");
    let cart = await this.cartModel.findOne({ buyerId: actor.id });
    if (!cart) {
      cart = await this.cartModel.create({ buyerId: actor.id, items: [] });
    }

    const productIds = (cart.items || []).map((i: any) => i.productId);
    const artworks = await this.artworkModel
      .find({ _id: { $in: productIds } })
      .lean();
    const artworkMap = new Map(artworks.map((a: any) => [String(a._id), a]));

    const workshopIds = artworks
      .map((a: any) => a.workshopId)
      .filter((wId: any) => Boolean(wId));
    const workshops = await this.workshopModel
      .find({ _id: { $in: workshopIds } })
      .lean();
    const workshopMap = new Map(workshops.map((w: any) => [String(w._id), w]));

    const populatedItems: any[] = [];
    let hasStale = false;

    for (const item of cart.items || []) {
      const art = artworkMap.get(String(item.productId));
      if (!art) {
        hasStale = true;
        continue;
      }
      const ws = art.workshopId
        ? workshopMap.get(String(art.workshopId))
        : null;

      populatedItems.push({
        _id: item._id,
        productId: String(item.productId),
        artworkName: art.name,
        image:
          Array.isArray(art.images) && art.images.length > 0
            ? art.images[0]
            : "",
        category: art.category,
        dimensions: art.dimensions || "26 × 37 cm",
        type: art.type || "general",
        price: art.price ?? null,
        workshopId: art.workshopId ? String(art.workshopId) : null,
        workshopName: ws?.name || "",
        quantity: item.quantity,
        note: item.note || "",
        selected: item.selected !== false,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    if (hasStale) {
      cart.items = cart.items.filter((i: any) =>
        artworkMap.has(String(i.productId)),
      );
      await cart.save();
    }

    const totalItems = populatedItems.length;
    const totalQuantity = populatedItems.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    const selectedList = populatedItems.filter((i) => i.selected);
    const selectedItems = selectedList.length;
    const selectedQuantity = selectedList.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    const selectedCustomList = selectedList.filter((i) => i.type === "custom");
    const hasCustomArtwork = selectedCustomList.length > 0;
    const customWorkshopIds = Array.from(
      new Set(
        selectedCustomList
          .map((i) => i.workshopId)
          .filter((wId): wId is string => Boolean(wId)),
      ),
    );

    return {
      _id: cart._id,
      buyerId: cart.buyerId,
      items: populatedItems,
      totalItems,
      totalQuantity,
      selectedItems,
      selectedQuantity,
      hasCustomArtwork,
      targetWorkshopId:
        customWorkshopIds.length === 1 ? customWorkshopIds[0] : null,
      customWorkshopCount: customWorkshopIds.length,
      updatedAt: cart.updatedAt,
    };
  }

  async addItem(actor: Actor, body: unknown) {
    role(actor, "buyer");
    const dto = parse(addToCartInputSchema, body);

    const artwork = await this.artworkModel.findById(dto.productId).lean();
    if (!artwork) {
      throw new NotFoundException("Tác phẩm không tồn tại trên hệ thống");
    }

    let cart = await this.cartModel.findOne({ buyerId: actor.id });
    if (!cart) {
      cart = new this.cartModel({ buyerId: actor.id, items: [] });
    }

    const existingItem = (cart.items || []).find(
      (i: any) => String(i.productId) === dto.productId,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      if (dto.note) {
        existingItem.note = dto.note;
      }
      existingItem.selected = true;
    } else {
      cart.items.push({
        productId: dto.productId,
        quantity: dto.quantity,
        note: dto.note || "",
        selected: true,
      });
    }

    await cart.save();
    return this.getCart(actor);
  }

  async updateItem(actor: Actor, productId: string, body: unknown) {
    role(actor, "buyer");
    parse(id, productId);
    const dto = parse(updateCartItemInputSchema, body);

    const cart = await this.cartModel.findOne({ buyerId: actor.id });
    if (!cart) {
      throw new NotFoundException("Giỏ hàng chưa được khởi tạo");
    }

    const item = (cart.items || []).find(
      (i: any) => String(i.productId) === productId,
    );
    if (!item) {
      throw new NotFoundException("Tác phẩm không có trong giỏ hàng");
    }

    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.note !== undefined) item.note = dto.note;
    if (dto.selected !== undefined) item.selected = dto.selected;

    await cart.save();
    return this.getCart(actor);
  }

  async removeItem(actor: Actor, productId: string) {
    role(actor, "buyer");
    parse(id, productId);

    const cart = await this.cartModel.findOne({ buyerId: actor.id });
    if (!cart) {
      throw new NotFoundException("Giỏ hàng chưa được khởi tạo");
    }

    cart.items = (cart.items || []).filter(
      (i: any) => String(i.productId) !== productId,
    );
    await cart.save();
    return this.getCart(actor);
  }

  async clear(actor: Actor, body: unknown) {
    role(actor, "buyer");
    const dto = parse(clearCartInputSchema, body || {});

    const cart = await this.cartModel.findOne({ buyerId: actor.id });
    if (!cart) {
      return this.getCart(actor);
    }

    if (dto.onlySelected) {
      cart.items = (cart.items || []).filter((i: any) => !i.selected);
    } else {
      cart.items = [];
    }

    await cart.save();
    return this.getCart(actor);
  }
}
