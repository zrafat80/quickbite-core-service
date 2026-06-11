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
exports.ProductService = void 0;
var common_1 = require("@nestjs/common");
var enums_1 = require("../user/enums"); // Adjust path
var product_constants_1 = require("./product.constants");
var event_types_1 = require("../../lib/events/event-types");
// 📍 Import the Parsers and Builder
var query_parser_1 = require("../../lib/pagination/query-parser"); // Adjust path
var cursor_pagination_1 = require("../../lib/pagination/cursor-pagination"); // Adjust path
var ProductService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProductService = _classThis = /** @class */ (function () {
        function ProductService_1(productRepo, categoryRepo, branchDetailsRepo, restaurantService, outboxRepo, knex) {
            this.productRepo = productRepo;
            this.categoryRepo = categoryRepo;
            this.branchDetailsRepo = branchDetailsRepo;
            this.restaurantService = restaurantService;
            this.outboxRepo = outboxRepo;
            this.knex = knex;
        }
        ProductService_1.prototype.create = function (restaurantId, userId, userRole, data) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurant, trx, categoryId, category, product, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantService.findRestaurantById(restaurantId)];
                        case 1:
                            restaurant = _a.sent();
                            if (userRole !== enums_1.SystemRole.SYSTEM_ADMIN &&
                                Number(restaurant.ownerId) !== Number(userId)) {
                                throw new common_1.ForbiddenException(product_constants_1.PRODUCT_ERRORS.NO_PERMISSION);
                            }
                            return [4 /*yield*/, this.knex.transaction()];
                        case 2:
                            trx = _a.sent();
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 10, , 12]);
                            categoryId = null;
                            if (!data.categoryName) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.categoryRepo.findByNameAndRestaurant(data.categoryName, restaurantId, trx)];
                        case 4:
                            category = _a.sent();
                            if (!!category) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.categoryRepo.createCategory(data.categoryName, restaurantId, trx)];
                        case 5:
                            category = _a.sent();
                            _a.label = 6;
                        case 6:
                            categoryId = category.id;
                            _a.label = 7;
                        case 7: return [4 /*yield*/, this.productRepo.createProduct({
                                name: data.name,
                                description: data.description,
                                imageUrl: data.imageUrl,
                                restaurantId: restaurantId,
                                categoryId: categoryId,
                            }, trx)];
                        case 8:
                            product = _a.sent();
                            return [4 /*yield*/, trx.commit()];
                        case 9:
                            _a.sent();
                            return [2 /*return*/, product];
                        case 10:
                            error_1 = _a.sent();
                            return [4 /*yield*/, trx.rollback()];
                        case 11:
                            _a.sent();
                            throw error_1;
                        case 12: return [2 /*return*/];
                    }
                });
            });
        };
        // 📍 GET /restaurants/:restaurantId/categories
        ProductService_1.prototype.findCategories = function (restaurantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.categoryRepo.findCategoriesByRestaurant(restaurantId)];
                });
            });
        };
        // 📍 GET /branches/:branchId/products (UPGRADED WITH PAGINATION)
        ProductService_1.prototype.findByBranch = function (branchId, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var branchProductMap, allowedFilters, pagination, filters, products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchProductMap = {
                                id: 'p.id',
                                createdAt: 'p.created_at',
                                categoryId: 'p.category_id',
                                price: 'pbd.price',
                                isAvailable: 'pbd.is_available',
                            };
                            allowedFilters = ['categoryId', 'isAvailable'];
                            pagination = (0, query_parser_1.parsePaginationQuery)(queryParams, branchProductMap);
                            filters = (0, query_parser_1.parseFilters)(queryParams, allowedFilters, branchProductMap);
                            return [4 /*yield*/, this.productRepo.findProductsByBranch(branchId, pagination, filters)];
                        case 1:
                            products = _a.sent();
                            return [2 /*return*/, (0, cursor_pagination_1.buildPaginationResult)(products, pagination.limit, pagination.apiSortBy)];
                    }
                });
            });
        };
        // 📍 GET /restaurants/:restaurantId/products (Management View - UPGRADED)
        ProductService_1.prototype.findByRestaurant = function (restaurantId, userId, userRole, queryParams) {
            return __awaiter(this, void 0, void 0, function () {
                var restaurant, productMap, allowedFilters, pagination, filters, products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantService.findRestaurantById(restaurantId)];
                        case 1:
                            restaurant = _a.sent();
                            if (userRole !== enums_1.SystemRole.SYSTEM_ADMIN &&
                                Number(restaurant.ownerId) !== Number(userId)) {
                                throw new common_1.ForbiddenException("You do not have permission to view this restaurant's internal catalog");
                            }
                            productMap = {
                                id: 'id',
                                createdAt: 'created_at',
                                categoryId: 'category_id',
                            };
                            allowedFilters = ['categoryId'];
                            pagination = (0, query_parser_1.parsePaginationQuery)(queryParams, productMap);
                            filters = (0, query_parser_1.parseFilters)(queryParams, allowedFilters, productMap);
                            return [4 /*yield*/, this.productRepo.findProductsByRestaurant(restaurantId, pagination, filters)];
                        case 2:
                            products = _a.sent();
                            return [2 /*return*/, (0, cursor_pagination_1.buildPaginationResult)(products, pagination.limit, pagination.apiSortBy)];
                    }
                });
            });
        };
        // 📍 GET /products/:id
        ProductService_1.prototype.findById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productRepo.findProductById(id)];
                        case 1:
                            product = _a.sent();
                            if (!product) {
                                throw new common_1.NotFoundException('Product not found');
                            }
                            return [2 /*return*/, {
                                    id: product.id,
                                    name: product.name,
                                    description: product.description,
                                    imageUrl: product.imageUrl,
                                    restaurantId: product.restaurantId,
                                    categoryId: product.categoryId,
                                    createdAt: product.createdAt,
                                    updatedAt: product.updatedAt,
                                }];
                    }
                });
            });
        };
        ProductService_1.prototype.update = function (id, userId, userRole, data, branchId) {
            return __awaiter(this, void 0, void 0, function () {
                var product, restaurant, trx, categoryId, category, updatedProduct, productNeedsUpdate, metaFieldChanged, branchIds, branchDetails, branchNeedsUpdate, error_2;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productRepo.findProductById(id)];
                        case 1:
                            product = _a.sent();
                            if (!product) {
                                throw new common_1.NotFoundException('Product not found');
                            }
                            return [4 /*yield*/, this.restaurantService.findRestaurantById(product.restaurantId)];
                        case 2:
                            restaurant = _a.sent();
                            if (userRole !== enums_1.SystemRole.SYSTEM_ADMIN &&
                                Number(restaurant.ownerId) !== Number(userId)) {
                                throw new common_1.ForbiddenException('You do not have permission to update this product');
                            }
                            return [4 /*yield*/, this.knex.transaction()];
                        case 3:
                            trx = _a.sent();
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 22, , 24]);
                            categoryId = product.categoryId;
                            if (!(data.categoryName !== undefined)) return [3 /*break*/, 9];
                            if (!(data.categoryName.trim() === '')) return [3 /*break*/, 5];
                            categoryId = null; // They want to remove the category
                            return [3 /*break*/, 9];
                        case 5: return [4 /*yield*/, this.categoryRepo.findByNameAndRestaurant(data.categoryName, product.restaurantId, trx)];
                        case 6:
                            category = _a.sent();
                            if (!!category) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.categoryRepo.createCategory(data.categoryName, product.restaurantId, trx)];
                        case 7:
                            category = _a.sent();
                            _a.label = 8;
                        case 8:
                            categoryId = category.id;
                            _a.label = 9;
                        case 9:
                            updatedProduct = product;
                            productNeedsUpdate = data.name !== undefined ||
                                data.description !== undefined ||
                                data.imageUrl !== undefined ||
                                data.categoryName !== undefined;
                            if (!productNeedsUpdate) return [3 /*break*/, 13];
                            return [4 /*yield*/, this.productRepo.updateProduct(id, {
                                    name: data.name,
                                    description: data.description,
                                    imageUrl: data.imageUrl,
                                    categoryId: categoryId,
                                }, trx)];
                        case 10:
                            updatedProduct = _a.sent();
                            metaFieldChanged = data.name !== undefined || data.imageUrl !== undefined;
                            if (!metaFieldChanged) return [3 /*break*/, 13];
                            return [4 /*yield*/, this.branchDetailsRepo.findBranchIdsByProduct(id, trx)];
                        case 11:
                            branchIds = _a.sent();
                            return [4 /*yield*/, Promise.all(branchIds.map(function (branchId) {
                                    return _this.outboxRepo.insertOutboxEvent(trx, {
                                        aggregateType: 'product_branch_details',
                                        aggregateId: "".concat(branchId, ":").concat(id),
                                        eventType: event_types_1.EVENT_TYPES.PRODUCT_META_CHANGED,
                                        payload: { branchId: branchId, productId: id },
                                    });
                                }))];
                        case 12:
                            _a.sent();
                            _a.label = 13;
                        case 13:
                            branchDetails = undefined;
                            branchNeedsUpdate = data.price !== undefined ||
                                data.stock !== undefined ||
                                data.isAvailable !== undefined;
                            if (!(branchId && branchNeedsUpdate)) return [3 /*break*/, 20];
                            return [4 /*yield*/, this.branchDetailsRepo.updateBranchDetails(id, branchId, {
                                    price: data.price,
                                    stock: data.stock,
                                    isAvailable: data.isAvailable,
                                }, trx)];
                        case 14:
                            branchDetails = _a.sent();
                            if (!branchDetails) {
                                throw new common_1.NotFoundException(product_constants_1.PRODUCT_ERRORS.BRANCH_DETAILS_NOT_FOUND_FOR_THAT_BRANCH);
                            }
                            if (!(data.price !== undefined)) return [3 /*break*/, 16];
                            return [4 /*yield*/, this.outboxRepo.insertOutboxEvent(trx, {
                                    aggregateType: 'product_branch_details',
                                    aggregateId: "".concat(branchId, ":").concat(id),
                                    eventType: event_types_1.EVENT_TYPES.PRODUCT_PRICE_CHANGED,
                                    payload: { branchId: branchId, productId: id, price: data.price },
                                })];
                        case 15:
                            _a.sent();
                            _a.label = 16;
                        case 16:
                            if (!(data.stock !== undefined)) return [3 /*break*/, 18];
                            return [4 /*yield*/, this.outboxRepo.insertOutboxEvent(trx, {
                                    aggregateType: 'product_branch_details',
                                    aggregateId: "".concat(branchId, ":").concat(id),
                                    eventType: event_types_1.EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                                    payload: { branchId: branchId, productId: id, stock: data.stock },
                                })];
                        case 17:
                            _a.sent();
                            _a.label = 18;
                        case 18:
                            if (!(data.isAvailable !== undefined)) return [3 /*break*/, 20];
                            return [4 /*yield*/, this.outboxRepo.insertOutboxEvent(trx, {
                                    aggregateType: 'product_branch_details',
                                    aggregateId: "".concat(branchId, ":").concat(id),
                                    eventType: event_types_1.EVENT_TYPES.PRODUCT_META_CHANGED,
                                    payload: { branchId: branchId, productId: id },
                                })];
                        case 19:
                            _a.sent();
                            _a.label = 20;
                        case 20: return [4 /*yield*/, trx.commit()];
                        case 21:
                            _a.sent();
                            return [2 /*return*/, {
                                    product: updatedProduct,
                                    branchDetails: branchDetails,
                                }];
                        case 22:
                            error_2 = _a.sent();
                            return [4 /*yield*/, trx.rollback()];
                        case 23:
                            _a.sent();
                            throw error_2;
                        case 24: return [2 /*return*/];
                    }
                });
            });
        };
        // For /api/internal/branches/:id/products?ids=...
        ProductService_1.prototype.findInternalBranchProducts = function (branchId, productIds) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productRepo.findInternalByBranchAndIds(branchId, productIds)];
                });
            });
        };
        // For /api/internal/branches/:id/reserve-stock
        ProductService_1.prototype.reserveStockInternal = function (branchId, items) {
            return __awaiter(this, void 0, void 0, function () {
                var trx, result, err_1, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (items.length === 0) {
                                return [2 /*return*/, { ok: true, reserved: [] }];
                            }
                            return [4 /*yield*/, this.knex.transaction()];
                        case 1:
                            trx = _b.sent();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 8, , 13]);
                            return [4 /*yield*/, this.productRepo.reserveStock(branchId, items, trx)];
                        case 3:
                            result = _b.sent();
                            if (!!result.ok) return [3 /*break*/, 5];
                            return [4 /*yield*/, trx.rollback()];
                        case 4:
                            _b.sent();
                            throw new common_1.ConflictException({
                                message: product_constants_1.PRODUCT_ERRORS.INSUFFICIENT_STOCK,
                                insufficient: result.insufficient,
                            });
                        case 5: return [4 /*yield*/, this.outboxRepo.insertOutboxEvents(trx, items.map(function (item) { return ({
                                aggregateType: 'product_branch_details',
                                aggregateId: "".concat(branchId, ":").concat(item.productId),
                                eventType: event_types_1.EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                                payload: {
                                    branchId: branchId,
                                    productId: item.productId,
                                    decremented: item.quantity,
                                },
                            }); }))];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, trx.commit()];
                        case 7:
                            _b.sent();
                            return [2 /*return*/, { ok: true, reserved: items }];
                        case 8:
                            err_1 = _b.sent();
                            _b.label = 9;
                        case 9:
                            _b.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, trx.rollback()];
                        case 10:
                            _b.sent();
                            return [3 /*break*/, 12];
                        case 11:
                            _a = _b.sent();
                            return [3 /*break*/, 12];
                        case 12: throw err_1;
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        // For /api/internal/branches/:id/release-stock
        ProductService_1.prototype.releaseStockInternal = function (branchId, items) {
            return __awaiter(this, void 0, void 0, function () {
                var trx, result, err_2, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (items.length === 0) {
                                return [2 /*return*/, { ok: true, released: [] }];
                            }
                            return [4 /*yield*/, this.knex.transaction()];
                        case 1:
                            trx = _b.sent();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 8, , 13]);
                            return [4 /*yield*/, this.productRepo.releaseStock(branchId, items, trx)];
                        case 3:
                            result = _b.sent();
                            if (!!result.ok) return [3 /*break*/, 5];
                            return [4 /*yield*/, trx.rollback()];
                        case 4:
                            _b.sent();
                            throw new common_1.NotFoundException({
                                message: product_constants_1.PRODUCT_ERRORS.PRODUCT_NOT_FOUND,
                                missing: result.missing,
                            });
                        case 5: return [4 /*yield*/, this.outboxRepo.insertOutboxEvents(trx, items.map(function (item) { return ({
                                aggregateType: 'product_branch_details',
                                aggregateId: "".concat(branchId, ":").concat(item.productId),
                                eventType: event_types_1.EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                                payload: {
                                    branchId: branchId,
                                    productId: item.productId,
                                    incremented: item.quantity,
                                },
                            }); }))];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, trx.commit()];
                        case 7:
                            _b.sent();
                            return [2 /*return*/, { ok: true, released: items }];
                        case 8:
                            err_2 = _b.sent();
                            _b.label = 9;
                        case 9:
                            _b.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, trx.rollback()];
                        case 10:
                            _b.sent();
                            return [3 /*break*/, 12];
                        case 11:
                            _a = _b.sent();
                            return [3 /*break*/, 12];
                        case 12: throw err_2;
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        return ProductService_1;
    }());
    __setFunctionName(_classThis, "ProductService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductService = _classThis;
}();
exports.ProductService = ProductService;
