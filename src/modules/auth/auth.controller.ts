import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { AuthService } from "./auth.service";
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post("register")
  register(
    @Body()
    body: unknown,
  ) {
    return this.service.register(body);
  }
  @Post("login")
  login(
    @Body()
    body: unknown,
  ) {
    return this.service.login(body);
  }
  @Get("me")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  me(
    @CurrentUser()
    actor: Actor,
  ) {
    return actor;
  }
}
