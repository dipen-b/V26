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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../common/entities/user.entity");
const evaluation_entity_1 = require("../common/entities/evaluation.entity");
const performance_metric_entity_1 = require("../common/entities/performance-metric.entity");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let AnalyticsService = class AnalyticsService {
    constructor(usersRepository, evaluationsRepository, metricsRepository) {
        this.usersRepository = usersRepository;
        this.evaluationsRepository = evaluationsRepository;
        this.metricsRepository = metricsRepository;
    }
    async getTeamDashboard(supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can access team analytics');
        }
        const employees = await this.usersRepository.find({
            where: {
                role: user_role_enum_1.UserRole.EMPLOYEE,
                ...(supervisor.department && { department: supervisor.department }),
            },
        });
        const totalEmployees = employees.length;
        const latestMetrics = await Promise.all(employees.map(emp => this.metricsRepository.findOne({
            where: { user: { id: emp.id } },
            order: { recordedAt: 'DESC' },
        })));
        const readyForProject = latestMetrics.filter(m => m?.readinessScore >= 85).length;
        const needsMentoring = latestMetrics.filter(m => m && m.readinessScore < 50).length;
        const atRisk = latestMetrics.filter(m => m && m.readinessScore < 60).length;
        const avgReadiness = latestMetrics.filter(m => m).reduce((sum, m) => sum + m.readinessScore, 0) /
            Math.max(1, latestMetrics.filter(m => m).length);
        return {
            totalEmployees,
            readyForProject,
            needsMentoring,
            atRisk,
            averageReadinessScore: Math.round(avgReadiness),
            teamHealthScore: Math.max(0, 100 - atRisk * 10),
        };
    }
    async getTeamPerformance(supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can access analytics');
        }
        const employees = await this.usersRepository.find({
            where: {
                role: user_role_enum_1.UserRole.EMPLOYEE,
                ...(supervisor.department && { department: supervisor.department }),
            },
        });
        const teamData = await Promise.all(employees.map(async (emp) => {
            const latestMetric = await this.metricsRepository.findOne({
                where: { user: { id: emp.id } },
                order: { recordedAt: 'DESC' },
            });
            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                role: emp.position,
                department: emp.department,
                readinessScore: latestMetric?.readinessScore || 0,
                performanceScore: latestMetric?.performanceScore || 0,
                status: this.getStatus(latestMetric?.readinessScore || 0),
                detailedScores: latestMetric?.detailedScores,
            };
        }));
        return teamData.sort((a, b) => b.readinessScore - a.readinessScore);
    }
    async getTopPerformers(supervisorId, limit = 5) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can access analytics');
        }
        const employees = await this.usersRepository.find({
            where: {
                role: user_role_enum_1.UserRole.EMPLOYEE,
                ...(supervisor.department && { department: supervisor.department }),
            },
        });
        const performanceData = await Promise.all(employees.map(async (emp) => {
            const latestMetric = await this.metricsRepository.findOne({
                where: { user: { id: emp.id } },
                order: { recordedAt: 'DESC' },
            });
            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                performanceScore: latestMetric?.performanceScore || 0,
            };
        }));
        return performanceData.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, limit);
    }
    async getReadinessTrends(supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can access analytics');
        }
        const employees = await this.usersRepository.find({
            where: {
                role: user_role_enum_1.UserRole.EMPLOYEE,
                ...(supervisor.department && { department: supervisor.department }),
            },
        });
        const trends = await Promise.all(employees.map(async (emp) => {
            const metrics = await this.metricsRepository.find({
                where: { user: { id: emp.id } },
                order: { recordedAt: 'DESC' },
                take: 10,
            });
            return {
                name: `${emp.firstName} ${emp.lastName}`,
                data: metrics.reverse().map(m => ({
                    date: m.recordedAt,
                    score: m.readinessScore,
                })),
            };
        }));
        return trends;
    }
    async getSkillGapAnalysis(supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can access analytics');
        }
        const employees = await this.usersRepository.find({
            where: {
                role: user_role_enum_1.UserRole.EMPLOYEE,
                ...(supervisor.department && { department: supervisor.department }),
            },
        });
        const skillGaps = {
            codingQuality: [],
            deliverySpeed: [],
            testingQuality: [],
            architecture: [],
            problemSolving: [],
            documentation: [],
            ownership: [],
            aiUsage: [],
        };
        for (const emp of employees) {
            const latestMetric = await this.metricsRepository.findOne({
                where: { user: { id: emp.id } },
                order: { recordedAt: 'DESC' },
            });
            if (latestMetric?.detailedScores) {
                Object.keys(skillGaps).forEach((skill) => {
                    skillGaps[skill].push({
                        name: `${emp.firstName} ${emp.lastName}`,
                        score: latestMetric.detailedScores[skill] || 0,
                    });
                });
            }
        }
        return skillGaps;
    }
    getStatus(readinessScore) {
        if (readinessScore >= 85)
            return 'Ready';
        if (readinessScore >= 70)
            return 'Progressing';
        if (readinessScore >= 50)
            return 'Developing';
        return 'At Risk';
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(evaluation_entity_1.Evaluation)),
    __param(2, (0, typeorm_1.InjectRepository)(performance_metric_entity_1.PerformanceMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map