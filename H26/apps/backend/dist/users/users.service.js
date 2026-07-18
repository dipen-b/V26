"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../common/entities/user.entity");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async getAllEmployees(supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can view employees');
        }
        return this.usersRepository.find({
            where: {
                role: user_role_enum_1.UserRole.EMPLOYEE,
                ...(supervisor.department && { department: supervisor.department }),
            },
            select: [
                'id',
                'email',
                'firstName',
                'lastName',
                'department',
                'position',
                'isActive',
                'createdAt',
            ],
            order: { createdAt: 'DESC' },
        });
    }
    async getEmployeeById(employeeId, supervisorId) {
        const supervisor = await this.usersRepository.findOne({
            where: { id: supervisorId },
        });
        if (!supervisor || supervisor.role !== user_role_enum_1.UserRole.SUPERVISOR) {
            throw new common_1.ForbiddenException('Only supervisors can view employee details');
        }
        const employee = await this.usersRepository.findOne({
            where: { id: employeeId, role: user_role_enum_1.UserRole.EMPLOYEE },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        if (supervisor.department && employee.department !== supervisor.department) {
            throw new common_1.ForbiddenException('You can only view employees in your department');
        }
        const { password, ...result } = employee;
        return result;
    }
    async getUserById(id) {
        return this.usersRepository.findOne({
            where: { id },
            select: [
                'id',
                'email',
                'firstName',
                'lastName',
                'role',
                'department',
                'position',
                'isActive',
            ],
        });
    }
    async updateUserProfile(userId, updateData) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(user, updateData);
        await this.usersRepository.save(user);
        const { password, ...result } = user;
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map