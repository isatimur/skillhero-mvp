import { describe, it, expect, beforeEach } from 'vitest';
import { rewardBus, createInitialRewardState, saveRewardState, loadRewardState, migrateStudyGameLoop, purchasePerk, purchaseConsumable, activateConsumable } from '@/lib/rewardBus';

describe('rewardBus', () => {
  it('awards base XP with no multipliers on fresh state', () => {
    const state = createInitialRewardState();
    const { reward } = rewardBus(state, { baseXp: 100 });
    expect(reward.xpAward).toBe(100);
    expect(reward.goldGain).toBeGreaterThan(0);
    expect(reward.crit).toBe(false);
  });

  it('applies combo multiplier after consecutive actions within window', () => {
    const state = createInitialRewardState();
    const { nextState: s1 } = rewardBus(state, { baseXp: 100 });
    expect(s1.combo).toBe(1);
    const { nextState: s2, reward } = rewardBus(s1, { baseXp: 100 });
    expect(s2.combo).toBe(2);
    expect(reward.xpAward).toBeGreaterThan(100);
  });

  it('resets combo when action is outside the 30-minute window', () => {
    const state = createInitialRewardState();
    const { nextState: s1 } = rewardBus(state, { baseXp: 100 });
    const staleState = { ...s1, lastActionAt: Date.now() - 31 * 60 * 1000 };
    const { nextState: s2 } = rewardBus(staleState, { baseXp: 100 });
    expect(s2.combo).toBe(1);
  });

  it('does not exceed max crit chance of 60%', () => {
    const state = { ...createInitialRewardState(), perks: { scholarLedger: 3, comboMastery: 3, luckyStrike: 2, shardSiphon: 2 } };
    let critCount = 0;
    let s = state;
    for (let i = 0; i < 100; i++) {
      const result = rewardBus(s, { baseXp: 50 });
      if (result.reward.crit) critCount++;
      s = result.nextState;
    }
    expect(critCount).toBeGreaterThan(0);
    expect(critCount).toBeLessThan(100);
  });

  it('marks daily complete after 3 actions', () => {
    let state = createInitialRewardState();
    for (let i = 0; i < 2; i++) {
      state = rewardBus(state, { baseXp: 50 }).nextState;
    }
    expect(state.dailyCompleted).toBe(false);
    const { nextState, reward } = rewardBus(state, { baseXp: 50 });
    expect(nextState.dailyCompleted).toBe(true);
    expect(reward.dailyCompletedNow).toBe(true);
  });

  it('gold gain is floored at 1 for small XP awards', () => {
    const state = createInitialRewardState();
    const { reward } = rewardBus(state, { baseXp: 1 });
    expect(reward.goldGain).toBeGreaterThanOrEqual(1);
  });
});

describe('migrateStudyGameLoop', () => {
  const OLD_KEY = 'skillhero_study_loop_testuser';
  const username = 'testuser';

  beforeEach(() => {
    localStorage.clear();
  });

  it('merges gold and shards from old key into rewardBus state', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 200, shards: 5, combo: 3 }));
    const before = createInitialRewardState();
    saveRewardState(before, username);

    migrateStudyGameLoop(username);

    const after = loadRewardState(username)!;
    expect(after.gold).toBe(200);
    expect(after.shards).toBe(5);
  });

  it('takes max combo between old and current', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 0, shards: 0, combo: 7 }));
    const before = { ...createInitialRewardState(), combo: 4 };
    saveRewardState(before, username);

    migrateStudyGameLoop(username);

    expect(loadRewardState(username)!.combo).toBe(7);
  });

  it('deletes the old key after migration', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 50, shards: 1, combo: 2 }));
    migrateStudyGameLoop(username);
    expect(localStorage.getItem(OLD_KEY)).toBeNull();
  });

  it('is idempotent — running twice has no additional effect', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 100, shards: 2, combo: 0 }));
    migrateStudyGameLoop(username);
    const goldAfterFirst = loadRewardState(username)!.gold;
    migrateStudyGameLoop(username); // key is gone, should no-op
    expect(loadRewardState(username)!.gold).toBe(goldAfterFirst);
  });

  it('is a no-op when old key does not exist', () => {
    // no old key set
    migrateStudyGameLoop(username);
    expect(loadRewardState(username)).toBeNull();
  });
});

describe('perk/consumable API', () => {
  describe('purchasePerk', () => {
    it('deducts gold/shards and increments perk level on success', () => {
      const state = { ...createInitialRewardState(), gold: 500, shards: 5 };
      const result = purchasePerk(state, 'scholarLedger');
      expect(result.ok).toBe(true);
      expect(result.nextState.gold).toBe(500 - 180);
      expect(result.nextState.shards).toBe(5 - 1);
      expect(result.nextState.perks.scholarLedger).toBe(1);
    });

    it('returns reason maxed when perk is at max level', () => {
      const state = { ...createInitialRewardState(), gold: 999, shards: 99, perks: { ...createInitialRewardState().perks, scholarLedger: 3 } };
      const result = purchasePerk(state, 'scholarLedger');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('maxed');
      expect(result.nextState).toBe(state);
    });

    it('returns reason insufficient_funds when gold is too low', () => {
      const state = { ...createInitialRewardState(), gold: 10, shards: 99 };
      const result = purchasePerk(state, 'scholarLedger');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('insufficient_funds');
    });

    it('returns reason insufficient_funds when shards are too low', () => {
      const state = { ...createInitialRewardState(), gold: 999, shards: 0 };
      const result = purchasePerk(state, 'scholarLedger');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('insufficient_funds');
    });
  });

  describe('purchaseConsumable', () => {
    it('deducts gold/shards and increments inventory on success', () => {
      const state = { ...createInitialRewardState(), gold: 500, shards: 5 };
      const result = purchaseConsumable(state, 'focusElixir');
      expect(result.ok).toBe(true);
      expect(result.nextState.gold).toBe(500 - 90);
      expect(result.nextState.shards).toBe(5 - 1);
      expect(result.nextState.inventory.focusElixir).toBe(1);
    });

    it('returns reason insufficient_funds when gold is too low', () => {
      const state = { ...createInitialRewardState(), gold: 5, shards: 99 };
      const result = purchaseConsumable(state, 'focusElixir');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('insufficient_funds');
    });
  });

  describe('activateConsumable', () => {
    it('moves item from inventory to activeBuffs on success', () => {
      const state = { ...createInitialRewardState(), inventory: { focusElixir: 2, luckyCharm: 0 } };
      const result = activateConsumable(state, 'focusElixir');
      expect(result.ok).toBe(true);
      expect(result.nextState.inventory.focusElixir).toBe(1);
      expect(result.nextState.activeBuffs.focusElixir).toBe(5); // durationActions for focusElixir
    });

    it('returns reason no_stock when inventory is empty', () => {
      const state = createInitialRewardState(); // inventory all 0
      const result = activateConsumable(state, 'focusElixir');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('no_stock');
    });

    it('returns reason already_active when buff is already running', () => {
      const state = { ...createInitialRewardState(), inventory: { focusElixir: 1, luckyCharm: 0 }, activeBuffs: { focusElixir: 3, luckyCharm: 0 } };
      const result = activateConsumable(state, 'focusElixir');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('already_active');
    });
  });
});
