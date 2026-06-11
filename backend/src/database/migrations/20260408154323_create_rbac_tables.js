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
                // 1. Roles Table
                return [4 /*yield*/, knex.schema.createTable('roles', function (table) {
                        // Note: Knex uses increments() for serial. For exact smallserial, we use specificType
                        table.specificType('id', 'smallserial').primary();
                        table.text('name').notNullable().unique();
                        table.text('display_name').notNullable();
                        table.text('description');
                        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
                    })];
                case 1:
                    // 1. Roles Table
                    _a.sent();
                    // 2. Permissions Table
                    return [4 /*yield*/, knex.schema.createTable('permissions', function (table) {
                            table.increments('id').primary(); // SERIAL
                            table.text('resource').notNullable(); // e.g., 'products', 'branches'
                            table.text('action').notNullable(); // e.g., 'create', 'update', 'delete'
                            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                            // Auto-creates index starting with 'resource'
                            table.unique(['resource', 'action'], 'uq_permissions_resource_action');
                        })];
                case 2:
                    // 2. Permissions Table
                    _a.sent();
                    // 3. Role Permissions (Pivot)
                    return [4 /*yield*/, knex.schema.createTable('role_permissions', function (table) {
                            table.specificType('role_id', 'smallint').notNullable();
                            table.integer('permission_id').notNullable();
                            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                            // Composite PK (Auto-creates index for role_id)
                            table.primary(['role_id', 'permission_id'], 'pk_role_permissions');
                            // Cascades are PERFECT here
                            table.foreign('role_id', 'fk_role_permissions_role_id')
                                .references('id').inTable('roles').onDelete('CASCADE');
                            table.foreign('permission_id', 'fk_role_permissions_permission_id')
                                .references('id').inTable('permissions').onDelete('CASCADE');
                            // 🛡️ Left-to-Right Rule Fix: Add index for the right-side column
                            table.index('permission_id', 'idx_role_permissions_permission_id');
                        })];
                case 3:
                    // 3. Role Permissions (Pivot)
                    _a.sent();
                    // 4. Restaurant Members Table
                    return [4 /*yield*/, knex.schema.createTable('restaurant_members', function (table) {
                            table.bigIncrements('id').primary();
                            table.bigInteger('restaurant_id').unsigned().notNullable();
                            table.bigInteger('user_id').unsigned().notNullable();
                            table.specificType('role_id', 'smallint').notNullable();
                            // Knex Enums are perfectly translated to CHECK constraints or native enums
                            table.enum('status', ['active', 'inactive', 'suspended'], { useNative: true, enumName: 'member_status_enum' })
                                .notNullable().defaultTo('active');
                            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                            table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
                            // Auto-creates index starting with restaurant_id
                            table.unique(['restaurant_id', 'user_id'], 'uq_restaurant_members_rest_user');
                            // Foreign Keys
                            table.foreign('restaurant_id', 'fk_restaurant_members_restaurant_id')
                                .references('id').inTable('restaurants').onDelete('CASCADE');
                            table.foreign('user_id', 'fk_restaurant_members_user_id')
                                .references('id').inTable('users').onDelete('RESTRICT');
                            table.foreign('role_id', 'fk_restaurant_members_role_id')
                                .references('id').inTable('roles').onDelete('RESTRICT'); // Don't allow deleting a role if users are assigned to it!
                            // 🛡️ Left-to-Right Rule Fix: We need an index on user_id to find a user's memberships
                            table.index('user_id', 'idx_restaurant_members_user_id');
                        })];
                case 4:
                    // 4. Restaurant Members Table
                    _a.sent();
                    // 5. Member Branches (Pivot for Multi-Branch Access)
                    return [4 /*yield*/, knex.schema.createTable('member_branches', function (table) {
                            table.bigInteger('member_id').unsigned().notNullable();
                            table.bigInteger('branch_id').unsigned().notNullable();
                            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                            // Composite PK (Auto-creates index for member_id)
                            table.primary(['member_id', 'branch_id'], 'pk_member_branches');
                            // Cascades are PERFECT here
                            table.foreign('member_id', 'fk_member_branches_member_id')
                                .references('id').inTable('restaurant_members').onDelete('CASCADE');
                            table.foreign('branch_id', 'fk_member_branches_branch_id')
                                .references('id').inTable('restaurant_branches').onDelete('CASCADE');
                            // 🛡️ Left-to-Right Rule Fix: Needed to find all members of a specific branch
                            table.index('branch_id', 'idx_member_branches_branch_id');
                        })];
                case 5:
                    // 5. Member Branches (Pivot for Multi-Branch Access)
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
                // Drop tables in strict reverse order of creation to avoid FK constraint errors
                return [4 /*yield*/, knex.schema.dropTableIfExists('member_branches')];
                case 1:
                    // Drop tables in strict reverse order of creation to avoid FK constraint errors
                    _a.sent();
                    return [4 /*yield*/, knex.schema.dropTableIfExists('restaurant_members')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, knex.schema.dropTableIfExists('role_permissions')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, knex.schema.dropTableIfExists('permissions')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, knex.schema.dropTableIfExists('roles')];
                case 5:
                    _a.sent();
                    // Drop the custom enum type Postgres creates
                    return [4 /*yield*/, knex.raw("DROP TYPE IF EXISTS member_status_enum;")];
                case 6:
                    // Drop the custom enum type Postgres creates
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
