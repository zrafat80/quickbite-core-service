"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheScope = void 0;
var common_1 = require("@nestjs/common");
// We create a decorator that attaches a invisible label to your route
var CacheScope = function (scope) { return (0, common_1.SetMetadata)('cache_scope', scope); };
exports.CacheScope = CacheScope;
