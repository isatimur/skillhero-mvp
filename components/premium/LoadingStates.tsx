import React from 'react';
import { motion } from 'framer-motion';
import { colors, gradients } from '../../lib/designSystem';
import { spinAnimation, pulseAnimation, shimmerAnimation } from '../../lib/animations';

interface LoadingStateProps {
    type?: 'spinner' | 'skeleton' | 'sword' | 'health' | 'pulse';
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type = 'spinner', message }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
            {type === 'spinner' && <GoldSpinner />}
            {type === 'skeleton' && <SkeletonLoader />}
            {type === 'sword' && <SwordLoader />}
            {type === 'health' && <HealthBarLoader />}
            {type === 'pulse' && <PulseLoader />}

            {message && (
                <motion.p
                    {...pulseAnimation}
                    className="text-gold-400 font-fantasy text-sm tracking-wider uppercase"
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
};

const GoldSpinner: React.FC = () => (
    <motion.div
        {...spinAnimation}
        className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full"
        style={{
            boxShadow: `0 0 20px ${colors.gold[500]}`,
        }}
    />
);

const PulseLoader: React.FC = () => (
    <motion.div
        {...pulseAnimation}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-gold-500 to-amber-500"
        style={{
            boxShadow: `0 0 30px ${colors.gold[500]}`,
        }}
    />
);

const SkeletonLoader: React.FC = () => (
    <div className="w-full max-w-md space-y-3">
        {[1, 2, 3].map((i) => (
            <motion.div
                key={i}
                className="h-12 bg-slate-800 rounded-lg overflow-hidden relative"
                style={{
                    background: `linear-gradient(90deg, ${colors.slate[800]} 25%, ${colors.slate[700]} 50%, ${colors.slate[800]} 75%)`,
                    backgroundSize: '200% 100%',
                }}
                {...shimmerAnimation}
            />
        ))}
    </div>
);

const SwordLoader: React.FC = () => (
    <div className="relative w-24 h-24">
        <motion.div
            animate={{
                y: [0, -20, 0],
                rotate: [0, -10, 0, 10, 0],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            className="absolute inset-0 flex items-center justify-center text-6xl"
        >
            ⚔️
        </motion.div>
        <motion.div
            {...pulseAnimation}
            className="absolute inset-0 rounded-full"
            style={{
                background: gradients.radialGlow,
            }}
        />
    </div>
);

const HealthBarLoader: React.FC = () => (
    <div className="w-64 h-6 bg-slate-900 rounded-full overflow-hidden border-2 border-gold-500">
        <motion.div
            animate={{
                x: ['-100%', '100%'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
        />
    </div>
);

// Full screen loading overlay
export const FullScreenLoader: React.FC<{
    message?: string;
}> = ({ message = 'Summoning Hero...' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        style={{
            background: gradients.voidDepth,
        }}
    >
        <div className="flex flex-col items-center gap-6">
            <SwordLoader />
            <h2 className="font-fantasy text-3xl tracking-widest uppercase text-gold-500">
                {message}
            </h2>
        </div>
    </motion.div>
);
