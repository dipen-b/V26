import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { SubmissionType } from '@/common/entities/submission.entity';

export class CreateSubmissionDto {
  @IsEnum(SubmissionType)
  type!: SubmissionType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
