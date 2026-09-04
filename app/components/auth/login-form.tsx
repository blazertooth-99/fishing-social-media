"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// import { useAuth } from "@/hooks/use-auth";

export default function LoginForm() {
  // const { loginWithGoogle, loading } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-field", {
        y: 15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.4,
        ease: "power2.out",
      });
    }, formRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={formRef}>
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-emerald-600">
          Welcome back 👋
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Welcome back,
          <br />
          <span className="text-emerald-600">Angler.</span>
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sign in to continue your fishing journey and see what your community
          is catching.
        </p>
      </div>

      <form className="space-y-5">
        {/* EMAIL */}
        <div className="login-field space-y-2">
          <Label htmlFor="email">Email address</Label>

          <div className="relative">
            <Mail
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-12 rounded-xl border-slate-200 pl-10 shadow-none focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="login-field space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>

            <Link
              href="/forgot-password"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <LockKeyhole
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-12 rounded-xl border-slate-200 pl-10 pr-11 shadow-none focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* SIGN IN */}
        <div className="login-field">
          <Button
            type="submit"
            className="group h-12 w-full rounded-xl bg-emerald-600 font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30"
          >
            Sign in
            <ArrowRight
              size={17}
              className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Button>
        </div>
      </form>

      {/* DIVIDER */}
      <div className="my-7 flex items-center gap-4">
        <Separator className="flex-1" />

        <span className="text-xs text-slate-400">OR</span>

        <Separator className="flex-1" />
      </div>

      {/* GOOGLE */}
      <Button
        variant="outline"
        // disabled={loading}
        // onClick={loginWithGoogle}
        className="h-12 w-full rounded-xl border-slate-200 bg-white font-medium hover:bg-slate-50"
      >
        <span className="mr-2 text-base font-bold">G</span>
        Continue with Google
      </Button>

      {/* REGISTER */}
      <p className="mt-8 text-center text-sm text-slate-500">
        New to AnglerHub?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
