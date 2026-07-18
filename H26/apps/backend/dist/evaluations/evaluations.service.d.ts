import { Repository } from 'typeorm';
import { Evaluation } from '@/common/entities/evaluation.entity';
import { User } from '@/common/entities/user.entity';
import { PerformanceMetric } from '@/common/entities/performance-metric.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
export declare class EvaluationsService {
    private evaluationsRepository;
    private usersRepository;
    private metricsRepository;
    constructor(evaluationsRepository: Repository<Evaluation>, usersRepository: Repository<User>, metricsRepository: Repository<PerformanceMetric>);
    getMyEvaluations(employeeId: string): Promise<Evaluation[]>;
    getEmployeeEvaluation(employeeId: string, supervisorId: string): Promise<Evaluation[]>;
    createEvaluation(employeeId: string, supervisorId: string, evaluationDto: CreateEvaluationDto): Promise<Evaluation>;
    approveEvaluation(evaluationId: string, supervisorId: string): Promise<Evaluation>;
    overrideEvaluation(evaluationId: string, supervisorId: string, overrideData: UpdateEvaluationDto): Promise<Evaluation>;
    private calculateReadinessScore;
    private recordPerformanceMetric;
    getPerformanceHistory(employeeId: string, supervisorId: string): Promise<PerformanceMetric[]>;
}
//# sourceMappingURL=evaluations.service.d.ts.map