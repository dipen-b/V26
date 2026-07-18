import { Repository } from 'typeorm';
import { User } from '@/common/entities/user.entity';
import { Evaluation } from '@/common/entities/evaluation.entity';
import { PerformanceMetric } from '@/common/entities/performance-metric.entity';
export declare class AnalyticsService {
    private usersRepository;
    private evaluationsRepository;
    private metricsRepository;
    constructor(usersRepository: Repository<User>, evaluationsRepository: Repository<Evaluation>, metricsRepository: Repository<PerformanceMetric>);
    getTeamDashboard(supervisorId: string): Promise<{
        totalEmployees: number;
        readyForProject: number;
        needsMentoring: number;
        atRisk: number;
        averageReadinessScore: number;
        teamHealthScore: number;
    }>;
    getTeamPerformance(supervisorId: string): Promise<{
        id: string;
        name: string;
        role: string;
        department: string;
        readinessScore: number;
        performanceScore: number;
        status: string;
        detailedScores: {
            codingQuality: number;
            deliverySpeed: number;
            testingQuality: number;
            architecture: number;
            problemSolving: number;
            documentation: number;
            ownership: number;
            aiUsage: number;
        };
    }[]>;
    getTopPerformers(supervisorId: string, limit?: number): Promise<{
        id: string;
        name: string;
        performanceScore: number;
    }[]>;
    getReadinessTrends(supervisorId: string): Promise<{
        name: string;
        data: {
            date: Date;
            score: number;
        }[];
    }[]>;
    getSkillGapAnalysis(supervisorId: string): Promise<Record<string, any>>;
    private getStatus;
}
//# sourceMappingURL=analytics.service.d.ts.map