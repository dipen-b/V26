import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getTeamDashboard(@Request() req: any) {
    return this.analyticsService.getTeamDashboard(req.user.userId);
  }

  @Get('team-performance')
  async getTeamPerformance(@Request() req: any) {
    return this.analyticsService.getTeamPerformance(req.user.userId);
  }

  @Get('top-performers')
  async getTopPerformers(
    @Request() req: any,
    @Query('limit') limit: number = 5,
  ) {
    return this.analyticsService.getTopPerformers(req.user.userId, limit);
  }

  @Get('readiness-trends')
  async getReadinessTrends(@Request() req: any) {
    return this.analyticsService.getReadinessTrends(req.user.userId);
  }

  @Get('skill-gap-analysis')
  async getSkillGapAnalysis(@Request() req: any) {
    return this.analyticsService.getSkillGapAnalysis(req.user.userId);
  }
}
