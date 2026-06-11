"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
var openapi = require("@nestjs/swagger");
var Role = /** @class */ (function () {
    function Role(data) {
        var _a, _b;
        this.id = data.id;
        this.name = data.name;
        this.displayName = data.displayName;
        this.description = data.description;
        this.createdAt = (_a = data.createdAt) !== null && _a !== void 0 ? _a : new Date();
        this.updatedAt = (_b = data.updatedAt) !== null && _b !== void 0 ? _b : new Date();
    }
    Role._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, name: { required: true, type: function () { return String; } }, displayName: { required: true, type: function () { return String; } }, description: { required: false, type: function () { return String; } }, createdAt: { required: true, type: function () { return Date; } }, updatedAt: { required: true, type: function () { return Date; } } };
    };
    return Role;
}());
exports.Role = Role;
