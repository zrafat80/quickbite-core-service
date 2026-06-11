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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantMemberRepository = void 0;
var common_1 = require("@nestjs/common");
var restaurant_member_entity_1 = require("../entity/restaurant-member.entity");
var enums_1 = require("../enums"); // Adjust path if needed
var MEMBER_COLUMNS = [
    'id',
    'restaurant_id',
    'user_id',
    'role_id',
    'status',
    'created_at',
    'updated_at',
];
var RestaurantMemberRepository = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RestaurantMemberRepository = _classThis = /** @class */ (function () {
        // 🌟 Inject the Knex connection instead of hardcoding it!
        function RestaurantMemberRepository_1(knex) {
            this.knex = knex;
        }
        // 🌟 The Translator (Private to the class)
        RestaurantMemberRepository_1.prototype.toEntity = function (row) {
            return new restaurant_member_entity_1.RestaurantMember({
                id: row.id,
                restaurantId: row.restaurant_id,
                userId: row.user_id,
                roleId: row.role_id,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            });
        };
        RestaurantMemberRepository_1.prototype.createRestaurantMember = function (data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('restaurant_members')
                                    .insert({
                                    restaurant_id: data.restaurantId,
                                    user_id: data.userId,
                                    role_id: data.roleId,
                                    status: data.status || enums_1.MemberStatus.INACTIVE,
                                    created_at: data.createdAt,
                                    updated_at: data.updatedAt,
                                })
                                    .returning(MEMBER_COLUMNS)];
                        case 1:
                            row = (_a.sent())[0];
                            return [2 /*return*/, this.toEntity(row)];
                    }
                });
            });
        };
        RestaurantMemberRepository_1.prototype.activateMemberByUserId = function (userId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('restaurant_members').where({ user_id: userId }).update({
                                    status: enums_1.MemberStatus.ACTIVE,
                                    updated_at: this.knex.fn.now(), // 🌟 Better to let PostgreSQL handle the exact timestamp
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        RestaurantMemberRepository_1.prototype.findRestaurantMemberWithRole = function (userId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('restaurant_members as rm')
                                .select('rm.restaurant_id', 'rm.id', 'r.name as roleName')
                                .leftJoin('roles as r', 'rm.role_id', 'r.id')
                                .where('rm.user_id', userId)
                                .andWhere('rm.status', enums_1.MemberStatus.ACTIVE)
                                .first()];
                        case 1:
                            row = _a.sent();
                            if (!row)
                                return [2 /*return*/, row];
                            return [2 /*return*/, {
                                    member: this.toEntity(row),
                                    roleName: row.roleName,
                                }];
                    }
                });
            });
        };
        RestaurantMemberRepository_1.prototype.findMembersByRestaurantId = function (restaurantId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('restaurant_members as rm')
                                    .select('rm.id', 'rm.user_id as userId', 'u.email', 'u.name', 'u.phone', 'r.name as role', 'r.display_name as roleDisplayName', 'rm.status')
                                    .join('users as u', 'rm.user_id', 'u.id')
                                    .join('roles as r', 'rm.role_id', 'r.id')
                                    .where('rm.restaurant_id', restaurantId)];
                        case 1: 
                        // Joins restaurant_members, users, and roles to return a flat list for the dashboard
                        return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        RestaurantMemberRepository_1.prototype.findMemberWithRoleName = function (memberId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, prefixedColumns, row;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            db = trx || this.knex;
                            prefixedColumns = MEMBER_COLUMNS.map(function (col) { return "rm.".concat(col); });
                            return [4 /*yield*/, (_a = db('restaurant_members as rm'))
                                    .select.apply(_a, __spreadArray(__spreadArray([], prefixedColumns, false), ['r.name as roleName'], false)).join('roles as r', 'rm.role_id', 'r.id')
                                    .where('rm.id', memberId)
                                    .first()];
                        case 1:
                            row = _b.sent();
                            if (!row)
                                return [2 /*return*/, null];
                            return [2 /*return*/, {
                                    member: this.toEntity(row),
                                    roleName: row.roleName,
                                }];
                    }
                });
            });
        };
        RestaurantMemberRepository_1.prototype.updateMember = function (memberId, data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, updateData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            updateData = { updated_at: this.knex.fn.now() };
                            if (data.roleId)
                                updateData.role_id = data.roleId;
                            if (data.status)
                                updateData.status = data.status;
                            return [4 /*yield*/, db('restaurant_members').where('id', memberId).update(updateData)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        RestaurantMemberRepository_1.prototype.deleteMember = function (memberId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var transaction, _a, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = trx;
                            if (_a) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.knex.transaction()];
                        case 1:
                            _a = (_b.sent());
                            _b.label = 2;
                        case 2:
                            transaction = _a;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 8, , 11]);
                            // 1. Delete Foreign Key constraints first (member_branches)
                            return [4 /*yield*/, transaction('member_branches')
                                    .where('member_id', memberId)
                                    .delete()];
                        case 4:
                            // 1. Delete Foreign Key constraints first (member_branches)
                            _b.sent();
                            // 2. Delete the main record
                            return [4 /*yield*/, transaction('restaurant_members').where('id', memberId).delete()];
                        case 5:
                            // 2. Delete the main record
                            _b.sent();
                            if (!!trx) return [3 /*break*/, 7];
                            return [4 /*yield*/, transaction.commit()];
                        case 6:
                            _b.sent(); // Only commit if we created the transaction here
                            _b.label = 7;
                        case 7: return [3 /*break*/, 11];
                        case 8:
                            error_1 = _b.sent();
                            if (!!trx) return [3 /*break*/, 10];
                            return [4 /*yield*/, transaction.rollback()];
                        case 9:
                            _b.sent();
                            _b.label = 10;
                        case 10: throw error_1;
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        return RestaurantMemberRepository_1;
    }());
    __setFunctionName(_classThis, "RestaurantMemberRepository");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RestaurantMemberRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RestaurantMemberRepository = _classThis;
}();
exports.RestaurantMemberRepository = RestaurantMemberRepository;
