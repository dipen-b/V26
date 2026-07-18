import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '@/common/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@/common/enums/user-role.enum';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: {
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
        };
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
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
        };
        access_token: string;
    }>;
    validateUser(userId: string): Promise<User>;
}
//# sourceMappingURL=auth.service.d.ts.map