"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantMember = void 0;
var openapi = require("@nestjs/swagger");
var enums_1 = require("../enums");
var RestaurantMember = /** @class */ (function () {
    function RestaurantMember(data) {
        var _a, _b, _c;
        this.id = data.id;
        this.restaurantId = data.restaurantId;
        this.userId = data.userId;
        this.roleId = data.roleId;
        this.status = (_a = data.status) !== null && _a !== void 0 ? _a : enums_1.MemberStatus.ACTIVE;
        this.createdAt = (_b = data.createdAt) !== null && _b !== void 0 ? _b : new Date();
        this.updatedAt = (_c = data.updatedAt) !== null && _c !== void 0 ? _c : new Date();
    }
    RestaurantMember._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, restaurantId: { required: true, type: function () { return Number; } }, userId: { required: true, type: function () { return Number; } }, roleId: { required: true, type: function () { return Number; } }, status: { required: true, enum: require("../enums").MemberStatus }, createdAt: { required: true, type: function () { return Date; } }, updatedAt: { required: true, type: function () { return Date; } } };
    };
    return RestaurantMember;
}());
exports.RestaurantMember = RestaurantMember;
