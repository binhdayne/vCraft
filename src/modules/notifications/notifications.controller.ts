import { Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  list(@CurrentUser() actor: Actor, @Query() query: unknown) {
    return this.service.list(actor, query);
  }

  @Patch("read-all")
  readAll(@CurrentUser() actor: Actor) {
    return this.service.readAll(actor);
  }

  @Patch(":key/read")
  read(@CurrentUser() actor: Actor, @Param("key") key: string) {
    return this.service.read(actor, key);
  }
}
