import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    sessionVersion: number;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      sessionVersion: number;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    sessionVersion: number;
  }
}
