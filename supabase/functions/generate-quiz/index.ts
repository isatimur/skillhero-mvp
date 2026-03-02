// supabase/functions/generate-quiz/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Allowed topics — must match SETopic in types.ts
const ALLOWED_TOPICS = new Set([
  'Algorithms',
  'Data Structures',
  'OOP & Design Patterns',
  'SQL & Databases',
  'Git & Version Control',
  'System Design',
  'Networking & APIs',
  'Security',
  'Testing & CI/CD',
  'JavaScript/TypeScript',
  'React & Frontend',
  'Backend & Servers',
  'Cloud & DevOps',
  'Concurrency',
  'General CS',
  'Software Architecture',
  'AI & Machine Learning',
  'Mobile Development',
  'Operating Systems',
  'TypeScript Advanced',
]);

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
    console.warn('parseJsonArray: failed to parse Gemini response', raw.slice(0, 200));
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
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) return null;
  const difficulty =
    q.difficulty === 'Easy' || q.difficulty === 'Medium' || q.difficulty === 'Hard'
      ? q.difficulty
      : 'Medium';
  return {
    id: `ai_${topic.replace(/\W+/g, '_').toLowerCase()}_${crypto.randomUUID()}_${idx}`,
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
  if (!topic || typeof topic !== 'string' || topic.length > 100) {
    return json({ error: 'Invalid request: topic is required' }, 400);
  }
  if (!ALLOWED_TOPICS.has(topic)) {
    return json({ error: 'Invalid request: unknown topic' }, 400);
  }
  count = Math.min(Math.max(1, count), 10); // clamp 1–10

  // Call Gemini
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return json({ error: 'Server misconfigured: missing GEMINI_API_KEY' }, 500);

  const prompt = [
    `Generate ${count} multiple-choice software engineering training questions for topic: "${topic}".`,
    'Return ONLY a JSON array, no markdown, no explanation outside the array.',
    'Each item must match this schema exactly:',
    '{ "text": string, "options": [string,string,string,string], "correctIndex": 0|1|2|3, "explanation": string, "difficulty": "Easy"|"Medium"|"Hard" }',
    'Rules:',
    '- Each question MUST describe a realistic scenario: a bug to diagnose, a system under load, a code snippet with a problem, or an architectural tradeoff — never a bare definition or trivia.',
    '- Wrong options must be plausible mistakes a real developer would make, not obviously incorrect.',
    '- Easy = junior-level mistake (missing null check, wrong command). Medium = mid-level tradeoff (caching strategy, query optimisation). Hard = senior architecture decision (consistency vs availability, scaling approach).',
    '- Exactly one correct option.',
    '- Explanation must state WHY the correct answer is best AND why the most tempting wrong answer fails.',
  ].join('\n');

  let geminiRes: Response;
  try {
    geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, topK: 40, topP: 0.95, maxOutputTokens: 4096 },
      }),
    });
  } catch (err) {
    console.error('Gemini fetch error:', err);
    return json({ error: 'AI service unreachable' }, 502);
  }

  if (!geminiRes.ok) {
    return json({ error: `Gemini request failed (${geminiRes.status})` }, 502);
  }

  let data: unknown;
  try {
    data = await geminiRes.json();
  } catch {
    return json({ error: 'AI returned invalid response' }, 502);
  }

  const geminiData = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text: string =
    geminiData.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('\n') ?? '';

  const questions = parseJsonArray(text)
    .map((item, idx) => normalizeQuestion(item, topic, idx))
    .filter(Boolean)
    .slice(0, count);

  if (questions.length === 0) {
    return json({ error: 'AI returned no valid questions.' }, 502);
  }

  return json({ questions });
});
