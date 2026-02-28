import React, { useEffect, useRef } from 'react';

interface GlobalParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
}

export const GlobalParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<GlobalParticle[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create initial particles
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push(createParticle(canvas.width, canvas.height));
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life++;

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Update opacity (pulse)
                particle.opacity = 0.3 + Math.sin(particle.life * 0.02) * 0.2;

                // Draw particle
                ctx.save();
                ctx.globalAlpha = particle.opacity;

                // Create gradient for glow effect
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 2
                );
                gradient.addColorStop(0, '#fbbf24');
                gradient.addColorStop(0.5, '#f59e0b');
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                ctx.fill();

                // Draw core
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

function createParticle(width: number, height: number): GlobalParticle {
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        life: Math.random() * 1000,
    };
}
