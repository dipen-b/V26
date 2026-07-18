import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("../common/entities/user.entity").User>;
    updateProfile(req: any, updateData: Record<string, any>): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../common/enums/user-role.enum").UserRole;
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
    getAllEmployees(req: any): Promise<import("../common/entities/user.entity").User[]>;
    getEmployeeById(employeeId: string, req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../common/enums/user-role.enum").UserRole;
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
//# sourceMappingURL=users.controller.d.ts.map