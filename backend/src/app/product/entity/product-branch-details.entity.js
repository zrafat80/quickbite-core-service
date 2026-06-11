"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductBranchDetails = void 0;
var openapi = require("@nestjs/swagger");
var ProductBranchDetails = /** @class */ (function () {
    function ProductBranchDetails(data) {
        var _a, _b, _c;
        this.id = data.id;
        this.branchId = data.branchId;
        this.productId = data.productId;
        this.price = (_a = data.price) !== null && _a !== void 0 ? _a : 0;
        this.stock = (_b = data.stock) !== null && _b !== void 0 ? _b : 0;
        this.isAvailable = (_c = data.isAvailable) !== null && _c !== void 0 ? _c : false;
    }
    ProductBranchDetails._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, branchId: { required: true, type: function () { return Number; } }, productId: { required: true, type: function () { return Number; } }, price: { required: true, type: function () { return Number; } }, stock: { required: true, type: function () { return Number; } }, isAvailable: { required: true, type: function () { return Boolean; } } };
    };
    return ProductBranchDetails;
}());
exports.ProductBranchDetails = ProductBranchDetails;
