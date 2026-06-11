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
exports.UserService = void 0;
// src/user/user.service.ts
var common_1 = require("@nestjs/common");
var user_constants_1 = require("./user.constants");
var UserService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UserService = _classThis = /** @class */ (function () {
        function UserService_1(userRepo, authUtils) {
            this.userRepo = userRepo;
            this.authUtils = authUtils;
        }
        // Expose a clean method to check if a user exists
        UserService_1.prototype.checkUserExists = function (email, phone, trx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.userRepo.findUserExistsByEmailOrPhone(email, phone)];
                });
            });
        };
        // Expose a clean method to create a user
        UserService_1.prototype.createUser = function (userData, trx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.userRepo.createUser(userData, trx)];
                });
            });
        };
        // We will need this one for the login route next!
        UserService_1.prototype.findUserByEmail = function (email, trx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.userRepo.findUserByEmail(email, trx)];
                });
            });
        };
        UserService_1.prototype.updatePassword = function (id, password, trx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.userRepo.updateUserPassword(id, password, trx);
                    return [2 /*return*/];
                });
            });
        };
        UserService_1.prototype.getByUserId = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userRepo.findUserById(userId)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                // You can import AUTH_ERRORS here, or just use a clear string
                                throw new common_1.NotFoundException(user_constants_1.USER_ERRORS.USER_NOT_FOUND);
                            }
                            // Return the clean, sanitized profile
                            return [2 /*return*/, {
                                    id: user.id,
                                    email: user.email,
                                    name: user.name,
                                    phone: user.phone,
                                    systemRole: user.systemRole,
                                }];
                    }
                });
            });
        };
        UserService_1.prototype.updateProfile = function (userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var updatedUser;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // 1. Update the database
                        return [4 /*yield*/, this.userRepo.updateProfile(userId, data)];
                        case 1:
                            // 1. Update the database
                            _a.sent();
                            return [4 /*yield*/, this.getByUserId(userId)];
                        case 2:
                            updatedUser = _a.sent();
                            // 3. Return the exact JSON structure your frontend expects
                            return [2 /*return*/, {
                                    message: user_constants_1.USER_MESSAGES.PROFILE_UPDATED,
                                    user: updatedUser,
                                }];
                    }
                });
            });
        };
        UserService_1.prototype.hashAndCreateUser = function (data_1, role_1, trx_1) {
            return __awaiter(this, arguments, void 0, function (data, role, trx, now) {
                var existing, hashedPassword;
                if (now === void 0) { now = new Date(); }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userRepo.findUserExistsByEmailOrPhone(data.email, data.phone, trx)];
                        case 1:
                            existing = _a.sent();
                            // 2. If exists, throw standard ConflictException
                            if (existing) {
                                throw new common_1.ConflictException(user_constants_1.USER_ERRORS.USER_ALREADY_EXISTS);
                            }
                            return [4 /*yield*/, this.authUtils.hashPassword(data.password)];
                        case 2:
                            hashedPassword = _a.sent();
                            return [4 /*yield*/, this.userRepo.createUser({
                                    email: data.email,
                                    phone: data.phone,
                                    name: data.name,
                                    passwordHash: hashedPassword,
                                    systemRole: role,
                                    createdAt: now,
                                    updatedAt: now,
                                }, trx)];
                        case 3: 
                        // 4. Create user
                        return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        return UserService_1;
    }());
    __setFunctionName(_classThis, "UserService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserService = _classThis;
}();
exports.UserService = UserService;
