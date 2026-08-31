import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { PartnerStatus, UserRole, UserStatus } from "@/generated/prisma/client";
import { canAccessProtectedPath } from "@/lib/auth/policies";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = credentialsSchema.safeParse(credentials);
        if (!result.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: result.data.email },
          include: {
            credential: true,
            partnerProfile: { select: { status: true } },
          },
        });

        if (!user?.credential || user.status !== UserStatus.ACTIVE) return null;
        if (
          user.role === UserRole.PARTNER &&
          user.partnerProfile?.status !== PartnerStatus.ACTIVE
        ) {
          return null;
        }

        const passwordMatches = await compare(
          result.data.password,
          user.credential.passwordHash,
        );

        if (!passwordMatches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.sessionVersion = user.sessionVersion;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.status = token.status;
      session.user.sessionVersion = token.sessionVersion;
      return session;
    },
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      const isProtected = ["/admin", "/partner", "/account"].some((prefix) =>
        pathname.startsWith(prefix),
      );

      if (!isProtected) return true;
      if (!session?.user || session.user.status !== UserStatus.ACTIVE) return false;

      return canAccessProtectedPath(session.user.role, pathname);
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "AUTH_SIGN_IN",
          entityType: "USER",
          entityId: user.id,
        },
      });
    },
  },
});
