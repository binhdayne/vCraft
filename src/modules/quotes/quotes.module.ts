import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { QuotesController } from "./quotes.controller";
import { QuotesService } from "./quotes.service";
import { BatchesModule } from "../batches/batches.module";
import { MailModule } from "../mail/mail.module";
@Module({
  imports: [DatabaseModule, AuthModule, BatchesModule, MailModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
