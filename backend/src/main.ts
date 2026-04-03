import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseErrorFilter } from './common/filters/database-error.filter';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS Setup
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
    ],
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
