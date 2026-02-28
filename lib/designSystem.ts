/**
 * SkillHero Design System
 * Premium fantasy RPG aesthetic with dark souls meets modern UI
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
    // Void - Deepest blacks for backgrounds
    void: {
        black: '#0a0a0f',
        deep: '#0f0f14',
        medium: '#14141a',
    },

    // Slate - Base UI colors
    slate: {
        950: '#0f172a',
        900: '#1e293b',
        800: '#334155',
        700: '#475569',
        600: '#64748b',
        500: '#94a3b8',
        400: '#cbd5e1',
        300: '#e2e8f0',
        200: '#f1f5f9',
    },

    // Twilight - Purple tints
    twilight: {
        dark: '#1a1c2e',
        medium: '#252b42',
        light: '#2d3654',
    },

    // Mystic - Purple accents
    mystic: {
        900: '#4c1d95',
        800: '#5b21b6',
        700: '#6d28d9',
        600: '#7c3aed',
        500: '#8b5cf6',
    },

    // Gold - Primary accent
    gold: {
        900: '#78350f',
        800: '#92400e',
        700: '#b45309',
        600: '#d97706',
        500: '#f59e0b',
        400: '#fbbf24',
        300: '#fcd34d',
    },

    // Elemental colors
    ruby: {
        900: '#7f1d1d',
        700: '#b91c1c',
        500: '#ef4444',
        400: '#f87171',
    },
    emerald: {
        900: '#064e3b',
        700: '#047857',
        500: '#10b981',
        400: '#34d399',
    },
    sapphire: {
        900: '#1e3a8a',
        700: '#1d4ed8',
        500: '#3b82f6',
        400: '#60a5fa',
    },
    amethyst: {
        900: '#581c87',
        700: '#7e22ce',
        500: '#a855f7',
        400: '#c084fc',
    },

    // Status colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
};

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
    legendary: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)',
    epic: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    rare: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    common: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',

    // Directional
    radialGlow: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
    voidDepth: 'radial-gradient(ellipse at top, #1a1c2e 0%, #0a0a0f 100%)',

    // Animated (for keyframes)
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.3) 50%, transparent 100%)',
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const fonts = {
    fantasy: "'Cinzel', serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
};

export const fontSizes = {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
};

export const fontWeights = {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Glows
    goldGlow: '0 0 20px rgba(251, 191, 36, 0.5)',
    purpleGlow: '0 0 20px rgba(168, 85, 247, 0.5)',
    blueGlow: '0 0 20px rgba(59, 130, 246, 0.5)',

    // Inner
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
};

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
    background: -1,
    base: 0,
    dropdown: 50,
    sticky: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
    notification: 500,
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const durations = {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '800ms',
};

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const easings = {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Custom
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
};

// ============================================================================
// RARITY COLORS
// ============================================================================

export const rarityColors = {
    common: colors.slate[500],
    rare: colors.sapphire[500],
    epic: colors.amethyst[500],
    legendary: colors.gold[400],
    artifact: '#ff6b6b',
    ancient: '#ffd700',
};

export const rarityGradients = {
    common: gradients.common,
    rare: gradients.rare,
    epic: gradients.epic,
    legendary: gradients.legendary,
    artifact: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    ancient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const rgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getGlowShadow = (color: string, intensity: number = 0.5): string => {
    return `0 0 ${20 * intensity}px ${rgba(color, intensity)}`;
};
