import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { AdminService } from "./admin.service";
@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly service: AdminService) {}
  @Get("users")
  users(
    @CurrentUser()
    actor: Actor,
  ) {
    return this.service.users(actor);
  }
  @Get("workshops")
  workshops(
    @CurrentUser()
    actor: Actor,
  ) {
    return this.service.workshops(actor);
  }
  @Post("artisans")
  create(
    @CurrentUser()
    actor: Actor,
    @Body()
    body: unknown,
  ) {
    return this.service.create(actor, body);
  }
  @Patch("workshops/:id/approval")
  approval(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.approval(actor, key, body);
  }
  @Patch("users/:id")
  account(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.account(actor, key, body);
  }
}
