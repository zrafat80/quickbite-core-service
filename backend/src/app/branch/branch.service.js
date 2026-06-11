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
exports.BranchService = void 0;
var common_1 = require("@nestjs/common");
var enums_1 = require("../user/enums"); // Adjust path if needed
var branch_constants_1 = require("./branch.constants");
var restaurant_constants_1 = require("../../../../../../../../../../../src/app/restaurant/restaurant.constants");
// 📍 Import the Parsers and Builder
var query_parser_1 = require("../../lib/pagination/query-parser"); // Adjust path
var cursor_pagination_1 = require("../../lib/pagination/cursor-pagination"); // Adjust path
var BranchService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BranchService = _classThis = /** @class */ (function () {
        // 1. Inject BOTH repositories so we can verify the restaurant ownership
        function BranchService_1(branchRepo, restaurantService) {
            this.branchRepo = branchRepo;
            this.restaurantService = restaurantService;
        }
        // 2. Standard class method instead of arrow function (UPGRADED WITH PAGINATION)
        BranchService_1.prototype.findNearby = function (lat, lng, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var nearbyColumnMap, allowedFilters, pagination, filters, rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nearbyColumnMap = {
                                id: 'b.id',
                                createdAt: 'b.created_at',
                                isActive: 'b.is_active',
                                acceptOrders: 'b.accept_orders'
                            };
                            allowedFilters = ['isActive', 'acceptOrders'];
                            pagination = (0, query_parser_1.parsePaginationQuery)(queryParams, nearbyColumnMap);
                            filters = (0, query_parser_1.parseFilters)(queryParams, allowedFilters, nearbyColumnMap);
                            console.log(filters);
                            console.log(pagination);
                            return [4 /*yield*/, this.branchRepo.findNearbyBranches(lat, lng, pagination, filters)];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, (0, cursor_pagination_1.buildPaginationResult)(rows, pagination.limit, pagination.apiSortBy)];
                    }
                });
            });
        };
        BranchService_1.prototype.create = function (restaurantId, userId, userRole, data) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurant, branch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantService.findRestaurantById(restaurantId)];
                        case 1:
                            restaurant = _a.sent();
                            if (!restaurant) {
                                throw new common_1.NotFoundException('Restaurant not found');
                            }
                            // 4. Security Check
                            if (userRole !== enums_1.SystemRole.SYSTEM_ADMIN &&
                                Number(restaurant.ownerId) !== Number(userId)) {
                                throw new common_1.ForbiddenException(branch_constants_1.BRANCH_ERRORS.NO_PERMISSION);
                            }
                            return [4 /*yield*/, this.branchRepo.createBranch({
                                    restaurantId: restaurantId,
                                    label: data.label,
                                    countryCode: data.countryCode,
                                    lat: data.lat,
                                    lng: data.lng,
                                    addressText: data.addressText,
                                    isActive: false, // Defaulting to false until the branch is fully set up
                                    opensAt: data.opensAt,
                                    closesAt: data.closesAt,
                                    currency: data.currency,
                                    deliveryRadius: data.deliveryRadius,
                                    commission: 0, // Admin will likely update this later!
                                    acceptOrders: true,
                                    // ✨ Notice: No createdAt or updatedAt! Your Knex defaultTo() handles it perfectly.
                                })];
                        case 2:
                            branch = _a.sent();
                            return [2 /*return*/, branch];
                    }
                });
            });
        };
        // 📍 GET /restaurants/:restaurantId/branches (UPGRADED WITH PAGINATION)
        BranchService_1.prototype.findByRestaurant = function (restaurantId, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var branchColumnMap, allowedFilters, pagination, filters, rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchColumnMap = {
                                id: 'id',
                                createdAt: 'created_at',
                                isActive: 'is_active',
                                countryCode: 'country_code',
                                acceptOrders: 'accept_orders'
                            };
                            allowedFilters = ['isActive', 'countryCode', 'acceptOrders'];
                            pagination = (0, query_parser_1.parsePaginationQuery)(queryParams, branchColumnMap);
                            filters = (0, query_parser_1.parseFilters)(queryParams, allowedFilters, branchColumnMap);
                            return [4 /*yield*/, this.branchRepo.findBranchesByRestaurant(restaurantId, pagination, filters)];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, (0, cursor_pagination_1.buildPaginationResult)(rows, pagination.limit, pagination.apiSortBy)];
                    }
                });
            });
        };
        // 📍 PATCH /branches/:id
        BranchService_1.prototype.update = function (id, userId, userRole, data) {
            return __awaiter(this, void 0, void 0, function () {
                var branch, restaurant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.branchRepo.findById(id)];
                        case 1:
                            branch = _a.sent();
                            if (!branch) {
                                throw new common_1.NotFoundException(branch_constants_1.BRANCH_ERRORS.BRANCH_NOT_FOUND);
                            }
                            return [4 /*yield*/, this.restaurantService.findRestaurantById(branch.restaurantId)];
                        case 2:
                            restaurant = _a.sent();
                            if (!restaurant) {
                                throw new common_1.NotFoundException(restaurant_constants_1.RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
                            }
                            // 3. Security Guard
                            if (userRole !== enums_1.SystemRole.SYSTEM_ADMIN &&
                                Number(restaurant.ownerId) !== Number(userId)) {
                                throw new common_1.ForbiddenException(branch_constants_1.BRANCH_ERRORS.NO_PERMISSION);
                            }
                            return [2 /*return*/, this.branchRepo.updateBranch(id, data)];
                    }
                });
            });
        };
        // 📍 PATCH /branches/:id/status
        BranchService_1.prototype.updateStatus = function (id, userRole, data) {
            return __awaiter(this, void 0, void 0, function () {
                var branch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // 1. Admin ONLY Guard
                            if (userRole !== enums_1.SystemRole.SYSTEM_ADMIN) {
                                throw new common_1.ForbiddenException(branch_constants_1.BRANCH_ERRORS.SYSTEM_ADMIN_ONLY);
                            }
                            return [4 /*yield*/, this.branchRepo.findById(id)];
                        case 1:
                            branch = _a.sent();
                            if (!branch) {
                                throw new common_1.NotFoundException(branch_constants_1.BRANCH_ERRORS.BRANCH_NOT_FOUND);
                            }
                            return [2 /*return*/, this.branchRepo.updateBranchStatus(id, data)];
                    }
                });
            });
        };
        BranchService_1.prototype.verifyBranchesBelongToRestaurant = function (branchIds, restaurantId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.branchRepo.verifyBranchesBelongToRestaurant(branchIds, restaurantId, trx)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        // For /api/internal/branches/:id — order-service consumes this at checkout.
        BranchService_1.prototype.findInternalById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.branchRepo.findInternalById(id)];
                        case 1:
                            data = _a.sent();
                            if (!data) {
                                throw new common_1.NotFoundException(branch_constants_1.BRANCH_ERRORS.BRANCH_NOT_FOUND);
                            }
                            return [2 /*return*/, data];
                    }
                });
            });
        };
        BranchService_1.prototype.findInternalMany = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (ids.length === 0)
                        return [2 /*return*/, []];
                    return [2 /*return*/, this.branchRepo.findInternalMany(ids)];
                });
            });
        };
        return BranchService_1;
    }());
    __setFunctionName(_classThis, "BranchService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BranchService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BranchService = _classThis;
}();
exports.BranchService = BranchService;
