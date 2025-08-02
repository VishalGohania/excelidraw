import { HTTP_BACKEND } from "@/config";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }
        if(credentials.action === "signin"){
          try {
            const res = await fetch(`${HTTP_BACKEND}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Failed to sign in");
            } 

            const responseData = await res.json();
            return responseData.data;
          } catch (error: any) {
            throw new Error(error.message);
          }
        }
        return null;
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
      if (user) {
        const backendUser = user as any;
        token.accessToken = backendUser.token;
        token.id = backendUser.user?.id;
      }
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
            const dbUserResponse = await res.json();
            const dbUser = dbUserResponse.data;
            token.id = dbUser.user.id;
            token.accessToken = dbUser.token;
          }
        } catch (error) {
          console.error("Google user creation error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // if (token && session.user) session.user.id = token.id as string;
      if(token) {
        session.accessToken = token.accessToken as string;
        if(session.user) {
          session.user.id = token.id as string;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };