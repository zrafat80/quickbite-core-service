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
exports.CreateBranchDTO = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var enums_1 = require("../enums");
var CreateBranchDTO = function () {
    var _a;
    var _countryCode_decorators;
    var _countryCode_initializers = [];
    var _countryCode_extraInitializers = [];
    var _label_decorators;
    var _label_initializers = [];
    var _label_extraInitializers = [];
    var _addressText_decorators;
    var _addressText_initializers = [];
    var _addressText_extraInitializers = [];
    var _lat_decorators;
    var _lat_initializers = [];
    var _lat_extraInitializers = [];
    var _lng_decorators;
    var _lng_initializers = [];
    var _lng_extraInitializers = [];
    var _opensAt_decorators;
    var _opensAt_initializers = [];
    var _opensAt_extraInitializers = [];
    var _closesAt_decorators;
    var _closesAt_initializers = [];
    var _closesAt_extraInitializers = [];
    var _deliveryRadius_decorators;
    var _deliveryRadius_initializers = [];
    var _deliveryRadius_extraInitializers = [];
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateBranchDTO() {
                this.countryCode = __runInitializers(this, _countryCode_initializers, void 0);
                this.label = (__runInitializers(this, _countryCode_extraInitializers), __runInitializers(this, _label_initializers, void 0));
                this.addressText = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _addressText_initializers, void 0));
                this.lat = (__runInitializers(this, _addressText_extraInitializers), __runInitializers(this, _lat_initializers, void 0));
                this.lng = (__runInitializers(this, _lat_extraInitializers), __runInitializers(this, _lng_initializers, void 0));
                this.opensAt = (__runInitializers(this, _lng_extraInitializers), __runInitializers(this, _opensAt_initializers, void 0));
                this.closesAt = (__runInitializers(this, _opensAt_extraInitializers), __runInitializers(this, _closesAt_initializers, void 0));
                this.deliveryRadius = (__runInitializers(this, _closesAt_extraInitializers), __runInitializers(this, _deliveryRadius_initializers, void 0));
                this.currency = (__runInitializers(this, _deliveryRadius_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
                __runInitializers(this, _currency_extraInitializers);
            }
            CreateBranchDTO._OPENAPI_METADATA_FACTORY = function () {
                return { countryCode: { required: true, type: function () { return String; } }, label: { required: true, type: function () { return String; } }, addressText: { required: true, type: function () { return String; } }, lat: { required: true, type: function () { return Number; } }, lng: { required: true, type: function () { return Number; } }, opensAt: { required: true, type: function () { return String; } }, closesAt: { required: true, type: function () { return String; } }, deliveryRadius: { required: true, type: function () { return Number; }, minimum: 0 }, currency: { required: true, enum: require("../enums").Currency } };
            };
            return CreateBranchDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _countryCode_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _label_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _addressText_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _lat_decorators = [(0, class_validator_1.IsNumber)()];
            _lng_decorators = [(0, class_validator_1.IsNumber)()];
            _opensAt_decorators = [(0, class_validator_1.IsString)()];
            _closesAt_decorators = [(0, class_validator_1.IsString)()];
            _deliveryRadius_decorators = [(0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _currency_decorators = [(0, class_validator_1.IsEnum)(enums_1.Currency)];
            __esDecorate(null, null, _countryCode_decorators, { kind: "field", name: "countryCode", static: false, private: false, access: { has: function (obj) { return "countryCode" in obj; }, get: function (obj) { return obj.countryCode; }, set: function (obj, value) { obj.countryCode = value; } }, metadata: _metadata }, _countryCode_initializers, _countryCode_extraInitializers);
            __esDecorate(null, null, _label_decorators, { kind: "field", name: "label", static: false, private: false, access: { has: function (obj) { return "label" in obj; }, get: function (obj) { return obj.label; }, set: function (obj, value) { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(null, null, _addressText_decorators, { kind: "field", name: "addressText", static: false, private: false, access: { has: function (obj) { return "addressText" in obj; }, get: function (obj) { return obj.addressText; }, set: function (obj, value) { obj.addressText = value; } }, metadata: _metadata }, _addressText_initializers, _addressText_extraInitializers);
            __esDecorate(null, null, _lat_decorators, { kind: "field", name: "lat", static: false, private: false, access: { has: function (obj) { return "lat" in obj; }, get: function (obj) { return obj.lat; }, set: function (obj, value) { obj.lat = value; } }, metadata: _metadata }, _lat_initializers, _lat_extraInitializers);
            __esDecorate(null, null, _lng_decorators, { kind: "field", name: "lng", static: false, private: false, access: { has: function (obj) { return "lng" in obj; }, get: function (obj) { return obj.lng; }, set: function (obj, value) { obj.lng = value; } }, metadata: _metadata }, _lng_initializers, _lng_extraInitializers);
            __esDecorate(null, null, _opensAt_decorators, { kind: "field", name: "opensAt", static: false, private: false, access: { has: function (obj) { return "opensAt" in obj; }, get: function (obj) { return obj.opensAt; }, set: function (obj, value) { obj.opensAt = value; } }, metadata: _metadata }, _opensAt_initializers, _opensAt_extraInitializers);
            __esDecorate(null, null, _closesAt_decorators, { kind: "field", name: "closesAt", static: false, private: false, access: { has: function (obj) { return "closesAt" in obj; }, get: function (obj) { return obj.closesAt; }, set: function (obj, value) { obj.closesAt = value; } }, metadata: _metadata }, _closesAt_initializers, _closesAt_extraInitializers);
            __esDecorate(null, null, _deliveryRadius_decorators, { kind: "field", name: "deliveryRadius", static: false, private: false, access: { has: function (obj) { return "deliveryRadius" in obj; }, get: function (obj) { return obj.deliveryRadius; }, set: function (obj, value) { obj.deliveryRadius = value; } }, metadata: _metadata }, _deliveryRadius_initializers, _deliveryRadius_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateBranchDTO = CreateBranchDTO;
