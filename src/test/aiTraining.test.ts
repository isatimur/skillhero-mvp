// src/test/aiTraining.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module before importing aiTraining
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { generateAIQuiz } from '@/lib/aiTraining';
import { supabase } from '@/lib/supabase';

const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>;

const fakeQuestion = {
  id: 'ai_test_1',
  text: 'What is X?',
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 0,
  explanation: 'Because A.',
  difficulty: 'Medium' as const,
  xpReward: 30,
  topic: 'Algorithms' as const,
};

describe('generateAIQuiz', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('returns questions on success', async () => {
    mockInvoke.mockResolvedValue({ data: { questions: [fakeQuestion] }, error: null });
    const result = await generateAIQuiz('Algorithms', 1);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('What is X?');
    expect(mockInvoke).toHaveBeenCalledWith('generate-quiz', { body: { topic: 'Algorithms', count: 1 } });
  });

  it('throws on supabase error', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Unauthorized' } });
    await expect(generateAIQuiz('Algorithms', 1)).rejects.toThrow('Unauthorized');
  });

  it('throws when questions array is empty', async () => {
    mockInvoke.mockResolvedValue({ data: { questions: [] }, error: null });
    await expect(generateAIQuiz('Algorithms', 1)).rejects.toThrow('no valid questions');
  });
});
