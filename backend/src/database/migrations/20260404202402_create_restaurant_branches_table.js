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
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // 1. Enable the PostGIS extension (Only runs if it doesn't exist yet)
                return [4 /*yield*/, knex.raw('CREATE EXTENSION IF NOT EXISTS postgis;')];
                case 1:
                    // 1. Enable the PostGIS extension (Only runs if it doesn't exist yet)
                    _a.sent();
                    // 2. Create the table
                    return [4 /*yield*/, knex.schema.createTable('restaurant_branches', function (table) {
                            // Matched to standard INTEGER so it connects to your restaurants table perfectly!
                            table.increments('id').primary();
                            table.bigInteger('restaurant_id').unsigned().notNullable();
                            table.foreign('restaurant_id', 'fk_restaurant_branches_restaurant_id')
                                .references('id')
                                .inTable('restaurants');
                            table.text('country_code').notNullable();
                            table.text('address_text').notNullable();
                            table.text('label').notNullable();
                            // 9 total digits, 6 after the decimal - perfect precision for GPS coordinates
                            table.decimal('lat', 9, 6).notNullable();
                            table.decimal('lng', 9, 6).notNullable();
                            table.boolean('is_active').notNullable().defaultTo(true);
                            table.time('opens_at').notNullable();
                            table.time('closes_at').notNullable();
                            table.boolean('accept_orders').notNullable().defaultTo(true);
                            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                            table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
                            table.smallint('delivery_radius').notNullable(); // Stored in meters usually!
                            // Our clean CHECK constraint for currency instead of a messy native enum
                            table.text('currency').notNullable();
                            table.check("currency IN ('EGP', 'SAR')", [], 'chk_branches_currency');
                            table.integer('commission').notNullable(); // e.g., 15 for 15%
                            // 🌟 THE MAGIC POSTGIS COLUMN!
                            // We use specificType to handle the complex 'GENERATED ALWAYS AS' logic
                            table.specificType('location', 'geography(Point, 4326) GENERATED ALWAYS AS (ST_MakePoint(lng::float, lat::float)::geography) STORED');
                            // Standard Indexes
                            table.index('restaurant_id', 'idx_restaurant_branches_restaurant_id');
                            table.index('is_active', 'idx_restaurant_branches_is_active');
                        })];
                case 2:
                    // 2. Create the table
                    _a.sent();
                    // 3. The GIST Index for Geographic Queries
                    // Knex doesn't have a native table.gistIndex(), so we use raw.
                    // This is what makes your location-based searches lightning fast!
                    return [4 /*yield*/, knex.raw('CREATE INDEX idx_restaurant_branches_location ON restaurant_branches USING GIST(location);')];
                case 3:
                    // 3. The GIST Index for Geographic Queries
                    // Knex doesn't have a native table.gistIndex(), so we use raw.
                    // This is what makes your location-based searches lightning fast!
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // We drop the table cleanly. 
                // Note: We DO NOT drop the PostGIS extension here, because if you have other 
                // geo-tables (like delivery drivers), dropping the extension would destroy them!
                return [4 /*yield*/, knex.schema.dropTableIfExists('restaurant_branches')];
                case 1:
                    // We drop the table cleanly. 
                    // Note: We DO NOT drop the PostGIS extension here, because if you have other 
                    // geo-tables (like delivery drivers), dropping the extension would destroy them!
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
