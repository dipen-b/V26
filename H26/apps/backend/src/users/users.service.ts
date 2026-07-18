import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/common/entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async getAllEmployees(supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException(
        'Only supervisors can view employees',
      );
    }

    return this.usersRepository.find({
      where: {
        role: UserRole.EMPLOYEE,
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

  async getEmployeeById(employeeId: string, supervisorId: string) {
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException(
        'Only supervisors can view employee details',
      );
    }

    const employee = await this.usersRepository.findOne({
      where: { id: employeeId, role: UserRole.EMPLOYEE },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (supervisor.department && employee.department !== supervisor.department) {
      throw new ForbiddenException(
        'You can only view employees in your department',
      );
    }

    const { password, ...result } = employee;
    return result;
  }

  async getUserById(id: string) {
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

  async updateUserProfile(userId: string, updateData: Partial<User>) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    await this.usersRepository.save(user);
    const { password, ...result } = user;
    return result;
  }
}
