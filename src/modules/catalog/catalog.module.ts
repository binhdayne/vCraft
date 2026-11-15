import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { BatchesModule } from "../batches/batches.module";
@Module({
  imports: [DatabaseModule, AuthModule, BatchesModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
