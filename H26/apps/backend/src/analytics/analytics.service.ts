import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/common/entities/user.entity';
import { Evaluation } from '@/common/entities/evaluation.entity';
import { PerformanceMetric } from '@/common/entities/performance-metric.entity';
import { UserRole } from '@/common/enums/user-role.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Evaluation) private evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(PerformanceMetric)
    private metricsRepository: Repository<PerformanceMetric>,
  ) {}

  async getTeamDashboard(supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can access team analytics');
    }

    const employees = await this.usersRepository.find({
      where: {
        role: UserRole.EMPLOYEE,
        ...(supervisor.department && { department: supervisor.department }),
      },
    });

    const totalEmployees = employees.length;
    const latestMetrics = await Promise.all(
      employees.map(emp =>
        this.metricsRepository.findOne({
          where: { user: { id: emp.id } },
          order: { recordedAt: 'DESC' },
        }),
      ),
    );

    const readyForProject = latestMetrics.filter(m => m?.readinessScore >= 85).length;
    const needsMentoring = latestMetrics.filter(m => m && m.readinessScore < 50).length;
    const atRisk = latestMetrics.filter(m => m && m.readinessScore < 60).length;

    const avgReadiness =
      latestMetrics.filter(m => m).reduce((sum, m) => sum + m.readinessScore, 0) /
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

  async getTeamPerformance(supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can access analytics');
    }

    const employees = await this.usersRepository.find({
      where: {
        role: UserRole.EMPLOYEE,
        ...(supervisor.department && { department: supervisor.department }),
      },
    });

    const teamData = await Promise.all(
      employees.map(async (emp) => {
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
      }),
    );

    return teamData.sort((a, b) => b.readinessScore - a.readinessScore);
  }

  async getTopPerformers(supervisorId: string, limit: number = 5) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can access analytics');
    }

    const employees = await this.usersRepository.find({
      where: {
        role: UserRole.EMPLOYEE,
        ...(supervisor.department && { department: supervisor.department }),
      },
    });

    const performanceData = await Promise.all(
      employees.map(async (emp) => {
        const latestMetric = await this.metricsRepository.findOne({
          where: { user: { id: emp.id } },
          order: { recordedAt: 'DESC' },
        });
        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          performanceScore: latestMetric?.performanceScore || 0,
        };
      }),
    );

    return performanceData.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, limit);
  }

  async getReadinessTrends(supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can access analytics');
    }

    const employees = await this.usersRepository.find({
      where: {
        role: UserRole.EMPLOYEE,
        ...(supervisor.department && { department: supervisor.department }),
      },
    });

    const trends = await Promise.all(
      employees.map(async (emp) => {
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
      }),
    );

    return trends;
  }

  async getSkillGapAnalysis(supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can access analytics');
    }

    const employees = await this.usersRepository.find({
      where: {
        role: UserRole.EMPLOYEE,
        ...(supervisor.department && { department: supervisor.department }),
      },
    });

    const skillGaps: Record<string, any> = {
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

  private getStatus(readinessScore: number): string {
    if (readinessScore >= 85) return 'Ready';
    if (readinessScore >= 70) return 'Progressing';
    if (readinessScore >= 50) return 'Developing';
    return 'At Risk';
  }
}
