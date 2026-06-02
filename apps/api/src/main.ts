import 'reflect-metadata';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { setupSwagger } from './bootstrap/swagger';
import { AppConfigService } from './config/config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Route all framework logs through pino (structured, audit-safe).
  app.useLogger(app.get(Logger));

  const config = app.get(AppConfigService);

  // --- Security middleware ---
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({ origin: [config.core.webUrl], credentials: true });

  // --- API routing: /api/v1/... ---
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // --- Global validation ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Exception filter + logging interceptor are registered as DI providers
  // (see AppModule) so they can inject the pino logger.

  app.enableShutdownHooks();

  setupSwagger(app);

  await app.listen(config.core.port);

  app
    .get(Logger)
    .log(`Wayly API listening on ${config.core.apiUrl} (docs: ${config.core.apiUrl}/docs)`);
}

void bootstrap();
