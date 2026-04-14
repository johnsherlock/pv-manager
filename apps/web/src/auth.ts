import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';
import { eq, or } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile?.email) return false;

      const googleSub = account.providerAccountId;
      const email = profile.email;
      const displayName = profile.name ?? null;

      // Look up by sub first, then fall back to email (handles seeded users
      // whose authUserId is a placeholder rather than their real Google sub).
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(or(eq(users.authUserId, googleSub), eq(users.email, email)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          authUserId: googleSub,
          email,
          displayName,
          role: 'user',
          status: 'awaiting_approval',
          termsAcceptedAt: new Date(),
        });
      } else {
        // Ensure the real Google sub is stored (fixes seeded placeholder subs)
        await db
          .update(users)
          .set({ authUserId: googleSub, updatedAt: new Date() })
          .where(eq(users.id, existing[0].id));
      }

      return true;
    },

    async jwt({ token, account, profile }) {
      // On first sign-in, populate token from DB
      if (account && profile?.email) {
        const googleSub = account.providerAccountId;
        const rows = await db
          .select({ id: users.id, role: users.role, status: users.status })
          .from(users)
          .where(eq(users.authUserId, googleSub))
          .limit(1);

        if (rows[0]) {
          token.userId = rows[0].id;
          token.role = rows[0].role;
          token.status = rows[0].status;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) session.userId = token.userId as string;
      if (token.role) session.role = token.role as string;
      if (token.status) session.status = token.status as string;
      return session;
    },
  },

  pages: {
    signIn: '/sign-in',
  },
};
