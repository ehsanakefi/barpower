import { Role } from "@prisma/client";

export interface RegisterDTO {
  username: string;
  password: string;
  email?: string;
  fullName?: string;
  role?: Role;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface AuthPayload {
  userId: string;
  username: string;
  role: Role;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string | null;
    fullName: string | null;
    role: Role;
    isActive: boolean;
  };
  token: string;
}
