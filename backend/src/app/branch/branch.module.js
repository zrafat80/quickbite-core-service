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
exports.BranchModule = void 0;
var common_1 = require("@nestjs/common");
var branch_service_1 = require("./branch.service");
var branch_repository_1 = require("./repository/branch.repository");
var restaurant_module_1 = require("../../../../../../../../../../../src/app/restaurant/restaurant.module"); // 🌟 Import the module!
var branch_controller_1 = require("./branch.controller");
var product_module_1 = require("../../../../../../../../../../../src/app/product/product.module");
var BranchModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            controllers: [branch_controller_1.BranchController],
            // RestaurantModule for ownership checks; ProductModule (forwardRef to avoid cycle)
            // for the internal /branches/:id/products and /reserve-stock routes that live on
            // this controller for URL ergonomics.
            imports: [restaurant_module_1.RestaurantModule, (0, common_1.forwardRef)(function () { return product_module_1.ProductModule; })],
            providers: [branch_service_1.BranchService, branch_repository_1.BranchRepository],
            exports: [branch_service_1.BranchService],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BranchModule = _classThis = /** @class */ (function () {
        function BranchModule_1() {
        }
        return BranchModule_1;
    }());
    __setFunctionName(_classThis, "BranchModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BranchModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BranchModule = _classThis;
}();
exports.BranchModule = BranchModule;
