"use client";

import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignInFlow } from "@/types/auth-types";

interface SigninCardProps {
  setFormType: (state: SignInFlow) => void;
}

export default function SigninCard({ setFormType: setState }: SigninCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const signInWithProvider = async (provider: "google" | "credentials") => {
    try {
      if (provider === "credentials") {
        const res = await signIn(provider, {
          email,
          password,
          action: "signin",
          redirect: false,
          callbackUrl: "/room",
        });
        if (res?.error) {
          setError(res.error);
        }
        if (!res?.error) {
          router.push("/room");
        }
      }
      if (provider === "google") {
        const res = await signIn(provider, {
          redirect: false,
          callbackUrl: "/room",
        });
        if (res?.error) {
          setError(res.error);
        }

        if (!res?.error) {
          router.push("/room");
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError("An unexpected error occurred.");
    } finally {
      setPending(false);
    }
  };

  const handlerCredentialSignin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setPending(true);
    signInWithProvider("credentials");
  };

  const handleGoogleSignin = (provider: "google") => {
    setError("");
    setPending(true);
    signInWithProvider(provider);
  };

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30 sm:opacity-50">
          <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-4 sm:-bottom-8 left-20 sm:left-40 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>
      <Card className="w-full border-purple-600 bg-gray-800 bg-opacity-50 p-8">
        <CardHeader className="w-full">
          <CardTitle className="text-center text-3xl font-bold text-white">
            Login to ExcelIdraw
          </CardTitle>
        </CardHeader>
        {!!error && (
          <div className="mb-6 flex w-full items-center gap-x-2 rounded-md bg-destructive p-3 text-sm text-white">
            <TriangleAlert className="size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <CardContent className="space-y-6 px-0 pb-0">
          <form onSubmit={handlerCredentialSignin} className="space-y-4">
            <Input
              disabled={pending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
              type="email"
              required
            />
            <Input
              disabled={pending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
              type="password"
              required
            />
            <Button
              disabled={pending}
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              size={"lg"}
            >
              Continue
            </Button>
          </form>
          <Separator className="bg-gradient-to-r from-gray-800 via-neutral-500 to-gray-800" />
          <div className="flex flex-col items-center gap-y-2.5">
            <Button
              disabled={pending}
              onClick={() => {
                handleGoogleSignin("google");
              }}
              size="lg"
              variant="outline"
              className="relative w-full bg-white text-black hover:bg-white/90"
            >
              <FcGoogle className="absolute left-2.5 top-3 size-5" />
              Continue with google
            </Button>
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <span
                className="cursor-pointer text-sky-700 hover:underline"
                onClick={() => setState("signUp")}
              >
                Sign up
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
