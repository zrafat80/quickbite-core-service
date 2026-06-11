"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermissions = exports.PERMISSIONS_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
// This allows you to tag a route like: @RequirePermissions('product', 'create')
var RequirePermissions = function (resource, action, allowSystemAdmin) {
    if (allowSystemAdmin === void 0) { allowSystemAdmin = true; }
    return (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, { resource: resource, action: action, allowSystemAdmin: allowSystemAdmin });
};
exports.RequirePermissions = RequirePermissions;
exports.PERMISSIONS_KEY;
