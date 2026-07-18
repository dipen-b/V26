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
exports.EvaluationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const evaluation_entity_1 = require("../common/entities/evaluation.entity");
const user_entity_1 = require("../common/entities/user.entity");
const performance_metric_entity_1 = require("../common/entities/performance-metric.entity");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let EvaluationsService = class EvaluationsService {
    constructor(evaluationsRepository, usersRepository, metricsRepository) {
        this.evaluationsRepository = evaluationsRepository;
        this.usersRepository = usersRepository;
        this.metricsRepository = metricsRepository;
    }
    async getMyEvaluations(employeeId) {
        return this.evaluationsRepository.find({
            where: { employee: { id: employeeId } },
            relations: ['supervisor'],
            order: { createdAt: 'DESC' },
        });
    }
    async getEmployeeEvaluation(employeeId, supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can create evaluations');
        }
        const employee = await this.usersRepository.findOne({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const evaluations = await this.evaluationsRepository.find({
            where: { employee: { id: employeeId } },
            order: { createdAt: 'DESC' },
        });
        return evaluations;
    }
    async createEvaluation(employeeId, supervisorId, evaluationDto) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can create evaluations');
        }
        const employee = await this.usersRepository.findOne({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const readinessScore = this.calculateReadinessScore(evaluationDto.scores);
        const evaluation = this.evaluationsRepository.create({
            employee,
            supervisor,
            scores: evaluationDto.scores,
            evidence: evaluationDto.evidence,
            improvementAreas: evaluationDto.improvementAreas || [],
            recommendations: evaluationDto.recommendations || [],
            readinessScore,
        });
        const savedEvaluation = await this.evaluationsRepository.save(evaluation);
        await this.recordPerformanceMetric(employeeId, evaluationDto.scores, readinessScore);
        return savedEvaluation;
    }
    async approveEvaluation(evaluationId, supervisorId) {
        const evaluation = await this.evaluationsRepository.findOne({
            where: { id: evaluationId, supervisor: { id: supervisorId } },
        });
        if (!evaluation) {
            throw new common_1.NotFoundException('Evaluation not found');
        }
        evaluation.isApproved = true;
        return this.evaluationsRepository.save(evaluation);
    }
    async overrideEvaluation(evaluationId, supervisorId, overrideData) {
        const evaluation = await this.evaluationsRepository.findOne({
            where: { id: evaluationId, supervisor: { id: supervisorId } },
        });
        if (!evaluation) {
            throw new common_1.NotFoundException('Evaluation not found');
        }
        if (overrideData.scores) {
            evaluation.scores = { ...evaluation.scores, ...overrideData.scores };
            evaluation.readinessScore = this.calculateReadinessScore(evaluation.scores);
        }
        evaluation.supervisorNotes = overrideData.supervisorNotes || evaluation.supervisorNotes;
        evaluation.isOverridden = true;
        evaluation.overrideReason = overrideData.overrideReason || {};
        return this.evaluationsRepository.save(evaluation);
    }
    calculateReadinessScore(scores) {
        const values = Object.values(scores);
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    async recordPerformanceMetric(userId, scores, readinessScore) {
        const performanceScore = (readinessScore + 50) / 1.5;
        const metric = this.metricsRepository.create({
            user: { id: userId },
            readinessScore,
            performanceScore: Math.min(100, performanceScore),
            detailedScores: scores,
        });
        await this.metricsRepository.save(metric);
    }
    async getPerformanceHistory(employeeId, supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can view performance history');
        }
        return this.metricsRepository.find({
            where: { user: { id: employeeId } },
            order: { recordedAt: 'DESC' },
            take: 12,
        });
    }
};
exports.EvaluationsService = EvaluationsService;
exports.EvaluationsService = EvaluationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(evaluation_entity_1.Evaluation)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(performance_metric_entity_1.PerformanceMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EvaluationsService);
//# sourceMappingURL=evaluations.service.js.map