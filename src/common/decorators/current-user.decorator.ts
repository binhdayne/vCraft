import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Actor } from "../../modules/auth/interfaces/actor.interface";
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Actor =>
    ctx.switchToHttp().getRequest().user,
);
