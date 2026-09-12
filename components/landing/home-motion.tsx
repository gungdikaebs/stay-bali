"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  domAnimation,
  LazyMotion,
  m,
  MotionConfig,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

export function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "4%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.08]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || reduceMotion) {
      return;
    }

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    if (connection?.saveData) {
      return;
    }

    let hasLoaded = false;
    let isVisible = false;

    const syncPlayback = () => {
      if (!isVisible || document.hidden || video.ended) {
        video.pause();
        return;
      }

      if (!hasLoaded) {
        hasLoaded = true;
        video.preload = "auto";
        video.load();
      }

      void video.play().catch(() => {
        // The poster remains visible when a browser blocks autoplay.
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.05 },
    );

    const handleVisibilityChange = () => syncPlayback();

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      video.pause();
    };
  }, [reduceMotion]);

  return (
    <m.div
      ref={containerRef}
      animate={{ opacity: 1 }}
      className="absolute -inset-[5%]"
      initial={reduceMotion ? false : { opacity: 0.82 }}
      style={reduceMotion ? undefined : { scale, y }}
      transition={{ duration: 1.4, ease }}
    >
      <video
        ref={videoRef}
        aria-hidden="true"
        className="size-full translate-x-[8%] scale-[1.2] object-cover object-center md:translate-x-[12%] md:scale-[1.34] xl:translate-x-[16%] xl:scale-[1.48]"
        disablePictureInPicture
        muted
        playsInline
        poster="/videos/homepage/hero-construction-poster.webp"
        preload="none"
      >
        <source
          src="/videos/homepage/hero-construction.av1.mp4"
          type='video/mp4; codecs="av01.0.05M.08"'
        />
        <source
          src="/videos/homepage/hero-construction.webm"
          type='video/webm; codecs="vp9"'
        />
        <source
          src="/videos/homepage/hero-construction.mp4"
          type="video/mp4"
        />
      </video>
    </m.div>
  );
}

export function HeroReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </m.div>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, delay, ease }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -64px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </m.div>
  );
}
