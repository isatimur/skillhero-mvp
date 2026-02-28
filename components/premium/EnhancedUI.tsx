/**
 * Enhanced UI Components with Fantasy RPG Styling
 * Premium buttons, cards, and panels with glow effects
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { colors } from '../../lib/designSystem';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// ENHANCED FANTASY BUTTON
// ============================================================================

interface EnhancedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'legendary';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    children: React.ReactNode;
    glowIntensity?: 'low' | 'medium' | 'high';
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    children,
    glowIntensity = 'medium',
    className = '',
    ...props
}) => {
    const variants = {
        primary: {
            bg: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
            border: 'border-indigo-400',
            text: 'text-white',
            glow: colors.sapphire[500],
        },
        secondary: {
            bg: 'bg-gradient-to-r from-slate-700 to-slate-600',
            border: 'border-slate-500',
            text: 'text-slate-200',
            glow: colors.slate[500],
        },
        danger: {
            bg: 'bg-gradient-to-r from-red-600 to-red-500',
            border: 'border-red-400',
            text: 'text-white',
            glow: colors.ruby[500],
        },
        success: {
            bg: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
            border: 'border-emerald-400',
            text: 'text-white',
            glow: colors.emerald[500],
        },
        legendary: {
            bg: 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600',
            border: 'border-gold-400',
            text: 'text-slate-900',
            glow: colors.gold[500],
        },
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const glowIntensities = {
        low: 0.3,
        medium: 0.5,
        high: 0.8,
    };

    const style = variants[variant];
    const glowAlpha = glowIntensities[glowIntensity];

    return (
        <motion.button
            className={`
        ${style.bg} ${style.border} ${style.text} ${sizes[size]}
        border-2 rounded-lg font-bold uppercase tracking-wider
        relative overflow-hidden
        transition-all duration-300
        flex items-center gap-2 justify-center
        ${className}
      `}
            whileHover={{
                scale: 1.05,
                boxShadow: `0 0 20px rgba(${hexToRgb(style.glow)}, ${glowAlpha})`,
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            {...props}
        >
            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                animate={{
                    x: ['-100%', '200%'],
                    opacity: [0, 0.3, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                }}
            />

            {icon && <span>{icon}</span>}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

// ============================================================================
// QUEST CARD
// ============================================================================

interface QuestCardProps {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Nightmare';
    levelRequired: number;
    completed?: boolean;
    locked?: boolean;
    bossImage?: string;
    onClick?: () => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({
    title,
    description,
    difficulty,
    levelRequired,
    completed = false,
    locked = false,
    bossImage,
    onClick,
}) => {
    const difficultyColors = {
        Easy: { border: colors.emerald[500], glow: colors.emerald[500], skulls: 1 },
        Medium: { border: colors.sapphire[500], glow: colors.sapphire[500], skulls: 2 },
        Hard: { border: colors.amethyst[500], glow: colors.amethyst[500], skulls: 3 },
        Expert: { border: colors.ruby[500], glow: colors.ruby[500], skulls: 4 },
        Nightmare: { border: colors.gold[500], glow: colors.gold[500], skulls: 5 },
    };

    const diffStyle = difficultyColors[difficulty];

    return (
        <motion.div
            className={`
        relative bg-gradient-to-b from-slate-800 to-slate-900
        border-2 rounded-xl p-6 cursor-pointer
        transition-all duration-300
        ${locked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
            style={{
                borderColor: diffStyle.border,
            }}
            whileHover={!locked ? {
                scale: 1.05,
                rotateY: 2,
                boxShadow: `0 10px 30px rgba(${hexToRgb(diffStyle.glow)}, 0.5)`,
            } : {}}
            whileTap={!locked ? { scale: 0.98 } : {}}
            onClick={!locked ? onClick : undefined}
        >
            {/* Completed stamp */}
            {completed && (
                <div className="absolute top-4 right-4 bg-gold-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase rotate-12">
                    ✓ Completed
                </div>
            )}

            {/* Lock icon */}
            {locked && (
                <div className="absolute top-4 right-4 text-4xl">
                    🔒
                </div>
            )}

            {/* Boss image */}
            {bossImage && (
                <div className="text-6xl mb-4 text-center">
                    {bossImage}
                </div>
            )}

            {/* Title */}
            <h3 className="font-fantasy text-2xl text-gold-400 mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {description}
            </p>

            {/* Metadata */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                        Level {levelRequired}+
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {Array.from({ length: diffStyle.skulls }).map((_, i) => (
                        <span key={i} className="text-sm opacity-80">💀</span>
                    ))}
                </div>
            </div>

            {/* Difficulty badge */}
            <div
                className="absolute bottom-4 left-4 px-2 py-1 rounded text-xs font-bold uppercase"
                style={{
                    backgroundColor: `${diffStyle.border}20`,
                    border: `1px solid ${diffStyle.border}`,
                    color: diffStyle.border,
                }}
            >
                {difficulty}
            </div>
        </motion.div>
    );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '0, 0, 0';
}
