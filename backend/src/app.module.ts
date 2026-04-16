import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'; // <-- Add APP_INTERCEPTOR
import { SuccessInterceptor } from './common/interceptors/success.interceptor'; // <-- Import your file (adjust path if needed)
// Controllers & Services

// Common & Core
import { DatabaseModule } from './common/database.module';
import { CorrelationMiddleware } from './common/middleware/correlation.middleware';
import { RequestContextService } from './common/context/request-context.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// External Packages
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import appConfig from './common/config/app.config';
import { HealthModule } from './app/health/health.module';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { AddressModule } from './app/address/address.module';
import { RestaurantModule } from './app/restaurant/restaurant.module';
import { BranchModule } from './app/branch/branch.module';
import { ProductModule } from './app/product/product.module';
import { RbacModule } from './app/rbac/rbac.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [createKeyv('redis://127.0.0.1:6379')],
        ttl: 3600000,
      }),
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_APP_PASSWORD,
        },
      },
      defaults: {
        from: '"Food Order App" <zrafat80@gmail.com>',
      },
    }),

    // Core Modules
    DatabaseModule,
    TerminusModule,
    HealthModule,
    AuthModule,
    UserModule,
    AddressModule,
    RestaurantModule,
    BranchModule,
    ProductModule,
    RbacModule,
    // Add your new domain modules (Users, Orders, etc.) here as you build them
  ],
  controllers: [],
  providers: [
    RequestContextService, // Provides the AsyncLocalStorage context
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
