import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './common/entities/user.entity';
import { UserRole } from './common/enums/user-role.enum';
import { Task } from './common/entities/task.entity';
import { Project } from './common/entities/project.entity';
import { Submission } from './common/entities/submission.entity';
import { Evaluation } from './common/entities/evaluation.entity';
import { PerformanceMetric } from './common/entities/performance-metric.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './skillproof_ai.db',
  entities: [User, Task, Project, Submission, Evaluation, PerformanceMetric],
  synchronize: true,
});

async function seedDatabase() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const performanceRepo = AppDataSource.getRepository(PerformanceMetric);

  // Check if data exists
  const existingUsers = await userRepo.find();
  if (existingUsers.length > 0) {
    console.log('✅ Database already seeded');
    await AppDataSource.destroy();
    return;
  }

  // Create demo users
  const hashedPassword = await bcrypt.hash('password', 10);

  const supervisor = userRepo.create({
    email: 'supervisor@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    password: hashedPassword,
    role: UserRole.SUPERVISOR,
    department: 'Engineering',
    position: 'Engineering Manager',
    isActive: true,
  });

  const employee1 = userRepo.create({
    email: 'employee@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: hashedPassword,
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    position: 'Senior Developer',
    isActive: true,
  });

  const employee2 = userRepo.create({
    email: 'dev2@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    password: hashedPassword,
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    position: 'Frontend Developer',
    isActive: true,
  });

  const employee3 = userRepo.create({
    email: 'dev3@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    password: hashedPassword,
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    position: 'Backend Developer',
    isActive: true,
  });

  const savedUsers = await userRepo.save([supervisor, employee1, employee2, employee3]);
  const [, savedEmp1, savedEmp2, savedEmp3] = savedUsers;

  // Create performance metrics
  const metricsData = [
    {
      user: savedEmp1,
      readinessScore: 82.5,
      performanceScore: 85,
      detailedScores: {
        codingQuality: 85,
        deliverySpeed: 78,
        testingQuality: 82,
        architecture: 88,
        problemSolving: 90,
        documentation: 75,
        ownership: 92,
        aiUsage: 70,
      },
    },
    {
      user: savedEmp2,
      readinessScore: 86.1,
      performanceScore: 88,
      detailedScores: {
        codingQuality: 92,
        deliverySpeed: 88,
        testingQuality: 85,
        architecture: 80,
        problemSolving: 87,
        documentation: 90,
        ownership: 85,
        aiUsage: 80,
      },
    },
    {
      user: savedEmp3,
      readinessScore: 72.9,
      performanceScore: 75,
      detailedScores: {
        codingQuality: 78,
        deliverySpeed: 72,
        testingQuality: 70,
        architecture: 75,
        problemSolving: 80,
        documentation: 68,
        ownership: 75,
        aiUsage: 65,
      },
    },
  ];

  for (const data of metricsData) {
    const metric = performanceRepo.create(data);
    await performanceRepo.save(metric);
  }

  console.log('✅ Database seeded with demo data!');
  console.log('Accounts:');
  console.log('  Supervisor: supervisor@example.com / password');
  console.log('  Employee 1: employee@example.com / password');
  console.log('  Employee 2: dev2@example.com / password');
  console.log('  Employee 3: dev3@example.com / password');

  await AppDataSource.destroy();
}

seedDatabase().catch(console.error);
