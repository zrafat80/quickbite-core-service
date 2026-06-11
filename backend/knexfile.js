"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var isProduction = process.env.NODE_ENV === 'production';
exports.default = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    // ADD THIS BLOCK:
    pool: {
        min: Number(process.env.DB_POOL_MIN) || 2,
        max: Number(process.env.DB_POOL_MAX) || 10,
    },
    migrations: {
        // Dynamically switch between src (TS) and dist (JS)
        directory: isProduction
            ? './dist/database/migrations'
            : './src/database/migrations',
        // Tell Knex to look for .js files in production, and .ts files locally
        extension: isProduction ? 'js' : 'ts',
    },
};
