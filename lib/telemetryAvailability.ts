const TELEMETRY_DISABLED_KEY = 'skillhero_question_attempts_disabled';

export function isTelemetryEnabled(): boolean {
  try {
    return localStorage.getItem(TELEMETRY_DISABLED_KEY) !== '1';
  } catch {
    return true;
  }
}

export function disableTelemetry(reason?: string): void {
  try {
    localStorage.setItem(TELEMETRY_DISABLED_KEY, '1');
    if (reason) {
      localStorage.setItem(`${TELEMETRY_DISABLED_KEY}_reason`, reason);
    }
  } catch {
    // Keep non-blocking.
  }
}

export function isMissingQuestionAttemptsError(error: any): boolean {
  if (!error) return false;
  if (typeof error?.status === 'number' && error.status === 404) return true;
  const code = String(error?.code || '');
  if (code === '42P01' || code === 'PGRST205' || code === 'PGRST204') return true;
  const message = String(error?.message || '').toLowerCase();
  return message.includes('question_attempts') && (message.includes('not found') || message.includes('does not exist'));
}
