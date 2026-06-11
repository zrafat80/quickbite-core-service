"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberBranch = void 0;
var openapi = require("@nestjs/swagger");
var MemberBranch = /** @class */ (function () {
    function MemberBranch(data) {
        var _a;
        this.memberId = data.memberId;
        this.branchId = data.branchId;
        this.createdAt = (_a = data.createdAt) !== null && _a !== void 0 ? _a : new Date();
    }
    MemberBranch._OPENAPI_METADATA_FACTORY = function () {
        return { memberId: { required: true, type: function () { return Number; } }, branchId: { required: true, type: function () { return Number; } }, createdAt: { required: true, type: function () { return Date; } } };
    };
    return MemberBranch;
}());
exports.MemberBranch = MemberBranch;
