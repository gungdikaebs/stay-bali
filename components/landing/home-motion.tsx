"use client";

import type { ReactNode } from "react";
import {
  domAnimation,
  LazyMotion,
  m,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

export function HeroMedia({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0"
      initial={reduceMotion ? false : { opacity: 0.82, scale: 1.045 }}
      transition={{ duration: 1.4, ease }}
    >
      {children}
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
