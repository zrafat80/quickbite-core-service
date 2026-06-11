"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var openapi = require("@nestjs/swagger");
var User = /** @class */ (function () {
    function User(data) {
        var _a, _b, _c;
        Object.assign(this, data);
        this.deletedAt = (_a = data.deletedAt) !== null && _a !== void 0 ? _a : null;
        this.createdAt = (_b = data.createdAt) !== null && _b !== void 0 ? _b : new Date();
        this.updatedAt = (_c = data.updatedAt) !== null && _c !== void 0 ? _c : new Date();
    }
    User._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, email: { required: true, type: function () { return String; } }, phone: { required: true, type: function () { return String; } }, name: { required: true, type: function () { return String; } }, passwordHash: { required: true, type: function () { return String; } }, systemRole: { required: true, enum: require("../enums").SystemRole }, deletedAt: { required: true, type: function () { return Date; }, nullable: true }, createdAt: { required: true, type: function () { return Date; } }, updatedAt: { required: true, type: function () { return Date; } } };
    };
    return User;
}());
exports.User = User;
