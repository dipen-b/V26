import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';

import { User } from './common/entities/user.entity';
import { Task } from './common/entities/task.entity';
import { Project } from './common/entities/project.entity';
import { Submission } from './common/entities/submission.entity';
import { Evaluation } from './common/entities/evaluation.entity';
import { PerformanceMetric } from './common/entities/performance-metric.entity';
import { PracticalTask } from './common/entities/practical-task.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { ProjectsModule } from './projects/projects.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PracticalTasksModule } from './practical-tasks/practical-tasks.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './skillproof_ai.db',
      entities: [User, Task, Project, Submission, Evaluation, PerformanceMetric, PracticalTask],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UsersModule,
    TasksModule,
    EvaluationsModule,
    ProjectsModule,
    AnalyticsModule,
    PracticalTasksModule,
  ],
})
export class AppModule {}
