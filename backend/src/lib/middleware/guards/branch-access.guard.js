"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchAccessGuard = void 0;
var common_1 = require("@nestjs/common");
var enums_1 = require("../../../../../../../../../../../../src/app/user/enums");
var guard_constants_1 = require("./guard.constants");
var BranchAccessGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BranchAccessGuard = _classThis = /** @class */ (function () {
        function BranchAccessGuard_1() {
        }
        // We don't even need the MemberBranchRepository here anymore!
        // Reading from the JWT in memory is 1000x faster than querying the database.
        BranchAccessGuard_1.prototype.canActivate = function (context) {
            var req = context.switchToHttp().getRequest();
            var user = req.user;
            // 🌟 1. Extract branchId from params OR query string (Fallback)
            var branchIdStr = req.params.branchId || req.query.branchId;
            var branchId = parseInt(branchIdStr, 10);
            // If the route doesn't specify a branch, let it pass (other guards will handle it)
            if (!branchId)
                return true;
            // 🌟 2. System Admin and Owner Bypass
            if (user.role === enums_1.SystemRole.SYSTEM_ADMIN)
                return true;
            if (user.restaurantRole === 'owner')
                return true;
            // 🌟 3. Check the JWT Payload
            // Because we fetch these during login, user.branchIds will be an array like [2, 5, 8]
            var userBranchIds = user.branchIds || [];
            var hasAccess = userBranchIds.includes(branchId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException(guard_constants_1.GUARD_ERRORS.BRANCH_ACCESS_DENIED);
            }
            return true;
        };
        return BranchAccessGuard_1;
    }());
    __setFunctionName(_classThis, "BranchAccessGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BranchAccessGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BranchAccessGuard = _classThis;
}();
exports.BranchAccessGuard = BranchAccessGuard;
