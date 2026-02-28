import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../../lib/designSystem';
import { cardHover, fadeInUp, staggerContainer, staggerItem } from '../../lib/animations';

interface ComboMeterProps {
    streak: number;
    maxStreak?: number;
    multiplier: number;
}

export const ComboMeter: React.FC<ComboMeterProps> = ({
    streak,
    maxStreak = 10,
    multiplier,
}) => {
    const percentage = Math.min((streak / maxStreak) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-8 z-50"
        >
            <div className="bg-slate-900/80 backdrop-blur-md border-2 border-gold-500/50 rounded-xl p-4 min-w-[200px]">
                {/* Streak Display */}
                <div className="flex items-center justify-between mb-2">
                    <span className="font-fantasy text-gold-400 uppercase text-sm tracking-wider">
                        Combo
                    </span>
                    <motion.span
                        key={streak}
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-2xl text-gold-400"
                    >
                        {streak}
                    </motion.span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                        style={{
                            boxShadow: `0 0 10px ${colors.gold[500]}`,
                        }}
                    />
                </div>

                {/* Multiplier */}
                <AnimatePresence>
                    {multiplier > 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-center"
                        >
                            <span className="text-emerald-400 font-bold text-lg">
                                {multiplier}x Multiplier!
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Max Combo Celebration */}
                <AnimatePresence>
                    {streak >= maxStreak && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 text-center"
                        >
                            <motion.span
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                }}
                                className="text-gold-400 font-fantasy uppercase text-xs"
                            >
                                🔥 On Fire! 🔥
                            </motion.span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// Combo break notification
export const ComboBreak: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]"
    >
        <motion.div
            animate={{
                rotate: [0, -5, 5, -5, 5, 0],
            }}
            className="bg-ruby-900/90 backdrop-blur-md border-2 border-ruby-500 rounded-xl px-8 py-4"
            style={{
                boxShadow: `0 0 30px ${colors.ruby[500]}`,
            }}
        >
            <h3 className="font-fantasy text-4xl text-ruby-400 uppercase tracking-wider">
                Combo Broken!
            </h3>
        </motion.div>
    </motion.div>
);

// Perfect answer notification
export const PerfectAnswer: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-[100]"
    >
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: 0.5,
            }}
            className="flex flex-col items-center gap-2"
        >
            <div className="text-6xl">⚡</div>
            <div className="font-fantasy text-3xl text-gold-400 uppercase tracking-wider">
                Perfect!
            </div>
        </motion.div>
    </motion.div>
);
