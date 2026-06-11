"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idempotency = exports.IDEMPOTENCY_KEY_METADATA = void 0;
var common_1 = require("@nestjs/common");
exports.IDEMPOTENCY_KEY_METADATA = 'idempotency_options';
// This custom decorator attaches the options to the route
var Idempotency = function (options) {
    if (options === void 0) { options = { strict: false }; }
    return (0, common_1.SetMetadata)(exports.IDEMPOTENCY_KEY_METADATA, options);
};
exports.Idempotency = Idempotency;
