import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Database } from './database';
import { AuthController, AuthGuard } from './auth';
import { CatalogController, AdminController } from './catalog';
import { QuotesController } from './quotes';
import { BatchesController, NewsController, MediaController } from './content';
@Module({imports:[JwtModule.registerAsync({inject:[ConfigService],useFactory:(config:ConfigService)=>({secret:config.getOrThrow<string>('JWT_SECRET'),signOptions:{expiresIn:'8h',issuer:'vcraft',audience:'vcraft-web'},verifyOptions:{issuer:'vcraft',audience:'vcraft-web'}})})],providers:[Database,AuthGuard],controllers:[AuthController,CatalogController,AdminController,QuotesController,BatchesController,NewsController,MediaController]})
export class DomainModule {}
