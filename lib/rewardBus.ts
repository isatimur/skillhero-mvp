// Unified reward bus — single entry point for all XP/gold/shard awards.
// Replaces awardStudyAction() from studyGameLoop.ts and awardGameplay() in App.tsx.

export const COMBO_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
export const DAILY_TARGET = 3;
export const WEEKLY_TARGET = 14;

export interface RewardState {
  gold: number;
  shards: number;
  combo: number;
  lastActionAt: number;
  totalActions: number;
  totalStudyXp: number;
  dailyDay: string;
  dailyActions: number;
  dailyCompleted: boolean;
  weeklyKey: string;
  weeklyActions: number;
  weeklyCompleted: boolean;
  perks: {
    scholarLedger: number;  // 0-3: +10% XP per level
    comboMastery: number;   // 0-3: faster combo growth
    luckyStrike: number;    // 0-2: +6% crit per level
    shardSiphon: number;    // 0-2: extra shard per N actions
  };
  activeBuffs: {
    focusElixir: number;   // actions remaining
    luckyCharm: number;    // actions remaining
  };
  inventory: {
    focusElixir: number;
    luckyCharm: number;
  };
}

export interface RewardResult {
  xpAward: number;
  goldGain: number;
  shardGain: number;
  crit: boolean;
  comboMultiplier: number;
  dailyCompletedNow: boolean;
  weeklyCompletedNow: boolean;
  focusBuffActive: boolean;
  luckyBuffActive: boolean;
}

export interface RewardBusResult {
  nextState: RewardState;
  reward: RewardResult;
}

export type PerkId = 'scholarLedger' | 'comboMastery' | 'luckyStrike' | 'shardSiphon';
export type ConsumableId = 'focusElixir' | 'luckyCharm';

export interface PerkDefinition {
  id: PerkId;
  name: string;
  description: string;
  maxLevel: number;
  goldCost: number;
  shardCost: number;
}

export interface ConsumableDefinition {
  id: ConsumableId;
  name: string;
  description: string;
  durationActions: number;
  goldCost: number;
  shardCost: number;
}

export const PERK_DEFS: PerkDefinition[] = [
  { id: 'scholarLedger', name: 'Scholar Ledger', description: '+10% XP gain per level.', maxLevel: 3, goldCost: 180, shardCost: 1 },
  { id: 'comboMastery', name: 'Combo Mastery', description: 'Combo multiplier grows faster.', maxLevel: 3, goldCost: 220, shardCost: 1 },
  { id: 'luckyStrike', name: 'Lucky Strike', description: '+6% crit chance per level.', maxLevel: 2, goldCost: 260, shardCost: 2 },
  { id: 'shardSiphon', name: 'Shard Siphon', description: 'Extra shard every 6 actions per level.', maxLevel: 2, goldCost: 320, shardCost: 2 },
];

export const CONSUMABLE_DEFS: ConsumableDefinition[] = [
  { id: 'focusElixir', name: 'Focus Elixir', description: '+25% XP gain for next 5 study actions.', durationActions: 5, goldCost: 90, shardCost: 1 },
  { id: 'luckyCharm', name: 'Lucky Charm', description: '+15% crit chance for next 4 study actions.', durationActions: 4, goldCost: 110, shardCost: 1 },
];

export interface PurchasePerkResult { ok: boolean; reason?: 'maxed' | 'insufficient_funds'; nextState: RewardState; }
export interface PurchaseConsumableResult { ok: boolean; reason?: 'insufficient_funds'; nextState: RewardState; }
export interface ActivateConsumableResult { ok: boolean; reason?: 'no_stock' | 'already_active'; nextState: RewardState; }

export function purchasePerk(current: RewardState, perkId: PerkId): PurchasePerkResult {
  const perk = PERK_DEFS.find(p => p.id === perkId);
  if (!perk) return { ok: false, reason: 'insufficient_funds', nextState: current };
  const level = current.perks[perkId] ?? 0;
  if (level >= perk.maxLevel) return { ok: false, reason: 'maxed', nextState: current };
  if (current.gold < perk.goldCost || current.shards < perk.shardCost)
    return { ok: false, reason: 'insufficient_funds', nextState: current };
  return {
    ok: true,
    nextState: {
      ...current,
      gold: current.gold - perk.goldCost,
      shards: current.shards - perk.shardCost,
      perks: { ...current.perks, [perkId]: level + 1 },
    },
  };
}

