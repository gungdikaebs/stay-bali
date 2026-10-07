"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Lock scroll while intro motion is playing
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    let minTimer: ReturnType<typeof setTimeout> | undefined;
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined;

    let minTimePassed = false;
    let windowLoaded = false;

    const startExit = () => {
      setIsExiting((alreadyExiting) => {
        if (alreadyExiting) return true;

        cleanupTimer = setTimeout(
          () => {
            setIsVisible(false);
            document.documentElement.style.overflow = previousOverflow;
          },
          reduceMotion ? 120 : 1200,
        );

        return true;
      });
    };

    const attemptExit = () => {
      if (minTimePassed && windowLoaded) {
        startExit();
      }
    };

    const handleImmediateDismiss = () => {
      startExit();
    };

    if (reduceMotion) {
      minTimePassed = true;
      attemptExit();
    } else {
      // Allow the elegant entry motion to play for 1.3s
      minTimer = setTimeout(() => {
        minTimePassed = true;
        attemptExit();
      }, 1300);
    }

    if (document.readyState === "complete") {
      windowLoaded = true;
      attemptExit();
    } else {
      window.addEventListener(
        "load",
        () => {
          windowLoaded = true;
          attemptExit();
        },
        { once: true },
      );
    }

    // Safety fallback: maximum 3.5s
    const maxTimer = setTimeout(startExit, 3500);

    window.addEventListener("wheel", handleImmediateDismiss, {
      passive: true,
      once: true,
    });
    window.addEventListener("touchstart", handleImmediateDismiss, {
      passive: true,
      once: true,
    });

    return () => {
      if (minTimer) clearTimeout(minTimer);
      if (maxTimer) clearTimeout(maxTimer);
      if (cleanupTimer) clearTimeout(cleanupTimer);
      window.removeEventListener("wheel", handleImmediateDismiss);
      window.removeEventListener("touchstart", handleImmediateDismiss);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [reduceMotion]);

  if (!isVisible) {
    return null;
  }

  return (
    <m.div
      animate={isExiting ? { y: "-100%" } : { y: "0%" }}
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#071713] select-none ${
        isExiting ? "pointer-events-none" : "pointer-events-auto"
      }`}
      initial={{ y: "0%" }}
      role="presentation"
      transition={{
        duration: reduceMotion ? 0.1 : 0.82,
        delay: isExiting && !reduceMotion ? 0.24 : 0,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      {/* Background glow ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.18)_0%,rgba(7,23,19,0.95)_70%)]" />

      {/* Masked window containing the brand emblem and typography */}
      <div className="relative z-10 overflow-hidden px-10 py-6">
        <m.div
          animate={
            isExiting ? { y: "-145%", opacity: 0 } : { y: "0%", opacity: 1 }
          }
          className="flex flex-col items-center text-center"
          initial={reduceMotion ? { opacity: 1 } : { y: "145%", opacity: 0 }}
          transition={{
            duration: reduceMotion ? 0.1 : isExiting ? 0.6 : 0.95,
            delay: isExiting || reduceMotion ? 0 : 0.16,
            ease: isExiting ? [0.64, 0, 0.78, 0] : [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative h-12 w-48 sm:h-14 sm:w-56">
            <Image
              alt=""
              aria-hidden="true"
              className="object-contain brightness-0 invert drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
              fill
              priority
              sizes="224px"
              src="/branding/staybali-logo.png"
            />
          </div>
          <span className="mt-4 font-display text-sm font-extrabold tracking-[0.16em] text-white uppercase sm:text-base">
            StayBali
          </span>
          <small className="mt-1.5 text-[11px] font-bold tracking-[0.22em] text-[#8ce0d4] uppercase">
            Curated Bali Stays
          </small>
        </m.div>
      </div>

      {/* Progress line along the bottom border */}
      <m.div
        animate={isExiting ? { scaleX: 1 } : { scaleX: 0.78 }}
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-primary via-[#8ce0d4] to-brand-coral"
        initial={{ scaleX: 0 }}
        transition={{
          duration: reduceMotion ? 0 : isExiting ? 0.28 : 1.45,
          delay: reduceMotion ? 0 : 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </m.div>
  );
}
