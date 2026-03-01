# Gemini Edge Function — Design Doc

**Date:** 2026-03-01
**Status:** Approved

## Overview

Move the Gemini API call for AI quiz generation from the browser to a Supabase Edge Function. The API key is stored as a Supabase Secret and never reaches the client.

## Architecture

```
Browser (StudyHub.tsx)
  → supabase.functions.invoke('generate-quiz', { body: { topic, count } })
      [automatically sends Authorization: Bearer <session JWT>]
  → supabase/functions/generate-quiz/index.ts
      1. Verify JWT via Supabase Auth (401 if missing/invalid)
      2. POST to Gemini API using Deno.env.get('GEMINI_API_KEY')
      3. Return { questions: Question[] }
  → lib/aiTraining.ts (updated)
      Replaces direct fetch() with supabase.functions.invoke()
```

## Files

| File | Change |
|------|--------|
| `supabase/functions/generate-quiz/index.ts` | New — Deno edge function |
| `lib/aiTraining.ts` | Replace Gemini fetch with supabase.functions.invoke |
| `.env.local` | Remove VITE_GEMINI_API_KEY (no longer needed) |

## Edge Function Contract

**Request:** POST (invoked via Supabase client SDK)
- Header: `Authorization: Bearer <JWT>` (attached automatically by SDK)
- Body: `{ topic: string, count: number }`

**Response 200:** `{ questions: Question[] }`
**Response 401:** `{ error: "Unauthorized" }` — missing or invalid JWT
**Response 400:** `{ error: "Invalid request" }` — bad topic/count
**Response 500:** `{ error: "AI request failed" }` — Gemini error

## Gemini Key Storage

```bash
supabase secrets set GEMINI_API_KEY=<real-key>
```

Read inside the function as `Deno.env.get('GEMINI_API_KEY')`. Never in the build or `.env.local`.

## What Does NOT Change

- `normalizeQuestion` / `parseJsonArray` logic — moves into the edge function unchanged
- `summonAIQuiz()` in StudyHub — same call site, same error handling
- Question schema — identical
