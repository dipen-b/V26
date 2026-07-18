export declare class CreateEvaluationDto {
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
    improvementAreas?: string[];
    recommendations?: string[];
}
//# sourceMappingURL=create-evaluation.dto.d.ts.map