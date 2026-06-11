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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMemberBranchesDTO = exports.UpdateMemberDTO = exports.CreateMemberDTO = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var CreateMemberDTO = function () {
    var _a;
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _phoneNumber_decorators;
    var _phoneNumber_initializers = [];
    var _phoneNumber_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _branchIds_decorators;
    var _branchIds_initializers = [];
    var _branchIds_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateMemberDTO() {
                this.email = __runInitializers(this, _email_initializers, void 0);
                this.name = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.phoneNumber = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
                this.role = (__runInitializers(this, _phoneNumber_extraInitializers), __runInitializers(this, _role_initializers, void 0));
                this.branchIds = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _branchIds_initializers, void 0));
                __runInitializers(this, _branchIds_extraInitializers);
            }
            CreateMemberDTO._OPENAPI_METADATA_FACTORY = function () {
                return { email: { required: true, type: function () { return String; }, format: "email" }, name: { required: true, type: function () { return String; } }, phoneNumber: { required: true, type: function () { return String; } }, role: { required: true, type: function () { return String; } }, branchIds: { required: true, type: function () { return [Number]; } } };
            };
            return CreateMemberDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, class_validator_1.IsEmail)(), (0, class_validator_1.IsNotEmpty)()];
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _phoneNumber_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _role_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _branchIds_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: function (obj) { return "phoneNumber" in obj; }, get: function (obj) { return obj.phoneNumber; }, set: function (obj, value) { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _branchIds_decorators, { kind: "field", name: "branchIds", static: false, private: false, access: { has: function (obj) { return "branchIds" in obj; }, get: function (obj) { return obj.branchIds; }, set: function (obj, value) { obj.branchIds = value; } }, metadata: _metadata }, _branchIds_initializers, _branchIds_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateMemberDTO = CreateMemberDTO;
var UpdateMemberDTO = function () {
    var _a;
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateMemberDTO() {
                this.role = __runInitializers(this, _role_initializers, void 0);
                this.status = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                __runInitializers(this, _status_extraInitializers);
            }
            UpdateMemberDTO._OPENAPI_METADATA_FACTORY = function () {
                return { role: { required: false, type: function () { return String; } }, status: { required: false, type: function () { return String; }, enum: ['active', 'inactive', 'suspended'] } };
            };
            return UpdateMemberDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _role_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsIn)(['active', 'inactive', 'suspended'], {
                    message: 'Status must be exactly: active, inactive, or suspended',
                })];
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateMemberDTO = UpdateMemberDTO;
var UpdateMemberBranchesDTO = function () {
    var _a;
    var _branchIds_decorators;
    var _branchIds_initializers = [];
    var _branchIds_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateMemberBranchesDTO() {
                this.branchIds = __runInitializers(this, _branchIds_initializers, void 0);
                __runInitializers(this, _branchIds_extraInitializers);
            }
            UpdateMemberBranchesDTO._OPENAPI_METADATA_FACTORY = function () {
                return { branchIds: { required: true, type: function () { return [Number]; } } };
            };
            return UpdateMemberBranchesDTO;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _branchIds_decorators = [(0, class_validator_1.IsArray)({ message: 'branchIds must be an array' })];
            __esDecorate(null, null, _branchIds_decorators, { kind: "field", name: "branchIds", static: false, private: false, access: { has: function (obj) { return "branchIds" in obj; }, get: function (obj) { return obj.branchIds; }, set: function (obj, value) { obj.branchIds = value; } }, metadata: _metadata }, _branchIds_initializers, _branchIds_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateMemberBranchesDTO = UpdateMemberBranchesDTO;
