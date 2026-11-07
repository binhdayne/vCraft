import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { BatchesService } from "./batches.service";
@ApiTags("batches")
@Controller()
export class BatchesController {
  constructor(private readonly service: BatchesService) {}
  @Get("trace/:id")
  trace(
    @Param("id")
    key: string,
  ) {
    return this.service.trace(key);
  }
  @Get("trace/:id/qr")
  async qr(
    @Param("id")
    key: string,
    @Res()
    res: Response,
  ) {
    const buffer = await this.service.qr(key);
    res.type("png").send(buffer);
  }
  @Get("studio/batches")
  @UseGuards(AuthGuard)
  list(
    @CurrentUser()
    actor: Actor,
  ) {
    return this.service.list(actor);
  }
  @Post("studio/batches")
  @UseGuards(AuthGuard)
  create(
    @CurrentUser()
    actor: Actor,
    @Body()
    body: unknown,
  ) {
    return this.service.create(actor, body);
  }
  @Patch("studio/batches/:id")
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
  @Post("studio/batches/:id/events")
  @UseGuards(AuthGuard)
  event(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.event(actor, key, body);
  }
}
