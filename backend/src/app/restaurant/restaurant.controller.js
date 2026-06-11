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
exports.RestaurantController = void 0;
var openapi = require("@nestjs/swagger");
var common_1 = require("@nestjs/common");
var jwtGuard_1 = require("../../../../../../../../../../../src/lib/middleware/guards/jwtGuard");
var idempotency_interceptor_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.interceptor");
var idempotency_decorator_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.decorator");
var RestaurantController = function () {
    var _classDecorators = [(0, common_1.Controller)('restaurants')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getAllRestaurants_decorators;
    var _getRestaurantById_decorators;
    var _createRestaurantWithOwner_decorators;
    var _updateRestaurant_decorators;
    var _updateStatus_decorators;
    var RestaurantController = _classThis = /** @class */ (function () {
        function RestaurantController_1(restaurantService) {
            this.restaurantService = (__runInitializers(this, _instanceExtraInitializers), restaurantService);
        }
        RestaurantController_1.prototype.getAllRestaurants = function (queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurants;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantService.findAll(queryParams)];
                        case 1:
                            restaurants = _a.sent();
                            return [2 /*return*/, restaurants];
                    }
                });
            });
        };
        RestaurantController_1.prototype.getRestaurantById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantService.findRestaurantById(id)];
                        case 1:
                            restaurant = _a.sent();
                            return [2 /*return*/, restaurant];
                    }
                });
            });
        };
        RestaurantController_1.prototype.createRestaurantWithOwner = function (body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var adminRole, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            adminRole = req.user.role;
                            return [4 /*yield*/, this.restaurantService.createWithOwner(adminRole, body)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        RestaurantController_1.prototype.updateRestaurant = function (id, body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, userRole, restaurant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userId = req.user.userId;
                            userRole = req.user.role;
                            return [4 /*yield*/, this.restaurantService.update(id, userId, userRole, body)];
                        case 1:
                            restaurant = _a.sent();
                            return [2 /*return*/, restaurant];
                    }
                });
            });
        };
        RestaurantController_1.prototype.updateStatus = function (id, body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var userRole, restaurant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userRole = req.user.role;
                            return [4 /*yield*/, this.restaurantService.updateStatus(id, userRole, body.status)];
                        case 1:
                            restaurant = _a.sent();
                            return [2 /*return*/, restaurant];
                    }
                });
            });
        };
        return RestaurantController_1;
    }());
    __setFunctionName(_classThis, "RestaurantController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getAllRestaurants_decorators = [(0, common_1.Get)(), openapi.ApiResponse({ status: 200 })];
        _getRestaurantById_decorators = [(0, common_1.Get)(':id'), openapi.ApiResponse({ status: 200, type: require("./entity/restaurant.entity").RestaurantEntity })];
        _createRestaurantWithOwner_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Post)(), openapi.ApiResponse({ status: 201 })];
        _updateRestaurant_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Patch)(':id'), openapi.ApiResponse({ status: 200, type: require("./entity/restaurant.entity").RestaurantEntity })];
        _updateStatus_decorators = [(0, common_1.UseGuards)(jwtGuard_1.JwtAuthGuard), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Patch)(':id/status'), openapi.ApiResponse({ status: 200, type: Object })];
        __esDecorate(_classThis, null, _getAllRestaurants_decorators, { kind: "method", name: "getAllRestaurants", static: false, private: false, access: { has: function (obj) { return "getAllRestaurants" in obj; }, get: function (obj) { return obj.getAllRestaurants; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRestaurantById_decorators, { kind: "method", name: "getRestaurantById", static: false, private: false, access: { has: function (obj) { return "getRestaurantById" in obj; }, get: function (obj) { return obj.getRestaurantById; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRestaurantWithOwner_decorators, { kind: "method", name: "createRestaurantWithOwner", static: false, private: false, access: { has: function (obj) { return "createRestaurantWithOwner" in obj; }, get: function (obj) { return obj.createRestaurantWithOwner; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateRestaurant_decorators, { kind: "method", name: "updateRestaurant", static: false, private: false, access: { has: function (obj) { return "updateRestaurant" in obj; }, get: function (obj) { return obj.updateRestaurant; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: function (obj) { return "updateStatus" in obj; }, get: function (obj) { return obj.updateStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RestaurantController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RestaurantController = _classThis;
}();
exports.RestaurantController = RestaurantController;
