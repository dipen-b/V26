import { TasksService } from './tasks.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    getMyTasks(req: any): Promise<import("../common/entities/task.entity").Task[]>;
    getTaskById(taskId: string, req: any): Promise<import("../common/entities/task.entity").Task>;
    submitWork(taskId: string, submissionDto: CreateSubmissionDto, req: any): Promise<import("../common/entities/submission.entity").Submission>;
    getSubmissions(taskId: string, req: any): Promise<import("../common/entities/submission.entity").Submission[]>;
    updateCompletion(taskId: string, completionPercentage: number, req: any): Promise<import("../common/entities/task.entity").Task>;
}
//# sourceMappingURL=tasks.controller.d.ts.map