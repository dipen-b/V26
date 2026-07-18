import { Controller, Get, Post, Param, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getMyTasks(@Request() req: any) {
    return this.tasksService.getMyTasks(req.user.userId);
  }

  @Get(':id')
  async getTaskById(@Param('id') taskId: string, @Request() req: any) {
    return this.tasksService.getTaskById(taskId, req.user.userId);
  }

  @Post(':id/submit')
  async submitWork(
    @Param('id') taskId: string,
    @Body() submissionDto: CreateSubmissionDto,
    @Request() req: any,
  ) {
    return this.tasksService.submitWork(taskId, req.user.userId, submissionDto);
  }

  @Get(':id/submissions')
  async getSubmissions(@Param('id') taskId: string, @Request() req: any) {
    return this.tasksService.getSubmissions(taskId, req.user.userId);
  }

  @Patch(':id/completion')
  async updateCompletion(
    @Param('id') taskId: string,
    @Body('completionPercentage') completionPercentage: number,
    @Request() req: any,
  ) {
    return this.tasksService.updateTaskCompletion(
      taskId,
      req.user.userId,
      completionPercentage,
    );
  }
}
