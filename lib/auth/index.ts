import { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, teams, teamMembers } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user[0] || !user[0].passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user[0].passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        
        // Get user's teams
        const userTeams = await db
          .select({
            teamId: teamMembers.teamId,
            role: teamMembers.role,
            teamName: teams.name,
            teamSlug: teams.slug,
          })
          .from(teamMembers)
          .innerJoin(teams, eq(teams.id, teamMembers.teamId))
          .where(eq(teamMembers.userId, user.id));

        token.teams = userTeams;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.teams = token.teams;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};

// Helper functions for role-based access control
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = ['member', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

export function canAccessTeam(userTeams: any[], teamId: string): boolean {
  return userTeams.some(team => team.teamId === teamId);
}

// Types for extended session
declare module 'next-auth' {
  interface User {
    role: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
      teams: Array<{
        teamId: string;
        role: string;
        teamName: string;
        teamSlug: string;
      }>;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    teams: Array<{
      teamId: string;
      role: string;
      teamName: string;
      teamSlug: string;
    }>;
  }
}