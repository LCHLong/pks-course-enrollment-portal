import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/appError.js';
import { formatDateVN } from '../utils/date.js';

export interface UpdateProfileDTO {
  name: string;
}

export interface ChangePasswordDTO {
  current_password: string;
  new_password: string;
}

export class UserService {
  static async getProfile(userId: string) {
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

    return {
      ...user,
      registration_date: formatDateVN(user.created_at),
    };
  }

  static async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name.trim(),
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

    return {
      ...user,
      registration_date: formatDateVN(user.created_at),
    };
  }

  static async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Không tìm thấy người dùng.', 404);
    }

    const isMatch = await bcrypt.compare(data.current_password, user.password_hash);
    if (!isMatch) {
      throw new AppError('INVALID_CURRENT_PASSWORD', 'Mật khẩu hiện tại không chính xác.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const new_password_hash = await bcrypt.hash(data.new_password, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: new_password_hash,
      },
    });

    return { message: 'Đổi mật khẩu thành công.' };
  }
}
