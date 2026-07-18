import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

export enum SubmissionType {
  CODE = 'code',
  GITHUB_PR = 'github_pr',
  DOCUMENTATION = 'documentation',
  TEST_EVIDENCE = 'test_evidence',
  AI_PROMPT = 'ai_prompt',
  OTHER = 'other'
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: SubmissionType;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  submittedBy: User;

  @ManyToOne(() => Task, task => task.submissions, { onDelete: 'CASCADE' })
  task: Task;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
