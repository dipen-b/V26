import { Repository } from 'typeorm';
import { User } from '@/common/entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    getAllEmployees(supervisorId: string): Promise<User[]>;
    getEmployeeById(employeeId: string, supervisorId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        department?: string;
        position?: string;
        managerId?: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        assignedTasks: import("../common/entities/task.entity").Task[];
        evaluations: import("../common/entities/evaluation.entity").Evaluation[];
        supervisorEvaluations: import("../common/entities/evaluation.entity").Evaluation[];
    }>;
    getUserById(id: string): Promise<User>;
    updateUserProfile(userId: string, updateData: Partial<User>): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        department?: string;
        position?: string;
        managerId?: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        assignedTasks: import("../common/entities/task.entity").Task[];
        evaluations: import("../common/entities/evaluation.entity").Evaluation[];
        supervisorEvaluations: import("../common/entities/evaluation.entity").Evaluation[];
    }>;
}
//# sourceMappingURL=users.service.d.ts.map