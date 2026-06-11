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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
// src/app/auth/auth.module.ts
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var auth_controller_1 = require("./auth.controller");
var auth_service_1 = require("./auth.service");
var auth_utils_service_1 = require("./auth-utils.service");
var password_reset_repository_1 = require("./repository/password-reset.repository");
var user_module_1 = require("../../../../../../../../../../../src/app/user/user.module");
var restaurant_module_1 = require("../../../../../../../../../../../src/app/restaurant/restaurant.module");
var email_module_1 = require("../../../../../../../../../../../src/lib/email/email.module");
var AuthModule = function () {
    var _classDecorators = [(0, common_1.Global)(), (0, common_1.Module)({
            // 1. Imports: We need ConfigModule so AuthUtilsService can use ConfigService!
            imports: [config_1.ConfigModule, email_module_1.EmailModule, user_module_1.UserModule, (0, common_1.forwardRef)(function () { return restaurant_module_1.RestaurantModule; })],
            // 2. Controllers: The entry points for your HTTP requests
            controllers: [auth_controller_1.AuthController],
            // 3. Providers: All the services and repositories this module needs to do its job
            providers: [auth_service_1.AuthService, auth_utils_service_1.AuthUtilsService, password_reset_repository_1.PasswordResetRepository],
            // 4. Exports: (Optional) If another module ever needs AuthService, you would put it here!
            exports: [auth_service_1.AuthService, auth_utils_service_1.AuthUtilsService],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthModule = _classThis = /** @class */ (function () {
        function AuthModule_1() {
        }
        return AuthModule_1;
    }());
    __setFunctionName(_classThis, "AuthModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthModule = _classThis;
}();
exports.AuthModule = AuthModule;
