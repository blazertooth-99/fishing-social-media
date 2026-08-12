"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/app/util/constant";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Detect scroll position
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });

        ticking = true;
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleToggleSound = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (soundEnabled) {
        audio.pause();
        setSoundEnabled(false);
      } else {
        await audio.play();
        setSoundEnabled(true);
      }
    } catch {
      console.warn(
        "Interaksi pengguna diperlukan sebelum audio dapat diputar."
      );
    }
  };

  const handleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        id="nav"
        className={`
          fixed inset-x-0 top-0 z-50
          transition-all duration-500 ease-out
          ${
            isScrolled
              ? "bg-[#050505]/90 py-4 shadow-[0_0_35px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              : "bg-transparent py-2"
          }
        `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Audio */}
          <audio
            ref={audioRef}
            loop
            preload="none"
            src="https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav"
          />

          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Poseidon Cast - Beranda"
          >
            <div
              className="
                relative flex h-10 w-10 items-center justify-center
                rounded-xl
                border border-teal-400/20
                bg-gradient-to-br from-teal-500/10 to-cyan-500/10
                transition-all duration-300
                group-hover:border-teal-400/50
              "
            >
              <svg
                className="
                  h-5 w-5 text-teal-400
                  transition-transform duration-500
                  group-hover:rotate-12
                "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.99 20.485c3.314 0 6-2.686 6-6 0-1.782-1.07-3.328-2.62-4.114a1 1 0 00-1.12.18l-1.54 1.54a1 1 0 01-1.414 0l-1.54-1.54a1 1 0 00-1.12-.18C7.08 11.157 6 12.703 6 14.485c0 3.314 2.686 6 6 6z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v3m0 0a3 3 0 01-3 3H5M12 5a3 3 0 003 3h4"
                />
              </svg>
            </div>

            <span className="text-lg font-black tracking-[0.2em] bg-gradient-to-r from-white via-neutral-200 to-teal-400 bg-clip-text text-transparent">
              POSEIDON
              <span className="font-light text-teal-400">CAST</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-10 text-sm font-bold tracking-[0.2em] text-neutral-400 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  relative py-2
                  transition-colors duration-300
                  hover:text-white
                  after:absolute
                  after:bottom-0
                  after:left-0
                  after:h-px
                  after:w-0
                  after:bg-teal-400
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                "
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={
                soundEnabled
                  ? "Matikan suara pantai"
                  : "Aktifkan suara pantai"
              }
              aria-pressed={soundEnabled}
              title={
                soundEnabled
                  ? "Matikan Suara Pantai"
                  : "Aktifkan Suara Pantai"
              }
              className={`
                flex items-center justify-center rounded-xl border p-3
                transition-all duration-300
                ${
                  soundEnabled
                    ? "border-teal-500/40 bg-teal-950/20 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                    : "border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
                }
              `}
            >
              {soundEnabled ? (
                <div className="flex h-4 w-4 items-end gap-[3px]">
                  <span className="h-full w-[3px] animate-[bounce_1s_infinite_100ms] bg-teal-400" />
                  <span className="h-2/3 w-[3px] animate-[bounce_1s_infinite_300ms] bg-teal-400" />
                  <span className="h-5/6 w-[3px] animate-[bounce_1s_infinite_500ms] bg-teal-400" />
                </div>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
              )}
            </button>

            <Link
              href="#gabung"
              className="
                inline-flex items-center justify-center
                rounded-xl
                bg-gradient-to-r from-teal-400 to-cyan-500
                px-6 py-3
                text-[10px] font-black tracking-[0.15em] text-black
                shadow-[0_4px_25px_rgba(20,184,166,0.3)]
                transition-all duration-300
                hover:shadow-[0_4px_35px_rgba(20,184,166,0.5)]
                active:scale-95
              "
            >
              DAFTAR KLUB
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={
                soundEnabled
                  ? "Matikan suara pantai"
                  : "Aktifkan suara pantai"
              }
              aria-pressed={soundEnabled}
              className="
                rounded-lg border border-white/10
                p-2.5 text-neutral-400
                transition-colors
                hover:text-white
              "
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            <button
              type="button"
              onClick={handleMobileMenu}
              aria-label={
                mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
              }
              aria-expanded={mobileMenuOpen}
              className="
                rounded-lg p-2
                text-white
                transition-colors
                hover:text-teal-400
              "
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9h16.5M3.75 15h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden
          bg-black/95 backdrop-blur-2xl
          transition-all duration-300
          ${
            mobileMenuOpen
              ? "visible opacity-100"
              : "invisible pointer-events-none opacity-0"
          }
        `}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className="
                text-xl font-bold tracking-widest
                text-white
                transition-colors duration-300
                hover:text-teal-400
              "
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="#gabung"
            onClick={closeMobileMenu}
            className="
              mt-4 rounded-xl
              bg-gradient-to-r from-teal-400 to-cyan-500
              px-8 py-3.5
              text-xs font-extrabold
              tracking-widest text-black
              transition-transform
              active:scale-95
            "
          >
            GABUNG SEKARANG
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;