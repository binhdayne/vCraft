import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare, hash } from "bcryptjs";
import { Model } from "mongoose";
import { parse } from "../../common/validation";
import { loginInputSchema, registerInputSchema } from "./dto/auth.dto";
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
  private async session(user: any) {
    const actor = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return { user: actor, token: await this.jwt.signAsync({ sub: actor.id }) };
  }
}
