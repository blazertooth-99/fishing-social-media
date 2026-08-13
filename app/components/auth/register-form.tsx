"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterForm() {
    const formRef = useRef<HTMLDivElement>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".register-field", {
                y: 18,
                opacity: 0,
                duration: 0.5,
                stagger: 0.07,
                delay: 0.3,
                ease: "power2.out",
            });
        }, formRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={formRef}>
            {/* HEADER */}
            <div className="mb-7">
                <p className="mb-3 text-sm font-semibold text-emerald-600">
                    Join the community 🎣
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    Create your
                    <br />
                    <span className="text-emerald-600">
                        Angler account.
                    </span>
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Join thousands of anglers sharing catches,
                    discovering spots, and learning from each other.
                </p>
            </div>

            <form className="space-y-4">
                {/* NAME */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="register-field space-y-2">
                        <Label htmlFor="firstName">
                            First name
                        </Label>

                        <div className="relative">
                            <User
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <Input
                                id="firstName"
                                placeholder="Christian"
                                className="h-11 rounded-xl pl-10 shadow-none focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="register-field space-y-2">
                        <Label htmlFor="lastName">
                            Last name
                        </Label>

                        <Input
                            id="lastName"
                            placeholder="Satrio"
                            className="h-11 rounded-xl shadow-none focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        />
                    </div>
                </div>

                {/* EMAIL */}
                <div className="register-field space-y-2">
                    <Label htmlFor="registerEmail">
                        Email address
                    </Label>

                    <div className="relative">
                        <Mail
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <Input
                            id="registerEmail"
                            type="email"
                            placeholder="you@example.com"
                            className="h-11 rounded-xl pl-10 shadow-none focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div className="register-field space-y-2">
                    <Label htmlFor="registerPassword">
                        Password
                    </Label>

                    <div className="relative">
                        <LockKeyhole
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <Input
                            id="registerPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="h-11 rounded-xl pl-10 pr-10 shadow-none focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((value) => !value)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                            {showPassword ? (
                                <EyeOff size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </button>
                    </div>
                </div>

                {/* CONFIRM */}
                <div className="register-field space-y-2">
                    <Label htmlFor="confirmPassword">
                        Confirm password
                    </Label>

                    <div className="relative">
                        <LockKeyhole
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <Input
                            id="confirmPassword"
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Repeat your password"
                            className="h-11 rounded-xl pl-10 pr-10 shadow-none focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    (value) => !value
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </button>
                    </div>
                </div>

                {/* TERMS */}
                <div className="register-field flex items-start gap-3 pt-2">
                    <Checkbox
                        id="terms"
                        className="mt-0.5 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />

                    <Label
                        htmlFor="terms"
                        className="cursor-pointer text-xs font-normal leading-5 text-slate-500"
                    >
                        I agree to the{" "}
                        <Link
                            href="/terms"
                            className="font-medium text-emerald-600 hover:underline"
                        >
                            Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="font-medium text-emerald-600 hover:underline"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </Label>
                </div>

                {/* SUBSCRIBE */}
                <div className="register-field flex items-center gap-3">
                    <Checkbox
                        id="subscribe"
                        className="data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />

                    <Label
                        htmlFor="subscribe"
                        className="cursor-pointer text-xs font-normal text-slate-500"
                    >
                        Send me fishing tips and community updates.
                    </Label>
                </div>

                {/* BUTTON */}
                <div className="register-field pt-2">
                    <Button
                        type="submit"
                        className="group h-12 w-full rounded-xl bg-emerald-600 font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30"
                    >
                        Create account

                        <ArrowRight
                            size={17}
                            className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </Button>
                </div>
            </form>

            {/* OR */}
            <div className="my-6 flex items-center gap-4">
                <Separator className="flex-1" />

                <span className="text-xs text-slate-400">
                    OR
                </span>

                <Separator className="flex-1" />
            </div>

            {/* GOOGLE */}
            <Button
                variant="outline"
                className="h-11 w-full rounded-xl border-slate-200 bg-white font-medium"
            >
                <span className="mr-2 font-bold">G</span>
                Sign up with Google
            </Button>

            {/* LOGIN */}
            <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}