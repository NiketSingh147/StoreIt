"use client";

import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

export default function AnimatedLogo({ color = "white" }: { color?: string }) {
  const letters = "StoreIt".split("");
  const controls = useAnimation();

  // Run initial falling animation on mount
  useEffect(() => {
    letters.forEach((_, i) => {
      controls.start((index) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: index * 0.15,
          duration: 0.55,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }));
    });
  }, []);

  // Handle hover (plays FULL animation even after hover ends)
  const triggerHoverAnimation = () => {
    letters.forEach((_, i) => {
      controls.start((index) => ({
        y: [0, -15, 0],
        transition: {
          delay: index * 0.07,
          duration: 0.35,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }));
    });
  };

  return (
    <div
      className="flex items-center gap-3 cursor-pointer select-none"
      onMouseEnter={triggerHoverAnimation} // manual hover control
    >
      {/* Logo stays intact */}
      <Image
        src="/assets/icons/logo-full-cropped.svg"
        alt="logo"
        width={70}
        height={70}
        className="drop-shadow-[0_0_6px_rgba(0,0,0,0.25)]"
      />

      <div className="flex gap-1 font-extrabold text-white text-4xl">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            initial={{ opacity: 0, y: -40 }}
            animate={controls}
            style={{ display: "inline-block", color }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
