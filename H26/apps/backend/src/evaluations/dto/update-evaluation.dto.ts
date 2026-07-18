import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdateEvaluationDto {
  @IsObject()
  @IsOptional()
  scores?: {
    codingQuality?: number;
    deliverySpeed?: number;
    testingQuality?: number;
    architecture?: number;
    problemSolving?: number;
    documentation?: number;
    ownership?: number;
    aiUsage?: number;
  };

  @IsString()
  @IsOptional()
  supervisorNotes?: string;

  @IsObject()
  @IsOptional()
  overrideReason?: Record<string, any>;
}
