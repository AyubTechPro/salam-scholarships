import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No account found with this email address');
        }

        if (!user.password) {
          throw new Error('This account was created with a social login. Please sign in with Google or Apple.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Incorrect password');
        }

        // DEV: Allow super-admin to login without verification in development only
        const isDevelopment = process.env.NODE_ENV === 'development';
        const devSuperAdminEmail = process.env.SUPER_ADMIN_DEV_EMAIL;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || (devSuperAdminEmail && user.email === devSuperAdminEmail);
        
        if (!user.emailVerified && !(isDevelopment && isSuperAdmin)) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification code.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // Fetch user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            role: true,
            name: true,
            surname: true,
            email: true,
            image: true,
          },
        });
        token.role = dbUser?.role || 'USER';
        // Store name and image in token
        if (dbUser) {
          token.name = dbUser.name && dbUser.surname 
            ? `${dbUser.name} ${dbUser.surname}`.trim()
            : dbUser.name || dbUser.email?.split('@')[0] || 'User';
          token.image = dbUser.image || undefined;
          token.email = dbUser.email;
        }
      }
      // If session is being updated (e.g., via update() call), refresh user data
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { 
            role: true,
            name: true,
            surname: true,
            email: true,
            image: true,
          },
        });
        if (dbUser) {
          token.name = dbUser.name && dbUser.surname 
            ? `${dbUser.name} ${dbUser.surname}`.trim()
            : dbUser.name || dbUser.email?.split('@')[0] || 'User';
          token.image = dbUser.image || undefined;
          token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'USER';
        // Update name and image from token
        session.user.name = (token.name as string) || session.user.email?.split('@')[0] || 'User';
        session.user.image = (token.image as string) || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Role-based redirect is handled by login page and dashboard page
      // Allow callback URLs and relative URLs
      // If URL is relative, prepend baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If URL is absolute, validate it's from same origin
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) return url;
      } catch {
        // Invalid URL, fallback to baseUrl
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

