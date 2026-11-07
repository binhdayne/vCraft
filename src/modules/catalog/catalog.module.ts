import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
