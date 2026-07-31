import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { validateEmail, validatePassword } from '../utils/validators.util';
import { AppError } from '../middleware/error-handler.middleware';
import { User, CreateUserDTO } from '../models/User';

export class AuthService {
  async register(data: CreateUserDTO) {
    // Validate email
    if (!validateEmail(data.email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Validate password
    if (!validatePassword(data.password)) {
      throw new AppError(
        400,
        'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      );
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = $1',
      [data.email],
    );

    if (existingUser.rows.length > 0) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const userId = uuidv4();
    const result = await executeQuery(
      `INSERT INTO users (
        id, email, password_hash, first_name, last_name, age, gender,
        height_cm, current_weight_kg, goal_weight_kg, transformation_goal,
        country, is_premium, ad_consent, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING id, email, first_name, last_name`,
      [
        userId,
        data.email,
        passwordHash,
        data.firstName,
        data.lastName,
        data.age,
        data.gender,
        data.heightCm,
        data.currentWeightKg,
        data.goalWeightKg,
        data.transformationGoal,
        data.country,
        false,
        true,
        new Date(),
        new Date(),
      ],
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Validate email
    if (!validateEmail(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Find user
    const result = await executeQuery(
      'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      throw new AppError(401, 'Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const { id, email } = require('../utils/jwt.util').verifyRefreshToken(refreshToken);

      const result = await executeQuery(
        'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
        [id],
      );

      if (result.rows.length === 0) {
        throw new AppError(401, 'User not found');
      }

      const user = result.rows[0];
      const newAccessToken = generateAccessToken({ id: user.id, email: user.email });

      return { accessToken: newAccessToken };
    } catch (error: any) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  async validateEmail(email: string) {
    const result = await executeQuery(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    return result.rows.length === 0;
  }
}

export const authService = new AuthService();
