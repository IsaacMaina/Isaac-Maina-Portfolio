// src/lib/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string; // Add role to session
    };
  }

  interface User {
    role?: string; // Add role to user
  }
}