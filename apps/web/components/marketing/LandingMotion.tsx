"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroMotion({ children, className }: { children: ReactNode; className: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease }}>{children}</motion.div>;
}

export function StageMotion({ children, className }: { children: ReactNode; className: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .12, ease }}>{children}</motion.div>;
}

export function RevealSection({ children, className, id, reverse = false }: { children: ReactNode; className: string; id?: string; reverse?: boolean }) {
  const reduced = useReducedMotion();
  return <motion.section id={id} className={className} initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .65, ease }}>{children}</motion.section>;
}

export function FloatCard({ children, className }: { children: ReactNode; className: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} whileHover={reduced ? undefined : { y: -3 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>{children}</motion.div>;
}
