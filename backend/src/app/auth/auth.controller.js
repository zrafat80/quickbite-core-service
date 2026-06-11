"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.AuthController = void 0;
var openapi = require("@nestjs/swagger");
// src/app/auth/auth.controller.ts
var common_1 = require("@nestjs/common");
var time_utils_1 = require("../../../../../../../../../../../src/pkg/utils/time.utils");
var idempotency_interceptor_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.interceptor");
var idempotency_decorator_1 = require("../../../../../../../../../../../src/lib/idempotency/idempotency.decorator");
var AuthController = function () {
    var _classDecorators = [(0, common_1.Controller)('auth')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _register_decorators;
    var _login_decorators;
    var _forgotPassword_decorators;
    var _resetPassword_decorators;
    var _acceptInvite_decorators;
    var _refresh_decorators;
    var AuthController = _classThis = /** @class */ (function () {
        function AuthController_1(authService) {
            this.authService = (__runInitializers(this, _instanceExtraInitializers), authService);
        }
        AuthController_1.prototype.register = function (body, res) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.register(body)];
                        case 1:
                            result = _a.sent();
                            res.cookie('access_token', result.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                maxAge: time_utils_1.TimeUtils.hoursToMs(1),
                            });
                            // 3. Set the Refresh Token Cookie (7 days)
                            res.cookie('refresh_token', result.refreshToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                maxAge: time_utils_1.TimeUtils.daysToMs(7),
                                path: '/api/auth/refresh', // Brilliant move! Only sends to the refresh route.
                            });
                            // 2. Respond (NestJS automatically sets status to 201 for @Post requests)[cite: 9]
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        AuthController_1.prototype.login = function (body, res) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.login(body)];
                        case 1:
                            result = _a.sent();
                            // 2. Set the Access Token Cookie (1 hour)
                            res.cookie('access_token', result.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                maxAge: time_utils_1.TimeUtils.hoursToMs(1),
                            });
                            // 3. Set the Refresh Token Cookie (7 days)
                            res.cookie('refresh_token', result.refreshToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                maxAge: time_utils_1.TimeUtils.daysToMs(7),
                                path: '/api/auth/refresh', // Brilliant move! Only sends to the refresh route.
                            });
                            // 4. Return the user data (you don't need to send the tokens in the JSON body anymore!)
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        AuthController_1.prototype.forgotPassword = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.authService.forgotPassword(body)];
                });
            });
        };
        AuthController_1.prototype.resetPassword = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.authService.resetPassword(body)];
                });
            });
        };
        AuthController_1.prototype.acceptInvite = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // The ValidationPipe already validated 'data' before this line runs!
                        return [4 /*yield*/, this.authService.acceptInvite(data)];
                        case 1:
                            // The ValidationPipe already validated 'data' before this line runs!
                            _a.sent();
                            // NestJS automatically serializes returns into JSON responses!
                            return [2 /*return*/, {
                                    message: 'Invitation accepted successfully, please login again',
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.refresh = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var refreshToken, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
                            if (!refreshToken) {
                                throw new common_1.UnauthorizedException('No refresh token provided');
                            }
                            return [4 /*yield*/, this.authService.refreshAccessToken(refreshToken)];
                        case 1:
                            result = _b.sent();
                            // 3. Set the new Access Token as an httpOnly cookie, refreshing their 1-hour session
                            res.cookie('access_token', result.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                maxAge: time_utils_1.TimeUtils.hoursToMs(1), // 1 Hour
                            });
                            // 4. Return exactly the JSON structure you requested
                            return [2 /*return*/, {
                                    message: 'success',
                                }];
                    }
                });
            });
        };
        return AuthController_1;
    }());
    __setFunctionName(_classThis, "AuthController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _register_decorators = [(0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Post)('register'), openapi.ApiResponse({ status: 201 })];
        _login_decorators = [(0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: false }), (0, common_1.Post)('login'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), openapi.ApiResponse({ status: common_1.HttpStatus.OK })];
        _forgotPassword_decorators = [(0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Post)('forgot-password'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), openapi.ApiResponse({ status: common_1.HttpStatus.OK })];
        _resetPassword_decorators = [(0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Post)('reset-password'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object })];
        _acceptInvite_decorators = [(0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: true }), (0, common_1.Post)('accept-invite'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), openapi.ApiResponse({ status: common_1.HttpStatus.OK })];
        _refresh_decorators = [(0, common_1.Post)('refresh'), (0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor), (0, idempotency_decorator_1.Idempotency)({ strict: false }), (0, common_1.HttpCode)(common_1.HttpStatus.OK), openapi.ApiResponse({ status: common_1.HttpStatus.OK })];
        __esDecorate(_classThis, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: function (obj) { return "register" in obj; }, get: function (obj) { return obj.register; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: function (obj) { return "login" in obj; }, get: function (obj) { return obj.login; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: function (obj) { return "forgotPassword" in obj; }, get: function (obj) { return obj.forgotPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: function (obj) { return "resetPassword" in obj; }, get: function (obj) { return obj.resetPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptInvite_decorators, { kind: "method", name: "acceptInvite", static: false, private: false, access: { has: function (obj) { return "acceptInvite" in obj; }, get: function (obj) { return obj.acceptInvite; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _refresh_decorators, { kind: "method", name: "refresh", static: false, private: false, access: { has: function (obj) { return "refresh" in obj; }, get: function (obj) { return obj.refresh; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
}();
exports.AuthController = AuthController;
