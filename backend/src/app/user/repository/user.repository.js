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
exports.UserRepository = void 0;
// src/users/repository/user.repository.ts
var common_1 = require("@nestjs/common");
var user_entity_1 = require("../entity/user.entity");
var USER_COLUMNS = [
    'id',
    'email',
    'phone',
    'name',
    'password_hash',
    'system_role',
    'created_at',
    'updated_at',
    'deleted_at',
];
var UserRepository = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UserRepository = _classThis = /** @class */ (function () {
        // Keeping the columns locked safely inside the class
        // Injecting Knex perfectly instead of using a global db import
        function UserRepository_1(knex) {
            this.knex = knex;
        }
        // Encapsulated mapper to turn database rows into clean Domain Entities
        UserRepository_1.prototype.toEntity = function (row) {
            return new user_entity_1.User({
                id: row.id,
                email: row.email,
                phone: row.phone,
                name: row.name,
                passwordHash: row.password_hash, // snake_case to camelCase
                systemRole: row.system_role,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                deletedAt: row.deleted_at,
            });
        };
        UserRepository_1.prototype.findUserByEmail = function (email, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('users')
                                    .select(USER_COLUMNS)
                                    .where('email', email)
                                    .whereNull('deleted_at')
                                    .first()];
                        case 1:
                            row = _a.sent();
                            return [2 /*return*/, row ? this.toEntity(row) : undefined];
                    }
                });
            });
        };
        UserRepository_1.prototype.findUserExistsByEmailOrPhone = function (email, phone, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, this.knex.raw("\n            SELECT EXISTS (SELECT 1 FROM users WHERE email = ? OR phone = ?) AS \"exists\"\n        ", [email, phone])];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.rows[0].exists];
                    }
                });
            });
        };
        UserRepository_1.prototype.createUser = function (user, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('users')
                                    .insert({
                                    email: user.email,
                                    phone: user.phone,
                                    name: user.name,
                                    password_hash: user.passwordHash,
                                    system_role: user.systemRole,
                                    created_at: user.createdAt,
                                    updated_at: user.updatedAt,
                                })
                                    .returning(USER_COLUMNS)];
                        case 1:
                            row = (_a.sent())[0];
                            return [2 /*return*/, this.toEntity(row)];
                    }
                });
            });
        };
        UserRepository_1.prototype.updateUserPassword = function (id, password, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var db;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            db = trx || this.knex;
                            return [4 /*yield*/, db('users').where('id', id).update({ password_hash: password })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UserRepository_1.prototype.findUserById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex('users').where('id', id).first()];
                        case 1:
                            row = _a.sent();
                            // Assuming you have a toEntity mapper like in the password reset repo!
                            return [2 /*return*/, row ? this.toEntity(row) : undefined];
                    }
                });
            });
        };
        UserRepository_1.prototype.updateProfile = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var updatePayload;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            updatePayload = { updated_at: new Date() };
                            // Dynamically build the payload so we don't accidentally set things to undefined
                            if (data.name !== undefined)
                                updatePayload.name = data.name;
                            if (data.phone !== undefined)
                                updatePayload.phone = data.phone;
                            if (!(Object.keys(updatePayload).length > 1)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.knex('users').where('id', id).update(updatePayload)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        return UserRepository_1;
    }());
    __setFunctionName(_classThis, "UserRepository");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserRepository = _classThis;
}();
exports.UserRepository = UserRepository;
