import { User } from './user.entity';
import { Project } from './project.entity';
import { Submission } from './submission.entity';
export declare enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    SUBMITTED = "submitted",
    EVALUATED = "evaluated",
    COMPLETED = "completed"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    estimatedHours?: number;
    completionPercentage: number;
    assignedTo: User;
    project: Project;
    createdAt: Date;
    updatedAt: Date;
    submissions: Submission[];
}
//# sourceMappingURL=task.entity.d.ts.map