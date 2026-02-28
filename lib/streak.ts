/**
 * Daily streak and "Daily Challenge" bonus for engagement.
 * Persisted in localStorage (keyed by user id when available).
 */

const STREAK_KEY = 'skillhero_streak';
const LAST_DATE_KEY = 'skillhero_last_date';
const DAILY_BONUS_CLAIMED_KEY = 'skillhero_daily_bonus_claimed';

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function today(): string {
  return formatLocalDate(new Date());
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
}

export function getStreak(): number {
  try {
    const last = localStorage.getItem(LAST_DATE_KEY);
    const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    const todayStr = today();
    const yesterdayStr = yesterday();

    if (!last) return 0;
    if (last === todayStr) return streak; // already played today
    if (last === yesterdayStr) return streak + 1; // will be updated on record
    return 0; // missed a day
  } catch {
    return 0;
  }
}

/** Call when user completes an activity (e.g. quest victory). Returns current streak after update. */
export function recordActivity(): number {
  const last = localStorage.getItem(LAST_DATE_KEY);
  const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  const todayStr = today();
  const yesterdayStr = yesterday();

  let newStreak = streak;
  if (last !== todayStr) {
    if (last === yesterdayStr) {
      newStreak = streak + 1;
    } else {
      newStreak = 1;
    }
    localStorage.setItem(LAST_DATE_KEY, todayStr);
    localStorage.setItem(STREAK_KEY, String(newStreak));
  }
  return newStreak;
}

/** Whether the daily 1.5x XP bonus has already been claimed today. */
export function isDailyBonusClaimed(): boolean {
  const claimed = localStorage.getItem(DAILY_BONUS_CLAIMED_KEY);
  return claimed === today();
}

/** Mark daily bonus as claimed (call after granting 1.5x XP once per day). */
export function claimDailyBonus(): void {
  localStorage.setItem(DAILY_BONUS_CLAIMED_KEY, today());
}

/** Multiplier for XP when daily challenge is active (first win of the day). 1.5 = 50% bonus. */
export const DAILY_CHALLENGE_XP_MULTIPLIER = 1.5;
