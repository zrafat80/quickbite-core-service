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
exports.RestaurantRepository = void 0;
var common_1 = require("@nestjs/common");
var restaurant_entity_1 = require("../entity/restaurant.entity");
var cursor_pagination_1 = require("../../../lib/pagination/cursor-pagination"); // Adjust path
// Safe explicit column selection
var RESTAURANT_COLUMNS = [
    'id',
    'owner_id',
    'name',
    'logo_url',
    'status',
    'primary_country',
    'created_at',
    'updated_at',
    'status_updated_at',
];
var RestaurantRepository = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RestaurantRepository = _classThis = /** @class */ (function () {
        function RestaurantRepository_1(knex) {
            this.knex = knex;
        }
        RestaurantRepository_1.prototype.toEntity = function (row) {
            // Keeping it strictly mapped just like our Address Entity
            return new restaurant_entity_1.RestaurantEntity({
                id: row.id,
                ownerId: row.owner_id,
                name: row.name,
                logoURL: row.logo_url,
                status: row.status,
                primaryCountry: row.primary_country,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                statusUpdatedAt: row.status_updated_at,
            });
        };
        // 📍 UPGRADED WITH PAGINATION
        RestaurantRepository_1.prototype.findAllRestaurants = function (pagination, filters) {
            return __awaiter(this, void 0, void 0, function () {
                var query, rows;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = this.knex('restaurants').select(RESTAURANT_COLUMNS);
                            // Apply the pagination engine!
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
        RestaurantRepository_1.prototype.findRestaurantById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('restaurants')
                                .select(RESTAURANT_COLUMNS)
                                .where({ id: id })
                                .first()];
                        case 1:
                            row = _a.sent();
                            // 🛡️ Critical Fix: If the restaurant doesn't exist, row is undefined.
                            // If we pass undefined to toEntity, it crashes. This ternary safely handles it.
                            return [2 /*return*/, row ? this.toEntity(row) : undefined];
                    }
                });
            });
        };
        // We use `trx?: Knex.Transaction` to allow passing an active transaction,
        // perfectly replicating your `conn = db` logic but in the NestJS way!
        RestaurantRepository_1.prototype.createRestaurant = function (data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('restaurants')
                                    .insert({
                                    owner_id: data.ownerId,
                                    name: data.name,
                                    logo_url: data.logoURL,
                                    status: data.status || 'pending',
                                    primary_country: data.primaryCountry,
                                    // ✨ Note: We don't need to manually insert created_at, updated_at,
                                    // or status_updated_at because our database migration uses defaultTo(knex.fn.now())!
                                })
                                    .returning(RESTAURANT_COLUMNS)];
                        case 1:
                            row = (_a.sent())[0];
                            return [2 /*return*/, this.toEntity(row)];
                    }
                });
            });
        };
        RestaurantRepository_1.prototype.updateRestaurant = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var updatedRow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('restaurants')
                                .where('id', id)
                                .update({
                                name: data.name,
                                logo_url: data.logoURL, // Remember to map camelCase to snake_case for DB
                                primary_country: data.primaryCountry,
                                updated_at: new Date(),
                            })
                                .returning(RESTAURANT_COLUMNS)];
                        case 1:
                            updatedRow = (_a.sent())[0];
                            return [2 /*return*/, this.toEntity(updatedRow)];
                    }
                });
            });
        };
        RestaurantRepository_1.prototype.updateRestaurantStatus = function (id, status) {
            return __awaiter(this, void 0, void 0, function () {
                var updatedRow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('restaurants')
                                .where('id', id)
                                .update({
                                status_updated_at: new Date(),
                                updated_at: new Date(),
                            })
                                .returning(['id', 'status'])];
                        case 1:
                            updatedRow = (_a.sent())[0];
                            return [2 /*return*/, updatedRow];
                    }
                });
            });
        };
        return RestaurantRepository_1;
    }());
    __setFunctionName(_classThis, "RestaurantRepository");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RestaurantRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RestaurantRepository = _classThis;
}();
exports.RestaurantRepository = RestaurantRepository;
