"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
var openapi = require("@nestjs/swagger");
var Branch = /** @class */ (function () {
    function Branch(data) {
        var _a, _b, _c, _d, _e;
        this.id = data.id;
        this.restaurantId = data.restaurantId;
        this.countryCode = data.countryCode;
        this.addressText = data.addressText;
        this.label = data.label;
        this.lat = data.lat;
        this.lng = data.lng;
        this.isActive = data.isActive;
        this.opensAt = data.opensAt;
        this.closesAt = data.closesAt;
        this.acceptOrders = data.acceptOrders;
        this.createdAt = (_a = data.createdAt) !== null && _a !== void 0 ? _a : new Date();
        this.updatedAt = (_b = data.updatedAt) !== null && _b !== void 0 ? _b : new Date();
        this.deliveryRadius = (_c = data.deliveryRadius) !== null && _c !== void 0 ? _c : 0;
        this.currency = data.currency;
        this.commission = (_d = data.commission) !== null && _d !== void 0 ? _d : 0;
        this.deliveryFee = (_e = data.deliveryFee) !== null && _e !== void 0 ? _e : 0;
    }
    Branch._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, restaurantId: { required: true, type: function () { return Number; } }, countryCode: { required: true, type: function () { return String; } }, addressText: { required: true, type: function () { return String; } }, label: { required: true, type: function () { return String; } }, lat: { required: true, type: function () { return Number; } }, lng: { required: true, type: function () { return Number; } }, isActive: { required: true, type: function () { return Boolean; } }, opensAt: { required: true, type: function () { return String; } }, closesAt: { required: true, type: function () { return String; } }, acceptOrders: { required: true, type: function () { return Boolean; } }, createdAt: { required: true, type: function () { return Date; } }, updatedAt: { required: true, type: function () { return Date; } }, deliveryRadius: { required: true, type: function () { return Number; } }, currency: { required: true, enum: require("../enums").Currency }, commission: { required: true, type: function () { return Number; } }, deliveryFee: { required: true, type: function () { return Number; } }, location: { required: false, type: function () { return Object; } } };
    };
    return Branch;
}());
exports.Branch = Branch;
