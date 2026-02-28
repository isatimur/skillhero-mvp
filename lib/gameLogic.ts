
import { User, HeroClass, HeroRace } from '../types';

export { findPath } from './pathfinding';

// --- RNG UTILS ---

/**
 * Deterministic random noise for tile variations based on coordinates.
 */
export const pseudoRandom = (x: number, y: number): number => {
    return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
};

// --- COMBAT LOGIC ---

/**
 * Calculates damage based on stats, race bonuses, crit chance, and combos.
 */
export const calculateDamage = (
    attacker: User, 
    defenderRace: string | undefined, 
    baseDmg: number, 
    isCrit: boolean, 
    combo: number,
    currentHpPercent: number // 0-1 (for Orc passive)
): number => {
    let dmg = baseDmg;
    const stats = attacker.stats || { str: 1, int: 1, agi: 1 };
    
    // Class Stat Scaling
    let statBonus = stats.str * 1.5;
    if (attacker.heroClass === 'MAGE') statBonus = stats.int * 1.5;
    if (attacker.heroClass === 'ROGUE') statBonus = stats.agi * 1.5;
    
    dmg += statBonus;

    // Combo Multiplier
    dmg *= (1 + (combo * 0.1));
    
    // Crit Multiplier
    if (isCrit) dmg *= 1.5;

    // Racial Passives
    if (attacker.heroRace === 'ORC') {
       // Orcs deal more damage at low HP
       const missingHpPct = 1 - currentHpPercent;
       if (missingHpPct > 0) {
           dmg *= (1 + (missingHpPct * 0.5));
       }
    }
    
    if (attacker.heroRace === 'DRAGONKIN') {
        dmg += 5; // Flat bonus
    }

    // Defender Passives
    if (defenderRace === 'DWARF') {
        dmg *= 0.8; // 20% damage reduction
    }

    return Math.ceil(dmg);
};

export const calculateCritChance = (user: User): number => {
    let chance = (user.stats?.agi || 1) * 0.03 + 0.05; // Base 5% + Agi scaling
    if (user.heroRace === 'ELF') chance += 0.15;
    if (user.heroClass === 'ROGUE') chance += 0.10;
    return chance;
};
