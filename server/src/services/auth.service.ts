import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/appError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production-at-least-32-chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterDTO) {
    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AppError('EMAIL_EXISTS', 'Email này đã được đăng ký trong hệ thống.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        password_hash,
        role: 'student',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  static async login(data: LoginDTO) {
    const email = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Email hoặc mật khẩu không chính xác.', 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      throw new AppError('INVALID_CREDENTIALS', 'Email hoặc mật khẩu không chính xác.', 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Không tìm thấy người dùng.', 404);
    }

    return user;
  }
}
