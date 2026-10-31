import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.use(helmet());
  app.enableCors({ origin: config.getOrThrow<string>('CORS_ORIGIN').split(',') });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();
  if (config.get('NODE_ENV') !== 'production') {
    const doc = new DocumentBuilder().setTitle('vCraft API').setDescription('Backend starter: health and public catalog. Business workflows are planned in docs/ROADMAP.md.').setVersion('0.1.0').build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
  }
  await app.listen(config.getOrThrow<number>('PORT'), config.getOrThrow<string>('HOST'));
}
bootstrap().catch(() => { console.error('Startup failed. Check configuration and MongoDB availability.'); process.exit(1); });
