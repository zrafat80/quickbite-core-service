"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordReset = void 0;
var openapi = require("@nestjs/swagger");
var PasswordReset = /** @class */ (function () {
    function PasswordReset(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.otpHash = data.otpHash;
        this.expiresAt = data.expiresAt;
        this.consumedAt = data.consumedAt;
        this.createdAt = data.createdAt || new Date();
    }
    PasswordReset.prototype.isExpired = function () {
        return this.expiresAt < new Date();
    };
    PasswordReset._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, userId: { required: true, type: function () { return Number; } }, otpHash: { required: true, type: function () { return String; } }, expiresAt: { required: true, type: function () { return Date; } }, consumedAt: { required: false, type: function () { return Date; } }, createdAt: { required: true, type: function () { return Date; } } };
    };
    return PasswordReset;
}());
exports.PasswordReset = PasswordReset;
