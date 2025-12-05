// src/lib/auth/authConfig.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { validateLoginCredentials } from '@/lib/validation';
import { verifyPassword } from './utils';
import { mapDatabaseRoleToEnum } from './utils';
import { getDb } from '@/lib/db-connector';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate credentials using our validation utilities
          validateLoginCredentials({
            email: credentials?.email || "",
            password: credentials?.password || ""
          });

          // Get database instance
          const db = getDb();

          // Find user by email
          const result = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials!.email));

          const user = result[0] || null;

          if (!user || !user.password) {
            // Even if user doesn't exist, we still verify the password to prevent timing attacks
            try {
              await verifyPassword(credentials!.password, '$2a$10$invalidhashforsecurity');
            } catch (timingError) {
              // Ignore errors during dummy password verification for timing attack prevention
            }
            throw new Error('Invalid email or password');
          }

          // Verify password
          const passwordsMatch = await verifyPassword(credentials!.password, user.password);

          if (!passwordsMatch) {
            throw new Error('Invalid email or password');
          }

          // Return user object if authenticated
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error("Error during authorization:", error);
          // Re-throw the error instead of returning null to show the proper message
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error('Invalid email or password');
          }
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.sub = user.id;
        // Convert database role string to enum value for proper authorization
        const mappedRole = mapDatabaseRoleToEnum(user.role as string);
        token.role = mappedRole;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // Security settings
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // Add security headers to JWT
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // Enable csrf protection
  csrfToken: true,
};

const handler = NextAuth(authOptions);

// Export the handlers
export { handler as GET, handler as POST };
export default handler;

// Export the auth function for server components
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;