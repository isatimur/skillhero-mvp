# Gemini Edge Function Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the Gemini API call for AI quiz generation from the browser into a Supabase Edge Function so the API key never reaches the client.

**Architecture:** A Deno TypeScript edge function at `supabase/functions/generate-quiz/` verifies the caller's Supabase JWT, calls Gemini with a server-side secret, and returns parsed questions. The client replaces the direct `fetch()` call with `supabase.functions.invoke()`, which automatically attaches the session token.

**Tech Stack:** Supabase Edge Functions (Deno), Supabase JS client v2, Gemini 1.5 Flash API, Vitest (client-side mock test).

---

## Task 1: Scaffold shared CORS helper

Supabase Edge Functions need CORS headers for browser requests. This helper is shared across all functions.

**Files:**
- Create: `supabase/functions/_shared/cors.ts`

### Step 1: Create the file

```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Step 2: Verify file exists

```bash
cat supabase/functions/_shared/cors.ts
```

Expected: prints the file contents.

### Step 3: Commit

```bash
git add supabase/functions/_shared/cors.ts
git commit -m "feat: add shared CORS headers for edge functions"
```

---

## Task 2: Create the generate-quiz edge function

**Files:**
- Create: `supabase/functions/generate-quiz/index.ts`

The function must:
1. Return 200 `ok` for CORS preflight (`OPTIONS`)
2. Reject requests with no/invalid JWT → 401
3. Reject requests with missing `topic` → 400
4. Call Gemini with the server-side `GEMINI_API_KEY` secret
5. Parse and validate the Gemini response using the same logic currently in `lib/aiTraining.ts`
6. Return `{ questions: Question[] }` on success

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically by Supabase at runtime — do not add them to secrets.

### Step 1: Create the function file

```typescript
// supabase/functions/generate-quiz/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ── Helpers (same logic as the old lib/aiTraining.ts) ────────────────────────

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

// ── Main handler ─────────────────────────────────────────────────────────────

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
```

### Step 2: Verify the file exists

```bash
cat supabase/functions/generate-quiz/index.ts | head -5
```

Expected: prints the import lines.

### Step 3: Commit

```bash
git add supabase/functions/generate-quiz/index.ts
git commit -m "feat: add generate-quiz supabase edge function"
```

---

## Task 3: Update lib/aiTraining.ts to call the edge function

The client no longer calls Gemini directly. It calls `supabase.functions.invoke('generate-quiz')`, which attaches the session JWT automatically. The parsing logic moves to the edge function, so `parseJsonArray`, `normalizeQuestion`, and the Gemini fetch can all be removed from this file.

**Files:**
- Modify: `lib/aiTraining.ts` (full rewrite — file becomes much smaller)

### Step 1: Write a failing Vitest test first

Add a new test file:

```typescript
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
```

### Step 2: Run the test — verify it fails

```bash
npx vitest run src/test/aiTraining.test.ts 2>&1 | tail -20
```

Expected: FAIL — `generateAIQuiz` still calls Gemini directly, not `supabase.functions.invoke`.

### Step 3: Replace lib/aiTraining.ts with the new implementation

```typescript
// lib/aiTraining.ts
import { Question, SETopic } from '../types';
import { supabase } from './supabase';

export const generateAIQuiz = async (topic: SETopic, count = 5): Promise<Question[]> => {
  const { data, error } = await supabase.functions.invoke('generate-quiz', {
    body: { topic, count },
  });

  if (error) throw new Error(error.message || 'AI quiz generation failed');
  if (!data?.questions?.length) throw new Error('AI returned no valid questions.');

  return data.questions as Question[];
};
```

### Step 4: Run the test — verify it passes

```bash
npx vitest run src/test/aiTraining.test.ts 2>&1 | tail -10
```

Expected: 3 tests pass.

### Step 5: Run the full test suite

```bash
npx vitest run 2>&1 | tail -5
```

Expected: all 55 tests pass (52 existing + 3 new).

### Step 6: Build check

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...` with 0 errors.

### Step 7: Commit

```bash
git add lib/aiTraining.ts src/test/aiTraining.test.ts
git commit -m "feat: route AI quiz generation through edge function"
```

---

## Task 4: Set the secret and deploy

### Step 1: Set the Gemini API key as a Supabase secret

```bash
supabase secrets set GEMINI_API_KEY=<your-real-gemini-key>
```

Expected: `✓ Finished supabase secrets set`

To verify (without revealing the value):
```bash
supabase secrets list
```

Expected: `GEMINI_API_KEY` appears in the list.

### Step 2: Link the local project to the Supabase project (if not already linked)

```bash
supabase link --project-ref qnurovjrxgproedytlyk
```

Expected: `✓ Finished linking project`

If it asks for your database password, enter it. If already linked, this command is a no-op.

### Step 3: Deploy the edge function

```bash
supabase functions deploy generate-quiz --no-verify-jwt
```

Wait — do NOT use `--no-verify-jwt`. The function handles JWT verification itself (so Supabase's gateway layer doesn't also try to verify it, which would reject anonymous preflight). Actually, we DO want JWT verification at the gateway level too since we require auth. Use:

```bash
supabase functions deploy generate-quiz
```

Expected output:
```
✓ Deployed Function generate-quiz
```

### Step 4: Smoke test the deployed function

Use the Supabase dashboard → Edge Functions → `generate-quiz` → Logs to confirm it's deployed.

Then test from the app:
1. Run `npm run dev`
2. Log in with isatimur.it@gmail.com
3. Navigate to Study Hub → Daily Quiz tab
4. Click the "AI Quiz" / "Summon" button
5. Expected: 5 questions load (assuming real GEMINI_API_KEY was set)

### Step 5: Remove VITE_GEMINI_API_KEY from .env.local

Edit `.env.local` — delete the line:
```
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

The key is no longer needed on the client at all.

### Step 6: Commit

```bash
git add .env.local 2>/dev/null || true
git commit -m "chore: remove VITE_GEMINI_API_KEY from client env (now a supabase secret)"
```

### Step 7: Push

```bash
git push
```

---

## Notes for the implementer

- **Deno imports**: The edge function uses `https://esm.sh/` CDN imports. Do not use `npm:` or `node:` imports — this is Deno, not Node.
- **SUPABASE_URL / SUPABASE_ANON_KEY**: These are injected automatically at runtime. Do not add them to `supabase secrets set`.
- **`--no-verify-jwt` flag**: Do NOT use this flag. We want the gateway to pass the JWT through to the function so it can verify it with `supabase.auth.getUser()`.
- **Local testing** (optional): `supabase functions serve generate-quiz` starts a local Deno server. Requires Docker running locally.
- **Cold starts**: Edge Functions have ~200–500ms cold start on first call. This is acceptable for AI quiz generation (the Gemini call itself takes 1–3s anyway).
