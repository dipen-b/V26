import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PracticalTasksService } from './practical-tasks.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('practical-tasks')
@UseGuards(JwtAuthGuard)
export class PracticalTasksController {
  constructor(private practicalTasksService: PracticalTasksService) {}

  // Employee: my assigned tasks (no AI review contents)
  @Get('mine')
  async getMyTasks(@Request() req: any) {
    return this.practicalTasksService.getMyTasks(req.user.userId);
  }

  // Employee: submit a GitHub URL -> triggers AI review
  @Post(':id/submit')
  async submit(
    @Param('id') id: string,
    @Body('githubUrl') githubUrl: string,
    @Request() req: any,
  ) {
    return this.practicalTasksService.submitWork(id, req.user.userId, githubUrl);
  }

  // Supervisor: all team tasks with full AI review
  @Get('team')
  async getTeamTasks(@Request() req: any) {
    return this.practicalTasksService.getTeamTasks(req.user.userId);
  }

  // Supervisor: single task with full AI review
  @Get(':id')
  async getTask(@Param('id') id: string, @Request() req: any) {
    return this.practicalTasksService.getTaskForSupervisor(id, req.user.userId);
  }

  // Supervisor: record decision + close
  @Post(':id/decision')
  async decide(
    @Param('id') id: string,
    @Body('decision') decision: string,
    @Request() req: any,
  ) {
    return this.practicalTasksService.recordDecision(id, req.user.userId, decision);
  }
}
