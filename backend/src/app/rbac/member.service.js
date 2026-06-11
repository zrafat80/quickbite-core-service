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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberService = void 0;
// Enums & Utils
var enums_1 = require("../user/enums");
var enums_2 = require("./enums");
var common_1 = require("@nestjs/common");
var rbac_constants_1 = require("./rbac.constants");
var time_utils_1 = require("../../../../../../../../../../../src/pkg/utils/time.utils");
var member_invitation_1 = require("./templates/member-invitation");
var MemberService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MemberService = _classThis = /** @class */ (function () {
        function MemberService_1(authService, authUtilsService, branchService, userService, roleRepo, restaurantMemberRepo, memberBranchRepo, permissionRepo, knex, emailProvider) {
            this.authService = authService;
            this.authUtilsService = authUtilsService;
            this.branchService = branchService;
            this.userService = userService;
            this.roleRepo = roleRepo;
            this.restaurantMemberRepo = restaurantMemberRepo;
            this.memberBranchRepo = memberBranchRepo;
            this.permissionRepo = permissionRepo;
            this.knex = knex;
            this.emailProvider = emailProvider;
        }
        MemberService_1.prototype.createOwnerMember = function (restaurantId, userId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                var ownerRoleId, now;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.roleRepo.findRoleByName('owner', trx)];
                        case 1:
                            ownerRoleId = _a.sent();
                            if (!ownerRoleId) {
                                throw new common_1.NotFoundException(rbac_constants_1.RBAC_ERRORS.ROLE_NOT_FOUND);
                            }
                            now = new Date();
                            return [2 /*return*/, this.restaurantMemberRepo.createRestaurantMember({
                                    restaurantId: restaurantId,
                                    userId: userId,
                                    roleId: ownerRoleId,
                                    status: enums_2.MemberStatus.ACTIVE,
                                    createdAt: now,
                                    updatedAt: now,
                                }, trx)];
                    }
                });
            });
        };
        MemberService_1.prototype.createMember = function (restaurantId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var roleId, branchIds, isValid, trx, user, member, otp, now, err_1, emailContent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (data.role === 'owner') {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.CANNOT_CREATE_OWNER_USERS);
                            }
                            return [4 /*yield*/, this.roleRepo.findRoleByName(data.role)];
                        case 1:
                            roleId = _a.sent();
                            if (!roleId) {
                                throw new common_1.NotFoundException(rbac_constants_1.RBAC_ERRORS.ROLE_NOT_FOUND);
                            }
                            branchIds = data.branchIds || [];
                            if (!(branchIds.length > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.branchService.verifyBranchesBelongToRestaurant(branchIds, restaurantId)];
                        case 2:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.NO_ACCESS_FOR_BRANCES);
                            }
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.knex.transaction()];
                        case 4:
                            trx = _a.sent();
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 12, , 14]);
                            now = new Date();
                            return [4 /*yield*/, this.userService.hashAndCreateUser({
                                    email: data.email,
                                    name: data.name,
                                    phone: data.phoneNumber,
                                    password: 'StrongStrongStrong1',
                                    createdAt: now,
                                    updatedAt: now,
                                }, enums_1.SystemRole.RESTAURANT_USER, trx, now)];
                        case 6:
                            user = _a.sent();
                            return [4 /*yield*/, this.restaurantMemberRepo.createRestaurantMember({
                                    restaurantId: restaurantId,
                                    userId: user.id,
                                    roleId: Number(roleId),
                                    createdAt: now,
                                    updatedAt: now,
                                    status: enums_2.MemberStatus.INACTIVE,
                                }, trx)];
                        case 7:
                            member = _a.sent();
                            if (!(branchIds.length > 0)) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.memberBranchRepo.setMemberBranches(member.id, branchIds, now, trx)];
                        case 8:
                            _a.sent();
                            _a.label = 9;
                        case 9: return [4 /*yield*/, this.authUtilsService.generateAndSaveOTP(user.id, time_utils_1.TimeUtils.hoursToMs(1), trx, now)];
                        case 10:
                            otp = _a.sent();
                            // 🌟 DATABASE WORK IS DONE. COMMIT IT NOW!
                            return [4 /*yield*/, trx.commit()];
                        case 11:
                            // 🌟 DATABASE WORK IS DONE. COMMIT IT NOW!
                            _a.sent();
                            return [3 /*break*/, 14];
                        case 12:
                            err_1 = _a.sent();
                            return [4 /*yield*/, trx.rollback()];
                        case 13:
                            _a.sent();
                            throw err_1; // Only DB errors will trigger a rollback and a 500 response
                        case 14:
                            emailContent = (0, member_invitation_1.memberInvitationEmail)(otp, data.role);
                            // Notice there is NO 'await' here!
                            this.emailProvider
                                .send(user.email, emailContent.subject, emailContent.html)
                                .catch(function (emailError) {
                                // If Mailjet crashes 3 seconds from now, it logs quietly here without breaking the app.
                                console.error("\uD83D\uDEA8 BACKGROUND EMAIL FAILED for ".concat(user.email, ":"), emailError.message);
                            });
                            // 🌟 Return immediately to the frontend!
                            return [2 /*return*/, {
                                    message: 'Member invited successfully',
                                    data: member,
                                }];
                    }
                });
            });
        };
        MemberService_1.prototype.listMembers = function (restaurantId) {
            return __awaiter(this, void 0, void 0, function () {
                var members;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantMemberRepo.findMembersByRestaurantId(restaurantId)];
                        case 1:
                            members = _a.sent();
                            return [2 /*return*/, members];
                    }
                });
            });
        };
        MemberService_1.prototype.updateMember = function (restaurantId, memberId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var result, member, newRoleId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantMemberRepo.findMemberWithRoleName(memberId)];
                        case 1:
                            result = _a.sent();
                            if (!result)
                                throw new common_1.NotFoundException(rbac_constants_1.RBAC_ERRORS.MEMBER_NOT_FOUND); // 🌟 Using Constant
                            member = result.member;
                            if (Number(member.restaurantId) !== Number(restaurantId)) {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.MEMBER_NOT_IN_RESTAURANT); // 🌟 Using Constant
                            }
                            newRoleId = null;
                            if (!data.role) return [3 /*break*/, 3];
                            if (data.role === 'owner') {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.CANNOT_REASSIGN_OWNER); // 🌟 Using Constant
                            }
                            return [4 /*yield*/, this.roleRepo.findRoleIdByName(data.role)];
                        case 2:
                            newRoleId = _a.sent();
                            if (!newRoleId)
                                throw new common_1.NotFoundException(rbac_constants_1.RBAC_ERRORS.ROLE_NOT_FOUND); // 🌟 Using Constant
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.restaurantMemberRepo.updateMember(memberId, {
                                roleId: newRoleId ? Number(newRoleId) : undefined,
                                status: data.status,
                            })];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, { message: 'Member updated successfully' }];
                    }
                });
            });
        };
        MemberService_1.prototype.deleteMember = function (restaurantId, memberId) {
            return __awaiter(this, void 0, void 0, function () {
                var result, member, roleName;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantMemberRepo.findMemberWithRoleName(memberId)];
                        case 1:
                            result = _a.sent();
                            if (!result)
                                throw new common_1.NotFoundException(rbac_constants_1.RBAC_ERRORS.MEMBER_NOT_FOUND); // 🌟 Using Constant
                            member = result.member, roleName = result.roleName;
                            if (Number(member.restaurantId) !== Number(restaurantId)) {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.MEMBER_NOT_IN_RESTAURANT); // 🌟 Using Constant
                            }
                            if (roleName === 'owner') {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.CANNOT_DELETE_OWNER); // 🌟 Using Constant
                            }
                            return [4 /*yield*/, this.restaurantMemberRepo.deleteMember(memberId)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { message: 'Member deleted successfully' }];
                    }
                });
            });
        };
        MemberService_1.prototype.updateMemberBranches = function (restaurantId, memberId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var result, member, roleName, isValid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantMemberRepo.findMemberWithRoleName(memberId)];
                        case 1:
                            result = _a.sent();
                            if (!result)
                                throw new common_1.NotFoundException(rbac_constants_1.RBAC_ERRORS.MEMBER_NOT_FOUND); // 🌟 Using Constant
                            member = result.member, roleName = result.roleName;
                            if (Number(member.restaurantId) !== Number(restaurantId)) {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.MEMBER_NOT_IN_RESTAURANT); // 🌟 Using Constant
                            }
                            if (roleName === 'owner') {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.OWNER_BRANCH_ACCESS_IMMUTABLE); // 🌟 Using Constant
                            }
                            if (!(data.branchIds && data.branchIds.length > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.branchService.verifyBranchesBelongToRestaurant(data.branchIds, restaurantId)];
                        case 2:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERRORS.NO_ACCESS_FOR_BRANCES); // 🌟 Re-used your existing constant!
                            }
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.memberBranchRepo.setMemberBranches(memberId, data.branchIds || [])];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, { message: 'Member branches access updated successfully' }];
                    }
                });
            });
        };
        MemberService_1.prototype.getRolePermissions = function (roleName) {
            return __awaiter(this, void 0, void 0, function () {
                var permissions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.permissionRepo.getPermissionsByRoleName(roleName)];
                        case 1:
                            permissions = _a.sent();
                            return [2 /*return*/, {
                                    role: roleName,
                                    permissions: permissions,
                                }];
                    }
                });
            });
        };
        // =======================================================================
        // EXISTING METHODS
        // =======================================================================
        MemberService_1.prototype.activateInvite = function (userId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantMemberRepo.activateMemberByUserId(userId, trx)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        MemberService_1.prototype.findRestaurantMemberWithRole = function (userId, trx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.restaurantMemberRepo.findRestaurantMemberWithRole(userId, trx)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        MemberService_1.prototype.findBranchIdsByMemberId = function (memberId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.memberBranchRepo.findBranchIdsByMemberId(memberId)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        return MemberService_1;
    }());
    __setFunctionName(_classThis, "MemberService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MemberService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MemberService = _classThis;
}();
exports.MemberService = MemberService;
