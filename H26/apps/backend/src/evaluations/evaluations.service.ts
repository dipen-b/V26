import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from '@/common/entities/evaluation.entity';
import { User } from '@/common/entities/user.entity';
import { PerformanceMetric } from '@/common/entities/performance-metric.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Evaluation) private evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(PerformanceMetric)
    private metricsRepository: Repository<PerformanceMetric>,
  ) {}

  async getMyEvaluations(employeeId: string) {
    return this.evaluationsRepository.find({
      where: { employee: { id: employeeId } },
      relations: ['supervisor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEmployeeEvaluation(employeeId: string, supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can create evaluations');
    }

    const employee = await this.usersRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const evaluations = await this.evaluationsRepository.find({
      where: { employee: { id: employeeId } },
      order: { createdAt: 'DESC' },
    });

    return evaluations;
  }

  async createEvaluation(
    employeeId: string,
    supervisorId: string,
    evaluationDto: CreateEvaluationDto,
  ) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can create evaluations');
    }

    const employee = await this.usersRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
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

  async approveEvaluation(evaluationId: string, supervisorId: string) {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id: evaluationId, supervisor: { id: supervisorId } },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    evaluation.isApproved = true;
    return this.evaluationsRepository.save(evaluation);
  }

  async overrideEvaluation(
    evaluationId: string,
    supervisorId: string,
    overrideData: UpdateEvaluationDto,
  ) {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id: evaluationId, supervisor: { id: supervisorId } },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
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

  private calculateReadinessScore(scores: any): number {
    const values = Object.values(scores) as number[];
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private async recordPerformanceMetric(
    userId: string,
    scores: any,
    readinessScore: number,
  ) {
    const performanceScore = (readinessScore + 50) / 1.5;

    const metric = this.metricsRepository.create({
      user: { id: userId },
      readinessScore,
      performanceScore: Math.min(100, performanceScore),
      detailedScores: scores,
    });

    await this.metricsRepository.save(metric);
  }

  async getPerformanceHistory(employeeId: string, supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can view performance history');
    }

    return this.metricsRepository.find({
      where: { user: { id: employeeId } },
      order: { recordedAt: 'DESC' },
      take: 12,
    });
  }
}
