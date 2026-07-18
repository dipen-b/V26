import { IsObject, IsArray, IsString, IsOptional } from 'class-validator';

export class CreateEvaluationDto {
  @IsObject()
  scores: {
    codingQuality: number;
    deliverySpeed: number;
    testingQuality: number;
    architecture: number;
    problemSolving: number;
    documentation: number;
    ownership: number;
    aiUsage: number;
  };

  @IsObject()
  evidence: {
    codingQuality: string;
    deliverySpeed: string;
    testingQuality: string;
    architecture: string;
    problemSolving: string;
    documentation: string;
    ownership: string;
    aiUsage: string;
  };

  @IsArray()
  @IsOptional()
  improvementAreas?: string[];

  @IsArray()
  @IsOptional()
  recommendations?: string[];

  @IsString()
  @IsOptional()
  supervisorNotes?: string;
}
