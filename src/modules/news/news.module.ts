import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
