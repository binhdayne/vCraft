import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { BatchesController } from "./batches.controller";
import { BatchesService } from "./batches.service";
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
