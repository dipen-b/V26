import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.evaluations, { onDelete: 'CASCADE' })
  employee: User;

  @ManyToOne(() => User, user => user.supervisorEvaluations, { onDelete: 'CASCADE' })
  supervisor: User;

  @Column({ type: 'json' })
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

  @Column({ type: 'json' })
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

  @Column({ type: 'json' })
  improvementAreas: string[];

  @Column({ type: 'json' })
  recommendations: string[];

  @Column({ type: 'float' })
  readinessScore: number;

  @Column({ nullable: true })
  supervisorNotes?: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isOverridden: boolean;

  @Column({ type: 'json', nullable: true })
  overrideReason?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
