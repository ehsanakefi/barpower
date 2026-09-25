import { prisma } from "../database/connection";
import { UserRole, UserStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { hashPassword } from "../utils/hashPassword";

const userSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  status: true,
  created_at: true,
} as const;
// type UserDto = Prisma.UserGetPayload<{
//   select: typeof userSelect;
// }>;
interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}
interface CreateUserDto {
  name: string;
  username: string;
  password: string;
  role?: UserRole;
}

class UserService {
async getAllUsers(options: GetUsersOptions) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    ...(options.search && {
      OR: [
        {
          name: {
            contains: options.search,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: options.search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(options.role && {
      role: options.role,
    }),

    ...(options.status && {
      status: options.status,
    }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      select: userSelect,
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    },
  };
}

  async getUserById(id: string): Promise<GetUsersOptions | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async createUser(data: CreateUserDto) {
    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: await hashPassword(data.password),
        role: data.role && data.role,
      },
      select: userSelect,
    });
  }

  async updateUserRole(id: string, role: UserRole) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async toggleUserStatus(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new Error("User not found");

    return prisma.user.update({
      where: { id },
      data: {
        status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });
  }

  async getUserStats() {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: "ACTIVE" },
    });
    const adminUsers = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    const inactiveUsers = await prisma.user.count({
      where: { status: "INACTIVE" },
    });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers,
    };
  }
}
export const userService = new UserService();
