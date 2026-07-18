import { Task } from './task.entity';
export declare class Project {
    id: string;
    name: string;
    description?: string;
    department?: string;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    tasks: Task[];
}
//# sourceMappingURL=project.entity.d.ts.map