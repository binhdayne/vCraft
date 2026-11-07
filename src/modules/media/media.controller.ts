import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Actor } from "../auth/interfaces/actor.interface";
import { MediaService } from "./media.service";
@ApiTags("media")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}
  @Post()
  @UseInterceptors(
    FilesInterceptor("files", 8, {
      limits: { fileSize: 8 * 1024 * 1024, files: 8 },
    }),
  )
  upload(
    @CurrentUser()
    actor: Actor,
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    return this.service.upload(actor, files);
  }
}
