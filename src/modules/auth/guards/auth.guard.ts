import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel("Account")
    private readonly users: Model<Record<string, any>>,
  ) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) throw new Error();
      const payload = await this.jwt.verifyAsync(header.slice(7));
      const user = await this.users
        .findOne({ _id: payload.sub, active: true })
        .lean();
      if (!user) throw new Error();
      req.user = {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
      };
      return true;
    } catch {
      throw new UnauthorizedException("Vui lòng đăng nhập lại");
    }
  }
}
