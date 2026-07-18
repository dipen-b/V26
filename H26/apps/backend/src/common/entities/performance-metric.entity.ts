import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('performance_metrics')
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'float' })
  readinessScore: number;

  @Column({ type: 'float' })
  performanceScore: number;

  @Column({
    type: 'json',
    default: () => "('{}')",
  })
  detailedScores: {
    codingQuality: number;
    deliverySpeed: number;
    testingQuality: number;
    architecture: number;
    problemSolving: number;
    documentation: number;
    ownership: number;
    aiUsage: number;
  };

  @Column({ type: 'json', nullable: true })
  trends?: Record<string, number[]>;

  @CreateDateColumn()
  recordedAt: Date;
}
