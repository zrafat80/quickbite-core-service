"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedCacheInterceptor = void 0;
var common_1 = require("@nestjs/common");
var cache_manager_1 = require("@nestjs/cache-manager");
var rxjs_1 = require("rxjs");
var UnifiedCacheInterceptor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = cache_manager_1.CacheInterceptor;
    var UnifiedCacheInterceptor = _classThis = /** @class */ (function (_super) {
        __extends(UnifiedCacheInterceptor_1, _super);
        function UnifiedCacheInterceptor_1(cacheManager, reflector) {
            var _this = _super.call(this, cacheManager, reflector) || this;
            _this.reflector = reflector;
            // 🌟 THE SHIELD: This Map tracks active requests that are currently talking to Postgres
            _this.inFlightRequests = new Map();
            return _this;
        }
        UnifiedCacheInterceptor_1.prototype.intercept = function (context, next) {
            return __awaiter(this, void 0, void 0, function () {
                var request, response, scope, key, lat, lng, cachedValue, activeStream, customTtl_1, dbStream, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            request = context.switchToHttp().getRequest();
                            response = context.switchToHttp().getResponse();
                            if (request.method !== 'GET')
                                return [2 /*return*/, next.handle()];
                            scope = this.reflector.get('cache_scope', context.getHandler()) || 'PUBLIC';
                            key = "".concat(request.method, ":").concat(request.url);
                            if (request.url.includes('/branches/nearby')) {
                                lat = parseFloat(request.query.lat).toFixed(2);
                                lng = parseFloat(request.query.lng).toFixed(2);
                                key = "GET:/branches/nearby:lat".concat(lat, ":lng").concat(lng);
                            }
                            if (scope === 'PRIVATE') {
                                if (!request.user || !request.user.userId)
                                    return [2 /*return*/, next.handle()];
                                key = "".concat(key, ":").concat(request.user.userId);
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.cacheManager.get(key)];
                        case 2:
                            cachedValue = _b.sent();
                            if (cachedValue) {
                                response.setHeader('X-Cache', "HIT (".concat(scope, ")"));
                                return [2 /*return*/, (0, rxjs_1.of)(cachedValue)];
                            }
                            activeStream = this.inFlightRequests.get(key);
                            // 2. STAMPEDE CHECK: Is the stream actively running?
                            if (activeStream) {
                                response.setHeader('X-Cache', "DEDUPLICATED (".concat(scope, ")"));
                                return [2 /*return*/, activeStream]; // TypeScript now guarantees this is an Observable, not undefined!
                            }
                            response.setHeader('X-Cache', "MISS (".concat(scope, ")"));
                            customTtl_1 = this.reflector.get(cache_manager_1.CACHE_TTL_METADATA, context.getHandler());
                            dbStream = next.handle().pipe((0, rxjs_1.tap)(function (data) {
                                // 🌟 FIX 2: Explicitly define (err: any) to satisfy noImplicitAny!
                                _this.cacheManager
                                    .set(key, data, customTtl_1)
                                    .catch(function (err) { return console.error('Redis Save Error:', err); });
                            }), (0, rxjs_1.finalize)(function () { return _this.inFlightRequests.delete(key); }), (0, rxjs_1.share)());
                            this.inFlightRequests.set(key, dbStream);
                            return [2 /*return*/, dbStream];
                        case 3:
                            _a = _b.sent();
                            return [2 /*return*/, next.handle()];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return UnifiedCacheInterceptor_1;
    }(_classSuper));
    __setFunctionName(_classThis, "UnifiedCacheInterceptor");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UnifiedCacheInterceptor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UnifiedCacheInterceptor = _classThis;
}();
exports.UnifiedCacheInterceptor = UnifiedCacheInterceptor;
