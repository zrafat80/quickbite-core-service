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
exports.DatabaseErrorFilter = void 0;
var common_1 = require("@nestjs/common");
// We catch all errors here, but filter specifically for Postgres database errors.
var DatabaseErrorFilter = function () {
    var _classDecorators = [(0, common_1.Catch)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DatabaseErrorFilter = _classThis = /** @class */ (function () {
        function DatabaseErrorFilter_1() {
        }
        DatabaseErrorFilter_1.prototype.catch = function (exception, host) {
            var ctx = host.switchToHttp();
            var response = ctx.getResponse();
            // 1. Let standard HttpExceptions (like NotFoundException) pass through normally
            if (exception instanceof common_1.HttpException) {
                var status_1 = exception.getStatus();
                var exceptionResponse = exception.getResponse();
                return response.status(status_1).json(typeof exceptionResponse === 'string'
                    ? {
                        statusCode: status_1,
                        isSuccess: false,
                        message: exceptionResponse,
                        data: null,
                    }
                    : exceptionResponse);
            }
            // 2. Extract Postgres error properties
            var code = exception.code; // Postgres error codes are 5-character strings
            var message = exception.message || 'Internal server error';
            var detail = exception.detail || ''; // Postgres often includes helpful specifics in 'detail'
            // 3. Handle specific PostgreSQL error codes
            switch (code) {
                case '23505': // unique_violation (Equivalent to MySQL 1062)
                    return response.status(common_1.HttpStatus.CONFLICT).json({
                        statusCode: common_1.HttpStatus.CONFLICT,
                        isSuccess: false,
                        message: 'A record with the same unique value already exists. ' + detail,
                        data: null,
                    });
                case '23503': // foreign_key_violation (Equivalent to MySQL 1451/1452)
                    return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        isSuccess: false,
                        message: 'Foreign key constraint failed. ' + detail,
                        data: null,
                    });
                case '23502': // not_null_violation (Equivalent to MySQL 1048/1364)
                    return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        isSuccess: false,
                        message: 'Missing required field (cannot be null). ' + message,
                        data: null,
                    });
                case '42703': // undefined_column (Equivalent to MySQL 1054)
                    return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        isSuccess: false,
                        message: 'Unknown column. ' + message,
                        data: null,
                    });
                case '22001': // string_data_right_truncation (Equivalent to MySQL 1406)
                    return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        isSuccess: false,
                        message: 'Data too long for column. ' + message,
                        data: null,
                    });
                default:
                    // Log unhandled exceptions so you can debug them in your terminal
                    console.error('❌ Unhandled Server Error:', exception);
                    return response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                        statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                        isSuccess: false,
                        message: 'Database operation failed or internal error occurred.',
                        data: null,
                    });
            }
        };
        return DatabaseErrorFilter_1;
    }());
    __setFunctionName(_classThis, "DatabaseErrorFilter");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DatabaseErrorFilter = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DatabaseErrorFilter = _classThis;
}();
exports.DatabaseErrorFilter = DatabaseErrorFilter;
