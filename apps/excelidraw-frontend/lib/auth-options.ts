import { HTTP_BACKEND } from "@/config";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" }, // "signin" or "signup"
        name: { label: "Name", type: "text" }, // Only for signup
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const isSignup = credentials.action === "signup";
        const endpoint = isSignup ? "/auth/signup" : "/auth/login";
        try {
          const res = await fetch(`${HTTP_BACKEND}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              name: credentials.name, // Only for signup
            }),
          });
          if (!res.ok) return null;
          const user = await res.json();
          return user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account?.provider === "google" && user) {
        try {
          const res = await fetch(`${HTTP_BACKEND}/auth/google-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });
          if (res.ok) {
            const dbUser = await res.json();
            token.id = dbUser.id;
          }
        } catch (error) {
          console.error("Google user creation error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };