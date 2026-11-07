import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { CatalogService } from "./catalog.service";
@ApiTags("catalog")
@Controller()
export class CatalogController {
  constructor(private readonly service: CatalogService) {}
  @Get("workshops")
  workshops() {
    return this.service.workshops();
  }
  @Get("workshops/:id")
  workshop(
    @Param("id")
    key: string,
  ) {
    return this.service.workshop(key);
  }
  @Get("products")
  products(
    @Query()
    query: unknown,
  ) {
    return this.service.products(query);
  }
  @Get("products/:id")
  product(
    @Param("id")
    key: string,
  ) {
    return this.service.product(key);
  }
  @Get("studio")
  @UseGuards(AuthGuard)
  studio(
    @CurrentUser()
    actor: Actor,
  ) {
    return this.service.studio(actor);
  }
  @Patch("studio")
  @UseGuards(AuthGuard)
  updateStudio(
    @CurrentUser()
    actor: Actor,
    @Body()
    body: unknown,
  ) {
    return this.service.updateStudio(actor, body);
  }
  @Get("studio/products")
  @UseGuards(AuthGuard)
  ownProducts(
    @CurrentUser()
    actor: Actor,
  ) {
    return this.service.ownProducts(actor);
  }
  @Post("studio/products")
  @UseGuards(AuthGuard)
  createProduct(
    @CurrentUser()
    actor: Actor,
    @Body()
    body: unknown,
  ) {
    return this.service.createProduct(actor, body);
  }
  @Patch("studio/products/:id")
  @UseGuards(AuthGuard)
  editProduct(
    @CurrentUser()
    actor: Actor,
    @Param("id")
    key: string,
    @Body()
    body: unknown,
  ) {
    return this.service.editProduct(actor, key, body);
  }
}
