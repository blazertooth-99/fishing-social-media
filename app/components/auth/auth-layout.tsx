"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { Fish } from "lucide-react";

interface AuthLayoutProps {
    children: ReactNode;
    visual?: boolean;
}

export default function AuthLayout({
    children,
    visual = true,
}: AuthLayoutProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const timeline = gsap.timeline({
                defaults: {
                    ease: "power3.out",
                },
            });

            timeline
                .from(".auth-brand", {
                    y: -20,
                    opacity: 0,
                    duration: 0.6,
                })
                .from(
                    ".auth-content",
                    {
                        x: -35,
                        opacity: 0,
                        duration: 0.8,
                    },
                    "-=0.3"
                )
                .from(
                    ".auth-visual",
                    {
                        x: 50,
                        opacity: 0,
                        duration: 1,
                    },
                    "-=0.6"
                );

            gsap.to(".floating-fish", {
                y: -15,
                rotation: 3,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });

            gsap.to(".water-glow", {
                scale: 1.08,
                opacity: 0.7,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <main
            ref={containerRef}
            className="min-h-screen bg-[#f4f7f4]"
        >
            <div
                className={`
          mx-auto min-h-screen max-w-[1500px]
          ${visual
                        ? "grid lg:grid-cols-[0.85fr_1.15fr]"
                        : "flex items-center justify-center"
                    }
        `}
            >
                {/* FORM AREA */}
                <section
                    className={`
            relative flex min-h-screen flex-col
            px-6 py-8 sm:px-10 lg:px-14 xl:px-20
            ${visual ? "bg-white" : ""}
          `}
                >
                    <div className="auth-brand flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                            <Fish size={21} />
                        </div>

                        <div>
                            <p className="font-bold tracking-tight text-slate-950">
                                AnglerHub
                            </p>

                            <p className="text-[11px] text-slate-400">
                                Fish · Explore · Connect
                            </p>
                        </div>
                    </div>

                    <div className="auth-content flex flex-1 items-center justify-center">
                        <div className="w-full max-w-md py-10">
                            {children}
                        </div>
                    </div>
                </section>

                {/* VISUAL */}
                {visual && (
                    <section className="auth-visual relative hidden min-h-screen overflow-hidden bg-slate-900 lg:block">
                        {/* BACKGROUND */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    "url(https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=85)",
                            }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-slate-900/40 to-cyan-950/60" />

                        {/* WATER GLOW */}
                        <div className="water-glow absolute -bottom-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

                        {/* CONTENT */}
                        <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
                            <div className="ml-auto rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
                                #FishingCommunity
                            </div>

                            <div className="max-w-xl">
                                <div className="floating-fish mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-4xl shadow-2xl backdrop-blur-md">
                                    🎣
                                </div>

                                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                                    Welcome to AnglerHub
                                </p>

                                <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
                                    Every cast has
                                    <br />
                                    <span className="text-emerald-300">
                                        a story.
                                    </span>
                                </h2>

                                <p className="mt-6 max-w-lg text-sm leading-7 text-white/70 xl:text-base">
                                    Connect with fellow anglers, discover hidden
                                    fishing spots, and share the catch that made
                                    your day unforgettable.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
                                        🎣 12K+ Anglers
                                    </div>

                                    <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
                                        🌊 2.4K Fishing Spots
                                    </div>

                                    <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
                                        🐟 500+ Species
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-white/40">
                                © 2026 AnglerHub · Built for people who love
                                the water.
                            </p>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}