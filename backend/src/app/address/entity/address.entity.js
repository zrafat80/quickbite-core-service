"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
var openapi = require("@nestjs/swagger");
var Address = /** @class */ (function () {
    // No more Object.assign shortcuts. Strict, 1-to-1 mapping.
    function Address(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.label = data.label;
        this.country = data.country;
        this.city = data.city;
        this.street = data.street;
        this.building = data.building;
        this.apartmentNumber = data.apartmentNumber;
        this.type = data.type;
        this.lat = data.lat;
        this.lng = data.lng;
        this.isDefault = data.isDefault;
    }
    Address._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, userId: { required: true, type: function () { return Number; } }, label: { required: true, type: function () { return String; } }, country: { required: true, type: function () { return String; } }, city: { required: true, type: function () { return String; } }, street: { required: true, type: function () { return String; } }, building: { required: true, type: function () { return String; }, nullable: true }, apartmentNumber: { required: true, type: function () { return String; }, nullable: true }, type: { required: true, type: function () { return String; } }, lat: { required: true, type: function () { return Number; } }, lng: { required: true, type: function () { return Number; } }, isDefault: { required: true, type: function () { return Boolean; } } };
    };
    return Address;
}());
exports.Address = Address;
