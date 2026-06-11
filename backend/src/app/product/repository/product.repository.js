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
exports.ProductRepository = void 0;
var common_1 = require("@nestjs/common");
var product_entity_1 = require("../entity/product.entity");
var cursor_pagination_1 = require("../../../lib/pagination/cursor-pagination"); // Adjust path
var PRODUCT_COLUMNS = [
    'id',
    'name',
    'description',
    'image_url',
    'restaurant_id',
    'category_id',
    'created_at',
    'updated_at',
    'deleted_at',
];
var ProductRepository = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProductRepository = _classThis = /** @class */ (function () {
        function ProductRepository_1(knex) {
            this.knex = knex;
        }
        // 🌟 The Translator!
        ProductRepository_1.prototype.toEntity = function (row) {
            return new product_entity_1.Product({
                id: Number(row.id),
                name: row.name,
                description: row.description,
                imageUrl: row.image_url,
                restaurantId: Number(row.restaurant_id),
                categoryId: row.category_id ? Number(row.category_id) : null,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                deletedAt: row.deleted_at,
            });
        };
        ProductRepository_1.prototype.createProduct = function (data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('products')
                                    .insert({
                                    name: data.name,
                                    description: data.description,
                                    image_url: data.imageUrl,
                                    restaurant_id: data.restaurantId,
                                    category_id: data.categoryId,
                                })
                                    .returning('*')];
                        case 1:
                            row = (_a.sent())[0];
                            return [2 /*return*/, this.toEntity(row)];
                    }
                });
            });
        };
        // 📍 GET /products/:id
        ProductRepository_1.prototype.findProductById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('products')
                                .where({ id: id })
                                .whereNull('deleted_at') // 🛡️ Hide soft-deleted items!
                                .first()];
                        case 1:
                            row = _a.sent();
                            return [2 /*return*/, row ? this.toEntity(row) : null];
                    }
                });
            });
        };
        // 📍 GET /restaurants/:restaurantId/products (Management View - UPGRADED)
        ProductRepository_1.prototype.findProductsByRestaurant = function (restaurantId, pagination, filters) {
            return __awaiter(this, void 0, void 0, function () {
                var query, rows;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = this.knex('products')
                                .where({ restaurant_id: restaurantId })
                                .whereNull('deleted_at');
                            // Attach the Engine
                            query = (0, cursor_pagination_1.applyFilters)(query, filters);
                            query = (0, cursor_pagination_1.applyCursorPagination)(query, pagination);
                            return [4 /*yield*/, query];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, rows.map(function (row) { return _this.toEntity(row); })];
                    }
                });
            });
        };
        // 📍 GET /branches/:branchId/products (Public Customer View - UPGRADED)
        ProductRepository_1.prototype.findProductsByBranch = function (branchId, pagination, filters) {
            return __awaiter(this, void 0, void 0, function () {
                var query, rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = this.knex('products as p')
                                .join('product_branch_details as pbd', 'p.id', 'pbd.product_id')
                                .leftJoin('product_categories as pc', 'p.category_id', 'pc.id')
                                .where('pbd.branch_id', branchId)
                                .whereNull('p.deleted_at')
                                .select('p.id', 'p.name', 'p.description', 'p.image_url', 'p.restaurant_id', 'p.category_id', 'p.created_at', // Mapped for cursor sorting!
                            'pc.name as category_name', 'pbd.price', 'pbd.stock', 'pbd.is_available');
                            // Attach the Engine
                            query = (0, cursor_pagination_1.applyFilters)(query, filters);
                            query = (0, cursor_pagination_1.applyCursorPagination)(query, pagination);
                            return [4 /*yield*/, query];
                        case 1:
                            rows = _a.sent();
                            // Map to the exact camelCase structure
                            return [2 /*return*/, rows.map(function (row) { return ({
                                    id: Number(row.id),
                                    name: row.name,
                                    description: row.description || '',
                                    imageUrl: row.image_url || '',
                                    restaurantId: Number(row.restaurant_id),
                                    categoryId: row.category_id ? Number(row.category_id) : null,
                                    categoryName: row.category_name || null,
                                    price: Number(row.price),
                                    stock: Number(row.stock),
                                    isAvailable: Boolean(row.is_available),
                                    createdAt: row.created_at, // Send it so the cursor works!
                                }); })];
                    }
                });
            });
        };
        ProductRepository_1.prototype.updateProduct = function (id, data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, updateData, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            updateData = { updated_at: this.knex.fn.now() };
                            if (data.name !== undefined)
                                updateData.name = data.name;
                            if (data.description !== undefined)
                                updateData.description = data.description;
                            if (data.imageUrl !== undefined)
                                updateData.image_url = data.imageUrl;
                            if (data.categoryId !== undefined)
                                updateData.category_id = data.categoryId;
                            return [4 /*yield*/, db('products')
                                    .where("id", id)
                                    .update(updateData)
                                    .returning('*')];
                        case 1:
                            row = (_a.sent())[0];
                            return [2 /*return*/, this.toEntity(row)];
                    }
                });
            });
        };
        // Internal batch lookup for order-service checkout.
        ProductRepository_1.prototype.findInternalByBranchAndIds = function (branchId, productIds, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (productIds.length === 0)
                                return [2 /*return*/, []];
                            db = trx || this.knex;
                            return [4 /*yield*/, db('products as p')
                                    .join('product_branch_details as pbd', 'p.id', 'pbd.product_id')
                                    .where('pbd.branch_id', branchId)
                                    .whereIn('p.id', productIds)
                                    .whereNull('p.deleted_at')
                                    .select('p.id as product_id', 'p.name', 'p.image_url', 'pbd.price', 'pbd.stock', 'pbd.is_available')];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, rows.map(function (r) {
                                    var _a;
                                    return ({
                                        productId: Number(r.product_id),
                                        name: r.name,
                                        imageUrl: (_a = r.image_url) !== null && _a !== void 0 ? _a : null,
                                        price: Number(r.price),
                                        stock: Number(r.stock),
                                        isAvailable: Boolean(r.is_available),
                                    });
                                })];
                    }
                });
            });
        };
        // Atomic reserve: select FOR UPDATE → check stock → decrement.
        // Returns offending items on underflow so caller can 409.
        ProductRepository_1.prototype.reserveStock = function (branchId, items, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var productIds, rows, byId, _i, _a, r, insufficient, _b, items_1, item, cur, bindings, placeholders;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            productIds = items.map(function (i) { return i.productId; });
                            return [4 /*yield*/, trx('product_branch_details')
                                    .where('branch_id', branchId)
                                    .whereIn('product_id', productIds)
                                    .select('product_id', 'stock', 'is_available')
                                    .forUpdate()];
                        case 1:
                            rows = _c.sent();
                            byId = new Map();
                            for (_i = 0, _a = rows; _i < _a.length; _i++) {
                                r = _a[_i];
                                byId.set(Number(r.product_id), {
                                    stock: Number(r.stock),
                                    isAvailable: Boolean(r.is_available),
                                });
                            }
                            insufficient = [];
                            for (_b = 0, items_1 = items; _b < items_1.length; _b++) {
                                item = items_1[_b];
                                cur = byId.get(item.productId);
                                if (!cur || !cur.isAvailable || cur.stock < item.quantity) {
                                    insufficient.push({
                                        productId: item.productId,
                                        requested: item.quantity,
                                        available: cur ? cur.stock : 0,
                                    });
                                }
                            }
                            if (insufficient.length > 0)
                                return [2 /*return*/, { ok: false, insufficient: insufficient }];
                            bindings = [];
                            placeholders = items
                                .map(function (item) {
                                bindings.push(item.productId, item.quantity);
                                return '(CAST(? AS BIGINT), CAST(? AS INT))';
                            })
                                .join(', ');
                            bindings.push(branchId);
                            return [4 /*yield*/, trx.raw("\n      UPDATE product_branch_details AS p\n      SET stock = p.stock - v.quantity\n      FROM (VALUES ".concat(placeholders, ") AS v(product_id, quantity)\n      WHERE p.branch_id = ? AND p.product_id = v.product_id;\n    "), bindings)];
                        case 2:
                            _c.sent();
                            return [2 /*return*/, { ok: true, insufficient: [] }];
                    }
                });
            });
        };
        // Atomic release: increment stock back. Mirror of reserveStock; used when an
        // order that had reserved stock is cancelled/rejected before the kitchen
        // commits to it.
        ProductRepository_1.prototype.releaseStock = function (branchId, items, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var productIds, rows, present, missing, bindings, placeholders;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Early return to prevent SQL syntax errors on empty arrays
                            if (items.length === 0) {
                                return [2 /*return*/, { ok: true, missing: [] }];
                            }
                            productIds = items.map(function (i) { return i.productId; });
                            return [4 /*yield*/, trx('product_branch_details')
                                    .where('branch_id', branchId)
                                    .whereIn('product_id', productIds)
                                    .select('product_id')
                                    .forUpdate()];
                        case 1:
                            rows = _a.sent();
                            present = new Set(rows.map(function (r) { return Number(r.product_id); }));
                            missing = productIds.filter(function (id) { return !present.has(id); });
                            if (missing.length > 0)
                                return [2 /*return*/, { ok: false, missing: missing }];
                            bindings = [];
                            placeholders = items
                                .map(function (item) {
                                bindings.push(item.productId, item.quantity);
                                // Explicit casts prevent Postgres from guessing the wrong data type
                                return '(CAST(? AS BIGINT), CAST(? AS INT))';
                            })
                                .join(', ');
                            // Add branchId as the final parameter for the WHERE clause
                            bindings.push(branchId);
                            // 3. Execute the single atomic bulk addition
                            return [4 /*yield*/, trx.raw("\n    UPDATE product_branch_details AS p\n    SET stock = p.stock + v.quantity\n    FROM (VALUES ".concat(placeholders, ") AS v(product_id, quantity)\n    WHERE p.branch_id = ? AND p.product_id = v.product_id;\n  "), bindings)];
                        case 2:
                            // 3. Execute the single atomic bulk addition
                            _a.sent();
                            return [2 /*return*/, { ok: true, missing: [] }];
                    }
                });
            });
        };
        return ProductRepository_1;
    }());
    __setFunctionName(_classThis, "ProductRepository");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductRepository = _classThis;
}();
exports.ProductRepository = ProductRepository;
