import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from '@/common/entities/evaluation.entity';
import { User } from '@/common/entities/user.entity';
import { PerformanceMetric } from '@/common/entities/performance-metric.entity';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { PracticalTasksModule } from '@/practical-tasks/practical-tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation, User, PerformanceMetric]),
    PracticalTasksModule,
  ],
  providers: [EvaluationsService],
  controllers: [EvaluationsController],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
