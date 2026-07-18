import { Controller, Get, Post, Param, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  @Get()
  async getMyEvaluations(@Request() req: any) {
    return this.evaluationsService.getMyEvaluations(req.user.userId);
  }

  @Get('employee/:employeeId')
  async getEmployeeEvaluations(
    @Param('employeeId') employeeId: string,
    @Request() req: any,
  ) {
    return this.evaluationsService.getEmployeeEvaluation(employeeId, req.user.userId);
  }

  @Post('employee/:employeeId')
  async createEvaluation(
    @Param('employeeId') employeeId: string,
    @Body() evaluationDto: CreateEvaluationDto,
    @Request() req: any,
  ) {
    return this.evaluationsService.createEvaluation(
      employeeId,
      req.user.userId,
      evaluationDto,
    );
  }

  @Patch(':id/approve')
  async approveEvaluation(@Param('id') evaluationId: string, @Request() req: any) {
    return this.evaluationsService.approveEvaluation(evaluationId, req.user.userId);
  }

  @Patch(':id/override')
  async overrideEvaluation(
    @Param('id') evaluationId: string,
    @Body() updateData: UpdateEvaluationDto,
    @Request() req: any,
  ) {
    return this.evaluationsService.overrideEvaluation(
      evaluationId,
      req.user.userId,
      updateData,
    );
  }

  @Get('history/:employeeId')
  async getPerformanceHistory(
    @Param('employeeId') employeeId: string,
    @Request() req: any,
  ) {
    return this.evaluationsService.getPerformanceHistory(employeeId, req.user.userId);
  }
}
