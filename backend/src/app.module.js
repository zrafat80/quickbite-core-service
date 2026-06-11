"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var schedule_1 = require("@nestjs/schedule");
var config_1 = require("@nestjs/config");
var mailer_1 = require("@nestjs-modules/mailer");
var core_1 = require("@nestjs/core"); // <-- Add APP_INTERCEPTOR
var success_interceptor_1 = require("./lib/interceptors/success.interceptor"); // <-- Import your file (adjust path if needed)
// Controllers & Services
// Common & Core
var database_module_1 = require("./lib/database.module");
var correlation_middleware_1 = require("./lib/middleware/correlation.middleware");
var request_context_service_1 = require("./lib/context/request-context.service");
var http_exception_filter_1 = require("./lib/filters/http-exception.filter");
// External Packages
var terminus_1 = require("@nestjs/terminus");
var cache_manager_1 = require("@nestjs/cache-manager");
var redis_1 = require("@keyv/redis");
var app_config_1 = require("./lib/config/app.config");
var health_module_1 = require("./app/health/health.module");
var auth_module_1 = require("./app/auth/auth.module");
var user_module_1 = require("./app/user/user.module");
var address_module_1 = require("./app/address/address.module");
var restaurant_module_1 = require("./app/restaurant/restaurant.module");
var branch_module_1 = require("./app/branch/branch.module");
var product_module_1 = require("./app/product/product.module");
var rbac_module_1 = require("./app/rbac/rbac.module");
var email_module_1 = require("./lib/email/email.module");
var events_module_1 = require("./lib/events/events.module");
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                cache_manager_1.CacheModule.registerAsync({
                    isGlobal: true,
                    useFactory: function () { return ({
                        stores: [(0, redis_1.createKeyv)('redis://127.0.0.1:6379')],
                        ttl: 3600000,
                    }); },
                }),
                schedule_1.ScheduleModule.forRoot(),
                config_1.ConfigModule.forRoot({ isGlobal: true, load: [app_config_1.default] }),
                mailer_1.MailerModule.forRoot({
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
                database_module_1.DatabaseModule,
                terminus_1.TerminusModule,
                health_module_1.HealthModule,
                auth_module_1.AuthModule,
                user_module_1.UserModule,
                address_module_1.AddressModule,
                restaurant_module_1.RestaurantModule,
                branch_module_1.BranchModule,
                product_module_1.ProductModule,
                rbac_module_1.RbacModule,
                email_module_1.EmailModule,
                events_module_1.EventsModule,
                // Add your new domain modules (Users, Orders, etc.) here as you build them
            ],
            controllers: [],
            providers: [
                request_context_service_1.RequestContextService, // Provides the AsyncLocalStorage context
                {
                    provide: core_1.APP_FILTER,
                    useClass: http_exception_filter_1.HttpExceptionFilter,
                },
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: success_interceptor_1.SuccessInterceptor,
                },
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        AppModule_1.prototype.configure = function (consumer) {
            consumer
                .apply(correlation_middleware_1.CorrelationMiddleware)
                .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
        };
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
