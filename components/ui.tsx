
import React from 'react';
import { Loader } from 'lucide-react';

// --- Types ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'tech' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

// --- Components ---

/**
 * Primary Game Button - "The Rune Slab"
 * Visuals: 3D press effect, gold border, inner glow.
 */
export const FantasyButton: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', fullWidth, className = '', disabled, isLoading, icon, ...props 
}) => {
  const baseStyle = "font-fantasy font-bold rounded-lg border-t border-l border-r border-b-4 transition-all duration-150 uppercase tracking-widest flex items-center justify-center gap-2 relative overflow-hidden group active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4";
  
  const sizeStyles = {
    sm: "py-1 px-3 text-xs min-h-[32px]",
    md: "py-2 px-6 text-sm min-h-[44px]",
    lg: "py-4 px-8 text-lg min-h-[64px]"
  };

  const variants = {
    // Gold/Obsidian (Main Action)
    primary: "bg-[#1a1c2c] border-gold-600 text-gold-400 hover:text-white hover:bg-gold-600 hover:border-gold-400 shadow-[0_0_15px_rgba(218,165,32,0.2)] hover:shadow-[0_0_25px_rgba(218,165,32,0.6)]",
    
    // Stone (Secondary)
    secondary: "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500",
    
    // Blood (Destructive)
    danger: "bg-blood-900 border-red-600 text-red-300 hover:bg-red-700 hover:text-white hover:border-red-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]",
    
    // Tech (Cyberpunk/Admin)
    tech: "bg-slate-900 border-tech-cyan text-tech-cyan font-mono hover:bg-tech-cyan/20 hover:shadow-[0_0_15px_#00f0ff]",
    
    // Admin (Database)
    admin: "bg-indigo-950 border-indigo-500 text-indigo-300 font-mono hover:bg-indigo-900",

    // Ghost
    ghost: "bg-transparent border-transparent text-slate-400 hover:text-gold-400 border-b-0 active:translate-y-0"
  };

  return (
    <button 
      className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader className="animate-spin" size={16} />}
      {!isLoading && icon}
      <span className="relative z-10">{children}</span>
      
      {/* Shine Effect */}
      {variant !== 'ghost' && (
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shine pointer-events-none"></div>
      )}
    </button>
  );
};

/**
 * Main Content Container - "The Arcane Tablet"
 * Visuals: Dark glass background, gold corners, parchment texture overlay.
 */
export const ParchmentPanel: React.FC<CardProps> = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`relative bg-obsidian-900/90 border border-gold-600/30 rounded-xl shadow-[0_0_30px_rgba(218,165,32,0.05)] overflow-hidden backdrop-blur-md ${className}`}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-hex-pattern opacity-10 pointer-events-none"></div>

      {/* Decorative Corners (12px) */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold-500 rounded-tl-xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold-500 rounded-tr-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold-500 rounded-bl-xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold-500 rounded-br-xl pointer-events-none"></div>

      {/* Header */}
      {(title || subtitle || action) && (
        <div className="relative z-10 p-4 border-b border-gold-600/20 bg-gradient-to-r from-transparent via-gold-900/10 to-transparent flex justify-between items-start">
          <div>
            {title && <h2 className="text-2xl font-fantasy text-gold-400 text-shadow-gold tracking-wide">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-widest">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 text-slate-200">
        {children}
      </div>
    </div>
  );
};

/**
 * Liquid Health/XP Bar
 * Visuals: Animated liquid fill, glass container, glowing edge.
 */
export const LiquidBar: React.FC<{ 
  current: number; 
  max: number; 
  color?: 'red' | 'blue' | 'green' | 'gold' | 'cyan'; 
  label?: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ current, max, color = 'gold', label, subLabel, size = 'md' }) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  
  const heightClass = size === 'sm' ? 'h-2' : size === 'md' ? 'h-4' : 'h-6';
  
  const colors = {
    red: 'from-red-600 to-red-900 shadow-[0_0_10px_#ef4444]',
    blue: 'from-blue-500 to-blue-900 shadow-[0_0_10px_#3b82f6]',
    green: 'from-emerald-500 to-emerald-900 shadow-[0_0_10px_#10b981]',
    gold: 'from-gold-400 to-yellow-700 shadow-[0_0_10px_#fbbf24]',
    cyan: 'from-cyan-400 to-blue-600 shadow-[0_0_10px_#22d3ee]',
  };

  return (
    <div className="w-full group">
      <div className="flex justify-between items-end mb-1 px-1">
        {label && <span className="font-fantasy text-xs tracking-widest text-gold-400/80 group-hover:text-gold-300 transition-colors">{label}</span>}
        <span className="font-mono text-xs text-gold-500/60">{Math.floor(current)}/{max} {subLabel}</span>
      </div>
      <div className={`w-full bg-black/60 rounded-full border border-slate-700/50 p-[2px] relative overflow-hidden backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ${heightClass}`}>
        {/* The Liquid */}
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-500 ease-out relative`}
          style={{ width: `${percent}%` }}
        >
          {/* Shimmer */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50 shadow-[0_0_5px_white]"></div>
        </div>
      </div>
    </div>
  );
};

export const StatBadge: React.FC<{ icon: React.ReactNode, label: string, value: number | string, color?: string }> = ({ icon, label, value, color = "text-gold-400" }) => (
    <div className="flex flex-col items-center p-2 bg-black/40 rounded border border-white/5 hover:border-gold-500/30 transition-colors w-20">
        <div className={`mb-1 ${color}`}>{icon}</div>
        <div className="text-[10px] text-slate-500 uppercase font-bold">{label}</div>
        <div className="font-mono font-bold text-white text-lg">{value}</div>
    </div>
);
