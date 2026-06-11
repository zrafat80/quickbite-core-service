"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
var openapi = require("@nestjs/swagger");
var Permission = /** @class */ (function () {
    function Permission(data) {
        var _a;
        this.id = data.id;
        this.resource = data.resource;
        this.action = data.action;
        this.createdAt = (_a = data.createdAt) !== null && _a !== void 0 ? _a : new Date();
    }
    Permission._OPENAPI_METADATA_FACTORY = function () {
        return { id: { required: true, type: function () { return Number; } }, resource: { required: true, type: function () { return String; } }, action: { required: true, type: function () { return String; } }, createdAt: { required: true, type: function () { return Date; } } };
    };
    return Permission;
}());
exports.Permission = Permission;
