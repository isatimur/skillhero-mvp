import { supabase } from './supabase';
import { disableTelemetry, isMissingQuestionAttemptsError, isTelemetryEnabled } from './telemetryAvailability';

export type AttemptSource = 'BATTLE' | 'DAILY_QUIZ' | 'CODE_CHALLENGE' | 'INTERVIEW';

interface RecordQuestionAttemptParams {
  userId?: string | null;
  questionId: string;
  source: AttemptSource;
  topic?: string;
  difficulty?: string;
  isCorrect: boolean;
  responseMs?: number;
  hintUsed?: boolean;
  metadata?: Record<string, unknown>;
}

const LOCAL_ATTEMPT_BUFFER_KEY = 'skillhero_attempt_buffer';

export interface BufferedAttempt {
  questionId: string;
  source: AttemptSource;
  topic?: string;
  difficulty?: string;
  isCorrect: boolean;
  responseMs?: number | null;
  hintUsed?: boolean;
  metadata?: Record<string, unknown>;
  attemptedAt: string;
}

function bufferAttempt(payload: Omit<RecordQuestionAttemptParams, 'userId'>) {
  try {
    const prev = JSON.parse(localStorage.getItem(LOCAL_ATTEMPT_BUFFER_KEY) || '[]') as any[];
    prev.push({ ...payload, attemptedAt: new Date().toISOString() });
    localStorage.setItem(LOCAL_ATTEMPT_BUFFER_KEY, JSON.stringify(prev.slice(-500)));
  } catch {
    // Keep telemetry non-blocking.
  }
}

export function readBufferedAttempts(limit = 1500): BufferedAttempt[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_ATTEMPT_BUFFER_KEY) || '[]') as BufferedAttempt[];
    return raw.slice(-limit).reverse();
  } catch {
    return [];
  }
}

export async function recordQuestionAttempt(params: RecordQuestionAttemptParams): Promise<void> {
  const { userId, questionId, source, topic, difficulty, isCorrect, responseMs, hintUsed, metadata } = params;
  const payload = {
    questionId,
    source,
    topic,
    difficulty,
    isCorrect,
    responseMs: typeof responseMs === 'number' ? Math.max(0, Math.floor(responseMs)) : null,
    hintUsed: Boolean(hintUsed),
    metadata: metadata || {},
  };

  if (!userId) {
    bufferAttempt(payload);
    return;
  }

  if (!isTelemetryEnabled()) {
    bufferAttempt(payload);
    return;
  }

  try {
    const { error } = await supabase.from('question_attempts').insert({
      user_id: userId,
      question_id: questionId,
      source: source,
      topic: topic || null,
      difficulty: difficulty || null,
      is_correct: isCorrect,
      response_ms: payload.responseMs,
      hint_used: payload.hintUsed,
      metadata: payload.metadata,
    });

    if (error) {
      if (isMissingQuestionAttemptsError(error)) {
        disableTelemetry('question_attempts_missing');
      }
      bufferAttempt(payload);
    }
  } catch {
    bufferAttempt(payload);
  }
}
