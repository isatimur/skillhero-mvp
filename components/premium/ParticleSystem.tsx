import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    opacity: number;
}

type ParticleType = 'xp' | 'levelup' | 'critical' | 'sparkle' | 'explosion';

interface ParticleSystemProps {
    type: ParticleType;
    active: boolean;
    x?: number;
    y?: number;
    count?: number;
    color?: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
    type,
    active,
    x = 50,
    y = 50,
    count = 20,
    color = '#fbbf24',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Create particles based on type
        const particles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(type, x, y, color));
        }
        particlesRef.current = particles;

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter(p => {
                // Update particle
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.life++;
                p.opacity = 1 - (p.life / p.maxLife);

                // Draw particle
                if (p.opacity > 0) {
                    ctx.save();
                    ctx.globalAlpha = p.opacity;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    return true;
                }
                return false;
            });

            if (particlesRef.current.length > 0) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [active, type, x, y, count, color]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-50"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

function createParticle(type: ParticleType, x: number, y: number, color: string): Particle {
    const baseParticle = {
        id: Math.random(),
        x,
        y,
        life: 0,
        color,
        opacity: 1,
    };

    switch (type) {
        case 'xp':
            return {
                ...baseParticle,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 5 - 2,
                maxLife: 60,
                size: Math.random() * 4 + 2,
                color: '#fbbf24',
            };

        case 'levelup':
            return {
                ...baseParticle,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                maxLife: 80,
                size: Math.random() * 6 + 3,
                color: Math.random() > 0.5 ? '#fbbf24' : '#f59e0b',
            };

        case 'critical':
            return {
                ...baseParticle,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 8 - 4,
                maxLife: 50,
                size: Math.random() * 5 + 3,
                color: '#ef4444',
            };

        case 'sparkle':
            return {
                ...baseParticle,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                maxLife: 40,
                size: Math.random() * 3 + 1,
                color,
            };

        case 'explosion':
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 12 + 4;
            return {
                ...baseParticle,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                maxLife: 70,
                size: Math.random() * 6 + 2,
                color,
            };

        default:
            return {
                ...baseParticle,
                vx: 0,
                vy: 0,
                maxLife: 60,
                size: 4,
            };
    }
}

// Simple particle effect for text/numbers
export const FloatingText: React.FC<{
    text: string;
    color?: string;
    duration?: number;
}> = ({ text, color = '#fbbf24', duration = 1.5 }) => {
    return (
        <motion.div
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -100, opacity: 0, scale: 1.5 }}
            transition={{ duration, ease: 'easeOut' }}
            className="absolute pointer-events-none font-bold text-2xl"
            style={{ color, textShadow: `0 0 10px ${color}` }}
        >
            {text}
        </motion.div>
    );
};
