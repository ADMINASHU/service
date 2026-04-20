import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email, isActive: true });
        if (!user) return null;
        const passwordsMatch = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (passwordsMatch) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            region: user.region,
            branch: user.branch,
          };
        }
        return null;
      },
    }),
  ],
});
