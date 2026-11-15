import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { QuotesController } from "./quotes.controller";
import { QuotesService } from "./quotes.service";
import { BatchesModule } from "../batches/batches.module";
@Module({
  imports: [DatabaseModule, AuthModule, BatchesModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
