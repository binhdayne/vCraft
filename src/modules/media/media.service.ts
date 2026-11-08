import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { role } from "../../common/authorization";
import { Actor } from "../auth/interfaces/actor.interface";
@Injectable()
export class MediaService {
  constructor(
    @InjectModel("MediaAsset")
    private readonly assetsModel: Model<Record<string, any>>,
  ) {}

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
    const created: { path: string; url: string }[] = [];
    try {
      for (const buffer of converted) {
        const name = randomUUID() + ".webp";
        const filePath = join(dir, name);
        await writeFile(filePath, buffer);
        created.push({ path: filePath, url: "/uploads/" + name });
      }
      await this.assetsModel.insertMany(
        created.map(({ url }) => ({ url, ownerId: actor.id })),
      );
      return { urls: created.map(({ url }) => url) };
    } catch (error) {
      await Promise.allSettled([
        this.assetsModel.deleteMany({ ownerId: actor.id, url: { $in: created.map(({ url }) => url) } }).exec(),
        ...created.map(({ path }) => unlink(path)),
      ]);
      throw error;
    }
  }
}
