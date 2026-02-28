export interface AttemptLite {
  questionId: string;
  topic?: string | null;
  isCorrect: boolean;
  attemptedAt: string;
}

interface AttemptStats {
  attempts: number;
  correct: number;
  lastAttemptAt: number;
}

function toMillis(iso: string): number {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function buildMaps(attempts: AttemptLite[]) {
  const byQuestion: Record<string, AttemptStats> = {};
  const byTopic: Record<string, AttemptStats> = {};

  for (const a of attempts) {
    const ms = toMillis(a.attemptedAt);

    if (!byQuestion[a.questionId]) {
      byQuestion[a.questionId] = { attempts: 0, correct: 0, lastAttemptAt: 0 };
    }
    byQuestion[a.questionId].attempts += 1;
    if (a.isCorrect) byQuestion[a.questionId].correct += 1;
    if (ms > byQuestion[a.questionId].lastAttemptAt) byQuestion[a.questionId].lastAttemptAt = ms;

    if (a.topic) {
      if (!byTopic[a.topic]) {
        byTopic[a.topic] = { attempts: 0, correct: 0, lastAttemptAt: 0 };
      }
      byTopic[a.topic].attempts += 1;
      if (a.isCorrect) byTopic[a.topic].correct += 1;
      if (ms > byTopic[a.topic].lastAttemptAt) byTopic[a.topic].lastAttemptAt = ms;
    }
  }

  return { byQuestion, byTopic };
}

export function scoreAdaptivePriority(
  questionId: string,
  topic: string | undefined,
  attempts: AttemptLite[],
  nowMs = Date.now()
): number {
  const { byQuestion, byTopic } = buildMaps(attempts);
  const q = byQuestion[questionId];
  const t = topic ? byTopic[topic] : undefined;

  const topicInaccuracy = t && t.attempts > 0 ? 1 - t.correct / t.attempts : 0.4;

  if (!q) {
    // New question: prioritize if its topic seems weak.
    return 1.4 + topicInaccuracy;
  }

  const qAccuracy = q.correct / q.attempts;
  const qInaccuracy = 1 - qAccuracy;
  const hoursSince = q.lastAttemptAt > 0 ? (nowMs - q.lastAttemptAt) / (1000 * 60 * 60) : 999;
  const dueScore = Math.min(1, Math.max(0, hoursSince / 24)); // grows over a day
  const lowSampleBoost = q.attempts < 2 ? 0.25 : 0;

  return qInaccuracy * 1.3 + dueScore * 0.9 + topicInaccuracy * 0.4 + lowSampleBoost;
}

export function pickWeakestTopic<T extends string>(
  topics: T[],
  attempts: AttemptLite[],
  fallbackTopic: T
): T {
  if (attempts.length === 0) return fallbackTopic;

  const { byTopic } = buildMaps(attempts);
  let weakest = fallbackTopic;
  let weakestScore = Number.POSITIVE_INFINITY;

  for (const topic of topics) {
    const t = byTopic[topic];
    const score = t && t.attempts > 0 ? t.correct / t.attempts : 0.55;
    if (score < weakestScore) {
      weakestScore = score;
      weakest = topic;
    }
  }
  return weakest;
}