export function purchaseConsumable(current: RewardState, id: ConsumableId): PurchaseConsumableResult {
  const def = CONSUMABLE_DEFS.find(c => c.id === id);
  if (!def) return { ok: false, reason: 'insufficient_funds', nextState: current };
  if (current.gold < def.goldCost || current.shards < def.shardCost)
    return { ok: false, reason: 'insufficient_funds', nextState: current };
  return {
    ok: true,
    nextState: {
      ...current,
      gold: current.gold - def.goldCost,
      shards: current.shards - def.shardCost,
      inventory: { ...current.inventory, [id]: (current.inventory[id] ?? 0) + 1 },
    },
  };
}

export function activateConsumable(current: RewardState, id: ConsumableId): ActivateConsumableResult {
  const def = CONSUMABLE_DEFS.find(c => c.id === id);
  if (!def) return { ok: false, reason: 'no_stock', nextState: current };
  const stock = current.inventory[id] ?? 0;
  if (stock <= 0) return { ok: false, reason: 'no_stock', nextState: current };
  if ((current.activeBuffs[id] ?? 0) > 0) return { ok: false, reason: 'already_active', nextState: current };
  return {
    ok: true,
    nextState: {
      ...current,
      inventory: { ...current.inventory, [id]: stock - 1 },
      activeBuffs: { ...current.activeBuffs, [id]: def.durationActions },
    },
  };
}

export function getPerkCatalog(): PerkDefinition[] { return PERK_DEFS; }
export function getConsumableCatalog(): ConsumableDefinition[] { return CONSUMABLE_DEFS; }

export function createInitialRewardState(): RewardState {
  const today = new Date().toISOString().slice(0, 10);
  const weekKey = getISOWeekKey(new Date());
  return {
    gold: 0, shards: 0, combo: 0, lastActionAt: 0,
    totalActions: 0, totalStudyXp: 0,
    dailyDay: today, dailyActions: 0, dailyCompleted: false,
    weeklyKey: weekKey, weeklyActions: 0, weeklyCompleted: false,
    perks: { scholarLedger: 0, comboMastery: 0, luckyStrike: 0, shardSiphon: 0 },
    activeBuffs: { focusElixir: 0, luckyCharm: 0 },
    inventory: { focusElixir: 0, luckyCharm: 0 },
  };
}

function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

