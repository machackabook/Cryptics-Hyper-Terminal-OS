import React from 'react';
import { motion } from 'framer-motion';

export const PersistentBackgroundFX: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Ambient Energy Orbs with Framer-Motion */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#42f5ff]/10 blur-[120px]"
        animate={{
          x: [0, 60, -40, 0],
          y: [0, 40, 80, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#74ff9b]/10 blur-[140px]"
        animate={{
          x: [0, -50, 60, 0],
          y: [0, -60, -30, 0],
          scale: [0.9, 1.15, 1, 0.9],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-[#f5ce70]/5 blur-[160px]"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Subtle grid scanning pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#42f5ff]/5 to-transparent h-32"
        animate={{
          y: ['-100vh', '100vh'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};
