import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticalTask } from '@/common/entities/practical-task.entity';
import { User } from '@/common/entities/user.entity';
import { PracticalTasksService } from './practical-tasks.service';
import { PracticalTasksController } from './practical-tasks.controller';
import { AiReviewService } from './ai-review.service';

@Module({
  imports: [TypeOrmModule.forFeature([PracticalTask, User])],
  providers: [PracticalTasksService, AiReviewService],
  controllers: [PracticalTasksController],
  exports: [PracticalTasksService],
})
export class PracticalTasksModule {}
