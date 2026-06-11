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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessInterceptor = void 0;
var common_1 = require("@nestjs/common");
var operators_1 = require("rxjs/operators");
var DEFAULT_MESSAGE = 'Operation succeeded';
/**
 * Wraps every response in `{ isSuccess, statusCode, message, data }` (with
 * `meta` hoisted alongside for paginated responses). Hoisting rules applied
 * to the raw payload:
 *   - `message: string`  → top-level `message` (else default).
 *   - `meta` defined     → top-level `meta` (paginated marker).
 *   - `data` + `meta`    → top-level `data` is the inner array (paginated).
 *   - everything else    → top-level `data` is "the rest" (or null if empty).
 *
 * Primitives / arrays / null pass through as `data` with the default message.
 */
var SuccessInterceptor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SuccessInterceptor = _classThis = /** @class */ (function () {
        function SuccessInterceptor_1() {
        }
        SuccessInterceptor_1.prototype.intercept = function (context, next) {
            var response = context.switchToHttp().getResponse();
            return next.handle().pipe((0, operators_1.map)(function (resPayload) { return buildEnvelope(resPayload, response.statusCode); }));
        };
        return SuccessInterceptor_1;
    }());
    __setFunctionName(_classThis, "SuccessInterceptor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SuccessInterceptor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SuccessInterceptor = _classThis;
}();
exports.SuccessInterceptor = SuccessInterceptor;
function buildEnvelope(payload, statusCode) {
    if (payload === null || payload === undefined) {
        return { isSuccess: true, statusCode: statusCode, message: DEFAULT_MESSAGE, data: null };
    }
    if (typeof payload !== 'object' || Array.isArray(payload)) {
        return { isSuccess: true, statusCode: statusCode, message: DEFAULT_MESSAGE, data: payload };
    }
    var _a = payload, message = _a.message, meta = _a.meta, innerData = _a.data, rest = __rest(_a, ["message", "meta", "data"]);
    var finalMessage = typeof message === 'string' ? message : DEFAULT_MESSAGE;
    var isPaginated = meta !== undefined && innerData !== undefined;
    var finalData;
    if (isPaginated) {
        finalData = innerData;
    }
    else {
        if (innerData !== undefined)
            rest.data = innerData;
        finalData = Object.keys(rest).length > 0 ? rest : null;
    }
    var envelope = {
        isSuccess: true,
        statusCode: statusCode,
        message: finalMessage,
        data: finalData,
    };
    if (meta !== undefined)
        envelope.meta = meta;
    return envelope;
}
