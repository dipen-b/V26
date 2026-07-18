import { Repository } from 'typeorm';
import { Project } from '@/common/entities/project.entity';
import { Task } from '@/common/entities/task.entity';
export declare class ProjectsService {
    private projectsRepository;
    private tasksRepository;
    constructor(projectsRepository: Repository<Project>, tasksRepository: Repository<Task>);
    getMyProjects(employeeId: string): Promise<Project[]>;
    getProjectById(projectId: string): Promise<Project>;
    getProjectTasks(projectId: string, employeeId: string): Promise<Task[]>;
}
//# sourceMappingURL=projects.service.d.ts.map