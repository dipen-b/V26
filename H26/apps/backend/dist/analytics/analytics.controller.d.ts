import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getTeamDashboard(req: any): Promise<{
        totalEmployees: number;
        readyForProject: number;
        needsMentoring: number;
        atRisk: number;
        averageReadinessScore: number;
        teamHealthScore: number;
    }>;
    getTeamPerformance(req: any): Promise<{
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
    getTopPerformers(req: any, limit?: number): Promise<{
        id: string;
        name: string;
        performanceScore: number;
    }[]>;
    getReadinessTrends(req: any): Promise<{
        name: string;
        data: {
            date: Date;
            score: number;
        }[];
    }[]>;
    getSkillGapAnalysis(req: any): Promise<Record<string, any>>;
}
//# sourceMappingURL=analytics.controller.d.ts.map