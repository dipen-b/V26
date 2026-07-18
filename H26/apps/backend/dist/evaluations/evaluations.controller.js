"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationsController = void 0;
const common_1 = require("@nestjs/common");
const evaluations_service_1 = require("./evaluations.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_evaluation_dto_1 = require("./dto/create-evaluation.dto");
const update_evaluation_dto_1 = require("./dto/update-evaluation.dto");
let EvaluationsController = class EvaluationsController {
    constructor(evaluationsService) {
        this.evaluationsService = evaluationsService;
    }
    async getMyEvaluations(req) {
        return this.evaluationsService.getMyEvaluations(req.user.userId);
    }
    async getEmployeeEvaluations(employeeId, req) {
        return this.evaluationsService.getEmployeeEvaluation(employeeId, req.user.userId);
    }
    async createEvaluation(employeeId, evaluationDto, req) {
        return this.evaluationsService.createEvaluation(employeeId, req.user.userId, evaluationDto);
    }
    async approveEvaluation(evaluationId, req) {
        return this.evaluationsService.approveEvaluation(evaluationId, req.user.userId);
    }
    async overrideEvaluation(evaluationId, updateData, req) {
        return this.evaluationsService.overrideEvaluation(evaluationId, req.user.userId, updateData);
    }
    async getPerformanceHistory(employeeId, req) {
        return this.evaluationsService.getPerformanceHistory(employeeId, req.user.userId);
    }
};
exports.EvaluationsController = EvaluationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "getMyEvaluations", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "getEmployeeEvaluations", null);
__decorate([
    (0, common_1.Post)('employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_evaluation_dto_1.CreateEvaluationDto, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "createEvaluation", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "approveEvaluation", null);
__decorate([
    (0, common_1.Patch)(':id/override'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_evaluation_dto_1.UpdateEvaluationDto, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "overrideEvaluation", null);
__decorate([
    (0, common_1.Get)('history/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "getPerformanceHistory", null);
exports.EvaluationsController = EvaluationsController = __decorate([
    (0, common_1.Controller)('evaluations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [evaluations_service_1.EvaluationsService])
], EvaluationsController);
//# sourceMappingURL=evaluations.controller.js.map