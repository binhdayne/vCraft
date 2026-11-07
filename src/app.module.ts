import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnvironment } from "./config/environment.validation";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BatchesModule } from "./modules/batches/batches.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { HealthModule } from "./modules/health/health.module";
import { MediaModule } from "./modules/media/media.module";
import { NewsModule } from "./modules/news/news.module";
import { QuotesModule } from "./modules/quotes/quotes.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    AuthModule,
    CatalogModule,
    AdminModule,
    QuotesModule,
    BatchesModule,
    NewsModule,
    MediaModule,
    HealthModule,
  ],
})
export class AppModule {}
