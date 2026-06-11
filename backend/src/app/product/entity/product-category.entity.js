"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCategory = void 0;
var openapi = require("@nestjs/swagger");
var ProductCategory = /** @class */ (function () {
    function ProductCategory(data) {
        var _a, _b;
        this.id = data.id;
        this.restaurantId = data.restaurantId;
        this.name = data.name;
        this.createdAt = (_a = data.createdAt) !== null && _a !== void 0 ? _a : new Date();
        this.updatedAt = (_b = data.updatedAt) !== null && _b !== void 0 ? _b : new Date();
    }
    ProductCategory._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, restaurantId: { required: true, type: function () { return Number; } }, name: { required: true, type: function () { return String; } }, createdAt: { required: true, type: function () { return Date; } }, updatedAt: { required: true, type: function () { return Date; } } };
    };
    return ProductCategory;
}());
exports.ProductCategory = ProductCategory;
