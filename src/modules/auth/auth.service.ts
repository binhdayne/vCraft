import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare, hash } from "bcryptjs";
import { Model } from "mongoose";
import { parse } from "../../common/validation";
import {
  changePasswordSchema,
  loginInputSchema,
  registerInputSchema,
  updateProfileSchema,
} from "./dto/auth.dto";
@Injectable()
export class AuthService {
  constructor(
    @InjectModel("Account")
    private readonly usersModel: Model<Record<string, any>>,
    private readonly jwt: JwtService,
  ) {}
  async register(body: unknown) {
    const data = parse(registerInputSchema, body);
    try {
      const user = await this.usersModel.create({
        name: data.name,
        email: data.email,
        passwordHash: await hash(data.password, 12),
        role: "buyer",
      });
      return this.session(user);
    } catch (e: any) {
      if (e.code === 11000)
        throw new ConflictException("Email đã được đăng ký");
      throw e;
    }
  }
  async login(body: unknown) {
    const data = parse(loginInputSchema, body);
    const user = await this.usersModel
      .findOne({ email: data.email, active: true })
      .select("+passwordHash");
    if (!user || !(await compare(data.password, user.passwordHash)))
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    return this.session(user);
  }
  async getProfile(actorId: string) {
    const user = await this.usersModel.findById(actorId).lean();
    if (!user || !user.active)
      throw new UnauthorizedException("Tài khoản không tồn tại hoặc đã bị khóa");
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
      active: user.active,
      createdAt: user.createdAt,
    };
  }
  async updateProfile(actorId: string, body: unknown) {
    const data = parse(updateProfileSchema, body);
    const user = await this.usersModel
      .findByIdAndUpdate(actorId, { $set: data }, { new: true })
      .lean();
    if (!user) throw new NotFoundException("Không tìm thấy tài khoản");
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
      active: user.active,
      createdAt: user.createdAt,
    };
  }
  async changePassword(actorId: string, body: unknown) {
    const data = parse(changePasswordSchema, body);
    const user = await this.usersModel.findById(actorId).select("+passwordHash");
    if (!user) throw new NotFoundException("Không tìm thấy tài khoản");
    const matches = await compare(data.currentPassword, user.passwordHash);
    if (!matches)
      throw new UnauthorizedException("Mật khẩu hiện tại không chính xác");
    user.passwordHash = await hash(data.newPassword, 12);
    await user.save();
    return { message: "Đổi mật khẩu thành công" };
  }
  private async session(user: any) {
    const actor = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      createdAt: user.createdAt,
    };
    return { user: actor, token: await this.jwt.signAsync({ sub: actor.id }) };
  }
}
