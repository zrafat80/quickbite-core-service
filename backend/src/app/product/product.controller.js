"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.ProductController = void 0;
var openapi = require("@nestjs/swagger");
var common_1 = require("@nestjs/common");
var jwtGuard_1 = require("../../lib/middleware/guards/jwtGuard");
var branch_access_guard_1 = require("../../lib/middleware/guards/branch-access.guard"); // 🌟 Imported the Guard
var product_constants_1 = require("./product.constants");
var cache_interceptor_1 = require("../../../../../../../../../../../src/lib/cache/cache.interceptor");
var time_utils_1 = require("../../../../../../../../../../../src/pkg/utils/time.utils");
var cache_manager_1 = require("@nestjs/cache-manager");
var idempotency_interceptor_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.interceptor");
var idempotency_decorator_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.decorator");
var ProductController = function () {
    var _classDecorators = [(0, common_1.Controller)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findCategories_decorators;
    var _findByBranch_decorators;
    var _findByRestaurant_decorators;
    var _findById_decorators;
    var _createProduct_decorators;
    var _updateProduct_decorators;
    var ProductController = _classThis = /** @class */ (function () {
        function ProductController_1(productService) {
            this.productService = (__runInitializers(this, _instanceExtraInitializers), productService);
        }
        ProductController_1.prototype.findCategories = function (restaurantId) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productService.findCategories(restaurantId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { data: data }];
                    }
                });
            });
        };
        ProductController_1.prototype.findByBranch = function (branchId, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productService.findByBranch(branchId, queryParams)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            });
        };
        ProductController_1.prototype.findByRestaurant = function (restaurantId, req, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productService.findByRestaurant(restaurantId, req.user.userId, req.user.role, queryParams)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            });
        };
        ProductController_1.prototype.findById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productService.findById(id)];
                        case 1:
                            product = _a.sent();
                            return [2 /*return*/, product];
                    }
                });
            });
        };
        ProductController_1.prototype.createProduct = function (restaurantId, body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productService.create(restaurantId, req.user.userId, req.user.role, body)];
                        case 1:
                            product = _a.sent();
                            return [2 /*return*/, product];
                    }
                });
            });
        };
        // 🌟 FIX: Added BranchAccessGuard!
        // Because the URL uses ?branchId=X, our Guard will detect it and check permissions perfectly.
        ProductController_1.prototype.updateProduct = function (id, branchIdStr, body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var branchId, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchId = branchIdStr ? parseInt(branchIdStr, 10) : undefined;
                            if (branchIdStr && isNaN(branchId)) {
                                throw new common_1.BadRequestException(product_constants_1.PRODUCT_ERRORS.BRANCH_ID_SHOULD_BE_NUMBER);
                            }
                            return [4 /*yield*/, this.productService.update(id, req.user.userId, req.user.role, body, branchId)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, __assign({ product: result.product }, (result.branchDetails && { branchDetails: result.branchDetails }))];
                    }
                });
            });
        };
        return ProductController_1;
    }());
    __setFunctionName(_classThis, "ProductController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findCategories_decorators = [(0, common_1.Get)('restaurants/:restaurantId/categories'), openapi.ApiResponse({ status: 200 })];
        _findByBranch_decorators = [(0, common_1.UseInterceptors)(cache_interceptor_1.UnifiedCacheInterceptor), (0, cache_manager_1.CacheTTL)(time_utils_1.TimeUtils.hoursToMs(1)), (0, common_1.Get)('branches/:branchId/products'), openapi.ApiResponse({ status: 200 })];
        _findByRestaurant_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard), (0, common_1.Get)('restaurants/:restaurantId/products'), openapi.ApiResponse({ status: 200 })];
        _findById_decorators = [(0, common_1.UseInterceptors)(cache_interceptor_1.UnifiedCacheInterceptor), (0, cache_manager_1.CacheTTL)(time_utils_1.TimeUtils.hoursToMs(1)), (0, common_1.Get)('products/:id'), openapi.ApiResponse({ status: 200 })];
        _createProduct_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Post)('restaurants/:restaurantId/products'), openapi.ApiResponse({ status: 201, type: require("./entity/product.entity").Product })];
        _updateProduct_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard, branch_access_guard_1.BranchAccessGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Patch)('products/:id'), openapi.ApiResponse({ status: 200 })];
        __esDecorate(_classThis, null, _findCategories_decorators, { kind: "method", name: "findCategories", static: false, private: false, access: { has: function (obj) { return "findCategories" in obj; }, get: function (obj) { return obj.findCategories; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByBranch_decorators, { kind: "method", name: "findByBranch", static: false, private: false, access: { has: function (obj) { return "findByBranch" in obj; }, get: function (obj) { return obj.findByBranch; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByRestaurant_decorators, { kind: "method", name: "findByRestaurant", static: false, private: false, access: { has: function (obj) { return "findByRestaurant" in obj; }, get: function (obj) { return obj.findByRestaurant; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: function (obj) { return "findById" in obj; }, get: function (obj) { return obj.findById; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createProduct_decorators, { kind: "method", name: "createProduct", static: false, private: false, access: { has: function (obj) { return "createProduct" in obj; }, get: function (obj) { return obj.createProduct; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProduct_decorators, { kind: "method", name: "updateProduct", static: false, private: false, access: { has: function (obj) { return "updateProduct" in obj; }, get: function (obj) { return obj.updateProduct; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductController = _classThis;
}();
exports.ProductController = ProductController;
