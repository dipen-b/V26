import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
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
        };
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
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
        };
        access_token: string;
    }>;
    getCurrentUser(req: any): Promise<import("../common/entities/user.entity").User>;
}
//# sourceMappingURL=auth.controller.d.ts.map