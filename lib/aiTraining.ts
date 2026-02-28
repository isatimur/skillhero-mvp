import { Question, SETopic } from '../types';

interface GeminiCandidatePart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiCandidatePart[];
    };
  }>;
}

const parseJsonArray = (raw: string): any[] => {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return [];
  }
};

const normalizeQuestion = (item: any, topic: SETopic, idx: number): Question | null => {
  if (!item || typeof item !== 'object') return null;
  if (!item.text || !Array.isArray(item.options) || typeof item.correctIndex !== 'number' || !item.explanation) return null;
  if (item.options.length !== 4) return null;
  if (item.correctIndex < 0 || item.correctIndex > 3) return null;

  const difficulty = item.difficulty === 'Easy' || item.difficulty === 'Medium' || item.difficulty === 'Hard'
    ? item.difficulty
    : 'Medium';

  return {
    id: `ai_${topic.replace(/\W+/g, '_').toLowerCase()}_${Date.now()}_${idx}`,
    text: String(item.text).trim(),
    options: item.options.map((o: unknown) => String(o).trim()),
    correctIndex: item.correctIndex,
    explanation: String(item.explanation).trim(),
    difficulty,
    xpReward: difficulty === 'Hard' ? 35 : difficulty === 'Medium' ? 30 : 25,
    topic,
  };
};

// WARNING: VITE_GEMINI_API_KEY is a browser-visible env var. Only use it locally for
// development. In production, proxy this call through a server-side edge function
// so the key is never shipped to the client.
export const generateAIQuiz = async (topic: SETopic, count = 5): Promise<Question[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to .env.local for local AI quiz generation only.');
  }

  const prompt = [
    `Generate ${count} multiple-choice software engineering training questions for topic: "${topic}".`,
    'Return ONLY JSON array, no markdown.',
    'Each item must match this schema exactly:',
    '{ "text": string, "options": [string,string,string,string], "correctIndex": 0|1|2|3, "explanation": string, "difficulty": "Easy"|"Medium"|"Hard" }',
    'Rules:',
    '- Practical, interview-style scenarios, not trivia.',
    '- Exactly one correct option.',
    '- Explanation should mention why the correct option is best.',
  ].join('\n');

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed (${res.status})`);
  }

  const data: GeminiResponse = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';
  const parsed = parseJsonArray(text);
  const normalized = parsed
    .map((item, idx) => normalizeQuestion(item, topic, idx))
    .filter((q): q is Question => Boolean(q))
    .slice(0, count);

  if (normalized.length === 0) {
    throw new Error('AI returned no valid questions.');
  }

  return normalized;
};
