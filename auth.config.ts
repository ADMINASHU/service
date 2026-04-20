import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isApiRoute = nextUrl.pathname.startsWith('/api');

      if (isApiRoute) {
        if (nextUrl.pathname.startsWith('/api/auth')) return true;
        if (!isLoggedIn) return Response.json({ error: "Unauthorized" }, { status: 401 });
        return true;
      }

      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      if (!isLoggedIn) return false; // redirects to signIn page
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.region = user.region;
        token.branch = user.branch;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.region = token.region as string;
        session.user.branch = token.branch as string;
      }
      return session;
    },
  },
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
