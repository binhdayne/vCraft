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
  approvalInputSchema,
  createInputSchema,
} from "./dto/admin.dto";
@Injectable()
export class AdminService {
  constructor(
    @InjectModel("Account")
    private readonly usersModel: Model<Record<string, any>>,
    @InjectModel("Studio")
    private readonly workshopsModel: Model<Record<string, any>>,
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
}
