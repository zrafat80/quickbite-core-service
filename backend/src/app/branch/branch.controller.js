"use strict";
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
exports.BranchController = void 0;
var openapi = require("@nestjs/swagger");
var common_1 = require("@nestjs/common");
var jwtGuard_1 = require("../../../../../../../../../../../src/lib/middleware/guards/jwtGuard");
var branch_access_guard_1 = require("../../../../../../../../../../../src/lib/middleware/guards/branch-access.guard"); // 🌟 Imported the Guard
var permissions_decorator_1 = require("../../../../../../../../../../../src/lib/decorators/permissions.decorator");
var restaurant_member_guard_1 = require("../../../../../../../../../../../src/lib/middleware/guards/restaurant-member.guard");
var permissions_guard_1 = require("../../../../../../../../../../../src/lib/middleware/guards/permissions.guard");
var internal_api_key_guard_1 = require("../../../../../../../../../../../src/lib/middleware/guards/internal-api-key.guard");
var cache_manager_1 = require("@nestjs/cache-manager");
var time_utils_1 = require("../../../../../../../../../../../src/pkg/utils/time.utils");
var cache_interceptor_1 = require("../../../../../../../../../../../src/lib/cache/cache.interceptor");
var idempotency_decorator_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.decorator");
var idempotency_interceptor_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.interceptor");
var BranchController = function () {
    var _classDecorators = [(0, common_1.Controller)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getInternalBranch_decorators;
    var _getInternalBranchesBulk_decorators;
    var _getInternalBranchProducts_decorators;
    var _reserveStockInternal_decorators;
    var _releaseStockInternal_decorators;
    var _findNearby_decorators;
    var _findByRestaurant_decorators;
    var _create_decorators;
    var _update_decorators;
    var _updateStatus_decorators;
    var BranchController = _classThis = /** @class */ (function () {
        function BranchController_1(branchService, productService) {
            this.branchService = (__runInitializers(this, _instanceExtraInitializers), branchService);
            this.productService = productService;
        }
        // ─── INTERNAL (service-to-service) ────────────────────────────────────────
        BranchController_1.prototype.getInternalBranch = function (branchId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.branchService.findInternalById(branchId)];
                });
            });
        };
        BranchController_1.prototype.getInternalBranchesBulk = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                var branchIds;
                return __generator(this, function (_a) {
                    branchIds = (ids !== null && ids !== void 0 ? ids : '')
                        .split(',')
                        .map(function (s) { return Number(s.trim()); })
                        .filter(function (n) { return !isNaN(n) && n > 0; });
                    return [2 /*return*/, this.branchService.findInternalMany(branchIds)];
                });
            });
        };
        BranchController_1.prototype.getInternalBranchProducts = function (branchId, ids) {
            return __awaiter(this, void 0, void 0, function () {
                var productIds;
                return __generator(this, function (_a) {
                    productIds = (ids !== null && ids !== void 0 ? ids : '')
                        .split(',')
                        .map(function (s) { return Number(s.trim()); })
                        .filter(function (n) { return Number.isInteger(n) && n > 0; });
                    return [2 /*return*/, this.productService.findInternalBranchProducts(branchId, productIds)];
                });
            });
        };
        BranchController_1.prototype.reserveStockInternal = function (branchId, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productService.reserveStockInternal(branchId, body.items)];
                });
            });
        };
        BranchController_1.prototype.releaseStockInternal = function (branchId, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productService.releaseStockInternal(branchId, body.items)];
                });
            });
        };
        // ──────────────────────────────────────────────────────────────────────────
        BranchController_1.prototype.findNearby = function (lat, lng, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.branchService.findNearby(lat, lng, queryParams)];
                        case 1:
                            results = _a.sent();
                            return [2 /*return*/, results];
                    }
                });
            });
        };
        BranchController_1.prototype.findByRestaurant = function (restaurantId, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.branchService.findByRestaurant(restaurantId, queryParams)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            });
        };
        BranchController_1.prototype.create = function (restaurantId, data, req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, userRole, branch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = req.user.userId;
                            userRole = req.user.role;
                            return [4 /*yield*/, this.branchService.create(restaurantId, userId, userRole, data)];
                        case 1:
                            branch = _a.sent();
                            return [2 /*return*/, branch];
                    }
                });
            });
        };
        // 📍 PATCH /branches/:branchId (Owner/Admin)
        // 🌟 FIX: Changed :id to :branchId to match the Guard!
        BranchController_1.prototype.update = function (branchId, data, req) {
            return __awaiter(this, void 0, void 0, function () {
                var branch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.branchService.update(branchId, req.user.userId, req.user.role, data)];
                        case 1:
                            branch = _a.sent();
                            return [2 /*return*/, branch];
                    }
                });
            });
        };
        // 📍 PATCH /branches/:branchId/status (Admin Only)
        // 🌟 FIX: Changed :id to :branchId to match the Guard!
        BranchController_1.prototype.updateStatus = function (branchId, data, req) {
            return __awaiter(this, void 0, void 0, function () {
                var branch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.branchService.updateStatus(branchId, req.user.role, data)];
                        case 1:
                            branch = _a.sent();
                            return [2 /*return*/, branch];
                    }
                });
            });
        };
        return BranchController_1;
    }());
    __setFunctionName(_classThis, "BranchController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getInternalBranch_decorators = [(0, common_1.Get)('internal/branches/:branchId'), (0, common_1.UseGuards)(internal_api_key_guard_1.RequireInternalApiKeyGuard), openapi.ApiResponse({ status: 200 })];
        _getInternalBranchesBulk_decorators = [(0, common_1.Get)('internal/branches'), (0, common_1.UseGuards)(internal_api_key_guard_1.RequireInternalApiKeyGuard), openapi.ApiResponse({ status: 200, type: [Object] })];
        _getInternalBranchProducts_decorators = [(0, common_1.Get)('internal/branches/:branchId/products'), (0, common_1.UseGuards)(internal_api_key_guard_1.RequireInternalApiKeyGuard), openapi.ApiResponse({ status: 200 })];
        _reserveStockInternal_decorators = [(0, common_1.Post)('internal/branches/:branchId/reserve-stock'), (0, common_1.UseGuards)(internal_api_key_guard_1.RequireInternalApiKeyGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), openapi.ApiResponse({ status: 201 })];
        _releaseStockInternal_decorators = [(0, common_1.Post)('internal/branches/:branchId/release-stock'), (0, common_1.UseGuards)(internal_api_key_guard_1.RequireInternalApiKeyGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), openapi.ApiResponse({ status: 201 })];
        _findNearby_decorators = [(0, common_1.UseInterceptors)(cache_interceptor_1.UnifiedCacheInterceptor), (0, cache_manager_1.CacheTTL)(time_utils_1.TimeUtils.hoursToMs(1)), (0, common_1.Get)('branches/nearby'), openapi.ApiResponse({ status: 200 })];
        _findByRestaurant_decorators = [(0, common_1.Get)('restaurants/:restaurantId/branches'), openapi.ApiResponse({ status: 200 })];
        _create_decorators = [(0, common_1.Post)('restaurants/:restaurantId/branches'), (0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard, restaurant_member_guard_1.RestaurantMemberGuard, permissions_guard_1.PermissionsGuard), (0, permissions_decorator_1.RequirePermissions)('core:branch', 'create'), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), openapi.ApiResponse({ status: 201, type: require("./entity/branch.entity").Branch })];
        _update_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard, branch_access_guard_1.BranchAccessGuard), (0, permissions_decorator_1.RequirePermissions)('core:branch', 'update'), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Patch)('branches/:branchId'), openapi.ApiResponse({ status: 200, type: require("./entity/branch.entity").Branch })];
        _updateStatus_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard, branch_access_guard_1.BranchAccessGuard), (0, permissions_decorator_1.RequirePermissions)('core:branch', 'update'), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Patch)('branches/:branchId/status'), openapi.ApiResponse({ status: 200 })];
        __esDecorate(_classThis, null, _getInternalBranch_decorators, { kind: "method", name: "getInternalBranch", static: false, private: false, access: { has: function (obj) { return "getInternalBranch" in obj; }, get: function (obj) { return obj.getInternalBranch; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInternalBranchesBulk_decorators, { kind: "method", name: "getInternalBranchesBulk", static: false, private: false, access: { has: function (obj) { return "getInternalBranchesBulk" in obj; }, get: function (obj) { return obj.getInternalBranchesBulk; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInternalBranchProducts_decorators, { kind: "method", name: "getInternalBranchProducts", static: false, private: false, access: { has: function (obj) { return "getInternalBranchProducts" in obj; }, get: function (obj) { return obj.getInternalBranchProducts; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _reserveStockInternal_decorators, { kind: "method", name: "reserveStockInternal", static: false, private: false, access: { has: function (obj) { return "reserveStockInternal" in obj; }, get: function (obj) { return obj.reserveStockInternal; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _releaseStockInternal_decorators, { kind: "method", name: "releaseStockInternal", static: false, private: false, access: { has: function (obj) { return "releaseStockInternal" in obj; }, get: function (obj) { return obj.releaseStockInternal; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findNearby_decorators, { kind: "method", name: "findNearby", static: false, private: false, access: { has: function (obj) { return "findNearby" in obj; }, get: function (obj) { return obj.findNearby; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByRestaurant_decorators, { kind: "method", name: "findByRestaurant", static: false, private: false, access: { has: function (obj) { return "findByRestaurant" in obj; }, get: function (obj) { return obj.findByRestaurant; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: function (obj) { return "updateStatus" in obj; }, get: function (obj) { return obj.updateStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BranchController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BranchController = _classThis;
}();
exports.BranchController = BranchController;
