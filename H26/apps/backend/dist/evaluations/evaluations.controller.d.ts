import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
export declare class EvaluationsController {
    private evaluationsService;
    constructor(evaluationsService: EvaluationsService);
    getMyEvaluations(req: any): Promise<import("../common/entities/evaluation.entity").Evaluation[]>;
    getEmployeeEvaluations(employeeId: string, req: any): Promise<import("../common/entities/evaluation.entity").Evaluation[]>;
    createEvaluation(employeeId: string, evaluationDto: CreateEvaluationDto, req: any): Promise<import("../common/entities/evaluation.entity").Evaluation>;
    approveEvaluation(evaluationId: string, req: any): Promise<import("../common/entities/evaluation.entity").Evaluation>;
    overrideEvaluation(evaluationId: string, updateData: UpdateEvaluationDto, req: any): Promise<import("../common/entities/evaluation.entity").Evaluation>;
    getPerformanceHistory(employeeId: string, req: any): Promise<import("../common/entities/performance-metric.entity").PerformanceMetric[]>;
}
//# sourceMappingURL=evaluations.controller.d.ts.map