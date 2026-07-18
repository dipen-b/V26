import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticalTask } from '@/common/entities/practical-task.entity';
import { User } from '@/common/entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { AiReviewService } from './ai-review.service';
import { generateTaskFromScores } from './task-generator';

@Injectable()
export class PracticalTasksService {
  constructor(
    @InjectRepository(PracticalTask) private tasksRepository: Repository<PracticalTask>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private aiReviewService: AiReviewService,
  ) {}

  /** Called after an evaluation is created — generates a dynamic task for the employee. */
  async generateFromEvaluation(params: {
    employee: User;
    supervisor: User;
    evaluationId: string;
    scores: Record<string, number>;
  }): Promise<PracticalTask> {
    const generated = generateTaskFromScores(params.scores);
    const task = this.tasksRepository.create({
      employee: params.employee,
      supervisor: params.supervisor,
      evaluationId: params.evaluationId,
      title: generated.title,
      description: generated.description,
      targetDimensions: generated.targetDimensions,
      requirements: generated.requirements,
      status: 'assigned',
      aiReviewStatus: 'none',
    });
    return this.tasksRepository.save(task);
  }

  /** Employee: list my assigned practical tasks (AI review details stripped out). */
  async getMyTasks(employeeId: string) {
    const tasks = await this.tasksRepository.find({
      where: { employee: { id: employeeId } },
      order: { createdAt: 'DESC' },
    });
    return tasks.map((t) => this.stripReviewForEmployee(t));
  }

  /** Supervisor: list all practical tasks for my team, with full AI review. */
  async getTeamTasks(supervisorId: string) {
    const supervisor = await this.requireSupervisor(supervisorId);
    const tasks = await this.tasksRepository.find({
      where: { supervisor: { id: supervisor.id } },
      relations: ['employee'],
      order: { updatedAt: 'DESC' },
    });
    return tasks.map((t) => this.stripEmployeeSecrets(t));
  }

  /** Employee: submit a GitHub URL, which triggers the AI review. */
  async submitWork(taskId: string, employeeId: string, githubUrl: string) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, employee: { id: employeeId } },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (!githubUrl || !githubUrl.trim()) {
      throw new BadRequestException('A GitHub repository URL is required');
    }
    if (!this.aiReviewService.parseGitHubUrl(githubUrl)) {
      throw new BadRequestException('Please provide a valid GitHub repository URL');
    }

    task.githubUrl = githubUrl.trim();
    task.submittedAt = new Date();
    task.status = 'submitted';
    task.aiReviewStatus = 'pending';
    task.aiReviewError = null;
    await this.tasksRepository.save(task);

    // Run the AI review inline, then persist the result.
    try {
      const review = await this.aiReviewService.reviewSubmission(
        task.githubUrl,
        task.targetDimensions,
        task.requirements,
      );
      task.aiReview = review;
      task.aiReviewStatus = 'completed';
      task.status = 'reviewed';
    } catch (err: any) {
      task.aiReviewStatus = 'failed';
      task.aiReviewError = err.message || 'AI review failed';
      task.status = 'submitted';
    }
    await this.tasksRepository.save(task);

    return this.stripReviewForEmployee(task);
  }

  /** Supervisor: full task incl. AI review. */
  async getTaskForSupervisor(taskId: string, supervisorId: string) {
    await this.requireSupervisor(supervisorId);
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, supervisor: { id: supervisorId } },
      relations: ['employee'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return this.stripEmployeeSecrets(task);
  }

  /** Supervisor: record a decision and close the task. */
  async recordDecision(taskId: string, supervisorId: string, decision: string) {
    await this.requireSupervisor(supervisorId);
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, supervisor: { id: supervisorId } },
      relations: ['employee'],
    });
    if (!task) throw new NotFoundException('Task not found');
    task.supervisorDecision = decision;
    task.status = 'closed';
    const saved = await this.tasksRepository.save(task);
    return this.stripEmployeeSecrets(saved);
  }

  private async requireSupervisor(supervisorId: string): Promise<User> {
    const supervisor = await this.usersRepository.findOne({ where: { id: supervisorId } });
    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException('Only supervisors can access this resource');
    }
    return supervisor;
  }

  /** Remove sensitive employee fields (e.g. password) from a supervisor-facing task. */
  private stripEmployeeSecrets(task: PracticalTask) {
    if (task.employee) {
      const { password, ...employee } = task.employee as any;
      return { ...task, employee };
    }
    return task;
  }

  /** Remove supervisor-only AI review data before returning to an employee. */
  private stripReviewForEmployee(task: PracticalTask) {
    const { aiReview, aiReviewError, supervisorDecision, ...safe } = task;
    return {
      ...safe,
      // Employee only sees whether a review has happened, not its contents.
      reviewCompleted: task.aiReviewStatus === 'completed',
    };
  }
}
