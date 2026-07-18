import { User } from './user.entity';
export declare class Evaluation {
    id: string;
    employee: User;
    supervisor: User;
    scores: {
        codingQuality: number;
        deliverySpeed: number;
        testingQuality: number;
        architecture: number;
        problemSolving: number;
        documentation: number;
        ownership: number;
        aiUsage: number;
    };
    evidence: {
        codingQuality: string;
        deliverySpeed: string;
        testingQuality: string;
        architecture: string;
        problemSolving: string;
        documentation: string;
        ownership: string;
        aiUsage: string;
    };
    improvementAreas: string[];
    recommendations: string[];
    readinessScore: number;
    supervisorNotes?: string;
    isApproved: boolean;
    isOverridden: boolean;
    overrideReason?: any;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=evaluation.entity.d.ts.map