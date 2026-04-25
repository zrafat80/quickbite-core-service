import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseErrorFilter } from './lib/filters/database-error.filter';
import { SuccessInterceptor } from './lib/interceptors/success.interceptor';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const origin = configService.get<string>('corsOrigins');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Allow Swagger UI to load its scripts and styles
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        },
      },
    }),
  );
  // ✅ CORS Setup
  app.enableCors({
    origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // ✅ Swagger Setup (Cleaned up: No Auth yet)
  const config = new DocumentBuilder()
    .setTitle('Food Order Core Service API')
    .setDescription('The core service API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/swagger', app, document);
  app.use(cookieParser());
  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ✅ Filters
  app.useGlobalFilters(new DatabaseErrorFilter());

  // ✅ Interceptors
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.enableShutdownHooks();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Core Service backend listening on port ${port}`);
}

bootstrap();
