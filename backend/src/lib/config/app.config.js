"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () {
    var _a;
    return ({
        environment: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'zeyiad123123',
            name: process.env.DB_DATABASE || 'myfirst',
            poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
            poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
        },
        testDatabase: {
            host: process.env.TEST_DB_HOST || 'localhost',
            port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
            username: process.env.TEST_DB_USERNAME || 'postgres',
            password: process.env.TEST_DB_PASSWORD || 'zeyiad123123',
            name: process.env.TEST_DB_NAME || 'mySecond',
        },
        jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET,
            accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        },
        corsOrigins: (_a = process.env.CORS_ORIGNS) === null || _a === void 0 ? void 0 : _a.split(','),
        mailjet: {
            apiKey: process.env.MAILJET_API_KEY,
            secretKey: process.env.MAILJET_SECRET_KEY,
            fromEmail: process.env.MAILJET_FROM_EMAIL,
            fromName: process.env.MAILJET_FROM_NAME,
        },
        // Shared secret for service-to-service HTTP calls (matched against
        // x-api-key header by RequireInternalApiKeyGuard).
        internal: {
            apiKey: process.env.INTERNAL_API_KEY,
        },
        // RabbitMQ — outbox worker publishes core.events here (consumed by
        // order-service for cache invalidation).
        rabbit: {
            url: process.env.RABBITMQ_URL,
            exchange: process.env.RABBITMQ_CORE_EVENTS_EXCHANGE || 'core.events',
            alternateExchange: process.env.RABBITMQ_CORE_EVENTS_AE || 'core.events.unroutable',
            alternateQueue: process.env.RABBITMQ_CORE_EVENTS_UNROUTABLE_QUEUE ||
                'core.events.unroutable.dlq',
            drainCron: process.env.OUTBOX_DRAIN_CRON || '* * * * * *',
            batchSize: parseInt(process.env.OUTBOX_BATCH_SIZE || '50', 10),
        },
    });
});
