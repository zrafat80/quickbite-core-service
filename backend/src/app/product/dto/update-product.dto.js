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
exports.UpdateProductDTO = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var UpdateProductDTO = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _categoryName_decorators;
    var _categoryName_initializers = [];
    var _categoryName_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var _stock_decorators;
    var _stock_initializers = [];
    var _stock_extraInitializers = [];
    var _isAvailable_decorators;
    var _isAvailable_initializers = [];
    var _isAvailable_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateProductDTO() {
                // Global Product Fields
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.categoryName = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _categoryName_initializers, void 0));
                // Branch-Specific Fields (Only used if branchId is in query params)
                this.price = (__runInitializers(this, _categoryName_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.stock = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
                this.isAvailable = (__runInitializers(this, _stock_extraInitializers), __runInitializers(this, _isAvailable_initializers, void 0));
                __runInitializers(this, _isAvailable_extraInitializers);
            }
            UpdateProductDTO._OPENAPI_METADATA_FACTORY = function () {
                return { name: { required: false, type: function () { return String; } }, description: { required: false, type: function () { return String; } }, imageUrl: { required: false, type: function () { return String; } }, categoryName: { required: false, type: function () { return String; } }, price: { required: false, type: function () { return Number; }, minimum: 0 }, stock: { required: false, type: function () { return Number; }, minimum: 0 }, isAvailable: { required: false, type: function () { return Boolean; } } };
            };
            return UpdateProductDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _imageUrl_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _categoryName_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _price_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _stock_decorators = [(0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _isAvailable_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _categoryName_decorators, { kind: "field", name: "categoryName", static: false, private: false, access: { has: function (obj) { return "categoryName" in obj; }, get: function (obj) { return obj.categoryName; }, set: function (obj, value) { obj.categoryName = value; } }, metadata: _metadata }, _categoryName_initializers, _categoryName_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: function (obj) { return "stock" in obj; }, get: function (obj) { return obj.stock; }, set: function (obj, value) { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
            __esDecorate(null, null, _isAvailable_decorators, { kind: "field", name: "isAvailable", static: false, private: false, access: { has: function (obj) { return "isAvailable" in obj; }, get: function (obj) { return obj.isAvailable; }, set: function (obj, value) { obj.isAvailable = value; } }, metadata: _metadata }, _isAvailable_initializers, _isAvailable_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateProductDTO = UpdateProductDTO;
