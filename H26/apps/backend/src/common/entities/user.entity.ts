import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Evaluation } from './evaluation.entity';
import { Task } from './task.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  @Column({ nullable: true })
  department?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  managerId?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Task, task => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => Evaluation, evaluation => evaluation.employee)
  evaluations: Evaluation[];

  @OneToMany(() => Evaluation, evaluation => evaluation.supervisor)
  supervisorEvaluations: Evaluation[];
}
