import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './common/entities/user.entity';
import { PerformanceMetric } from './common/entities/performance-metric.entity';
import { UserRole } from './common/enums/user-role.enum';

export async function seedDemoData(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const performanceRepo = dataSource.getRepository(PerformanceMetric);

  const hashedPassword = await bcrypt.hash('password', 10);

  // Create supervisor
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

  // Create employees
  const employee1 = userRepo.create({
    email: 'employee@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: hashedPassword,
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    position: 'Senior Developer',
    managerId: supervisor.id,
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
    managerId: supervisor.id,
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
    managerId: supervisor.id,
    isActive: true,
  });

  const savedUsers = await userRepo.save([supervisor, employee1, employee2, employee3]);
  const [savedSupervisor, savedEmp1, savedEmp2, savedEmp3] = savedUsers;

  // Create performance metrics
  const metricsData = [
    {
      employee: savedEmp1,
      supervisor: savedSupervisor,
      scores: {
        codingQuality: 85,
        deliverySpeed: 78,
        testingQuality: 82,
        architecture: 88,
        problemSolving: 90,
        documentation: 75,
        ownership: 92,
        aiUsage: 70,
      },
      readinessScore: 82.5,
    },
    {
      employee: savedEmp2,
      supervisor: savedSupervisor,
      scores: {
        codingQuality: 92,
        deliverySpeed: 88,
        testingQuality: 85,
        architecture: 80,
        problemSolving: 87,
        documentation: 90,
        ownership: 85,
        aiUsage: 80,
      },
      readinessScore: 86.1,
    },
    {
      employee: savedEmp3,
      supervisor: savedSupervisor,
      scores: {
        codingQuality: 78,
        deliverySpeed: 72,
        testingQuality: 70,
        architecture: 75,
        problemSolving: 80,
        documentation: 68,
        ownership: 75,
        aiUsage: 65,
      },
      readinessScore: 72.9,
    },
  ];

  for (const data of metricsData) {
    const metric = performanceRepo.create(data);
    await performanceRepo.save(metric);
  }

  console.log('✅ Demo data seeded successfully!');
}
