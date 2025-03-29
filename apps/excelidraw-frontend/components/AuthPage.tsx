"use client";

import SignIn from "@/app/(auth)/signin/page";
import Signup from "@/app/(auth)/signup/page";


export function AuthPage({ isSignin }: { isSignin: boolean }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {isSignin ? <SignIn /> : <Signup />}
      </div>
    </div>
  );
}