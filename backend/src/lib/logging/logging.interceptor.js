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
exports.LoggingInterceptor = void 0;
var common_1 = require("@nestjs/common");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
// 1. Tell TypeScript that our requests might have a 'user' object attached
var LoggingInterceptor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LoggingInterceptor = _classThis = /** @class */ (function () {
        function LoggingInterceptor_1(logger, requestContext) {
            this.logger = logger;
            this.requestContext = requestContext;
        }
        LoggingInterceptor_1.prototype.intercept = function (context, next) {
            var _this = this;
            var _a;
            var ctx = context.switchToHttp();
            // 2. Use our custom interface here instead of the standard Request
            var startTime = Date.now();
            var correlationId = this.requestContext.getCorrelationId();
            var request = context.switchToHttp().getRequest();
            // TypeScript will now perfectly autocomplete this for you without errors:
            var userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId;
            var logData = {
                packetType: 'request',
                correlationId: correlationId,
                // 3. No more red squiggly lines! TypeScript knows request.user is safe.
                userId: userId,
                ipAddress: request.ip || 'unknown',
                userAgent: request.headers['user-agent'] || 'unknown',
                action: "".concat(context.getClass().name, ".").concat(context.getHandler().name),
                endpoint: request.originalUrl,
                method: request.method,
            };
            return next.handle().pipe((0, rxjs_1.tap)(function () {
                logData.packetType = 'response';
                logData.responseTime = Date.now() - startTime;
                _this.logger.log(logData);
            }), (0, operators_1.catchError)(function (error) {
                logData.packetType = 'response';
                logData.responseTime = Date.now() - startTime;
                logData.trace = error.stack;
                logData.errorMessage = error.message;
                _this.logger.error(logData);
                throw error;
            }));
        };
        return LoggingInterceptor_1;
    }());
    __setFunctionName(_classThis, "LoggingInterceptor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LoggingInterceptor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LoggingInterceptor = _classThis;
}();
exports.LoggingInterceptor = LoggingInterceptor;
