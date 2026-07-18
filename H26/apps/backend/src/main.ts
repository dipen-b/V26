import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function initializeSeedData(dataSource: DataSource) {
  try {
    const userRepository = dataSource.getRepository('User');
    const existingUsers = await userRepository.find();

    if (existingUsers.length === 0) {
      console.log('📌 Running seed data initialization...');
      // Import and run seed
      const { seedDemoData } = await import('./seed-data');
      await seedDemoData(dataSource);
    }
  } catch (error) {
    console.error('Failed to check/seed data:', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }));
        return new BadRequestException(formattedErrors);
      },
    }),
  );

  app.enableCors();

  // Initialize seed data if needed
  try {
    const dataSource = app.get(DataSource);
    await initializeSeedData(dataSource);
  } catch (error) {
    console.log('Seed data initialization skipped');
  }

  await app.listen(process.env.PORT || 3001);
  console.log(`Backend running on http://localhost:${process.env.PORT || 3001}`);
}

bootstrap();
