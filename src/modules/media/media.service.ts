import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { role } from "../../common/authorization";
import { Actor } from "../auth/interfaces/actor.interface";
@Injectable()
export class MediaService {
  async upload(actor: Actor, files: Express.Multer.File[]) {
    role(actor, "artisan", "admin");
    if (!files?.length) throw new BadRequestException("Chọn ít nhất một ảnh");
    const converted: Buffer[] = [];
    for (const file of files) {
      try {
        const input = sharp(file.buffer, { limitInputPixels: 40000000 });
        const meta = await input.metadata();
        if (
          !["jpeg", "png", "webp"].includes(meta.format || "") ||
          (meta.pages && meta.pages > 1)
        )
          throw new Error();
        converted.push(
          await input
            .rotate()
            .resize({
              width: 1600,
              height: 1600,
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp({ quality: 82 })
            .toBuffer(),
        );
      } catch {
        throw new BadRequestException(
          "Chỉ nhận ảnh JPEG, PNG, WebP tĩnh, tối đa 40 megapixel",
        );
      }
    }
    const dir = join(process.cwd(), ".local", "uploads");
    await mkdir(dir, { recursive: true });
    const urls = [];
    for (const buffer of converted) {
      const name = randomUUID() + ".webp";
      await writeFile(join(dir, name), buffer);
      urls.push("/uploads/" + name);
    }
    return { urls };
  }
}
