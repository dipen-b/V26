import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async getMyProjects(@Request() req: any) {
    return this.projectsService.getMyProjects(req.user.userId);
  }

  @Get(':id')
  async getProjectById(@Param('id') projectId: string) {
    return this.projectsService.getProjectById(projectId);
  }

  @Get(':id/tasks')
  async getProjectTasks(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.getProjectTasks(projectId, req.user.userId);
  }
}
