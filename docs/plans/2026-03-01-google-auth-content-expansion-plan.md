# Google Auth + Content Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add Google Sign-In to the login screen and expand the question library with 8 new scenario-based quests across thin topics + improve the AI quiz prompt.

**Architecture:** Supabase `signInWithOAuth` handles the Google redirect flow — no new backend code needed. After OAuth callback, the existing `fetchProfile` + `LoginScreen` hero-creation path already handles new users. Content lives in `lib/content/quests.ts` (static) and the Gemini prompt in the edge function (AI).

**Tech Stack:** React 19, Supabase JS v2, Vitest, Supabase Edge Functions (Deno).

---

## Task 1: Google Sign-In button + OAuth handler

**Files:**
- Modify: `components/MenuScreens.tsx` (LoginScreen component, lines 24–309)

### Step 1: Add `handleGoogleSignIn` function inside LoginScreen

Insert after line 48 (after `handleAuth`), before `handleCreateProfile`:

```typescript
const handleGoogleSignIn = async () => {
    setLoading(true); setError(null);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
        // Browser will redirect — no further action needed here
    } catch (err: any) { setError(err.message); setLoading(false); }
};
```

### Step 2: Pre-fill username from Google metadata for new OAuth users

Insert after the `handleGoogleSignIn` function (before `handleCreateProfile`):

```typescript
useEffect(() => {
    if (session?.user?.app_metadata?.provider === 'google' && !username) {
        const name: string =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            '';
        if (name) setUsername(name.split(' ')[0].slice(0, 15));
    }
}, [session]);
```

### Step 3: Add the Google button to the login form

In the `!session` render block, replace the closing `</ParchmentPanel>` section (lines 93–99):

**Find this exact block:**
```tsx
                    <div className="mt-6 text-center border-t border-slate-700 pt-4">
                        <button type="button" onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-slate-400 hover:text-gold-400 text-sm transition-colors uppercase tracking-wider font-bold">
                            {authMode === 'LOGIN' ? "Create New Grimoire" : "Access Existing Hero"}
                        </button>
                    </div>
```

**Replace with:**
```tsx
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold">or</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="mt-3 w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-slate-600 hover:border-slate-400 rounded text-white text-sm font-bold transition-all disabled:opacity-50"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                    <div className="mt-4 text-center border-t border-slate-700 pt-4">
                        <button type="button" onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-slate-400 hover:text-gold-400 text-sm transition-colors uppercase tracking-wider font-bold">
                            {authMode === 'LOGIN' ? "Create New Grimoire" : "Access Existing Hero"}
                        </button>
                    </div>
```

