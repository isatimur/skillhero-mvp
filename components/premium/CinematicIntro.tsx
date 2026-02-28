import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/animations';
import { colors } from '../../lib/designSystem';

interface CinematicIntroProps {
    bossName: string;
    bossImage?: string;
    onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
    bossName,
    bossImage,
    onComplete,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black"
            onAnimationComplete={() => {
                setTimeout(onComplete, 2000);
            }}
        >
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col items-center gap-8"
            >
                {/* Boss Image */}
                {bossImage && (
                    <motion.div
                        variants={staggerItem}
                        className="relative"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                boxShadow: [
                                    `0 0 0px ${colors.ruby[500]}`,
                                    `0 0 60px ${colors.ruby[500]}`,
                                    `0 0 0px ${colors.ruby[500]}`,
                                ],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                            className="text-9xl"
                        >
                            {bossImage}
                        </motion.div>
                    </motion.div>
                )}

                {/* Boss Name Reveal */}
                <motion.div
                    variants={staggerItem}
                    className="flex flex-col items-center gap-4"
                >
                    <motion.h1
                        className="font-fantasy text-6xl text-gold-400 tracking-wider uppercase text-center"
                        style={{
                            textShadow: `0 0 20px ${colors.gold[500]}`,
                        }}
                    >
                        {bossName.split('').map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="h-1 w-64 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
                    />

                    <motion.p
                        variants={fadeInUp}
                        className="font-fantasy text-2xl text-slate-400 tracking-widest uppercase mt-4"
                    >
                        Prepare for Battle
                    </motion.p>
                </motion.div>

                {/* Flash Effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: 1.8, duration: 0.3 }}
                    className="fixed inset-0 bg-white pointer-events-none"
                />
            </motion.div>
        </motion.div>
    );
};

// Victory screen
export const VictoryScreen: React.FC<{
    xpGained: number;
    onContinue: () => void;
}> = ({ xpGained, onContinue }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[150] flex items-center justify-center"
            style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-slate-900/90 backdrop-blur-md border-2 border-emerald-500 rounded-2xl p-12 flex flex-col items-center gap-6"
                style={{
                    boxShadow: `0 0 40px ${colors.emerald[500]}`,
                }}
            >
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 1, repeat: Infinity },
                    }}
                    className="text-8xl"
                >
                    🏆
                </motion.div>

                <h2 className="font-fantasy text-5xl text-emerald-400 tracking-wider uppercase">
                    Victory!
                </h2>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="text-6xl font-bold text-gold-400"
                >
                    +{xpGained} XP
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onContinue}
                    className="mt-4 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg font-bold text-lg uppercase tracking-wider"
                    style={{
                        boxShadow: `0 0 20px ${colors.emerald[500]}`,
                    }}
                >
                    Continue
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

// Defeat screen
export const DefeatScreen: React.FC<{
    onRetry: () => void;
    onExit: () => void;
}> = ({ onRetry, onExit }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[150] flex items-center justify-center"
            style={{
                background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)',
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-slate-900/90 backdrop-blur-md border-2 border-ruby-500 rounded-2xl p-12 flex flex-col items-center gap-6"
                style={{
                    boxShadow: `0 0 40px ${colors.ruby[500]}`,
                }}
            >
                <motion.div
                    animate={{
                        rotate: [0, -10, 10, -10, 10, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                    }}
                    className="text-8xl"
                >
                    💀
                </motion.div>

                <h2 className="font-fantasy text-5xl text-ruby-400 tracking-wider uppercase">
                    Defeated
                </h2>

                <p className="text-slate-400 text-center max-w-md">
                    The code overwhelmed you. Study more and try again!
                </p>

                <div className="flex gap-4 mt-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        className="px-6 py-3 bg-gradient-to-r from-ruby-600 to-ruby-500 rounded-lg font-bold uppercase tracking-wider"
                    >
                        Try Again
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onExit}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold uppercase tracking-wider"
                    >
                        Exit
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};
