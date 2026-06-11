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
                // 1. Insert predefined roles
                return [4 /*yield*/, knex.raw("\n        INSERT INTO roles (name, display_name, description, created_at, updated_at) VALUES\n        ('owner', 'Restaurant Owner', 'Full access to all restaurant resources', NOW(), NOW()),\n        ('branch_manager', 'Branch Manager', 'Manages branch operations and staff', NOW(), NOW()),\n        ('staff', 'Staff Member', 'Limited access for daily operations', NOW(), NOW())\n        ON CONFLICT (name) DO NOTHING;\n    ")];
                case 1:
                    // 1. Insert predefined roles
                    _a.sent();
                    // 2. Insert permissions with AWS-like resource naming
                    return [4 /*yield*/, knex.raw("\n        INSERT INTO permissions (resource, action, created_at) VALUES\n        -- Product permissions\n        ('core:product', 'create', NOW()),\n        ('core:product', 'read', NOW()),\n        ('core:product', 'update', NOW()),\n\n        -- Member permissions\n        ('core:member', 'create', NOW()),\n        ('core:member', 'read', NOW()),\n        ('core:member', 'update', NOW()),\n        ('core:member', 'delete', NOW()),\n\n        -- Branch permissions\n        ('core:branch', 'create', NOW()),\n        ('core:branch', 'update', NOW()),\n\n        -- Restaurant settings permissions\n        ('core:restaurant', 'update', NOW())\n\n        ON CONFLICT (resource, action) DO NOTHING;\n    ")];
                case 2:
                    // 2. Insert permissions with AWS-like resource naming
                    _a.sent();
                    // 3. Owner gets ALL permissions
                    return [4 /*yield*/, knex.raw("\n        INSERT INTO role_permissions (role_id, permission_id, created_at)\n        SELECT r.id, p.id, NOW() FROM roles r, permissions p\n        WHERE r.name = 'owner'\n        ON CONFLICT DO NOTHING;\n    ")];
                case 3:
                    // 3. Owner gets ALL permissions
                    _a.sent();
                    // 4. Branch Manager permissions
                    return [4 /*yield*/, knex.raw("\n        INSERT INTO role_permissions (role_id, permission_id, created_at)\n        SELECT r.id, p.id, NOW() FROM roles r, permissions p\n        WHERE r.name = 'branch_manager'\n        AND p.resource || ':' || p.action IN (\n            'core:product:create',\n            'core:product:read',\n            'core:product:update',\n            'core:member:read',\n            'core:branch:update'\n        )\n        ON CONFLICT DO NOTHING;\n    ")];
                case 4:
                    // 4. Branch Manager permissions
                    _a.sent();
                    // 5. Staff permissions
                    return [4 /*yield*/, knex.raw("\n        INSERT INTO role_permissions (role_id, permission_id, created_at)\n        SELECT r.id, p.id, NOW() FROM roles r, permissions p\n        WHERE r.name = 'staff'\n        AND p.resource || ':' || p.action IN (\n            'core:product:read',\n            'core:member:read'\n        )\n        ON CONFLICT DO NOTHING;\n    ")];
                case 5:
                    // 5. Staff permissions
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
                // Clean up the data if we ever rollback this migration!
                return [4 /*yield*/, knex.raw("\n        DELETE FROM role_permissions;\n        DELETE FROM permissions;\n        DELETE FROM roles WHERE name IN ('owner', 'branch_manager', 'staff');\n    ")];
                case 1:
                    // Clean up the data if we ever rollback this migration!
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
