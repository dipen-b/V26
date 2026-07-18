import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '@/common/entities/task.entity';
import { Submission, SubmissionType } from '@/common/entities/submission.entity';
import { User } from '@/common/entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
    @InjectRepository(Submission) private submissionsRepository: Repository<Submission>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getMyTasks(employeeId: string) {
    return this.tasksRepository.find({
      where: { assignedTo: { id: employeeId } },
      relations: ['project', 'submissions'],
      order: { dueDate: 'ASC' },
    });
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['assignedTo', 'project', 'submissions'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.assignedTo.id !== userId) {
      throw new ForbiddenException('You can only view your assigned tasks');
    }

    return task;
  }

  async submitWork(taskId: string, employeeId: string, submissionDto: CreateSubmissionDto) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, assignedTo: { id: employeeId } },
    });

    if (!task) {
      throw new NotFoundException('Task not found or not assigned to you');
    }

    const employee = await this.usersRepository.findOne({
      where: { id: employeeId },
    });

    const submission = this.submissionsRepository.create({
      type: submissionDto.type,
      content: submissionDto.content,
      url: submissionDto.url,
      metadata: submissionDto.metadata,
      task,
      submittedBy: employee,
    });

    return this.submissionsRepository.save(submission);
  }

  async getSubmissions(taskId: string, userId: string) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.submissionsRepository.find({
      where: { task: { id: taskId } },
      relations: ['submittedBy', 'task'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateTaskCompletion(taskId: string, employeeId: string, completionPercentage: number) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, assignedTo: { id: employeeId } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.completionPercentage = Math.min(100, completionPercentage);
    return this.tasksRepository.save(task);
  }
}
