import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './common/entities/user.entity';
import { UserRole } from './common/enums/user-role.enum';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './skillproof_ai.db',
  entities: [User],
  synchronize: true,
});

async function seedDatabase() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  // Clear existing users
  await userRepo.clear();

  // Create employee user
  const hashedPassword = await bcrypt.hash('password', 10);

  const employee = userRepo.create({
    email: 'employee@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: hashedPassword,
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    position: 'Senior Developer',
    isActive: true,
  });

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

  await userRepo.save([employee, supervisor]);

  console.log('✅ Database seeded with demo users!');
  console.log('Employee: employee@example.com / password');
  console.log('Supervisor: supervisor@example.com / password');

  await AppDataSource.destroy();
}

seedDatabase().catch(console.error);
