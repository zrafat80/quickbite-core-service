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
                // 1. Product Categories
                return [4 /*yield*/, knex.schema.createTable('product_categories', function (table) {
                        table.bigIncrements('id').primary();
                        table.bigInteger('restaurant_id').unsigned().notNullable();
                        table.text('name').notNullable();
                        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
                        // 🛡️ EXPLICIT FOREIGN KEY NAME + RESTRICT
                        table.foreign('restaurant_id', 'fk_product_categories_restaurant_id')
                            .references('id').inTable('restaurants').onDelete('RESTRICT');
                        // EXPLICIT UNIQUE CONSTRAINT NAME
                        table.unique(['restaurant_id', 'name'], 'uq_product_categories_restaurant_name');
                        table.index('restaurant_id', 'idx_product_categories_restaurant_id');
                    })];
                case 1:
                    // 1. Product Categories
                    _a.sent();
                    // 2. Products (Global Catalog)
                    return [4 /*yield*/, knex.schema.createTable('products', function (table) {
                            table.bigIncrements('id').primary();
                            table.text('name').notNullable();
                            table.text('description');
                            table.text('image_url');
                            table.bigInteger('restaurant_id').unsigned().notNullable();
                            table.bigInteger('category_id').unsigned();
                            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                            table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
                            table.timestamp('deleted_at'); // No default needed for soft deletes
                            // 🛡️ EXPLICIT FOREIGN KEY NAMES
                            table.foreign('restaurant_id', 'fk_products_restaurant_id')
                                .references('id').inTable('restaurants').onDelete('RESTRICT');
                            table.foreign('category_id', 'fk_products_category_id')
                                .references('id').inTable('product_categories').onDelete('SET NULL');
                            table.index('restaurant_id', 'idx_products_restaurant_id');
                            table.index('category_id', 'idx_products_category_id');
                            table.index('deleted_at', 'idx_products_deleted_at');
                        })];
                case 2:
                    // 2. Products (Global Catalog)
                    _a.sent();
                    // 3. Product Branch Details (Local Pricing/Availability)
                    return [4 /*yield*/, knex.schema.createTable('product_branch_details', function (table) {
                            table.bigIncrements('id').primary();
                            table.bigInteger('branch_id').unsigned().notNullable();
                            table.bigInteger('product_id').unsigned().notNullable();
                            table.integer('price').notNullable();
                            table.integer('stock').notNullable().defaultTo(0);
                            table.boolean('is_available').notNullable().defaultTo(false); // Default to draft/hidden
                            // 🛡️ EXPLICIT FOREIGN KEY NAMES
                            table.foreign('branch_id', 'fk_pbd_branch_id')
                                .references('id').inTable('restaurant_branches').onDelete('RESTRICT');
                            table.foreign('product_id', 'fk_pbd_product_id')
                                .references('id').inTable('products').onDelete('RESTRICT');
                            // EXPLICIT UNIQUE CONSTRAINT NAME
                            table.unique(['branch_id', 'product_id'], 'uq_pbd_branch_product');
                            table.index('branch_id', 'idx_pbd_branch_id');
                            table.index('product_id', 'idx_pbd_product_id');
                        })];
                case 3:
                    // 3. Product Branch Details (Local Pricing/Availability)
                    _a.sent();
                    // 4. The Magic Trigger (Kept in raw SQL)
                    return [4 /*yield*/, knex.raw("\n    -- Trigger: auto-insert product_branch_details for all branches when a product is created\n    CREATE OR REPLACE FUNCTION fn_insert_product_branch_details()\n    RETURNS TRIGGER AS $$\n    BEGIN\n        INSERT INTO product_branch_details (branch_id, product_id, price, stock, is_available)\n        SELECT id, NEW.id, 0, 0, false\n        FROM restaurant_branches\n        WHERE restaurant_id = NEW.restaurant_id;\n        RETURN NEW;\n    END;\n    $$ LANGUAGE plpgsql;\n\n    CREATE TRIGGER trg_product_after_insert\n    AFTER INSERT ON products\n    FOR EACH ROW\n    EXECUTE FUNCTION fn_insert_product_branch_details();\n  ")];
                case 4:
                    // 4. The Magic Trigger (Kept in raw SQL)
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
                // Drop trigger and function first
                return [4 /*yield*/, knex.raw("\n    DROP TRIGGER IF EXISTS trg_product_after_insert ON products;\n    DROP FUNCTION IF EXISTS fn_insert_product_branch_details;\n  ")];
                case 1:
                    // Drop trigger and function first
                    _a.sent();
                    // Drop tables in reverse order of creation
                    return [4 /*yield*/, knex.schema.dropTableIfExists('product_branch_details')];
                case 2:
                    // Drop tables in reverse order of creation
                    _a.sent();
                    return [4 /*yield*/, knex.schema.dropTableIfExists('products')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, knex.schema.dropTableIfExists('product_categories')];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
