import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '@/common/entities/project.entity';
import { Task } from '@/common/entities/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getMyProjects(employeeId: string) {
    const tasks = await this.tasksRepository.find({
      where: { assignedTo: { id: employeeId } },
      relations: ['project'],
    });

    const projectIds = [...new Set(tasks.map(t => t.project.id))];
    if (projectIds.length === 0) return [];
    return this.projectsRepository.find({
      where: { id: In(projectIds) },
    });
  }

  async getProjectById(projectId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['tasks'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getProjectTasks(projectId: string, employeeId: string) {
    return this.tasksRepository.find({
      where: { project: { id: projectId }, assignedTo: { id: employeeId } },
      relations: ['project'],
    });
  }
}
