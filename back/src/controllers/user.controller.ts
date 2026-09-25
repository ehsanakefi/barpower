import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { UserRole, UserStatus } from "@prisma/client";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const role =
      typeof req.query.role === "string"
        ? (req.query.role as UserRole)
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? (req.query.status as UserStatus)
        : undefined;

    const result = await userService.getAllUsers({
      page,
      limit,
      search,
      role,
      status,
    });

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(String(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, username, role, password } = req.body;

    if (!name || !username || !role || !password) {
      return res.status(400).json({
        success: false,
        message: "لطفاً تمام فیلدهای مورد نیاز را پر کنید",
      });
    }

    const user = await userService.createUser({
      name,
      username,
      role,
      password,
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const user = await userService.updateUserRole(String(id), role);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.toggleUserStatus(String(id));
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle user status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
