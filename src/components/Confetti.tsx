"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  "#FF7A00", // orange
  "#FFA94D", // orange-soft
  "#FFD166", // yellow
  "#FFE08C", // yellow-soft
  "#00d4d4", // cyan
  "#79e0e0", // cyan-soft
  "#ff00ff", // magenta
  "#ffeb3b", // yellow
  "#00ffff", // cyan
];

export const Confetti = ({ trigger, onComplete }: ConfettiProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number; scale: number }>>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!trigger) return;

    // Skip confetti if user prefers reduced motion
    if (shouldReduceMotion) {
      onComplete?.();
      return;
    }

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * -100 - 50,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [trigger, onComplete, shouldReduceMotion]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            rotate: 0,
            scale: particle.scale,
          }}
          animate={{
            x: particle.x * 8,
            y: particle.y * 4,
            opacity: 0,
            rotate: particle.rotation * 3,
            scale: 0,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            backgroundColor: particle.color,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
};
