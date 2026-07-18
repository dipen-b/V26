import { User } from './user.entity';
export declare class PerformanceMetric {
    id: string;
    user: User;
    readinessScore: number;
    performanceScore: number;
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
    trends?: Record<string, number[]>;
    recordedAt: Date;
}
//# sourceMappingURL=performance-metric.entity.d.ts.map