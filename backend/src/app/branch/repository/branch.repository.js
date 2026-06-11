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
exports.BranchRepository = void 0;
var common_1 = require("@nestjs/common");
var branch_entity_1 = require("../entity/branch.entity"); // Adjust path if needed
var cursor_pagination_1 = require("../../../lib/pagination/cursor-pagination"); // Adjust path
var BRANCH_COLUMNS = [
    'id',
    'restaurant_id',
    'country_code',
    'address_text',
    'label',
    'lat',
    'lng',
    'is_active',
    'opens_at',
    'closes_at',
    'accept_orders',
    'created_at',
    'updated_at',
    'delivery_radius',
    'currency',
    'commission',
    'delivery_fee',
    'location',
];
var BranchRepository = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BranchRepository = _classThis = /** @class */ (function () {
        // 1. Inject Knex connection instead of global import
        function BranchRepository_1(knex) {
            this.knex = knex;
        }
        // 2. Make toEntity a private class method
        BranchRepository_1.prototype.toEntity = function (row) {
            return new branch_entity_1.Branch({
                id: row.id,
                restaurantId: row.restaurant_id,
                countryCode: row.country_code,
                addressText: row.address_text,
                label: row.label,
                lat: row.lat,
                lng: row.lng,
                isActive: row.is_active,
                opensAt: row.opens_at,
                closesAt: row.closes_at,
                acceptOrders: row.accept_orders,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                deliveryRadius: row.delivery_radius,
                currency: row.currency,
                commission: row.commission,
                deliveryFee: row.delivery_fee !== undefined ? Number(row.delivery_fee) : 0,
                location: row.location,
            });
        };
        // For /api/internal/branches/:id — joins restaurants for status + name.
        BranchRepository_1.prototype.findInternalById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('restaurant_branches as b')
                                .join('restaurants as r', 'b.restaurant_id', 'r.id')
                                .select('b.id', 'b.restaurant_id', 'b.country_code', 'b.is_active', 'b.accept_orders', 'b.delivery_fee', 'b.commission', 'b.currency', 'b.lat', 'b.lng', 'b.label', 'b.address_text', 'r.status as restaurant_status', 'r.name as restaurant_name')
                                .where('b.id', id)
                                .first()];
                        case 1:
                            row = _a.sent();
                            if (!row)
                                return [2 /*return*/, null];
                            return [2 /*return*/, {
                                    id: Number(row.id),
                                    restaurantId: Number(row.restaurant_id),
                                    restaurantStatus: row.restaurant_status,
                                    restaurantName: row.restaurant_name,
                                    countryCode: row.country_code,
                                    isActive: row.is_active,
                                    acceptOrders: row.accept_orders,
                                    deliveryFee: Number(row.delivery_fee),
                                    commission: Number(row.commission),
                                    currency: row.currency,
                                    lat: Number(row.lat),
                                    lng: Number(row.lng),
                                    label: row.label,
                                    addressText: row.address_text,
                                }];
                    }
                });
            });
        };
        BranchRepository_1.prototype.findInternalMany = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                var rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (ids.length === 0)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, this.knex('restaurant_branches as b')
                                    .join('restaurants as r', 'b.restaurant_id', 'r.id')
                                    .select('b.id', 'b.restaurant_id', 'b.country_code', 'b.is_active', 'b.accept_orders', 'b.delivery_fee', 'b.commission', 'b.currency', 'b.lat', 'b.lng', 'b.label', 'b.address_text', 'r.status as restaurant_status', 'r.name as restaurant_name')
                                    .whereIn('b.id', ids)];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, rows.map(function (row) { return ({
                                    id: Number(row.id),
                                    restaurantId: Number(row.restaurant_id),
                                    restaurantStatus: row.restaurant_status,
                                    restaurantName: row.restaurant_name,
                                    countryCode: row.country_code,
                                    isActive: row.is_active,
                                    acceptOrders: row.accept_orders,
                                    deliveryFee: Number(row.delivery_fee),
                                    commission: Number(row.commission),
                                    currency: row.currency,
                                    lat: Number(row.lat),
                                    lng: Number(row.lng),
                                    label: row.label,
                                    addressText: row.address_text,
                                }); })];
                    }
                });
            });
        };
        // 3. Safe NestJS Transaction Pattern
        BranchRepository_1.prototype.createBranch = function (data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, row;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('restaurant_branches')
                                    .insert({
                                    restaurant_id: data.restaurantId,
                                    country_code: data.countryCode,
                                    address_text: data.addressText,
                                    label: data.label,
                                    lat: data.lat,
                                    lng: data.lng,
                                    is_active: (_a = data.isActive) !== null && _a !== void 0 ? _a : true, // Good practice to fallback to true
                                    opens_at: data.opensAt,
                                    closes_at: data.closesAt,
                                    accept_orders: (_b = data.acceptOrders) !== null && _b !== void 0 ? _b : true,
                                    delivery_radius: data.deliveryRadius,
                                    currency: data.currency,
                                    commission: data.commission,
                                    // ✨ Removed created_at and updated_at because defaultTo(knex.fn.now()) handles it!
                                    // ✨ Location is auto-generated by the DB per your brilliant migration!
                                })
                                    .returning(BRANCH_COLUMNS)];
                        case 1:
                            row = (_c.sent())[0];
                            return [2 /*return*/, this.toEntity(row)];
                    }
                });
            });
        };
        // 4. The PostGIS Query (UPGRADED WITH PAGINATION)
        BranchRepository_1.prototype.findNearbyBranches = function (lat, lng, pagination, filters) {
            return __awaiter(this, void 0, void 0, function () {
                var query, rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = this.knex('restaurant_branches as b')
                                .join('restaurants as r', 'b.restaurant_id', 'r.id')
                                .select('b.id', 'b.restaurant_id', 'b.address_text', 'b.label', 'b.lat', 'b.lng', 'b.is_active', 'b.accept_orders', 'b.currency', 'b.created_at', // Mapped for cursor
                            'r.name as restaurant_name', 'r.logo_url as restaurant_logo_url')
                                .where('b.is_active', true)
                                .andWhere('r.status', 'active');
                            // Inject the raw PostGIS math!
                            query = query.whereRaw('ST_DWithin(b.location, ST_MakePoint(?, ?)::geography, b.delivery_radius * 1000)', [lng, lat]);
                            // Apply the pagination engine!
                            query = (0, cursor_pagination_1.applyFilters)(query, filters);
                            query = (0, cursor_pagination_1.applyCursorPagination)(query, pagination);
                            return [4 /*yield*/, query];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, rows.map(function (row) { return ({
                                    id: row.id,
                                    restaurantId: Number(row.restaurant_id),
                                    addressText: row.address_text,
                                    label: row.label,
                                    lat: Number(row.lat),
                                    lng: Number(row.lng),
                                    isActive: row.is_active,
                                    acceptOrders: row.accept_orders,
                                    currency: row.currency,
                                    createdAt: row.created_at, // Map for the cursor!
                                    restaurantName: row.restaurant_name,
                                    restaurantLogoUrl: row.restaurant_logo_url,
                                }); })];
                    }
                });
            });
        };
        // 📍 Helper to find a single branch
        BranchRepository_1.prototype.findById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('restaurant_branches').where('id', id).first()];
                        case 1:
                            row = _a.sent();
                            if (!row)
                                return [2 /*return*/, null];
                            return [2 /*return*/, this.toEntity(row)];
                    }
                });
            });
        };
        // 📍 GET /restaurants/:restaurantId/branches (UPGRADED WITH PAGINATION)
        BranchRepository_1.prototype.findBranchesByRestaurant = function (restaurantId, pagination, filters) {
            return __awaiter(this, void 0, void 0, function () {
                var query, rows;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = this.knex('restaurant_branches').where('restaurant_id', restaurantId);
                            // Attach our engine
                            query = (0, cursor_pagination_1.applyFilters)(query, filters);
                            query = (0, cursor_pagination_1.applyCursorPagination)(query, pagination);
                            return [4 /*yield*/, query];
                        case 1:
                            rows = _a.sent();
                            // We reuse your brilliant private toEntity() mapper to convert to camelCase!
                            return [2 /*return*/, rows.map(function (row) { return _this.toEntity(row); })];
                    }
                });
            });
        };
        // 📍 PATCH /branches/:id (Owner/Admin)
        BranchRepository_1.prototype.updateBranch = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var updateData, updatedRow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            updateData = { updated_at: this.knex.fn.now() };
                            if (data.label !== undefined)
                                updateData.label = data.label;
                            if (data.addressText !== undefined)
                                updateData.address_text = data.addressText;
                            if (data.lat !== undefined)
                                updateData.lat = data.lat;
                            if (data.lng !== undefined)
                                updateData.lng = data.lng;
                            if (data.opensAt !== undefined)
                                updateData.opens_at = data.opensAt;
                            if (data.closesAt !== undefined)
                                updateData.closes_at = data.closesAt;
                            if (data.deliveryRadius !== undefined)
                                updateData.delivery_radius = data.deliveryRadius;
                            if (data.currency !== undefined)
                                updateData.currency = data.currency;
                            if (data.acceptOrders !== undefined)
                                updateData.accept_orders = data.acceptOrders;
                            return [4 /*yield*/, this.knex('restaurant_branches')
                                    .where('id', id)
                                    .update(updateData)
                                    .returning('*')];
                        case 1:
                            updatedRow = (_a.sent())[0];
                            return [2 /*return*/, this.toEntity(updatedRow)];
                    }
                });
            });
        };
        // 📍 PATCH /branches/:id/status (Admin Only)
        BranchRepository_1.prototype.updateBranchStatus = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var updateData, updatedRow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            updateData = { updated_at: this.knex.fn.now() };
                            if (data.isActive !== undefined)
                                updateData.is_active = data.isActive;
                            if (data.commission !== undefined)
                                updateData.commission = data.commission;
                            return [4 /*yield*/, this.knex('restaurant_branches')
                                    .where('id', id)
                                    .update(updateData)
                                    .returning(['id', 'is_active', 'accept_orders', 'commission'])];
                        case 1:
                            updatedRow = (_a.sent())[0];
                            // Return the exact shape requested
                            return [2 /*return*/, {
                                    id: updatedRow.id,
                                    isActive: updatedRow.is_active,
                                    acceptOrders: updatedRow.accept_orders,
                                    commission: Number(updatedRow.commission),
                                }];
                    }
                });
            });
        };
        BranchRepository_1.prototype.verifyBranchesBelongToRestaurant = function (branchIds, restaurantId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, result, foundCount;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('restaurant_branches')
                                    .whereIn('id', branchIds)
                                    .andWhere('restaurant_id', restaurantId)
                                    .count('id as count')
                                    .first()];
                        case 1:
                            result = _a.sent();
                            foundCount = Number((result === null || result === void 0 ? void 0 : result.count) || 0);
                            return [2 /*return*/, foundCount === branchIds.length];
                    }
                });
            });
        };
        return BranchRepository_1;
    }());
    __setFunctionName(_classThis, "BranchRepository");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BranchRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BranchRepository = _classThis;
}();
exports.BranchRepository = BranchRepository;
