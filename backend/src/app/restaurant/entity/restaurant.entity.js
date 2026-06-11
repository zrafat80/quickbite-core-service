"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantEntity = void 0;
var openapi = require("@nestjs/swagger");
var RestaurantEntity = /** @class */ (function () {
    function RestaurantEntity(data) {
        var _a, _b, _c, _d;
        this.id = data.id;
        this.ownerId = data.ownerId;
        this.name = data.name;
        this.logoURL = (_a = data.logoURL) !== null && _a !== void 0 ? _a : "";
        this.status = data.status;
        this.primaryCountry = data.primaryCountry;
        this.createdAt = (_b = data.createdAt) !== null && _b !== void 0 ? _b : new Date();
        this.updatedAt = (_c = data.updatedAt) !== null && _c !== void 0 ? _c : new Date();
        this.statusUpdatedAt = (_d = data.statusUpdatedAt) !== null && _d !== void 0 ? _d : new Date();
    }
    RestaurantEntity._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, ownerId: { required: true, type: function () { return Number; } }, name: { required: true, type: function () { return String; } }, logoURL: { required: true, type: function () { return String; } }, status: { required: true, enum: require("../enums").RestaurantStatus }, primaryCountry: { required: true, type: function () { return String; } }, createdAt: { required: true, type: function () { return Date; } }, updatedAt: { required: true, type: function () { return Date; } }, statusUpdatedAt: { required: true, type: function () { return Date; } } };
    };
    return RestaurantEntity;
}());
exports.RestaurantEntity = RestaurantEntity;
