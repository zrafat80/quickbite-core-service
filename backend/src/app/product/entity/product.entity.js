"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
var openapi = require("@nestjs/swagger");
var Product = /** @class */ (function () {
    function Product(data) {
        var _a, _b, _c, _d, _e, _f;
        this.id = data.id;
        this.name = data.name;
        this.description = (_a = data.description) !== null && _a !== void 0 ? _a : "";
        this.imageUrl = (_b = data.imageUrl) !== null && _b !== void 0 ? _b : "";
        this.restaurantId = data.restaurantId;
        this.categoryId = (_c = data.categoryId) !== null && _c !== void 0 ? _c : null;
        this.createdAt = (_d = data.createdAt) !== null && _d !== void 0 ? _d : new Date();
        this.updatedAt = (_e = data.updatedAt) !== null && _e !== void 0 ? _e : new Date();
        this.deletedAt = (_f = data.deletedAt) !== null && _f !== void 0 ? _f : null;
    }
    Product._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, name: { required: true, type: function () { return String; } }, description: { required: true, type: function () { return String; } }, imageUrl: { required: true, type: function () { return String; } }, restaurantId: { required: true, type: function () { return Number; } }, categoryId: { required: true, type: function () { return Number; }, nullable: true }, createdAt: { required: true, type: function () { return Date; } }, updatedAt: { required: true, type: function () { return Date; } }, deletedAt: { required: true, type: function () { return Date; }, nullable: true } };
    };
    return Product;
}());
exports.Product = Product;
