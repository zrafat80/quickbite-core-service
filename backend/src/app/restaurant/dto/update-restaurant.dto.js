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
exports.UpdateRestaurantStatusDTO = exports.UpdateRestaurantDTO = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var enums_1 = require("../enums"); // Adjust path if needed
var UpdateRestaurantDTO = function () {
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
            function UpdateRestaurantDTO() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.logoURL = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _logoURL_initializers, void 0));
                this.primaryCountry = (__runInitializers(this, _logoURL_extraInitializers), __runInitializers(this, _primaryCountry_initializers, void 0));
                __runInitializers(this, _primaryCountry_extraInitializers);
            }
            UpdateRestaurantDTO._OPENAPI_METADATA_FACTORY = function () {
                return { name: { required: false, type: function () { return String; } }, logoURL: { required: false, type: function () { return String; } }, primaryCountry: { required: false, type: function () { return String; } } };
            };
            return UpdateRestaurantDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _logoURL_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _primaryCountry_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _logoURL_decorators, { kind: "field", name: "logoURL", static: false, private: false, access: { has: function (obj) { return "logoURL" in obj; }, get: function (obj) { return obj.logoURL; }, set: function (obj, value) { obj.logoURL = value; } }, metadata: _metadata }, _logoURL_initializers, _logoURL_extraInitializers);
            __esDecorate(null, null, _primaryCountry_decorators, { kind: "field", name: "primaryCountry", static: false, private: false, access: { has: function (obj) { return "primaryCountry" in obj; }, get: function (obj) { return obj.primaryCountry; }, set: function (obj, value) { obj.primaryCountry = value; } }, metadata: _metadata }, _primaryCountry_initializers, _primaryCountry_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateRestaurantDTO = UpdateRestaurantDTO;
var UpdateRestaurantStatusDTO = function () {
    var _a;
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateRestaurantStatusDTO() {
                this.status = __runInitializers(this, _status_initializers, void 0);
                __runInitializers(this, _status_extraInitializers);
            }
            UpdateRestaurantStatusDTO._OPENAPI_METADATA_FACTORY = function () {
                return { status: { required: true, enum: require("../enums").RestaurantStatus } };
            };
            return UpdateRestaurantStatusDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, class_validator_1.IsEnum)(enums_1.RestaurantStatus, {
                    message: 'Status must be one of: active, suspended, disabled, pending',
                }), (0, class_validator_1.IsNotEmpty)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateRestaurantStatusDTO = UpdateRestaurantStatusDTO;
