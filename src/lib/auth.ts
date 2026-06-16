import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        if (account?.provider === 'google') {
          token.googleId = account.providerAccountId;
        }
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists
          let localUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Create user if doesn't exist
          if (!localUser) {
            localUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                googleId: account.providerAccountId,
                avatarUrl: user.image || null,
              },
            });
          }

          if (localUser) {
            user.id = localUser.id;
          }
        } catch (error) {
          console.error('Error creating user:', error);
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
