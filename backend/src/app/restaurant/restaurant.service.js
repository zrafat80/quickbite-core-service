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
exports.RestaurantService = void 0;
var common_1 = require("@nestjs/common");
var enums_1 = require("./enums"); // Or wherever your enum is stored
var restaurant_constants_1 = require("./restaurant.constants");
var enums_2 = require("../../../../../../../../../../../src/app/user/enums");
// 📍 Import the Parsers and Builder
var query_parser_1 = require("../../lib/pagination/query-parser"); // Adjust path
var cursor_pagination_1 = require("../../lib/pagination/cursor-pagination"); // Adjust path
var RestaurantService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RestaurantService = _classThis = /** @class */ (function () {
        // 1. Inject the Repository instead of importing raw functions
        function RestaurantService_1(restaurantRepo, knex, userService) {
            this.restaurantRepo = restaurantRepo;
            this.knex = knex;
            this.userService = userService;
        }
        // 2. Use standard async class methods instead of arrow functions
        RestaurantService_1.prototype.create = function (userId, data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurantData, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            restaurantData = {
                                ownerId: userId,
                                name: data.name,
                                logoURL: data.logoURL,
                                primaryCountry: data.primaryCountry,
                                status: enums_1.RestaurantStatus.PENDING, // Or simply 'pending'
                            };
                            return [4 /*yield*/, this.restaurantRepo.createRestaurant(restaurantData, trx)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        // 📍 UPGRADED WITH PAGINATION
        RestaurantService_1.prototype.findAll = function (queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var columnMap, allowedFilters, pagination, filters, restaurants;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            columnMap = {
                                id: 'id',
                                ownerId: 'owner_id',
                                name: 'name',
                                status: 'status',
                                primaryCountry: 'primary_country',
                                createdAt: 'created_at',
                                updatedAt: 'updated_at',
                                statusUpdatedAt: 'status_updated_at'
                            };
                            allowedFilters = ['status', 'primaryCountry', 'ownerId', 'name', 'createdAt'];
                            pagination = (0, query_parser_1.parsePaginationQuery)(queryParams, columnMap);
                            filters = (0, query_parser_1.parseFilters)(queryParams, allowedFilters, columnMap);
                            return [4 /*yield*/, this.restaurantRepo.findAllRestaurants(pagination, filters)];
                        case 1:
                            restaurants = _a.sent();
                            return [2 /*return*/, (0, cursor_pagination_1.buildPaginationResult)(restaurants, pagination.limit, pagination.apiSortBy)];
                    }
                });
            });
        };
        RestaurantService_1.prototype.findRestaurantById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantRepo.findRestaurantById(id)];
                        case 1:
                            restaurant = _a.sent();
                            if (!restaurant || restaurant.status !== 'active') {
                                throw new common_1.NotFoundException(restaurant_constants_1.RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
                            }
                            return [2 /*return*/, restaurant];
                    }
                });
            });
        };
        RestaurantService_1.prototype.createWithOwner = function (userRole, data) {
            return __awaiter(this, void 0, void 0, function () {
                var trx, newOwner, newRestaurant, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // 1. Security Check: Only SYSTEM_ADMIN can hit this logic
                            if (userRole !== enums_2.SystemRole.SYSTEM_ADMIN) {
                                throw new common_1.ForbiddenException('Only System Admins can provision new restaurants');
                            }
                            return [4 /*yield*/, this.knex.transaction()];
                        case 1:
                            trx = _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 6, , 8]);
                            return [4 /*yield*/, this.userService.hashAndCreateUser(data.owner, enums_2.SystemRole.RESTAURANT_USER, trx)];
                        case 3:
                            newOwner = _a.sent();
                            return [4 /*yield*/, this.restaurantRepo.createRestaurant({
                                    ownerId: newOwner.id,
                                    name: data.name,
                                    logoURL: data.logoUrl,
                                    primaryCountry: data.primaryCountry,
                                }, trx)];
                        case 4:
                            newRestaurant = _a.sent();
                            // 6. Commit the transaction if BOTH succeeded
                            return [4 /*yield*/, trx.commit()];
                        case 5:
                            // 6. Commit the transaction if BOTH succeeded
                            _a.sent();
                            // 7. Format the exact response requested
                            return [2 /*return*/, {
                                    restaurant: newRestaurant,
                                    owner: {
                                        id: newOwner.id,
                                        email: newOwner.email,
                                        phone: newOwner.phone,
                                        name: newOwner.name,
                                        systemRole: newOwner.systemRole,
                                    },
                                }];
                        case 6:
                            error_1 = _a.sent();
                            // 🚨 Rollback everything if ANYTHING fails
                            return [4 /*yield*/, trx.rollback()];
                        case 7:
                            // 🚨 Rollback everything if ANYTHING fails
                            _a.sent();
                            console.error('🚨 Admin Provisioning Failed:', error_1);
                            throw error_1;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        RestaurantService_1.prototype.update = function (id, userId, userRole, data) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurant, updatedRestaurant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantRepo.findRestaurantById(id)];
                        case 1:
                            restaurant = _a.sent();
                            if (!restaurant) {
                                throw new common_1.NotFoundException(restaurant_constants_1.RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
                            }
                            // 2. Security Guard: Must be SYSTEM_ADMIN OR the exact owner
                            if (userRole !== enums_2.SystemRole.SYSTEM_ADMIN &&
                                Number(restaurant.ownerId) !== Number(userId)) {
                                throw new common_1.ForbiddenException(restaurant_constants_1.RESTAURANT_ERRORS.NO_PERMISSION);
                            }
                            return [4 /*yield*/, this.restaurantRepo.updateRestaurant(id, data)];
                        case 2:
                            updatedRestaurant = _a.sent();
                            // Map snake_case back to camelCase if necessary based on your repo return!
                            return [2 /*return*/, updatedRestaurant];
                    }
                });
            });
        };
        RestaurantService_1.prototype.updateStatus = function (id, userRole, status) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurant, updatedRestaurant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // 1. Security Guard: STRICTLY SYSTEM_ADMIN ONLY
                            if (userRole !== enums_2.SystemRole.SYSTEM_ADMIN) {
                                throw new common_1.ForbiddenException(restaurant_constants_1.RESTAURANT_ERRORS.SYSTEM_ADMIN_ONLY);
                            }
                            return [4 /*yield*/, this.restaurantRepo.findRestaurantById(id)];
                        case 1:
                            restaurant = _a.sent();
                            if (!restaurant) {
                                throw new common_1.NotFoundException(restaurant_constants_1.RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
                            }
                            return [4 /*yield*/, this.restaurantRepo.updateRestaurantStatus(id, status)];
                        case 2:
                            updatedRestaurant = _a.sent();
                            return [2 /*return*/, updatedRestaurant];
                    }
                });
            });
        };
        return RestaurantService_1;
    }());
    __setFunctionName(_classThis, "RestaurantService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RestaurantService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RestaurantService = _classThis;
}();
exports.RestaurantService = RestaurantService;
