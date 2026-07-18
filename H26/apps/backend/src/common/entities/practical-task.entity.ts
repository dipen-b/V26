import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type PracticalTaskStatus =
  | 'assigned'       // generated from an evaluation, waiting for the employee
  | 'submitted'      // employee submitted a GitHub URL, AI review pending/running
  | 'reviewed'       // AI review complete, awaiting supervisor action
  | 'closed';        // supervisor acted on it

@Entity('practical_tasks')
export class PracticalTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  employee: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  supervisor: User;

  // The evaluation this task was generated from (id only, kept simple)
  @Column({ nullable: true })
  evaluationId?: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  // The weak dimensions this task targets, e.g. ['testingQuality','documentation']
  @Column({ type: 'json' })
  targetDimensions: string[];

  // Acceptance criteria the AI reviewer checks against
  @Column({ type: 'json' })
  requirements: string[];

  @Column({ type: 'varchar', default: 'assigned' })
  status: PracticalTaskStatus;

  // Employee submission
  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ type: 'datetime', nullable: true })
  submittedAt?: Date;

  // AI review result — SUPERVISOR-ONLY (never returned to the employee)
  @Column({ type: 'json', nullable: true })
  aiReview?: {
    overallScore: number;
    summary: string;
    dimensionScores: Record<string, number>;
    strengths: string[];
    issues: string[];
    recommendation: string;
    engine: string; // 'gemini' | 'heuristic'
  };

  @Column({ type: 'varchar', default: 'none' })
  aiReviewStatus: 'none' | 'pending' | 'completed' | 'failed';

  @Column({ type: 'text', nullable: true })
  aiReviewError?: string;

  // Supervisor's decision after reviewing the AI result
  @Column({ type: 'text', nullable: true })
  supervisorDecision?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