export function rewardBus(state: RewardState, input: { baseXp: number }): RewardBusResult {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const weekKey = getISOWeekKey(new Date());
  const { perks, activeBuffs } = state;

  // Reset daily/weekly if new day/week
  const dailyReset = state.dailyDay !== today;
  const weeklyReset = state.weeklyKey !== weekKey;
  const dailyActions = dailyReset ? 0 : state.dailyActions;
  const dailyCompleted = dailyReset ? false : state.dailyCompleted;
  const weeklyActions = weeklyReset ? 0 : state.weeklyActions;
  const weeklyCompleted = weeklyReset ? false : state.weeklyCompleted;

  // Combo — only increment if within the time window
  const withinWindow = state.lastActionAt > 0 && (now - state.lastActionAt) <= COMBO_WINDOW_MS;
  const newCombo = withinWindow ? state.combo + 1 : 1;

  // Multipliers
  const comboGrowth = 0.08 + perks.comboMastery * 0.03;
  const comboMax = 1.4 + perks.comboMastery * 0.4;
  const comboMultiplier = newCombo > 1
    ? 1 + Math.min(comboMax, (newCombo - 1) * comboGrowth)
    : 1;

  const xpPerkMultiplier = 1 + perks.scholarLedger * 0.1;
  const buffMultiplier = activeBuffs.focusElixir > 0 ? 1.25 : 1;

  // Crit chance uses (newCombo - 1) so first action (combo=1) always has 0 base chance.
  // This ensures no crit is possible on the very first action of a fresh state.
  const critChance = Math.min(0.60,
    (newCombo - 1) * 0.01 + perks.luckyStrike * 0.06 + (activeBuffs.luckyCharm > 0 ? 0.15 : 0)
  );
  const crit = Math.random() < critChance;
  const critMultiplier = crit ? 1.5 : 1;

  const xpAward = Math.max(1, Math.floor(input.baseXp * comboMultiplier * xpPerkMultiplier * buffMultiplier * critMultiplier));

  // Gold & Shards
  const baseGold = Math.max(1, Math.floor(xpAward / 12));
  let shardGain = crit ? 1 : 0;
  const totalActionsNew = state.totalActions + 1;
  const shardSiphonInterval = perks.shardSiphon === 0 ? Infinity : perks.shardSiphon === 1 ? 6 : 4;
  if (totalActionsNew % shardSiphonInterval === 0) shardGain += 1;
  if (newCombo > 0 && newCombo % 5 === 0) shardGain += 1;

  // Daily/Weekly completion
  const newDailyActions = dailyActions + 1;
  const dailyCompletedNow = !dailyCompleted && newDailyActions >= DAILY_TARGET;
  const dailyBonusGold = dailyCompletedNow ? 25 : 0;
  const dailyBonusShards = dailyCompletedNow ? 1 : 0;

  const newWeeklyActions = weeklyActions + 1;
  const weeklyCompletedNow = !weeklyCompleted && newWeeklyActions >= WEEKLY_TARGET;
  const weeklyBonusGold = weeklyCompletedNow ? 120 : 0;
  const weeklyBonusShards = weeklyCompletedNow ? 3 : 0;

  const goldGain = baseGold + dailyBonusGold + weeklyBonusGold;
  const totalShards = shardGain + dailyBonusShards + weeklyBonusShards;

  // Update buffs
  const newBuffs = {
    focusElixir: Math.max(0, activeBuffs.focusElixir - 1),
    luckyCharm: Math.max(0, activeBuffs.luckyCharm - 1),
  };

  const nextState: RewardState = {
    ...state,
    gold: state.gold + goldGain,
    shards: state.shards + totalShards,
    combo: newCombo,
    lastActionAt: now,
    totalActions: totalActionsNew,
    totalStudyXp: state.totalStudyXp + xpAward,
    dailyDay: today,
    dailyActions: newDailyActions,
    dailyCompleted: dailyCompleted || dailyCompletedNow,
    weeklyKey: weekKey,
    weeklyActions: newWeeklyActions,
    weeklyCompleted: weeklyCompleted || weeklyCompletedNow,
    activeBuffs: newBuffs,
  };

  return {
    nextState,
    reward: {
      xpAward, goldGain, shardGain: totalShards, crit, comboMultiplier,
      dailyCompletedNow, weeklyCompletedNow,
      focusBuffActive: activeBuffs.focusElixir > 0,
      luckyBuffActive: activeBuffs.luckyCharm > 0,
    },
  };
}

export function getStudyRank(totalXp: number): string {
  if (totalXp >= 20000) return 'Archmage';
  if (totalXp >= 12000) return 'Grand Scholar';
  if (totalXp >= 7000) return 'Lore Master';
  if (totalXp >= 3500) return 'Battle Sage';
  if (totalXp >= 1200) return 'Adept';
  return 'Apprentice';
}

export function saveRewardState(state: RewardState, username: string): void {
  try {
    localStorage.setItem(`rewardBus_${username}`, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function loadRewardState(username: string): RewardState | null {
  try {
    const raw = localStorage.getItem(`rewardBus_${username}`);
    if (!raw) return null;
    const loaded = JSON.parse(raw);
    // Merge with defaults to handle schema changes gracefully
    const defaults = createInitialRewardState();
    return {
      ...defaults,
      ...loaded,
      perks: { ...defaults.perks, ...(loaded.perks ?? {}) },
      activeBuffs: { ...defaults.activeBuffs, ...(loaded.activeBuffs ?? {}) },
      inventory: { ...defaults.inventory, ...(loaded.inventory ?? {}) },
    };
  } catch {
    return null;
  }
}

/**
 * One-time migration: reads legacy studyGameLoop state and merges gold/shards/combo
 * into the rewardBus state, then deletes the old key.
 * Idempotent — safe to call on every login.
 */
export function migrateStudyGameLoop(username: string): void {
  const oldKey = `skillhero_study_loop_${username.toLowerCase()}`;
  const raw = localStorage.getItem(oldKey);
  if (!raw) return;
  try {
    const old = JSON.parse(raw);
    const current = loadRewardState(username) ?? createInitialRewardState();
    const merged: RewardState = {
      ...current,
      gold: current.gold + (old.gold ?? 0),
      shards: current.shards + (old.shards ?? 0),
      combo: Math.max(current.combo, old.combo ?? 0),
    };
    saveRewardState(merged, username);
  } catch {
    // Corrupted old data — just clean it up
  }
  localStorage.removeItem(oldKey);
}
