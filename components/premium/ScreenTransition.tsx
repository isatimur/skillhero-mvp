import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const pageTransitions = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

const slideTransitions = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const fadeTransitions = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

interface ScreenTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  type = 'scale',
  duration = 0.3,
}) => {
  const variants = {
    fade: fadeTransitions,
    slide: slideTransitions,
    scale: pageTransitions,
  };

  return (
    <motion.div
      variants={variants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, ease: 'easeInOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div >
  );
};

// Epic battle transition (like Dark Souls)
export const BattleTransition: React.FC<{ show: boolean; onComplete: () => void }> = ({
  show,
  onComplete,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 z-[200] bg-black origin-left"
        >
          <div className="flex items-center justify-center h-full">
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="font-fantasy text-6xl text-gold-400 tracking-widest uppercase"
            >
              Entering Battle
            </motion.h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
