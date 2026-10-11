import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../database/prisma";
import {
  RegisterDTO,
  LoginDTO,
  AuthPayload,
  AuthResponse,
} from "../types/auth";

const JWT_SECRET =
  process.env.JWT_SECRET || "default-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * ثبت‌نام کاربر جدید
   */
  static async register(input: RegisterDTO): Promise<AuthResponse> {
    const { username, password, email, fullName, role = Role.USER } = input;

    // بررسی وجود نام‌کاربری
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw Object.assign(new Error("نام کاربری قبلاً انتخاب شده است."), {
        status: 400,
      });
    }

    // بررسی وجود ایمیل در صورت ارسال
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw Object.assign(new Error("این ایمیل قبلاً ثبت شده است."), {
          status: 400,
        });
      }
    }

    // هش پسورد
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // ایجاد کاربر در دیتابیس
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email,
        fullName,
        role,
      },
    });

    // صدور توکن
    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      },
      token,
    };
  }

  /**
   * ورود کاربر و صدور JWT
   */
  static async login(input: LoginDTO): Promise<AuthResponse> {
    const { username, password } = input;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw Object.assign(new Error("نام کاربری یا رمز عبور اشتباه است."), {
        status: 401,
      });
    }

    if (!user.isActive) {
      throw Object.assign(new Error("حساب کاربری شما غیرفعال شده است."), {
        status: 403,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw Object.assign(new Error("نام کاربری یا رمز عبور اشتباه است."), {
        status: 401,
      });
    }

    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      },
      token,
    };
  }

  /**
   * دریافت پروفایل کاربر جاری
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error("کاربر یافت نشد."), { status: 404 });
    }

    return user;
  }

  /**
   * تولید JWT Token
   */
  static generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * اعتبارسنجی JWT Token
   */
  static verifyToken(token: string): AuthPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (
        typeof decoded !== "object" ||
        decoded === null ||
        !("userId" in decoded) ||
        !("username" in decoded) ||
        !("role" in decoded)
      ) {
        throw new Error("ساختار توکن نامعتبر است.");
      }

      return decoded as AuthPayload;
    } catch {
      throw Object.assign(new Error("توکن نامعتبر یا منقضی شده است."), {
        status: 401,
      });
    }
  }
}
