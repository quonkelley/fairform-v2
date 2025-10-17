'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface StepCompletionCelebrationProps {
  isVisible: boolean;
  stepName: string;
  onComplete: () => void;
}

export function StepCompletionCelebration({
  isVisible,
  stepName,
  onComplete,
}: StepCompletionCelebrationProps) {
  // Trigger confetti when visible
  useEffect(() => {
    if (isVisible) {
      // Fire confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // Auto-close after animation
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="relative bg-card border-2 border-success rounded-2xl shadow-2xl p-8 max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <CheckCircle2 className="w-20 h-20 text-success" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full bg-success"
                />
              </div>
            </motion.div>

            {/* Text content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-success" />
                Step Complete!
                <Sparkles className="w-6 h-6 text-success" />
              </h2>
              <p className="text-base text-muted-foreground mb-1">
                You&apos;ve completed:
              </p>
              <p className="text-lg font-semibold text-foreground mb-4">
                &ldquo;{stepName}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">
                Great progress! Keep going!
              </p>
            </motion.div>

            {/* Decorative sparkles */}
            <div className="absolute top-4 left-4">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Sparkles className="w-5 h-5 text-success/50" />
              </motion.div>
            </div>
            <div className="absolute bottom-4 right-4">
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Sparkles className="w-4 h-4 text-success/50" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
