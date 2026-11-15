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
import { QuotesService } from "./quotes.service";
@ApiTags("quotes")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("quotes")
export class QuotesController {
  constructor(private readonly service: QuotesService) {}
  @Get()
  list(
    @CurrentUser()
    actor: Actor,
  ) {
    return this.service.list(actor);
  }
  @Get(":id")
  detail(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
  ) {
    return this.service.detail(actor, key);
  }
  @Post()
  create(
    @CurrentUser()
    actor: Actor,
    @Body()
    body: unknown,
  ) {
    return this.service.create(actor, body);
  }
  @Patch(":id")
  edit(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.edit(actor, key, body);
  }
  @Post(":id/send")
  send(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.send(actor, key, body);
  }
  @Post(":id/bids")
  bid(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.bid(actor, key, body);
  }
  @Post(":id/accept")
  accept(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.accept(actor, key, body);
  }
  @Post(":id/production")
  production(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.production(actor, key, body);
  }
  @Post(":id/deliver")
  deliver(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.deliver(actor, key, body);
  }
}
