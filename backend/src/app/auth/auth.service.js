"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.AuthService = void 0;
// src/app/auth/auth.service.ts
var common_1 = require("@nestjs/common");
var enums_1 = require("../user/enums");
var auth_constants_1 = require("./auth.constants");
var time_utils_1 = require("../../../../../../../../../../../src/pkg/utils/time.utils");
var password_reset_1 = require("./templates/password-reset");
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        // 1. Inject the dependencies via the constructor
        function AuthService_1(knex, userService, authUtils, memberService, passwordResetRepo, emailProvider, restaurantService) {
            this.knex = knex;
            this.userService = userService;
            this.authUtils = authUtils;
            this.memberService = memberService;
            this.passwordResetRepo = passwordResetRepo;
            this.emailProvider = emailProvider;
            this.restaurantService = restaurantService;
        }
        AuthService_1.prototype.register = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var trx, restaurant, user, restaurantMemberInfo, err_1, payload, accessToken, refreshToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (data.role === enums_1.SystemRole.SYSTEM_ADMIN) {
                                throw new common_1.ForbiddenException(auth_constants_1.AUTH_ERRORS.SYSTEM_ADMIN_SIGNUP_FORBIDDEN);
                            }
                            return [4 /*yield*/, this.knex.transaction()];
                        case 1:
                            trx = _a.sent();
                            restaurantMemberInfo = {};
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 8, , 10]);
                            return [4 /*yield*/, this.userService.hashAndCreateUser(data, data.role, trx)];
                        case 3:
                            // 🌟 Use the extracted helper to do the heavy security lifting
                            user = _a.sent();
                            if (!(data.role == enums_1.SystemRole.RESTAURANT_USER)) return [3 /*break*/, 6];
                            // Check if it's undefined, null, OR if it's missing the required 'name' field
                            if (!data.restaurant || !data.restaurant.name) {
                                throw new common_1.BadRequestException('Valid restaurant data (including name) is required for this role');
                            }
                            return [4 /*yield*/, this.restaurantService.create(user.id, data.restaurant, trx)];
                        case 4:
                            restaurant = _a.sent();
                            return [4 /*yield*/, this.memberService.createOwnerMember(restaurant.id, user.id, trx)];
                        case 5:
                            _a.sent();
                            restaurantMemberInfo = {
                                restaurantId: restaurant.id,
                                restaurantRole: 'owner',
                                branchIds: [],
                            };
                            _a.label = 6;
                        case 6: return [4 /*yield*/, trx.commit()];
                        case 7:
                            _a.sent();
                            return [3 /*break*/, 10];
                        case 8:
                            err_1 = _a.sent();
                            return [4 /*yield*/, trx.rollback()];
                        case 9:
                            _a.sent();
                            // 🛑 CRITICAL: Re-throw the error to stop execution!
                            throw err_1;
                        case 10:
                            payload = __assign({ userId: user.id, role: user.systemRole, email: user.email }, restaurantMemberInfo);
                            accessToken = this.authUtils.createAccessToken(payload);
                            refreshToken = this.authUtils.createRefreshToken(payload);
                            // Return tokens and sanitized user data
                            return [2 /*return*/, {
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    user: {
                                        id: user.id,
                                        email: user.email,
                                        phone: user.phone,
                                        systemRole: user.systemRole,
                                        createdAt: user.createdAt,
                                    },
                                    restaurant: restaurant,
                                }];
                    }
                });
            });
        };
        AuthService_1.prototype.login = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var user, match, restaurantMemberInfo, memberData, branchIds, payload, accessToken, refreshToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.findUserByEmail(data.email)];
                        case 1:
                            user = _a.sent();
                            // Security Best Practice: Use the exact same error for "User not found" and "Wrong password"
                            // This prevents hackers from guessing which emails exist in your database!
                            if (!user) {
                                throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERRORS.INVALID_CREDENTIALS);
                            }
                            return [4 /*yield*/, this.authUtils.comparePassword(data.password, user.passwordHash)];
                        case 2:
                            match = _a.sent();
                            if (!match) {
                                throw new common_1.UnauthorizedException(auth_constants_1.AUTH_ERRORS.INVALID_CREDENTIALS);
                            }
                            restaurantMemberInfo = {};
                            if (!(user.systemRole == enums_1.SystemRole.RESTAURANT_USER)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.memberService.findRestaurantMemberWithRole(user.id)];
                        case 3:
                            memberData = _a.sent();
                            branchIds = {};
                            if (!memberData) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.memberService.findBranchIdsByMemberId(memberData.member.id)];
                        case 4:
                            branchIds = _a.sent();
                            restaurantMemberInfo = {
                                restaurantId: memberData.member.restaurantId,
                                restaurantRole: memberData.roleName,
                                branchIds: branchIds,
                            };
                            _a.label = 5;
                        case 5:
                            payload = __assign({ userId: user.id, role: user.systemRole, email: user.email }, restaurantMemberInfo);
                            accessToken = this.authUtils.createAccessToken(payload);
                            refreshToken = this.authUtils.createRefreshToken(payload);
                            // 4. Return the data perfectly formatted
                            return [2 /*return*/, {
                                    message: 'Login successful',
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    user: {
                                        id: user.id,
                                        email: user.email,
                                        phone: user.phone,
                                        systemRole: user.systemRole,
                                        createdAt: user.createdAt,
                                    },
                                }];
                    }
                });
            });
        };
        AuthService_1.prototype.forgotPassword = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var user, otp, emailContent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.findUserByEmail(data.email)];
                        case 1:
                            user = _a.sent();
                            // Security Best Practice: Silent return if user doesn't exist
                            if (!user) {
                                return [2 /*return*/, {
                                        message: 'If an account exists, a password reset email has been sent.',
                                    }];
                            }
                            return [4 /*yield*/, this.authUtils.generateAndSaveOTP(user.id, time_utils_1.TimeUtils.minutesToMs(15))];
                        case 2:
                            otp = _a.sent();
                            emailContent = (0, password_reset_1.passwordResetEmail)(otp);
                            // 4. Send the Email
                            return [4 /*yield*/, this.emailProvider.send(user.email, emailContent.subject, emailContent.html)];
                        case 3:
                            // 4. Send the Email
                            _a.sent();
                            return [2 /*return*/, {
                                    message: 'If an account exists, a password reset email has been sent.',
                                }];
                    }
                });
            });
        };
        AuthService_1.prototype.resetPassword = function (data, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, reset, inputOTPHash, hashedPassword;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.findUserByEmail(data.email, trx)];
                        case 1:
                            user = _a.sent();
                            // Use standard NestJS BadRequestException for invalid OTP flows
                            if (!user) {
                                throw new common_1.BadRequestException(auth_constants_1.AUTH_ERRORS.INVALID_CREDENTIALS); // Don't say "user not found"!
                            }
                            return [4 /*yield*/, this.passwordResetRepo.findLatestPasswordResetByUserId(user.id, trx)];
                        case 2:
                            reset = _a.sent();
                            if (!reset) {
                                throw new common_1.BadRequestException('Invalid or expired OTP');
                            }
                            inputOTPHash = this.authUtils.hashOTP(data.otp);
                            if (inputOTPHash !== reset.otpHash || reset.isExpired()) {
                                throw new common_1.BadRequestException(auth_constants_1.AUTH_ERRORS.INVALID_OTP);
                            }
                            return [4 /*yield*/, this.authUtils.hashPassword(data.newPassword)];
                        case 3:
                            hashedPassword = _a.sent();
                            // We will add this to your UserService in the next step!
                            return [4 /*yield*/, this.userService.updatePassword(user.id, hashedPassword, trx)];
                        case 4:
                            // We will add this to your UserService in the next step!
                            _a.sent();
                            // Mark the OTP as consumed so it can't be reused
                            return [4 /*yield*/, this.passwordResetRepo.updatePasswordResetConsumedAt(reset.id, trx)];
                        case 5:
                            // Mark the OTP as consumed so it can't be reused
                            _a.sent();
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        AuthService_1.prototype.refreshAccessToken = function (refreshToken) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, user, newPayload, newAccessToken, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            payload = this.authUtils.verifyRefreshToken(refreshToken);
                            return [4 /*yield*/, this.userService.getByUserId(payload.userId)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.UnauthorizedException('User account no longer exists');
                            }
                            newPayload = {
                                userId: payload.userId,
                                email: payload.email,
                                role: payload.role,
                                // for restaurant users only
                                restaurantId: payload.restaurantId,
                                restaurantRole: payload.restaurantRole,
                                branchIds: payload.branchIds,
                            };
                            newAccessToken = this.authUtils.createAccessToken(newPayload);
                            return [2 /*return*/, { accessToken: newAccessToken }];
                        case 2:
                            error_1 = _a.sent();
                            // If the refresh token is expired or manipulated, they must log in again.
                            throw new common_1.UnauthorizedException('Invalid or expired refresh token. Please log in again.');
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.acceptInvite = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var trx, user, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.knex.transaction()];
                        case 1:
                            trx = _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 6, , 8]);
                            return [4 /*yield*/, this.resetPassword(data, trx)];
                        case 3:
                            user = _a.sent();
                            // 2. Activate the Member
                            return [4 /*yield*/, this.memberService.activateInvite(user.id, trx)];
                        case 4:
                            // 2. Activate the Member
                            _a.sent();
                            // 3. Commit the transaction
                            return [4 /*yield*/, trx.commit()];
                        case 5:
                            // 3. Commit the transaction
                            _a.sent();
                            return [2 /*return*/, user];
                        case 6:
                            err_2 = _a.sent();
                            return [4 /*yield*/, trx.rollback()];
                        case 7:
                            _a.sent();
                            throw err_2; // Let NestJS automatically convert this to a 400/500 HTTP response
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
