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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { CartService } from "./cart.service";

@ApiTags("cart")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  getCart(@CurrentUser() actor: Actor) {
    return this.service.getCart(actor);
  }

  @Post("items")
  addItem(@CurrentUser() actor: Actor, @Body() body: unknown) {
    return this.service.addItem(actor, body);
  }

  @Patch("items/:productId")
  updateItem(
    @CurrentUser() actor: Actor,
    @Param("productId") productId: string,
    @Body() body: unknown,
  ) {
    return this.service.updateItem(actor, productId, body);
  }

  @Delete("items/:productId")
  removeItem(
    @CurrentUser() actor: Actor,
    @Param("productId") productId: string,
  ) {
    return this.service.removeItem(actor, productId);
  }

  @Post("clear")
  clear(@CurrentUser() actor: Actor, @Body() body: unknown) {
    return this.service.clear(actor, body);
  }
}
