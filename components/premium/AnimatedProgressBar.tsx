import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../lib/designSystem';

interface AnimatedProgressBarProps {
    current: number;
    max: number;
    color?: 'gold' | 'red' | 'blue' | 'green';
    label?: string;
    showNumbers?: boolean;
    height?: 'sm' | 'md' | 'lg';
}

const colorSchemes = {
    gold: {
        bg: colors.slate[900],
        fill: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
        glow: colors.gold[500],
        border: colors.gold[600],
    },
    red: {
        bg: colors.slate[900],
        fill: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
        glow: colors.ruby[500],
        border: colors.ruby[600],
    },
    blue: {
        bg: colors.slate[900],
        fill: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
        glow: colors.sapphire[500],
        border: colors.sapphire[600],
    },
    green: {
        bg: colors.slate[900],
        fill: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
        glow: colors.emerald[500],
        border: colors.emerald[600],
    },
};

const heightSizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
};

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
    current,
    max,
    color = 'gold',
    label,
    showNumbers = true,
    height = 'md',
}) => {
    const percentage = Math.min((current / max) * 100, 100);
    const scheme = colorSchemes[color];

    return (
        <div className="w-full">
            {(label || showNumbers) && (
                <div className="flex justify-between items-center mb-1">
                    {label && (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {label}
                        </span>
                    )}
                    {showNumbers && (
                        <span className="text-xs font-mono text-slate-500">
                            {current} / {max}
                        </span>
                    )}
                </div>
            )}

            <div
                className={`w-full ${heightSizes[height]} rounded-full overflow-hidden relative`}
                style={{
                    backgroundColor: scheme.bg,
                    border: `2px solid ${scheme.border}`,
                    boxShadow: `inset 0 2px 4px rgba(0,0,0,0.3)`,
                }}
            >
                {/* Background glow */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        background: `radial-gradient(circle at ${percentage}% 50%, ${scheme.glow}40 0%, transparent 70%)`,
                    }}
                />

                {/* Fill bar */}
                <motion.div
                    className="h-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 20,
                        duration: 0.8,
                    }}
                    style={{
                        background: scheme.fill,
                        boxShadow: `0 0 10px ${scheme.glow}`,
                    }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            x: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                            width: '50%',
                        }}
                    />
                </motion.div>

                {/* Percentage text (for larger bars) */}
                {height === 'lg' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white drop-shadow-lg">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// HP Bar variant
export const HPBar: React.FC<{
    current: number;
    max: number;
    showLabel?: boolean;
}> = ({ current, max, showLabel = true }) => (
    <AnimatedProgressBar
        current={current}
        max={max}
        color="red"
        label={showLabel ? 'HP' : undefined}
        height="md"
    />
);

// XP Bar variant
export const XPBar: React.FC<{
    current: number;
    max: number;
    showLabel?: boolean;
}> = ({ current, max, showLabel = true }) => (
    <AnimatedProgressBar
        current={current}
        max={max}
        color="gold"
        label={showLabel ? 'XP' : undefined}
        height="md"
    />
);

// Mana/Energy Bar variant
export const ManaBar: React.FC<{
    current: number;
    max: number;
    showLabel?: boolean;
}> = ({ current, max, showLabel = true }) => (
    <AnimatedProgressBar
        current={current}
        max={max}
        color="blue"
        label={showLabel ? 'Mana' : undefined}
        height="md"
    />
);
