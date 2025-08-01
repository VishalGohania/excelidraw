import 'next-auth';
import 'next-auth/jwt';
import { DefaultSession } from 'next-auth';


export type SignInFlow = "signIn" | "signUp";

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}
