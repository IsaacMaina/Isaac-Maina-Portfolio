import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Simplified version without db-service import to test NextAuth itself
const handler = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log('Authorize function called with:', credentials);
        // For now just return a mock user to see if NextAuth works
        return {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User'
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});

console.log('Handler created:', typeof handler);
console.log('Handler object:', handler);
console.log('Handlers property:', handler.handlers);

export const { handlers, signIn, signOut, auth } = handler;

console.log('Exported handlers:', handlers);
console.log('GET handler exists:', typeof handlers?.GET !== 'undefined');
console.log('POST handler exists:', typeof handlers?.POST !== 'undefined');