### Step 4: Type-check

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -10
```

Expected: 0 errors related to the new code.

### Step 5: Build check

```bash
npm run build 2>&1 | tail -3
```

Expected: `✓ built in ...`

### Step 6: Commit

```bash
git add components/MenuScreens.tsx
git commit -m "feat: add Google Sign-In to login screen"
```

---

## Task 2: Add 8 scenario-based quests to quests.ts

**Files:**
- Modify: `lib/content/quests.ts` (append 8 new quests at the end)
- Modify: `src/test/content.test.ts` (update assertions)

### Step 1: Update the content test first (write failing test)

In `src/test/content.test.ts`, make two changes:

**Change 1** — update the count assertion (line 49):
```typescript
// OLD:
  it('has at least 27 quests total (existing + 7 new)', () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(27);
// NEW:
  it('has at least 35 quests total (existing + 15 new scenario quests)', () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(35);
```

**Change 2** — add a new test after the existing `NEW_QUEST_IDS` test (after line 59):
```typescript
  const SCENARIO_QUEST_IDS = [
    'q_concurrency_phantom', 'q_git_detective', 'q_react_specter',
    'q_testing_ghost', 'q_cloud_wyvern', 'q_backend_ogre',
    'q_general_imp', 'q_oop_interface',
  ];
  it('all 8 new scenario quests exist', () => {
    const ids = QUESTS.map(q => q.id);
    for (const id of SCENARIO_QUEST_IDS) {
      expect(ids, `${id} missing`).toContain(id);
    }
  });
```

### Step 2: Run test — verify it fails

```bash
npx vitest run src/test/content.test.ts 2>&1 | tail -15
```

Expected: FAIL — "has at least 35 quests" fails, "all 8 new scenario quests exist" fails.

### Step 3: Add the 8 new quests to quests.ts

Append the following at the **end** of the `QUESTS` array in `lib/content/quests.ts` (before the final `];`):

```typescript
  // ========== SCENARIO-BASED QUESTS (Thin Topic Expansion) ==========

  {
    id: 'q_concurrency_phantom',
    title: 'The Race Condition Phantom',
    description: 'Threads collide in the night. Shared state screams. Debug the concurrency ghosts before they corrupt production.',
    levelRequired: 5,
    enemyName: 'Race Condition',
    enemyImage: '👻',
    enemyMaxHp: 200,
    enemyAttackDamage: 25,
    narrativeIntro: ['Deep in the Server Crypts, threads clash in the darkness.', 'A counter expected to reach 1000 reads only 847.', 'The Race Condition Phantom feeds on unsynchronized state!'],
    narrativeOutro: 'The phantom dissolves into properly synchronized code. The counter is correct.',
    rewardXp: 550,
    questions: [
      { id: 'cp1', text: 'Your Node.js server increments a global counter on each request. After 1000 requests you expect 1000 but get 847. What is the root cause?', options: ['Garbage collector interference', 'Race condition — multiple requests read before the write completes', 'Integer overflow at 847', 'Event loop throttling'], correctIndex: 1, explanation: 'JavaScript is single-threaded but async callbacks can interleave. Two handlers can read the same value, both increment it, and one write is lost.', difficulty: 'Medium', xpReward: 60, topic: 'Concurrency' },
      { id: 'cp2', text: 'A Java method is `synchronized void increment()`. Another method `read()` is NOT synchronized. What problem remains?', options: ['No problem — synchronized covers the whole object', 'read() may see a stale cached value due to memory visibility', 'Deadlock is guaranteed', 'The synchronized block causes busy-waiting'], correctIndex: 1, explanation: 'Synchronized ensures mutual exclusion but not visibility to unsynchronized readers. read() may see a stale value from CPU cache. Use volatile or synchronize both methods.', difficulty: 'Hard', xpReward: 70, topic: 'Concurrency' },
      { id: 'cp3', text: 'Thread A holds Lock1 and waits for Lock2. Thread B holds Lock2 and waits for Lock1. Your app freezes. What is the fix?', options: ['Add Thread.sleep() between acquisitions', 'Always acquire locks in the same global order', 'Use volatile instead of locks', 'Increase thread pool size'], correctIndex: 1, explanation: 'Deadlock occurs when threads form a circular wait. The standard fix: establish a global lock ordering and acquire locks in that order everywhere.', difficulty: 'Medium', xpReward: 60, topic: 'Concurrency' },
      { id: 'cp4', text: 'A Go service initializes a map once at startup, then only reads it from multiple goroutines. Is this safe?', options: ['No — all map access must use sync.Map', 'Yes — concurrent reads are safe when no writes occur', 'Only safe with sync.RWMutex', 'Only safe if keys are strings'], correctIndex: 1, explanation: 'Go maps are safe for concurrent reads as long as no goroutine is writing simultaneously. Since the map is initialized once before goroutines start, this is safe.', difficulty: 'Medium', xpReward: 60, topic: 'Concurrency' },
      { id: 'cp5', text: 'A Python multiprocessing pool processes items and updates a shared list. After pool.map() finishes, the list is empty. Why?', options: ['Python lists cannot be shared', 'Each process has its own memory space — changes are not reflected in the parent', 'map() does not wait for results', 'The GIL blocks all writes'], correctIndex: 1, explanation: 'multiprocessing spawns separate OS processes, each with their own memory. To share data across processes, use multiprocessing.Manager().list() or a Queue.', difficulty: 'Hard', xpReward: 70, topic: 'Concurrency' },
    ],
  },

  {
    id: 'q_git_detective',
    title: 'The Merge Conflict Detective',
    description: 'History is rewritten. Branches diverge. Untangle the git archaeology before the release is lost forever.',
    levelRequired: 3,
    enemyName: 'Diverged History',
    enemyImage: '🔀',
    enemyMaxHp: 160,
    enemyAttackDamage: 20,
    narrativeIntro: ['The repository is a crime scene.', 'Branches split weeks ago and nobody merged them.', 'Resolve the conflict or lose the release!'],
    narrativeOutro: 'History is clean and linear. The release ships on time.',
    rewardXp: 480,
    questions: [
      { id: 'gd1', text: 'You ran `git rebase main` on your feature branch and hit 3 conflicts — one per commit. After resolving and running `git rebase --continue`, 2 more conflicts appear. Why?', options: ['rebase failed silently', 'Each commit is replayed individually — each can conflict separately', 'You need to run git add -A first', 'The branch is corrupted'], correctIndex: 1, explanation: 'Rebase replays each commit in sequence. If your branch has 5 commits that all touch the same file, you may resolve a conflict 5 times — once per commit.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' },
      { id: 'gd2', text: 'A teammate force-pushed to a shared feature branch. Your local copy now diverges. What is the correct recovery?', options: ['git push --force back', 'git fetch, then git reset --hard origin/branch, then cherry-pick any unique local commits', 'git merge origin/branch', 'Delete the local branch and reclone'], correctIndex: 1, explanation: 'After a force push, the remote history changed. Reset your local branch to match the remote, then manually re-apply any of your unique commits with cherry-pick.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' },
      { id: 'gd3', text: 'You committed an API key in your last commit. The commit has NOT been pushed yet. What is the safest immediate fix?', options: ['Delete the file', 'git commit --amend to remove the sensitive data from the last commit', 'git revert', 'Close the repository'], correctIndex: 1, explanation: 'Amending the last unpushed commit rewrites it locally without creating a revert commit. Then rotate the key — treat it as compromised regardless.', difficulty: 'Easy', xpReward: 50, topic: 'Git & Version Control' },
      { id: 'gd4', text: 'git log shows A→B→C→D (D is HEAD). You need to undo commit C but keep D\'s changes intact. Which command?', options: ['git reset --hard HEAD~2', 'git revert C (using its hash)', 'git checkout HEAD~1', 'git stash pop'], correctIndex: 1, explanation: 'git revert creates a new commit that undoes a specific commit without touching later history. Perfect when you need to undo a commit while keeping subsequent work.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' },
      { id: 'gd5', text: 'You want to apply a single commit from branch `hotfix` to `main` without merging the entire branch. Which command?', options: ['git merge --squash hotfix', 'git cherry-pick <commit-hash>', 'git rebase hotfix main', 'git patch hotfix'], correctIndex: 1, explanation: 'cherry-pick applies the changes of a specific commit onto the current branch as a new commit. Ideal for backporting individual fixes.', difficulty: 'Easy', xpReward: 50, topic: 'Git & Version Control' },
    ],
  },

  {
    id: 'q_react_specter',
    title: 'The Stale Closure Specter',
    description: 'Components re-render when they should not. State is stale. The hooks are haunted.',
    levelRequired: 4,
    enemyName: 'Stale Closure',
    enemyImage: '🌀',
    enemyMaxHp: 175,
    enemyAttackDamage: 22,
    narrativeIntro: ['In the Component Forest, renders multiply without reason.', 'A closure captures an old value and refuses to let go.', 'Debug the haunted hooks!'],
    narrativeOutro: 'The closures are fresh. Renders are minimal. The forest is at peace.',
    rewardXp: 520,
    questions: [
      { id: 'rs1', text: 'A React component calls setState 3 times synchronously inside one click handler. How many re-renders occur in React 18?', options: ['3 re-renders', '1 re-render (automatic batching)', '0 re-renders until next frame', 'Depends on component type'], correctIndex: 1, explanation: 'React 18 introduced automatic batching: multiple setState calls inside event handlers (and most async contexts) are batched into a single re-render.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rs2', text: 'In React 18 StrictMode (development), a useEffect with [] fires twice on mount. In production it fires once. Why?', options: ['Bug in your code', 'StrictMode intentionally double-invokes effects in development to surface cleanup issues', 'useEffect is non-deterministic', 'State initialization race condition'], correctIndex: 1, explanation: 'React 18 StrictMode mounts, unmounts, then remounts components in development to help you find effects that lack proper cleanup. This does not happen in production builds.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rs3', text: 'A list of 1000 items uses key={index}. Inserting a new item at position 0 causes all 1000 items to re-render. What is the fix?', options: ['Wrap the list in React.memo', 'Use key={item.id} — stable keys prevent unnecessary reconciliation', 'Use useReducer instead of useState', 'Virtualize with a windowing library'], correctIndex: 1, explanation: 'When you use index as key and prepend an item, every index shifts by 1. React sees every item as changed. Stable unique IDs as keys let React identify which items actually changed.', difficulty: 'Easy', xpReward: 50, topic: 'React & Frontend' },
      { id: 'rs4', text: 'You fetch data in useEffect and see the API called twice in StrictMode. The correct fix that works in both dev and prod is:', options: ['Remove StrictMode', 'Return a cleanup function using an AbortController or ignore flag', 'Use useLayoutEffect instead', 'Move the fetch outside the component'], correctIndex: 1, explanation: 'Return a cleanup from useEffect: set an `ignored` flag or call `controller.abort()`. The second call cancels and its result is discarded. This is the idiomatic React pattern.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rs5', text: 'A Context Provider uses `<Ctx.Provider value={{ user, theme }}>`. Children re-render on every parent render even when user/theme are unchanged. The fix?', options: ['Wrap children in React.lazy', 'Memoize the value with useMemo({ user, theme }, [user, theme])', 'Use useReducer for context state', 'Replace Context with prop drilling'], correctIndex: 1, explanation: 'An inline object literal creates a new reference on every render, making React think the context changed. useMemo preserves the reference as long as user and theme are the same.', difficulty: 'Hard', xpReward: 70, topic: 'React & Frontend' },
    ],
  },

  {
    id: 'q_testing_ghost',
    title: 'The Flaky Test Ghost',
    description: 'Tests pass locally, fail in CI. The ghost of non-determinism haunts your pipeline.',
    levelRequired: 4,
    enemyName: 'Flaky Pipeline',
    enemyImage: '🔴',
    enemyMaxHp: 155,
    enemyAttackDamage: 20,
    narrativeIntro: ['The CI pipeline glows red.', 'The same test: green locally, red in CI, green again on retry.', 'The Flaky Test Ghost mocks your confidence!'],
    narrativeOutro: 'Tests are deterministic and isolated. The pipeline runs green every time.',
    rewardXp: 490,
    questions: [
      { id: 'tf1', text: 'A test asserts `expect(result.timestamp).toBe("2026-03-01T10:00:00Z")` and passes locally. It fails in CI at 3am. What is the root cause?', options: ['Node.js version mismatch', 'Test depends on wall-clock time — non-deterministic across environments and times', 'Missing environment variables in CI', 'Race condition in the test runner'], correctIndex: 1, explanation: 'Never assert on real timestamps. Mock Date or use relative assertions like expect(result.timestamp).toBeInstanceOf(Date). Hardcoding times makes tests time-zone and clock dependent.', difficulty: 'Easy', xpReward: 50, topic: 'Testing & CI/CD' },
      { id: 'tf2', text: 'Test A mocks an HTTP call. Test B (no mock) fails with unexpected network errors. Tests pass when run in isolation. What is wrong?', options: ['Test B has a bug', 'Test A\'s mock leaks — it was not cleaned up after the test', 'HTTP is blocked in CI', 'Import order of test files matters'], correctIndex: 1, explanation: 'A mock that is not reset/restored after each test bleeds into subsequent tests. Use beforeEach/afterEach to reset mocks, or configure your test framework to auto-restore them.', difficulty: 'Medium', xpReward: 60, topic: 'Testing & CI/CD' },
      { id: 'tf3', text: 'You write: `expect(result).toEqual(computeExpected())`. The test always passes even when you break the implementation. What is wrong?', options: ['Nothing — this is correct', 'You are comparing the output against itself — the mock and implementation use the same function', 'toEqual does not work for objects', 'Missing await'], correctIndex: 1, explanation: 'If computeExpected() calls the same code as the function under test, any bug affects both sides equally. Tests must compare against hardcoded, independently known values.', difficulty: 'Medium', xpReward: 60, topic: 'Testing & CI/CD' },
      { id: 'tf4', text: 'Integration tests take 8 minutes in CI. Which single change has the highest impact on speed?', options: ['Parallelise test files across workers', 'Replace real database calls with in-memory test doubles or fixtures', 'Upgrade the CI machine tier', 'Reduce the number of assertions per test'], correctIndex: 1, explanation: 'Real database I/O is the dominant cost in integration test suites. Replacing DB calls with in-memory fakes or a test database seeded with fixtures can reduce suite time by 80%+.', difficulty: 'Hard', xpReward: 70, topic: 'Testing & CI/CD' },
    ],
  },

  {
    id: 'q_cloud_wyvern',
    title: 'The Scaling Wyvern',
    description: 'Traffic spikes at 8am every day. Your cloud bill is on fire. Tame the infrastructure beast.',
    levelRequired: 5,
    enemyName: 'Hot Partition',
    enemyImage: '🐲',
    enemyMaxHp: 190,
    enemyAttackDamage: 24,
    narrativeIntro: ['Every morning at 8am, alarms fire.', 'DynamoDB throttles. Lambda times out. The Scaling Wyvern awakens.', 'Architect your way out before the system melts!'],
    narrativeOutro: 'Traffic is distributed. Costs normalized. The Wyvern is tamed.',
    rewardXp: 540,
    questions: [
      { id: 'cw1', text: 'Your Lambda function times out at 15 seconds processing a user-uploaded file. The actual processing takes 8 seconds. What is likely causing the extra time?', options: ['Lambda has a known bug at 15s', 'Cold start delay plus loading a large file — Lambda payload limit is 6MB; files should come via S3 presigned URL', 'VPC NAT Gateway latency', 'Memory limit too low'], correctIndex: 1, explanation: 'Lambda has a 6MB payload limit and cold starts of 200-500ms. Large files must be uploaded to S3 first; Lambda reads them from S3, not the event payload.', difficulty: 'Hard', xpReward: 70, topic: 'Cloud & DevOps' },
      { id: 'cw2', text: 'You deploy a new container version to Kubernetes. 20% of users see 503 errors for 90 seconds. What deployment strategy prevents this?', options: ['Recreate strategy (stop all old, start all new)', 'Rolling update with readiness probes that gate traffic until pods are healthy', 'Blue/green with immediate traffic switch and no health checks', 'Canary releasing 100% of traffic immediately'], correctIndex: 1, explanation: 'Rolling updates with readiness probes ensure new pods only receive traffic once they pass health checks. Old pods stay running until new ones are healthy.', difficulty: 'Medium', xpReward: 60, topic: 'Cloud & DevOps' },
      { id: 'cw3', text: 'An S3 bucket has `public-read` ACL on all objects. A security audit flags this as critical. What is the minimal fix that still lets your app serve images to users?', options: ['Keep it — it is the only option for public images', 'Generate pre-signed URLs with short expiry from your backend', 'Encrypt objects with KMS', 'Move all images to EFS'], correctIndex: 1, explanation: 'Pre-signed URLs grant time-limited access to private S3 objects. Your backend generates them on demand. Objects stay private; access is auditable and controlled.', difficulty: 'Medium', xpReward: 60, topic: 'Cloud & DevOps' },
      { id: 'cw4', text: 'A DynamoDB table is throttled every day at 8am. The partition key is `date` (e.g. "2026-03-01"). What is the architectural fix?', options: ['Add a GSI on user_id', 'Add a random suffix to the partition key (write sharding) to distribute load', 'Increase RCU/WCU provisioning', 'Switch to RDS Aurora'], correctIndex: 1, explanation: 'Using a date as partition key creates a hot partition — all traffic for today goes to one shard. Write sharding (appending a random 0-N suffix) distributes writes across N partitions.', difficulty: 'Hard', xpReward: 70, topic: 'Cloud & DevOps' },
    ],
  },

  {
    id: 'q_backend_ogre',
    title: 'The N+1 Ogre',
    description: 'One endpoint, 150 queries. The database weeps. The ogre feasts on unoptimized ORM calls.',
    levelRequired: 3,
    enemyName: 'N+1 Query',
    enemyImage: '👹',
    enemyMaxHp: 165,
    enemyAttackDamage: 21,
    narrativeIntro: ['The API endpoint takes 2.3 seconds.', 'A profiler reveals 150 SQL queries for a single request.', 'The N+1 Ogre has invaded your data layer!'],
    narrativeOutro: 'One query. 50 users with posts. The ogre is slain.',
    rewardXp: 500,
    questions: [
      { id: 'bo1', text: 'An API endpoint returns 50 users with their posts and takes 2.3s. Profiling shows 151 SQL queries (1 + 50×3). What is the problem?', options: ['Database is undersized', 'N+1 query problem — one query fetches users, then one per user fetches posts', 'Missing index on user_id', 'Connection pool exhausted'], correctIndex: 1, explanation: 'N+1 is a classic ORM problem: 1 query for users + N queries for posts (one per user). Fix with eager loading (JOIN or include in ORM) to fetch everything in 1-2 queries.', difficulty: 'Medium', xpReward: 60, topic: 'Backend & Servers' },
      { id: 'bo2', text: 'An endpoint builds a query: `SELECT * FROM users WHERE id = ${req.params.id}`. A tester sends id = "1 OR 1=1". What happens?', options: ['Database returns an error', 'SQL injection — the query returns all users', 'The app returns a 404', 'ORMs automatically prevent this'], correctIndex: 1, explanation: 'String interpolation directly into SQL enables injection. Always use parameterized queries or prepared statements: `WHERE id = $1` with `[req.params.id]` as the bound parameter.', difficulty: 'Easy', xpReward: 50, topic: 'Backend & Servers' },
      { id: 'bo3', text: 'Your Node.js Express server does CPU-intensive image resizing synchronously in the request handler. Throughput drops to 5 req/s. The correct fix is:', options: ['Add more await calls', 'Offload to a worker thread or message queue to keep the event loop free', 'Increase Node.js heap with --max-old-space-size', 'Use async/await around the resize call'], correctIndex: 1, explanation: 'Node.js is single-threaded. CPU-bound work blocks the event loop, preventing other requests from being served. Worker threads or a queue (with a separate worker process) keep the main thread free.', difficulty: 'Hard', xpReward: 70, topic: 'Backend & Servers' },
      { id: 'bo4', text: 'A REST API returns HTTP 200 with body `{ "error": "User not found" }`. Why is this a problem?', options: ['200 is only for HTML responses', 'Clients cannot programmatically detect errors without parsing the body — use HTTP 404', 'The key "error" is not a valid JSON key', 'JSON error bodies are not allowed in REST'], correctIndex: 1, explanation: 'HTTP status codes are the contract. A 200 with an error body forces clients to inspect the body on every call. Use the correct status (404, 400, 500) so clients and monitoring tools work correctly.', difficulty: 'Easy', xpReward: 50, topic: 'Backend & Servers' },
    ],
  },

  {
    id: 'q_general_imp',
    title: 'The Complexity Imp',
    description: 'O(n²) hides in plain sight. The imp feeds on inefficient algorithms and crashes production at scale.',
    levelRequired: 2,
    enemyName: 'Big-O Imp',
    enemyImage: '😈',
    enemyMaxHp: 140,
    enemyAttackDamage: 18,
    narrativeIntro: ['The algorithm seemed fine in testing with 100 items.', 'In production with 100,000 items, the server melts.', 'The Complexity Imp was hiding in the nested loop!'],
    narrativeOutro: 'O(n log n) reigns. The imp is banished. Scale achieved.',
    rewardXp: 450,
    questions: [
      { id: 'gi1', text: 'An algorithm processes n items. For each item it does a binary search in a sorted list of n items. What is the overall time complexity?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 1, explanation: 'n items × O(log n) binary search each = O(n log n) total. Binary search is O(log n), not O(1), so the outer loop multiplies it.', difficulty: 'Medium', xpReward: 60, topic: 'General CS' },
      { id: 'gi2', text: 'A hash map with 1,000 entries normally gives O(1) lookups. Occasionally lookups take O(n) time. What is happening?', options: ['Hash map corruption from concurrent access', 'Hash collisions causing elements to chain into a long list in one bucket', 'Memory fragmentation', 'GC pauses during lookup'], correctIndex: 1, explanation: 'A poor hash function can send many keys to the same bucket. The bucket degrades to a linked list with O(n) scan. Java HashMap upgrades heavily-collided buckets to a tree (O(log n)).', difficulty: 'Medium', xpReward: 60, topic: 'General CS' },
      { id: 'gi3', text: 'You need a data structure that returns the maximum element in O(1) and supports O(log n) insertion and deletion. Which fits?', options: ['Sorted array', 'Max-heap', 'Hash map', 'Balanced BST (AVL/Red-Black)'], correctIndex: 1, explanation: 'A max-heap keeps the maximum at the root (O(1) access) and rebalances on insert/delete in O(log n). A BST has O(log n) max access (requires traversal to rightmost node).', difficulty: 'Medium', xpReward: 60, topic: 'General CS' },
      { id: 'gi4', text: 'Function A calls Function B which calls Function A with a slightly different argument. Your app crashes with a stack overflow. What is the root cause?', options: ['Bug in the call stack implementation', 'Infinite recursion — the functions call each other without a base case that terminates', 'Stack memory too small for the OS', 'Circular module imports'], correctIndex: 1, explanation: 'Mutual recursion without a base case creates infinite call depth. Each call frame is pushed onto the stack until it overflows. Add a termination condition before the recursive call.', difficulty: 'Easy', xpReward: 50, topic: 'General CS' },
    ],
  },

  {
    id: 'q_oop_interface',
    title: 'The Interface Imp',
    description: 'SOLID principles are under siege. Fat interfaces, tight coupling, and fragile hierarchies everywhere.',
    levelRequired: 4,
    enemyName: 'SOLID Violator',
    enemyImage: '🧩',
    enemyMaxHp: 180,
    enemyAttackDamage: 23,
    narrativeIntro: ['The codebase is a tangled web of inheritance.', 'A change to Square breaks Rectangle. An interface demands 20 methods.', 'The SOLID Violator must be defeated with clean design!'],
    narrativeOutro: 'SOLID principles enforced. The codebase is flexible and maintainable.',
    rewardXp: 530,
    questions: [
      { id: 'oi1', text: 'Class Square extends Rectangle. Setting Square\'s width also sets its height. A function that doubles a Rectangle\'s width and checks area breaks when given a Square. Which SOLID principle is violated?', options: ['Single Responsibility', 'Liskov Substitution Principle — Square cannot be used wherever Rectangle is expected', 'Interface Segregation', 'Dependency Inversion'], correctIndex: 1, explanation: 'LSP: subtypes must be substitutable for their base types without breaking behavior. Square violates this because it changes the Rectangle contract (independent width/height).', difficulty: 'Hard', xpReward: 70, topic: 'OOP & Design Patterns' },
      { id: 'oi2', text: 'A Logger class writes to file, writes to a database, AND sends email alerts — all in one class. A bug in the email code breaks file logging. Which principle is violated?', options: ['DRY', 'Single Responsibility Principle — Logger has three unrelated reasons to change', 'Open/Closed', 'Dependency Inversion'], correctIndex: 1, explanation: 'SRP: a class should have one reason to change. Mixing file I/O, database writes, and SMTP in one class means any of three external systems can break the whole thing.', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'oi3', text: 'An interface has 20 methods. A class implementing it throws NotImplementedException for 15 of them. Which principle is violated?', options: ['DRY', 'Interface Segregation Principle — the interface is too fat; split into smaller focused interfaces', 'Open/Closed', 'Liskov Substitution'], correctIndex: 1, explanation: 'ISP: clients should not be forced to implement methods they do not use. Split the 20-method interface into smaller role interfaces (e.g., Readable, Writable, Configurable).', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'oi4', text: 'OrderService directly instantiates MySQLOrderRepository in its constructor: `this.repo = new MySQLOrderRepository()`. What is the key problem?', options: ['Performance overhead of construction', 'Tight coupling — OrderService cannot be tested or reconfigured without modifying its source code (violates DIP)', 'Memory leak from the new keyword', 'Thread safety issue'], correctIndex: 1, explanation: 'DIP: high-level modules should depend on abstractions, not concretions. Inject an IOrderRepository interface; let the caller decide the implementation. Now you can swap MySQL for Postgres or a mock.', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'oi5', text: 'You add PDF export to a class that already exports CSV and JSON by adding `if (format === "PDF")` inside the existing method. Which principle does this violate?', options: ['Single Responsibility', 'Open/Closed Principle — the class should be open for extension but closed for modification', 'Liskov Substitution', 'Interface Segregation'], correctIndex: 1, explanation: 'OCP: adding new behavior should not require modifying existing code. Use polymorphism: create a PDFExporter that implements an IExporter interface, just like CSVExporter and JSONExporter do.', difficulty: 'Hard', xpReward: 70, topic: 'OOP & Design Patterns' },
    ],
  },
```

### Step 4: Run the test — verify it passes

```bash
npx vitest run src/test/content.test.ts 2>&1 | tail -15
```

Expected: all tests pass, including the new "all 8 new scenario quests exist" test.

### Step 5: Run the full test suite

```bash
npx vitest run 2>&1 | tail -5
```

Expected: all tests pass.

### Step 6: Type-check

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | head -5
```

Expected: 0 errors.

### Step 7: Commit

```bash
git add lib/content/quests.ts src/test/content.test.ts
git commit -m "feat: add 8 scenario-based quests for thin topics"
```

---

## Task 3: Improve AI prompt in the edge function

**Files:**
- Modify: `supabase/functions/generate-quiz/index.ts`

### Step 1: Replace the prompt rules

In `supabase/functions/generate-quiz/index.ts`, find the `prompt` constant (currently starts at the line with `Generate ${count} multiple-choice...`).

**Find this exact block:**
```typescript
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
```

**Replace with:**
```typescript
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
```

### Step 2: Verify type-check still passes

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | head -5
```

Expected: 0 errors.

### Step 3: Commit

```bash
git add supabase/functions/generate-quiz/index.ts
git commit -m "feat: improve AI quiz prompt for scenario-based questions"
```

### Step 4: Deploy updated edge function

```bash
supabase functions deploy generate-quiz
```

Expected:
```
✓ Deployed Function generate-quiz
```

### Step 5: Push

```bash
git push
```

---

## Notes for the implementer

- **Google OAuth requires Supabase dashboard config** — the code change is complete but won't work until the user enables Google provider in Supabase Dashboard → Auth → Providers and adds the OAuth credentials from Google Cloud Console. The callback URL to add is: `https://qnurovjrxgproedytlyk.supabase.co/auth/v1/callback`
- **New Google users** — after clicking "Continue with Google", the OAuth redirect lands back at the app. `onAuthStateChange` fires, `fetchProfile` finds no profile, sets `screen = 'LOGIN'`. The LoginScreen sees `session !== null` (truthy) and renders the "Forge Your Hero" hero creation form. The `useEffect` in Task 1 Step 2 pre-fills the username from Google metadata. This flow requires no further changes to App.tsx.
- **Returning Google users** — `fetchProfile` finds their existing profile and goes to HUB. Identical to email users.
- **The project has a git repo** — memory saying "no git repo" is outdated. All commits should be made normally.
- **No `Co-Authored-By` lines** in commit messages per project rules.
