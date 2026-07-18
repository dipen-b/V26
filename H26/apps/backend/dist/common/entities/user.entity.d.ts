import { Evaluation } from './evaluation.entity';
import { Task } from './task.entity';
import { UserRole } from '../enums/user-role.enum';
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    department?: string;
    position?: string;
    managerId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    assignedTasks: Task[];
    evaluations: Evaluation[];
    supervisorEvaluations: Evaluation[];
}
//# sourceMappingURL=user.entity.d.ts.map