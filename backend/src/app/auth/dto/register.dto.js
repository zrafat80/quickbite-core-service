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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDTO = exports.RegisterRestaurantDTO = void 0;
var openapi = require("@nestjs/swagger");
// src/app/auth/dto/register.dto.ts
var class_validator_1 = require("class-validator");
var enums_1 = require("../../user/enums");
var class_transformer_1 = require("class-transformer");
var RegisterRestaurantDTO = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _logoURL_decorators;
    var _logoURL_initializers = [];
    var _logoURL_extraInitializers = [];
    var _primaryCountry_decorators;
    var _primaryCountry_initializers = [];
    var _primaryCountry_extraInitializers = [];
    return _a = /** @class */ (function () {
            function RegisterRestaurantDTO() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.logoURL = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _logoURL_initializers, void 0));
                this.primaryCountry = (__runInitializers(this, _logoURL_extraInitializers), __runInitializers(this, _primaryCountry_initializers, void 0));
                __runInitializers(this, _primaryCountry_extraInitializers);
            }
            RegisterRestaurantDTO._OPENAPI_METADATA_FACTORY = function () {
                return { name: { required: true, type: function () { return String; }, minLength: 1 }, logoURL: { required: false, type: function () { return String; } }, primaryCountry: { required: true, type: function () { return String; }, minLength: 1 } };
            };
            return RegisterRestaurantDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1)];
            _logoURL_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _primaryCountry_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _logoURL_decorators, { kind: "field", name: "logoURL", static: false, private: false, access: { has: function (obj) { return "logoURL" in obj; }, get: function (obj) { return obj.logoURL; }, set: function (obj, value) { obj.logoURL = value; } }, metadata: _metadata }, _logoURL_initializers, _logoURL_extraInitializers);
            __esDecorate(null, null, _primaryCountry_decorators, { kind: "field", name: "primaryCountry", static: false, private: false, access: { has: function (obj) { return "primaryCountry" in obj; }, get: function (obj) { return obj.primaryCountry; }, set: function (obj, value) { obj.primaryCountry = value; } }, metadata: _metadata }, _primaryCountry_initializers, _primaryCountry_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.RegisterRestaurantDTO = RegisterRestaurantDTO;
var RegisterDTO = function () {
    var _a;
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _restaurant_decorators;
    var _restaurant_initializers = [];
    var _restaurant_extraInitializers = [];
    return _a = /** @class */ (function () {
            function RegisterDTO() {
                this.email = __runInitializers(this, _email_initializers, void 0);
                this.phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.name = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.password = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _password_initializers, void 0));
                this.role = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _role_initializers, void 0));
                this.restaurant = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _restaurant_initializers, void 0));
                __runInitializers(this, _restaurant_extraInitializers);
            }
            RegisterDTO._OPENAPI_METADATA_FACTORY = function () {
                return { email: { required: true, type: function () { return String; }, format: "email" }, phone: { required: true, type: function () { return String; }, minLength: 10, maxLength: 11 }, name: { required: true, type: function () { return String; }, minLength: 1 }, password: { required: true, type: function () { return String; } }, role: { required: true, enum: require("../../user/enums").SystemRole }, restaurant: { required: false, type: function () { return require("./register.dto").RegisterRestaurantDTO; } } };
            };
            return RegisterDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, class_validator_1.IsEmail)()];
            _phone_decorators = [(0, class_validator_1.MinLength)(10), (0, class_validator_1.MaxLength)(11)];
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1)];
            _password_decorators = [(0, class_validator_1.IsStrongPassword)({
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 0,
                }, {
                    message: 'Password is not strong enough. It must contain at least 8 characters, one uppercase letter, one lowercase letter, one number.',
                })];
            _role_decorators = [(0, class_validator_1.IsEnum)(enums_1.SystemRole)];
            _restaurant_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(function () { return RegisterRestaurantDTO; })];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _restaurant_decorators, { kind: "field", name: "restaurant", static: false, private: false, access: { has: function (obj) { return "restaurant" in obj; }, get: function (obj) { return obj.restaurant; }, set: function (obj, value) { obj.restaurant = value; } }, metadata: _metadata }, _restaurant_initializers, _restaurant_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.RegisterDTO = RegisterDTO;
