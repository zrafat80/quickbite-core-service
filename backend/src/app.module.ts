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
import { SuccessInterceptor } from './lib/interceptors/success.interceptor'; // <-- Import your file (adjust path if needed)
// Controllers & Services

// Common & Core
import { DatabaseModule } from './lib/database.module';
import { CorrelationMiddleware } from './lib/middleware/correlation.middleware';
import { RequestContextService } from './lib/context/request-context.service';
import { HttpExceptionFilter } from './lib/filters/http-exception.filter';

// External Packages
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import appConfig from './lib/config/app.config';
import { HealthModule } from './app/health/health.module';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { AddressModule } from './app/address/address.module';
import { RestaurantModule } from './app/restaurant/restaurant.module';
import { BranchModule } from './app/branch/branch.module';
import { ProductModule } from './app/product/product.module';
import { RbacModule } from './app/rbac/rbac.module';
import { EmailModule } from './lib/email/email.module';
import { EventsModule } from './lib/events/events.module';
import { LoggingModule } from './lib/logging/logging.module';
import { LoggingInterceptor } from './lib/logging/logging.interceptor';
import { MediaModule } from './app/media/media.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [
          createKeyv(
            `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`,
          ),
        ],
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
    MediaModule,

    EmailModule,
    EventsModule,
    LoggingModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
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
