import { Controller, Get, Param, UseGuards, Request, Body, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.getUserById(req.user.userId);
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() updateData: Record<string, any>) {
    return this.usersService.updateUserProfile(req.user.userId, updateData);
  }

  @Get('employees')
  async getAllEmployees(@Request() req: any) {
    return this.usersService.getAllEmployees(req.user.userId);
  }

  @Get('employees/:id')
  async getEmployeeById(@Param('id') employeeId: string, @Request() req: any) {
    return this.usersService.getEmployeeById(employeeId, req.user.userId);
  }
}
