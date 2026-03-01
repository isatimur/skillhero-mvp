// supabase/functions/generate-quiz/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ── Helpers ───────────────────────────────────────────────────────────────────

const parseJsonArray = (raw: string): unknown[] => {
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

const normalizeQuestion = (item: unknown, topic: string, idx: number) => {
  if (!item || typeof item !== 'object') return null;
  const q = item as Record<string, unknown>;
  if (
    !q.text || !Array.isArray(q.options) || typeof q.correctIndex !== 'number' || !q.explanation
  ) return null;
  if (q.options.length !== 4) return null;
  if (q.correctIndex < 0 || q.correctIndex > 3) return null;
  const difficulty =
    q.difficulty === 'Easy' || q.difficulty === 'Medium' || q.difficulty === 'Hard'
      ? q.difficulty
      : 'Medium';
  return {
    id: `ai_${topic.replace(/\W+/g, '_').toLowerCase()}_${Date.now()}_${idx}`,
    text: String(q.text).trim(),
    options: (q.options as unknown[]).map((o) => String(o).trim()),
    correctIndex: q.correctIndex,
    explanation: String(q.explanation).trim(),
    difficulty,
    xpReward: difficulty === 'Hard' ? 35 : difficulty === 'Medium' ? 30 : 25,
    topic,
  };
};

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  // Auth — verify the caller has a valid Supabase session
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Unauthorized' }, 401);

  // Validate request body
  let topic: string, count: number;
  try {
    const body = await req.json();
    topic = body.topic;
    count = Number(body.count) || 5;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!topic || typeof topic !== 'string') {
    return json({ error: 'Invalid request: topic is required' }, 400);
  }
  count = Math.min(Math.max(1, count), 10); // clamp 1–10

  // Call Gemini
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return json({ error: 'Server misconfigured: missing GEMINI_API_KEY' }, 500);

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

  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
    }),
  });

  if (!geminiRes.ok) {
    return json({ error: `Gemini request failed (${geminiRes.status})` }, 502);
  }

  const data = await geminiRes.json();
  const text: string =
    data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('\n') ??
    '';

  const questions = parseJsonArray(text)
    .map((item, idx) => normalizeQuestion(item, topic, idx))
    .filter(Boolean)
    .slice(0, count);

  if (questions.length === 0) {
    return json({ error: 'AI returned no valid questions.' }, 502);
  }

  return json({ questions });
});
