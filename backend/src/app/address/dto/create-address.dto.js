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
exports.CreateAddressDTO = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var CreateAddressDTO = function () {
    var _a;
    var _label_decorators;
    var _label_initializers = [];
    var _label_extraInitializers = [];
    var _country_decorators;
    var _country_initializers = [];
    var _country_extraInitializers = [];
    var _city_decorators;
    var _city_initializers = [];
    var _city_extraInitializers = [];
    var _street_decorators;
    var _street_initializers = [];
    var _street_extraInitializers = [];
    var _building_decorators;
    var _building_initializers = [];
    var _building_extraInitializers = [];
    var _apartmentNumber_decorators;
    var _apartmentNumber_initializers = [];
    var _apartmentNumber_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _lat_decorators;
    var _lat_initializers = [];
    var _lat_extraInitializers = [];
    var _lng_decorators;
    var _lng_initializers = [];
    var _lng_extraInitializers = [];
    var _isDefault_decorators;
    var _isDefault_initializers = [];
    var _isDefault_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateAddressDTO() {
                this.label = __runInitializers(this, _label_initializers, void 0); // <-- Add ! here
                this.country = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _country_initializers, void 0)); // <-- Add ! here
                this.city = (__runInitializers(this, _country_extraInitializers), __runInitializers(this, _city_initializers, void 0)); // <-- Add ! here
                this.street = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _street_initializers, void 0)); // <-- Add ! here
                this.building = (__runInitializers(this, _street_extraInitializers), __runInitializers(this, _building_initializers, void 0)); // <-- Add ! here
                this.apartmentNumber = (__runInitializers(this, _building_extraInitializers), __runInitializers(this, _apartmentNumber_initializers, void 0)); // Optional properties use ? instead of !
                this.type = (__runInitializers(this, _apartmentNumber_extraInitializers), __runInitializers(this, _type_initializers, void 0)); // <-- Add ! here
                this.lat = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _lat_initializers, void 0)); // <-- Add ! here
                this.lng = (__runInitializers(this, _lat_extraInitializers), __runInitializers(this, _lng_initializers, void 0)); // <-- Add ! here
                this.isDefault = (__runInitializers(this, _lng_extraInitializers), __runInitializers(this, _isDefault_initializers, void 0));
                __runInitializers(this, _isDefault_extraInitializers);
            }
            CreateAddressDTO._OPENAPI_METADATA_FACTORY = function () {
                return { label: { required: true, type: function () { return String; } }, country: { required: true, type: function () { return String; } }, city: { required: true, type: function () { return String; } }, street: { required: true, type: function () { return String; } }, building: { required: true, type: function () { return String; } }, apartmentNumber: { required: false, type: function () { return String; } }, type: { required: true, type: function () { return String; } }, lat: { required: true, type: function () { return Number; }, minimum: -90, maximum: 90 }, lng: { required: true, type: function () { return Number; }, minimum: -180, maximum: 180 }, isDefault: { required: false, type: function () { return Boolean; } } };
            };
            return CreateAddressDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _label_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _country_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _city_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _street_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _building_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _apartmentNumber_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _type_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _lat_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(-90), (0, class_validator_1.Max)(90), (0, class_validator_1.IsNotEmpty)()];
            _lng_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(-180), (0, class_validator_1.Max)(180), (0, class_validator_1.IsNotEmpty)()];
            _isDefault_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: function (obj) { return "label" in obj; }, get: function (obj) { return obj.label; }, set: function (obj, value) { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(null, null, _country_decorators, { kind: "field", name: "country", static: false, private: false, access: { has: function (obj) { return "country" in obj; }, get: function (obj) { return obj.country; }, set: function (obj, value) { obj.country = value; } }, metadata: _metadata }, _country_initializers, _country_extraInitializers);
            __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: function (obj) { return "city" in obj; }, get: function (obj) { return obj.city; }, set: function (obj, value) { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
            __esDecorate(null, null, _street_decorators, { kind: "field", name: "street", static: false, private: false, access: { has: function (obj) { return "street" in obj; }, get: function (obj) { return obj.street; }, set: function (obj, value) { obj.street = value; } }, metadata: _metadata }, _street_initializers, _street_extraInitializers);
            __esDecorate(null, null, _building_decorators, { kind: "field", name: "building", static: false, private: false, access: { has: function (obj) { return "building" in obj; }, get: function (obj) { return obj.building; }, set: function (obj, value) { obj.building = value; } }, metadata: _metadata }, _building_initializers, _building_extraInitializers);
            __esDecorate(null, null, _apartmentNumber_decorators, { kind: "field", name: "apartmentNumber", static: false, private: false, access: { has: function (obj) { return "apartmentNumber" in obj; }, get: function (obj) { return obj.apartmentNumber; }, set: function (obj, value) { obj.apartmentNumber = value; } }, metadata: _metadata }, _apartmentNumber_initializers, _apartmentNumber_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _lat_decorators, { kind: "field", name: "lat", static: false, private: false, access: { has: function (obj) { return "lat" in obj; }, get: function (obj) { return obj.lat; }, set: function (obj, value) { obj.lat = value; } }, metadata: _metadata }, _lat_initializers, _lat_extraInitializers);
            __esDecorate(null, null, _lng_decorators, { kind: "field", name: "lng", static: false, private: false, access: { has: function (obj) { return "lng" in obj; }, get: function (obj) { return obj.lng; }, set: function (obj, value) { obj.lng = value; } }, metadata: _metadata }, _lng_initializers, _lng_extraInitializers);
            __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: function (obj) { return "isDefault" in obj; }, get: function (obj) { return obj.isDefault; }, set: function (obj, value) { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateAddressDTO = CreateAddressDTO;
