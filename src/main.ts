import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { join } from "node:path";
import "reflect-metadata";
import { AppModule } from "./app.module";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  app.use(
    helmet({
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://tile.openstreetmap.org",
            "https://*.tile.openstreetmap.org",
            "https://*.tile.openstreetmap.fr",
          ],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:"],
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  app.enableCors({
    origin: config.getOrThrow<string>("CORS_ORIGIN").split(","),
  });
  app.use(
    "/api/v1/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 60,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks();
  app.useStaticAssets(join(process.cwd(), "public", "art"), {
    prefix: "/art/",
  });
  app.useStaticAssets(join(process.cwd(), ".local", "uploads"), {
    prefix: "/uploads/",
  });
  app.useStaticAssets(join(process.cwd(), "frontend", "dist"));
  if (config.get("NODE_ENV") !== "production") {
    const doc = new DocumentBuilder()
      .setTitle("vCraft · Đông Hồ API")
      .setDescription(
        "Artisan studios, provenance, quotations and village administration.",
      )
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();
    SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, doc), {
      customJs: [],
      customCss: "",
    });
  }
  await app.listen(
    config.getOrThrow<number>("PORT"),
    config.getOrThrow<string>("HOST"),
  );
}
bootstrap().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
