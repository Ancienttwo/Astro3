'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FortuneRevealProps {
  isRevealed: boolean;
  children: ReactNode;
  className?: string;
}

export function FortuneReveal({
  isRevealed,
  children,
  className,
}: FortuneRevealProps) {
  return (
    <AnimatePresence mode="wait">
      {isRevealed && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn('transform-gpu', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}