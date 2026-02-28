/**
 * Animation Utilities for SkillHero
 * Framer Motion variants and reusable animation configs
 */

import { Variants } from 'framer-motion';

// ============================================================================
// ENTRANCE ANIMATIONS
// ============================================================================

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
};

export const slideInLeft: Variants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

export const slideInRight: Variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
};

// ============================================================================
// STAGGER CHILDREN
// ============================================================================

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

// ============================================================================
// HOVER EFFECTS
// ============================================================================

export const hoverScale = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

export const hoverGlow = {
    rest: {
        boxShadow: '0 0 0px rgba(251, 191, 36, 0)',
    },
    hover: {
        boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
    },
};

export const hoverLift = {
    rest: { y: 0, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: { y: -4, boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)' },
};

// ============================================================================
// GAME-SPECIFIC ANIMATIONS
// ============================================================================

export const damageShake: Variants = {
    shake: {
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
    },
};

export const criticalHit: Variants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.5, 1],
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.5 },
    },
};

export const xpGain: Variants = {
    initial: {
        y: 0,
        opacity: 1,
        scale: 1,
    },
    animate: {
        y: -100,
        opacity: 0,
        scale: 1.5,
        transition: {
            duration: 1.5,
            ease: 'easeOut',
        },
    },
};

export const levelUpPulse: Variants = {
    animate: {
        scale: [1, 1.2, 1],
        boxShadow: [
            '0 0 0px rgba(251, 191, 36, 0)',
            '0 0 40px rgba(251, 191, 36, 0.8)',
            '0 0 0px rgba(251, 191, 36, 0)',
        ],
        transition: {
            duration: 1,
            repeat: 3,
        },
    },
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransition = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
};

export const modalTransition: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardHover: Variants = {
    rest: {
        scale: 1,
        rotateY: 0,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    hover: {
        scale: 1.05,
        rotateY: 5,
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.25)',
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
};

export const cardFlip: Variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const pulseAnimation = {
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export const spinAnimation = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

export const shimmerAnimation = {
    animate: {
        backgroundPosition: ['200% center', '-200% center'],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

// ============================================================================
// SPRING CONFIGS
// ============================================================================

export const springs = {
    gentle: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
    },
    bouncy: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
    },
    snappy: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
    },
};

// ============================================================================
// TRANSITION CONFIGS
// ============================================================================

export const transitions = {
    fast: { duration: 0.15 },
    normal: { duration: 0.3 },
    slow: { duration: 0.5 },
    slower: { duration: 0.8 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const staggerDelay = (index: number, baseDelay: number = 0.1) => ({
    transition: { delay: index * baseDelay },
});

export const createSequence = (animations: any[], totalDuration: number) => {
    const stepDuration = totalDuration / animations.length;
    return animations.map((anim, i) => ({
        ...anim,
        transition: {
            ...anim.transition,
            delay: i * stepDuration,
        },
    }));
};
