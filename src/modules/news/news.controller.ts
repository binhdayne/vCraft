import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { NewsService } from "./news.service";
@ApiTags("news")
@Controller("news")
export class NewsController {
  constructor(private readonly service: NewsService) {}
  @Get()
  list() {
    return this.service.list();
  }
  @Get("manage")
  @UseGuards(AuthGuard)
  all(
    @CurrentUser()
    actor: Actor,
  ) {
    return this.service.all(actor);
  }
  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser()
    actor: Actor,
    @Body()
    body: unknown,
  ) {
    return this.service.create(actor, body);
  }
  @Patch(":id")
  @UseGuards(AuthGuard)
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
  @Delete(":id")
  @UseGuards(AuthGuard)
  remove(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
  ) {
    return this.service.remove(actor, key);
  }
}
