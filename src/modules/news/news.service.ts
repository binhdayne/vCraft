import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { role } from "../../common/authorization";
import { id, parse } from "../../common/validation";
import { Actor } from "../auth/interfaces/actor.interface";
import { newsInput } from "../news/dto/news.dto";
@Injectable()
export class NewsService {
  constructor(
    @InjectModel("Bulletin")
    private readonly newsModel: Model<Record<string, any>>,
  ) {}
  list() {
    return this.newsModel
      .find({ published: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }
  all(actor: Actor) {
    role(actor, "admin");
    return this.newsModel.find().sort({ createdAt: -1 }).lean();
  }
  create(actor: Actor, body: unknown) {
    role(actor, "admin");
    return this.newsModel.create({
      ...parse(newsInput, body),
      authorId: actor.id,
    });
  }
  async edit(actor: Actor, key: string, body: unknown) {
    role(actor, "admin");
    const result = await this.newsModel.findByIdAndUpdate(
      parse(id, key),
      { $set: parse(newsInput, body) },
      { new: true },
    );
    if (!result) throw new NotFoundException();
    return result;
  }
  async remove(actor: Actor, key: string) {
    role(actor, "admin");
    const r = await this.newsModel.findByIdAndDelete(parse(id, key));
    if (!r) throw new NotFoundException();
    return { deleted: true };
  }
}
