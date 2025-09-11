"use client";

import AuthScreen from "@/components/auth/auth-screen";
import { SignInFlow } from "@/types/auth-types";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";



export default function AuthPage() {
  const searchParams = useSearchParams();
  const formType = useMemo(() => searchParams.get("authType") as SignInFlow, [searchParams]
  )
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session.accessToken) {
      setTimeout(() => router.push("/room"), 100)
      console.log("PROD JWT:", session.accessToken);
    }
  }, [status, router, session?.accessToken])

  if (status === "authenticated") {
    return null;
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <AuthScreen authType={formType} />
    </div>
  )
}