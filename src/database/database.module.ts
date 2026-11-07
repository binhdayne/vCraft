import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { databaseModels } from "./models";
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("MONGODB_URI"),
        serverSelectionTimeoutMS: 5000,
        retryAttempts: 2,
      }),
    }),
    MongooseModule.forFeature(databaseModels),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
