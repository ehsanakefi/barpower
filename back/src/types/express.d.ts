import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: Role;
        companyId?: string | null;
      };
    }
  }
}

export {};
