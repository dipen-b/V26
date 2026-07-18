import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    getMyProjects(req: any): Promise<import("../common/entities/project.entity").Project[]>;
    getProjectById(projectId: string): Promise<import("../common/entities/project.entity").Project>;
    getProjectTasks(projectId: string, req: any): Promise<import("../common/entities/task.entity").Task[]>;
}
//# sourceMappingURL=projects.controller.d.ts.map