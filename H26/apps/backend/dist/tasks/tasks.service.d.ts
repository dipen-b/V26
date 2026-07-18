import { Repository } from 'typeorm';
import { Task } from '@/common/entities/task.entity';
import { Submission } from '@/common/entities/submission.entity';
import { User } from '@/common/entities/user.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class TasksService {
    private tasksRepository;
    private submissionsRepository;
    private usersRepository;
    constructor(tasksRepository: Repository<Task>, submissionsRepository: Repository<Submission>, usersRepository: Repository<User>);
    getMyTasks(employeeId: string): Promise<Task[]>;
    getTaskById(taskId: string, userId: string): Promise<Task>;
    submitWork(taskId: string, employeeId: string, submissionDto: CreateSubmissionDto): Promise<Submission>;
    getSubmissions(taskId: string, userId: string): Promise<Submission[]>;
    updateTaskCompletion(taskId: string, employeeId: string, completionPercentage: number): Promise<Task>;
}
//# sourceMappingURL=tasks.service.d.ts.map