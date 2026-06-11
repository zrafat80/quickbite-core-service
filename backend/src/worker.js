"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var core_1 = require("@nestjs/core");
var croner_1 = require("croner");
var outbox_drain_service_1 = require("./lib/events/outbox-drain.service");
var worker_module_1 = require("./worker.module");
/**
 * Outbox worker — runs independently of the HTTP server.
 *
 * API instances write to `events_outbox` in the same trx as their domain
 * mutation. This worker process polls that table on a cron schedule and
 * publishes pending rows with publisher confirms. Scales horizontally:
 * `OutboxRepository.claimBatch` uses FOR UPDATE SKIP LOCKED so N workers can
 * run in parallel without duplicate publishes.
 */
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var logger, app, configService, drain, pattern, batchSize, job, shutdown;
        var _this = this;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger = new common_1.Logger('Worker');
                    return [4 /*yield*/, core_1.NestFactory.createApplicationContext(worker_module_1.WorkerModule, {
                            logger: ['log', 'warn', 'error'],
                        })];
                case 1:
                    app = _c.sent();
                    app.enableShutdownHooks();
                    configService = app.get(config_1.ConfigService);
                    drain = app.get(outbox_drain_service_1.OutboxDrainService);
                    pattern = (_a = configService.get('rabbit.drainCron')) !== null && _a !== void 0 ? _a : '* * * * * *';
                    batchSize = (_b = configService.get('rabbit.batchSize')) !== null && _b !== void 0 ? _b : 50;
                    job = new croner_1.Cron(pattern, { protect: true }, function () { return __awaiter(_this, void 0, void 0, function () {
                        var moved, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, drain.drain()];
                                case 1:
                                    moved = (_a.sent()).moved;
                                    if (moved > 0) {
                                        logger.log("outbox drain: moved=".concat(moved));
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    err_1 = _a.sent();
                                    logger.error("outbox drain error: ".concat(err_1.message));
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    logger.log("outbox drain scheduled (cron=\"".concat(pattern, "\", batchSize=").concat(batchSize, ")"));
                    shutdown = function (signal) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    logger.log("worker: ".concat(signal, " received, stopping\u2026"));
                                    job.stop();
                                    return [4 /*yield*/, app.close()];
                                case 1:
                                    _a.sent();
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    process.on('SIGINT', function () { return shutdown('SIGINT'); });
                    process.on('SIGTERM', function () { return shutdown('SIGTERM'); });
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap().catch(function (err) {
    // eslint-disable-next-line no-console
    console.error('worker fatal:', err);
    process.exit(1);
});
