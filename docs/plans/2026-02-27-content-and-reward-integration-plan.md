# Content Expansion + Reward Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Grow from 123 questions / 35 quests to ~350 / ~42, and route StudyHub rewards through the unified `rewardBus` (ending the split economy).

**Architecture:** Extract LIBRARY_BOOKS and QUESTS from `constants.ts` into `lib/content/` (organisation only — interfaces unchanged). Expand content. Then migrate StudyHub from `studyGameLoop.ts` to `rewardBus.ts` by replacing `onGainXp` with `onStudyReward`, moving perk/consumable helpers to rewardBus, and adding a one-time migration on login.

**Tech Stack:** TypeScript 5.8, React 19, Vitest (tests in `src/test/`), `@` alias = project root.

---

## Task 1: SETopic expansion + lib/content/ scaffold

**Files:**
- Modify: `types.ts:46-61`
- Create: `lib/content/flashcards.ts`
- Create: `lib/content/quests.ts`
- Create: `lib/content/index.ts`
- Modify: `constants.ts:1-9, 285-422, 876-892`

### Step 1: Add 5 new SETopic values to `types.ts:46`

Replace the `SETopic` union (lines 46-61) with:

```typescript
export type SETopic =
  | 'Algorithms'
  | 'Data Structures'
  | 'OOP & Design Patterns'
  | 'SQL & Databases'
  | 'Git & Version Control'
  | 'System Design'
  | 'Networking & APIs'
  | 'Security'
  | 'Testing & CI/CD'
  | 'JavaScript/TypeScript'
  | 'React & Frontend'
  | 'Backend & Servers'
  | 'Cloud & DevOps'
  | 'Concurrency'
  | 'General CS'
  | 'Software Architecture'
  | 'AI & Machine Learning'
  | 'Mobile Development'
  | 'Operating Systems'
  | 'TypeScript Advanced';
```

### Step 2: Create `lib/content/flashcards.ts`

Cut the entire `LIBRARY_BOOKS` array from `constants.ts` (lines 286–422) and paste it here as:

```typescript
import { LibraryBook } from '../types';

export const LIBRARY_BOOKS: LibraryBook[] = [
  // ... all existing books go here, unchanged
];
```

### Step 3: Create `lib/content/quests.ts`

Cut the entire `QUESTS` array from `constants.ts` (lines 424–874) and paste it here as:

```typescript
import { Quest } from '../types';

export const QUESTS: Quest[] = [
  // ... all existing quests go here, unchanged
];
```

### Step 4: Create `lib/content/index.ts`

```typescript
export { LIBRARY_BOOKS } from './flashcards';
export { QUESTS } from './quests';
```

### Step 5: Update `constants.ts`

Add at the top (after existing imports):
```typescript
import { LIBRARY_BOOKS } from './lib/content/flashcards';
import { QUESTS } from './lib/content/quests';
export { LIBRARY_BOOKS, QUESTS };
```

Delete the old `LIBRARY_BOOKS` and `QUESTS` array literals. Also add the 5 new topics to `SE_TOPICS` (line 5–9):

```typescript
export const SE_TOPICS: SETopic[] = [
  'Algorithms', 'Data Structures', 'OOP & Design Patterns', 'SQL & Databases', 'Git & Version Control',
  'System Design', 'Networking & APIs', 'Security', 'Testing & CI/CD', 'JavaScript/TypeScript',
  'React & Frontend', 'Backend & Servers', 'Cloud & DevOps', 'Concurrency', 'General CS',
  'Software Architecture', 'AI & Machine Learning', 'Mobile Development', 'Operating Systems', 'TypeScript Advanced'
];
```

Keep `getTopicsPracticed` in `constants.ts` — it still uses the imported `LIBRARY_BOOKS` and `QUESTS`.

### Step 6: Verify compilation

```bash
npm run build
```

Expected: 0 errors. If TypeScript complains about circular imports, check that `lib/content/flashcards.ts` imports from `../types` (not from `../constants`).

### Step 7: Commit

```bash
git add types.ts lib/content/ constants.ts
git commit -m "refactor: extract LIBRARY_BOOKS and QUESTS to lib/content module"
```

---

## Task 2: Expand existing 15 topics

**Files:**
- Modify: `lib/content/flashcards.ts`

Add 8–12 new questions to each existing `LibraryBook` entry. Each question must:
- Have a unique `id` (extend the existing prefix, e.g., `j4`, `j5`... for Java book)
- Have `correctIndex` within `options.length - 1`
- Have `xpReward` ≥ 50
- Have `topic` set to a valid `SETopic`
- Focus on depth: harder questions, edge cases, "why" reasoning

**Minimum additions per book:**

| Book | New questions | Target total |
|------|--------------|--------------|
| book_java | 7 | 10 |
| book_sql | 7 | 10 |
| book_algo | 7 | 10 |
| book_datastruct | 7 | 10 |
| book_oop | 7 | 10 |
| book_networking | 7 | 10 |
| book_security | 7 | 10 |
| book_testing | 7 | 10 |
| book_cloud | 7 | 10 |
| book_git | 7 | 10 |
| book_javascript | 7 | 10 |
| book_react | 7 | 10 |
| book_backend | 7 | 10 |
| book_concurrency | 7 | 10 |
| book_systemdesign | 7 | 10 |

Example addition for `book_java`:
```typescript
{ id: 'j4', text: 'What is the difference between == and .equals() in Java?', options: ['No difference', '== compares references, .equals() compares values', '== compares values, .equals() compares references', '.equals() only works for primitives'], correctIndex: 1, explanation: '== tests reference identity (same object). .equals() tests value equality (overridable). Always use .equals() for strings.', difficulty: 'Medium', xpReward: 60, topic: 'Backend & Servers' },
{ id: 'j5', text: 'What does the volatile keyword do in Java?', options: ['Prevents compilation', 'Ensures visibility of variable changes across threads', 'Makes a variable immutable', 'Marks a variable for garbage collection'], correctIndex: 1, explanation: 'volatile guarantees that reads/writes go directly to main memory, preventing CPU caching that can hide updates in multi-threaded code.', difficulty: 'Hard', xpReward: 90, topic: 'Concurrency' },
```

### Step 1: Write a spot-check test

Create `src/test/content.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { LIBRARY_BOOKS } from '@/lib/content/flashcards';

describe('LIBRARY_BOOKS content', () => {
  it('all books have at least 10 questions', () => {
    for (const book of LIBRARY_BOOKS) {
      expect(book.questions.length, `${book.id} has too few questions`).toBeGreaterThanOrEqual(10);
    }
  });

  it('all questions have correctIndex in bounds', () => {
    for (const book of LIBRARY_BOOKS) {
      for (const q of book.questions) {
        expect(q.correctIndex, `${q.id} correctIndex out of bounds`).toBeLessThan(q.options.length);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('all questions have xpReward >= 50', () => {
    for (const book of LIBRARY_BOOKS) {
      for (const q of book.questions) {
        expect(q.xpReward, `${q.id} xpReward too low`).toBeGreaterThanOrEqual(50);
      }
    }
  });
});
```

### Step 2: Run test to see it fail

```bash
npx vitest run src/test/content.test.ts
```

Expected: FAIL (books have fewer than 10 questions).

### Step 3: Add questions to `lib/content/flashcards.ts`

Add to each book as described above.

### Step 4: Run test to verify it passes

```bash
npx vitest run src/test/content.test.ts
```

Expected: PASS.

### Step 5: Commit

```bash
git add lib/content/flashcards.ts src/test/content.test.ts
git commit -m "feat: expand existing 15 topics to 10+ questions each"
```

---

## Task 3: Add 5 new topic question sets

**Files:**
- Modify: `lib/content/flashcards.ts`

Add 5 new `LibraryBook` entries. Each needs 12–15 questions.

**New books to add:**

```typescript
// Software Architecture
{
  id: 'book_soft_arch',
  title: 'The Architect\'s Grimoire',
  author: 'Martin of the Clean Code',
  description: 'Master patterns for structuring large systems.',
  content: ["Software architecture defines the high-level structure of a system.", "Key patterns: layered, microservices, event-driven, hexagonal.", "Good architecture delays decisions and keeps options open."],
  rewardXp: 700,
  questions: [
    { id: 'sa1', text: 'What is the Hexagonal Architecture pattern?', options: ['A six-layer system', 'Ports and Adapters — domain logic isolated from infrastructure', 'A hexagon-shaped database schema', 'Six microservices communicating in a ring'], correctIndex: 1, explanation: 'Hexagonal (Ports & Adapters): domain logic at center, external systems connect via ports/adapters. Makes business logic testable without infrastructure.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    { id: 'sa2', text: 'What does CQRS stand for?', options: ['Command Query Responsibility Segregation', 'Concurrent Query Runtime System', 'Command Queue Response Stack', 'Centralized Query Result Storage'], correctIndex: 0, explanation: 'CQRS separates read (query) and write (command) models. Commands mutate state; queries return data. Enables optimized read/write scaling.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
    { id: 'sa3', text: 'What is Domain-Driven Design (DDD)?', options: ['Designing databases first', 'Modeling software around business domains with a ubiquitous language', 'Using domain-specific languages only', 'A front-end design pattern'], correctIndex: 1, explanation: 'DDD: align software model with business domain. Key concepts: bounded contexts, aggregates, entities, value objects, domain events, ubiquitous language.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
    { id: 'sa4', text: 'What is an Aggregate in DDD?', options: ['A database join', 'A cluster of domain objects treated as a single unit for data changes', 'An average of values', 'A service that aggregates API responses'], correctIndex: 1, explanation: 'Aggregate: group of domain objects with a root entity. All changes go through the root. Enforces invariants and is the unit of consistency.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    { id: 'sa5', text: 'What is the strangler fig pattern?', options: ['A code smell', 'Gradually replacing a legacy system by routing requests to new functionality', 'A security vulnerability', 'A database migration strategy'], correctIndex: 1, explanation: 'Strangler Fig: new system grows around the old one, gradually replacing it. Safe incremental migration — old and new coexist until legacy is fully replaced.', difficulty: 'Medium', xpReward: 80, topic: 'Software Architecture' },
    { id: 'sa6', text: 'What is a Bounded Context?', options: ['A limited scope API', 'An explicit boundary within which a domain model is consistent and applies', 'A container with resource limits', 'A context with a fixed number of threads'], correctIndex: 1, explanation: 'Bounded Context: explicit boundary where a particular domain model is defined and applicable. Terms have specific meanings inside but may mean different things outside.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    { id: 'sa7', text: 'Event Sourcing means:', options: ['Logging events to a file', 'Storing all state changes as a sequence of events rather than current state', 'Using events for inter-service communication only', 'Sourcing events from a message broker'], correctIndex: 1, explanation: 'Event Sourcing: persist state as sequence of events. Replay events to reconstruct state. Provides audit log, enables temporal queries, supports event-driven architecture.', difficulty: 'Hard', xpReward: 100, topic: 'Software Architecture' },
    { id: 'sa8', text: 'What is the difference between a library and a framework?', options: ['No difference', 'A library you call; a framework calls you (Inversion of Control)', 'Frameworks are larger', 'Libraries are faster'], correctIndex: 1, explanation: 'Library: your code calls it. Framework: it calls your code (Hollywood Principle / IoC). Framework controls the flow; you fill in the blanks.', difficulty: 'Easy', xpReward: 50, topic: 'Software Architecture' },
    { id: 'sa9', text: 'What is Conway\'s Law?', options: ['Software complexity grows over time', 'Systems reflect the communication structure of the organisations that build them', 'Bugs are proportional to lines of code', 'Every system needs documentation'], correctIndex: 1, explanation: 'Conway\'s Law: organisations design systems that mirror their communication structure. Inverse Conway Manoeuvre: design your org structure to get the architecture you want.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
    { id: 'sa10', text: 'What is the purpose of an anti-corruption layer?', options: ['Prevents SQL injection', 'Translates between models of two different systems/contexts', 'Encrypts inter-service traffic', 'Prevents circular dependencies'], correctIndex: 1, explanation: 'Anti-Corruption Layer (ACL): translation layer between two bounded contexts with different models. Prevents the outer model\'s concepts from polluting your domain.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    { id: 'sa11', text: 'What is a Saga in distributed systems?', options: ['A long function', 'A sequence of local transactions coordinated with compensating transactions', 'A database stored procedure', 'A multi-step API endpoint'], correctIndex: 1, explanation: 'Saga pattern: manage distributed transactions without 2PC. Each step has a compensating transaction. Choreography (events) or Orchestration (central coordinator).', difficulty: 'Hard', xpReward: 100, topic: 'Software Architecture' },
    { id: 'sa12', text: 'Microservices vs Monolith: when should you prefer a monolith?', options: ['Never', 'When starting out, team is small, or domain is not well understood', 'When performance matters', 'When using containers'], correctIndex: 1, explanation: 'Start with a monolith: simpler to develop, deploy, and debug. Move to microservices when you have clear domain boundaries, scaling needs, or multiple teams on separate services.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
  ]
},

// AI & Machine Learning
{
  id: 'book_ai_ml',
  title: 'The Neural Codex',
  author: 'Turing the Arcane',
  description: 'Demystify machine learning — from gradient descent to transformers.',
  content: ["Machine learning: systems that learn from data without being explicitly programmed.", "Key paradigms: supervised, unsupervised, reinforcement learning.", "Neural networks: layers of weighted connections that approximate complex functions."],
  rewardXp: 700,
  questions: [
    { id: 'ml1', text: 'What is gradient descent?', options: ['A mountain hiking algorithm', 'An optimisation algorithm that minimises loss by moving in the direction of steepest descent', 'A method for feature selection', 'A regularisation technique'], correctIndex: 1, explanation: 'Gradient descent updates model parameters iteratively: params -= learning_rate × gradient. The gradient points uphill; we move downhill to minimise loss.', difficulty: 'Medium', xpReward: 70, topic: 'AI & Machine Learning' },
    { id: 'ml2', text: 'What is overfitting?', options: ['Model is too simple', 'Model memorises training data, performs poorly on new data', 'Model trains too slowly', 'Model uses too little data'], correctIndex: 1, explanation: 'Overfitting: model learns noise in training data. High training accuracy, low validation accuracy. Fix with: more data, regularisation (L1/L2), dropout, early stopping.', difficulty: 'Easy', xpReward: 50, topic: 'AI & Machine Learning' },
    { id: 'ml3', text: 'What does a transformer\'s attention mechanism do?', options: ['Filters noise from input', 'Weighs the importance of different input positions relative to each other', 'Transforms data to a different format', 'Compresses the input sequence'], correctIndex: 1, explanation: 'Self-attention: each token attends to all other tokens, computing weighted sum based on relevance. Enables capturing long-range dependencies — key to GPT, BERT, etc.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
    { id: 'ml4', text: 'What is the bias-variance tradeoff?', options: ['Balancing dataset bias and variance', 'Underfitting (high bias) vs overfitting (high variance) — increasing model complexity trades bias for variance', 'Choosing between biased and unbiased estimators', 'A hardware tradeoff'], correctIndex: 1, explanation: 'High bias = model too simple, underfits. High variance = model too complex, overfits. Goal: sweet spot with low bias AND low variance through proper regularisation and model selection.', difficulty: 'Medium', xpReward: 80, topic: 'AI & Machine Learning' },
    { id: 'ml5', text: 'What is a confusion matrix?', options: ['A matrix of random values', 'A table showing TP, TN, FP, FN to evaluate classification performance', 'A matrix that confuses the model', 'A visualisation of neural network weights'], correctIndex: 1, explanation: 'Confusion matrix: rows = actual, columns = predicted. True Positive (TP), True Negative (TN), False Positive (FP), False Negative (FN). Basis for precision, recall, F1 score.', difficulty: 'Easy', xpReward: 50, topic: 'AI & Machine Learning' },
    { id: 'ml6', text: 'What is L2 regularisation (Ridge)?', options: ['Removing neurons randomly', 'Adding sum of squared weights to the loss function to penalise large weights', 'Setting weights to zero', 'Adding noise to training data'], correctIndex: 1, explanation: 'L2 (Ridge): loss += λ × Σw². Penalises large weights, shrinks them towards zero but rarely to zero. Reduces overfitting. L1 (Lasso) can zero out weights (feature selection).', difficulty: 'Medium', xpReward: 80, topic: 'AI & Machine Learning' },
    { id: 'ml7', text: 'What is backpropagation?', options: ['Running the model backwards', 'Propagating the gradient of the loss backwards through the network to compute weight updates', 'Reversing training data', 'A method of data augmentation'], correctIndex: 1, explanation: 'Backprop: chain rule applied layer by layer from output to input. Computes ∂Loss/∂w for each weight, enabling gradient descent to update the entire network.', difficulty: 'Hard', xpReward: 90, topic: 'AI & Machine Learning' },
    { id: 'ml8', text: 'What is transfer learning?', options: ['Moving a model between servers', 'Using a pre-trained model as a starting point for a new task', 'Transferring weights to a different architecture', 'Sharing model weights across users'], correctIndex: 1, explanation: 'Transfer learning: take a model trained on large dataset (e.g., ImageNet), fine-tune on your small dataset. Saves training time, works well when tasks share low-level features.', difficulty: 'Medium', xpReward: 70, topic: 'AI & Machine Learning' },
    { id: 'ml9', text: 'Precision vs Recall — when do you optimise for recall?', options: ['Always', 'When false negatives are more costly (e.g., cancer screening)', 'When false positives are more costly', 'When the dataset is balanced'], correctIndex: 1, explanation: 'High recall: minimize false negatives (missed positives). Critical when missing a positive is costly: cancer detection, fraud alerts, security threats. Trade-off: higher recall often means lower precision.', difficulty: 'Medium', xpReward: 80, topic: 'AI & Machine Learning' },
    { id: 'ml10', text: 'What is a vector embedding?', options: ['A compressed image format', 'A dense numerical representation of data (text, image, etc.) in a high-dimensional space', 'A type of neural network layer', 'An encryption of model weights'], correctIndex: 1, explanation: 'Embeddings map discrete objects (words, images) to continuous vectors. Similar objects cluster nearby. Foundation of word2vec, sentence transformers, and modern RAG systems.', difficulty: 'Medium', xpReward: 70, topic: 'AI & Machine Learning' },
    { id: 'ml11', text: 'What is the vanishing gradient problem?', options: ['Gradients explode to infinity', 'Gradients become very small in deep networks, making early layers learn slowly or not at all', 'Gradients become negative', 'The loss function disappears'], correctIndex: 1, explanation: 'In deep networks, gradients get multiplied through many layers during backprop. If activations (sigmoid, tanh) saturate, gradients shrink to near zero. Fix: ReLU, batch norm, residual connections.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
    { id: 'ml12', text: 'What is RAG (Retrieval-Augmented Generation)?', options: ['A training technique', 'Augmenting LLM generation with retrieved context from an external knowledge base', 'Random Activation Gating', 'A regularisation method'], correctIndex: 1, explanation: 'RAG: retrieve relevant documents (via vector search), add to LLM prompt as context. Reduces hallucinations, keeps knowledge current without retraining. Used in production AI search systems.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
  ]
},

// Mobile Development
{
  id: 'book_mobile',
  title: 'The Pocket Wizard\'s Guide',
  author: 'Expo the Elementalist',
  description: 'Build cross-platform mobile apps with React Native.',
  content: ["Mobile development targets iOS and Android from a single codebase.", "React Native: write JS/TS, render native components.", "Key considerations: performance, offline support, platform differences."],
  rewardXp: 600,
  questions: [
    { id: 'mob1', text: 'What is the main thread in React Native?', options: ['JavaScript thread', 'The UI (main) thread — renders native views and handles user interactions', 'The network thread', 'The bridge thread'], correctIndex: 1, explanation: 'React Native has: JS thread (your code), UI/main thread (native rendering + user input), and native modules thread. Heavy JS work blocking the JS thread can stutter UI. Use InteractionManager or worker threads.', difficulty: 'Medium', xpReward: 70, topic: 'Mobile Development' },
    { id: 'mob2', text: 'What is the React Native Bridge (old architecture)?', options: ['A network bridge for APIs', 'An asynchronous message-passing layer between JS and native code via JSON serialisation', 'A layout bridge between components', 'A CI/CD tool'], correctIndex: 1, explanation: 'Old arch: JS and native communicate via a serialised JSON bridge (async, batched). New arch (JSI): synchronous direct calls via C++ layer — eliminates bridge overhead.', difficulty: 'Hard', xpReward: 90, topic: 'Mobile Development' },
    { id: 'mob3', text: 'What is Expo?', options: ['A testing framework', 'A platform + toolchain that simplifies React Native development with pre-built native modules', 'A state management library', 'An app store alternative'], correctIndex: 1, explanation: 'Expo wraps React Native with managed workflow, EAS build service, over-the-air updates, and a rich SDK. Trade-off: less control over native code. Expo Go for fast iteration.', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
    { id: 'mob4', text: 'Difference between `StyleSheet.create` and inline styles in React Native?', options: ['No difference', 'StyleSheet.create validates styles at startup and enables optimisations; inline objects create new objects on every render', 'Inline styles support more properties', 'StyleSheet.create only works on iOS'], correctIndex: 1, explanation: 'StyleSheet.create: defined once, optimised, validated at startup. Inline styles: new object every render (minor perf cost). In practice, StyleSheet.create is preferred for perf + type safety.', difficulty: 'Medium', xpReward: 60, topic: 'Mobile Development' },
    { id: 'mob5', text: 'What is FlatList used for?', options: ['A flat navigation structure', 'Efficiently rendering large scrollable lists by only rendering visible items', 'A CSS layout helper', 'Displaying flat data without nesting'], correctIndex: 1, explanation: 'FlatList renders only visible items (virtual list). For large datasets, far more performant than mapping an array inside ScrollView. Use keyExtractor and getItemLayout for best performance.', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
    { id: 'mob6', text: 'What is AsyncStorage?', options: ['Asynchronous state management', 'A simple, unencrypted key-value store for persisting data on device', 'A cloud storage API', 'React\'s async storage hook'], correctIndex: 1, explanation: 'AsyncStorage: persistent, async key-value store on device. Good for user preferences, tokens, small data. Not encrypted (use SecureStore for sensitive data). Limited to strings (JSON.stringify/parse for objects).', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
    { id: 'mob7', text: 'What is the purpose of `useWindowDimensions` in React Native?', options: ['Measuring component size', 'Getting screen width/height that update on orientation change', 'Setting window title', 'Controlling app window position'], correctIndex: 1, explanation: 'useWindowDimensions: returns { width, height } and re-renders when dimensions change (e.g., rotation). Use instead of Dimensions.get() for responsive layouts.', difficulty: 'Medium', xpReward: 60, topic: 'Mobile Development' },
    { id: 'mob8', text: 'What is deep linking in mobile apps?', options: ['Accessing internal APIs', 'URLs that open specific screens/content directly inside an app', 'Low-level system access', 'Linking native libraries'], correctIndex: 1, explanation: 'Deep links: URLs like myapp://profile/123 or https://myapp.com/profile/123 (universal links) that open specific screens. Essential for notifications, marketing, and cross-app flows.', difficulty: 'Medium', xpReward: 70, topic: 'Mobile Development' },
    { id: 'mob9', text: 'What is Over-The-Air (OTA) update in React Native?', options: ['Wireless charging', 'Updating JS bundle without going through the app store review process', 'Bluetooth app pairing', 'A streaming update protocol'], correctIndex: 1, explanation: 'OTA: push JS/asset updates directly to users\' devices (e.g., via Expo Updates or CodePush). Bypasses store review for JS-only changes. Cannot update native code this way.', difficulty: 'Medium', xpReward: 70, topic: 'Mobile Development' },
    { id: 'mob10', text: 'What is the Hermes JavaScript engine?', options: ['A backend server', 'Facebook\'s optimised JS engine for React Native — improves startup time and reduces memory', 'A JavaScript testing framework', 'A bundler for React Native'], correctIndex: 1, explanation: 'Hermes: bytecode-compiling JS engine built for React Native. Pre-compiles JS to bytecode at build time → faster startup, lower memory. Enabled by default since React Native 0.70.', difficulty: 'Hard', xpReward: 90, topic: 'Mobile Development' },
    { id: 'mob11', text: 'What is the difference between a controlled and uncontrolled TextInput?', options: ['No difference', 'Controlled: value set via `value` prop + `onChangeText`; uncontrolled: manages own state internally', 'Controlled inputs are faster', 'Uncontrolled inputs only work on Android'], correctIndex: 1, explanation: 'Controlled TextInput: value comes from state, updated via onChangeText — single source of truth. Uncontrolled: internal state, accessed via ref. React prefers controlled for predictability.', difficulty: 'Medium', xpReward: 60, topic: 'Mobile Development' },
    { id: 'mob12', text: 'What should you use instead of setInterval in React Native for animations?', options: ['requestAnimationFrame', 'The Animated API or Reanimated — runs on native thread, not JS thread', 'useEffect + setInterval', 'CSS transitions'], correctIndex: 1, explanation: 'Animated/Reanimated: run animations on the native thread. setInterval-based animations block the JS thread, causing jank. Reanimated 2+ uses worklets — pure native execution.', difficulty: 'Hard', xpReward: 90, topic: 'Mobile Development' },
  ]
},

// Operating Systems
{
  id: 'book_os',
  title: 'The Kernel\'s Ancient Tome',
  author: 'Linus the Ascended',
  description: 'Understand processes, memory, and the OS beneath your code.',
  content: ["The OS manages hardware resources and provides abstractions for software.", "Key concepts: processes, threads, scheduling, virtual memory, file systems.", "Understanding the OS makes you a better programmer at every layer."],
  rewardXp: 600,
  questions: [
    { id: 'os1', text: 'What is the difference between a process and a thread?', options: ['No difference', 'A process has its own memory space; threads share the memory space of their parent process', 'A thread is a lighter process with its own memory', 'Processes are for OS tasks, threads for user tasks'], correctIndex: 1, explanation: 'Process: independent execution unit with its own address space (heap, stack, code). Thread: lightweight unit within a process, shares heap and code with siblings. Context switching is cheaper for threads.', difficulty: 'Easy', xpReward: 50, topic: 'Operating Systems' },
    { id: 'os2', text: 'What is a deadlock?', options: ['A process that runs forever', 'A circular wait where multiple processes each hold a resource the other needs, blocking permanently', 'A thread that\'s sleeping', 'A kernel panic'], correctIndex: 1, explanation: 'Deadlock requires 4 conditions (Coffman): mutual exclusion, hold-and-wait, no preemption, circular wait. Prevent by breaking any one condition (e.g., lock ordering, try-lock with timeout).', difficulty: 'Medium', xpReward: 70, topic: 'Operating Systems' },
    { id: 'os3', text: 'What is virtual memory?', options: ['RAM on the cloud', 'An abstraction that gives each process its own contiguous address space, backed by RAM + disk (swap)', 'Memory that doesn\'t exist', 'A faster type of RAM'], correctIndex: 1, explanation: 'Virtual memory: MMU maps virtual addresses to physical RAM. Processes are isolated — they can\'t access each other\'s memory. Pages can be swapped to disk when RAM is full.', difficulty: 'Medium', xpReward: 70, topic: 'Operating Systems' },
    { id: 'os4', text: 'What is a page fault?', options: ['A hardware error', 'Occurs when a process accesses a page not currently in RAM — OS loads it from disk', 'A file system error', 'An invalid memory access crash'], correctIndex: 1, explanation: 'Page fault: accessed page not in RAM. OS handles it by loading from swap/disk (minor fault: page just not mapped; major fault: needs disk I/O). Too many major faults = thrashing.', difficulty: 'Medium', xpReward: 80, topic: 'Operating Systems' },
    { id: 'os5', text: 'What does a context switch involve?', options: ['Switching between applications', 'Saving the current process state (registers, PC, stack pointer) and restoring another process\'s state', 'Changing the CPU clock speed', 'Switching memory banks'], correctIndex: 1, explanation: 'Context switch: OS saves current process\'s CPU state (registers, program counter) to PCB, loads next process\'s state. Expensive: cache eviction, TLB flush. Threads cheaper than processes.', difficulty: 'Medium', xpReward: 80, topic: 'Operating Systems' },
    { id: 'os6', text: 'What is a mutex?', options: ['A type of CPU instruction', 'A mutual exclusion lock — only one thread can hold it at a time', 'A shared memory segment', 'A read-only lock'], correctIndex: 1, explanation: 'Mutex (mutual exclusion): synchronisation primitive. Only one thread holds it at a time. Others block until released. Prevents race conditions on shared data. Heavier than spinlock for short critical sections.', difficulty: 'Easy', xpReward: 50, topic: 'Operating Systems' },
    { id: 'os7', text: 'What is the difference between preemptive and cooperative scheduling?', options: ['No practical difference', 'Preemptive: OS forcibly interrupts running processes; cooperative: processes voluntarily yield', 'Preemptive is faster', 'Cooperative is used in modern OS'], correctIndex: 1, explanation: 'Preemptive scheduling: OS interrupts process after time slice (timer interrupt). Prevents one process from hogging CPU. Cooperative: process runs until it yields. Used in older OS (Windows 3.x) and some coroutines.', difficulty: 'Medium', xpReward: 70, topic: 'Operating Systems' },
    { id: 'os8', text: 'What is a system call?', options: ['Calling a function in another process', 'Requesting a privileged OS service (like file I/O, memory allocation) — switches from user mode to kernel mode', 'A network API call', 'A function in libc'], correctIndex: 1, explanation: 'System call: software interrupt that switches CPU to kernel mode. Your code calls read(), write(), malloc() — these translate to sys_read, sys_write, sys_brk. Expensive relative to regular function calls.', difficulty: 'Medium', xpReward: 70, topic: 'Operating Systems' },
    { id: 'os9', text: 'What is the difference between user space and kernel space?', options: ['No difference in modern OS', 'User space: where applications run with limited privileges; kernel space: where OS runs with full hardware access', 'User space is faster', 'Kernel space is only for drivers'], correctIndex: 1, explanation: 'Protection ring: kernel runs in ring 0 (full hardware access). User apps run in ring 3 (restricted). System calls bridge them. Prevents misbehaving apps from crashing the OS.', difficulty: 'Medium', xpReward: 70, topic: 'Operating Systems' },
    { id: 'os10', text: 'What is the purpose of a semaphore?', options: ['A hardware signal', 'A synchronisation primitive with a counter — allows a fixed number of concurrent accesses', 'A networking protocol', 'An OS-level timer'], correctIndex: 1, explanation: 'Semaphore: integer counter. P()/wait() decrements (blocks if 0); V()/signal() increments. Binary semaphore ≈ mutex. Counting semaphore: limit concurrent resource access (e.g., max 5 DB connections).', difficulty: 'Hard', xpReward: 90, topic: 'Operating Systems' },
    { id: 'os11', text: 'What is copy-on-write (COW)?', options: ['Duplicating writes to two disks', 'Delaying memory copy until a write occurs — both parent and child process share pages until one writes', 'Writing in a temporary buffer', 'A backup strategy'], correctIndex: 1, explanation: 'COW: after fork(), parent and child share the same physical memory pages (read-only). On first write, OS copies the affected page. Makes fork() fast even for large processes.', difficulty: 'Hard', xpReward: 100, topic: 'Operating Systems' },
    { id: 'os12', text: 'What is an inode?', options: ['An internet node', 'A data structure storing file metadata (permissions, size, timestamps, disk block locations) — not the filename', 'An in-memory node', 'A type of file descriptor'], correctIndex: 1, explanation: 'Inode: file metadata structure. Contains: owner, permissions, timestamps, size, pointers to data blocks. Filename → inode mapping is in directory entry. Hard links share the same inode.', difficulty: 'Medium', xpReward: 80, topic: 'Operating Systems' },
  ]
},

// TypeScript Advanced
{
  id: 'book_ts_advanced',
  title: 'The Scroll of Strict Types',
  author: 'Anders the Immutable',
  description: 'Harness TypeScript\'s advanced type system to write safer, more expressive code.',
  content: ["TypeScript adds static typing to JavaScript, catching errors at compile time.", "Advanced types: generics, conditional types, mapped types, template literal types.", "The type system is Turing-complete — you can compute types from other types."],
  rewardXp: 700,
  questions: [
    { id: 'ts1', text: 'What is a generic in TypeScript?', options: ['A non-specific function', 'A type parameter that allows a function or type to work with multiple types while maintaining type safety', 'A built-in utility type', 'A type that accepts any value'], correctIndex: 1, explanation: 'Generic <T>: type variable. function identity<T>(x: T): T. Caller determines T. Enables type-safe reuse without sacrificing type information (unlike `any`).', difficulty: 'Easy', xpReward: 50, topic: 'TypeScript Advanced' },
    { id: 'ts2', text: 'What does `keyof T` produce?', options: ['A list of T\'s values', 'A union of T\'s property keys as literal types', 'The type of T\'s constructor', 'The keys of T at runtime'], correctIndex: 1, explanation: 'keyof T: union of property name literal types. For type Person = {name: string, age: number}, keyof Person = "name" | "age". Essential for type-safe property access and mapped types.', difficulty: 'Medium', xpReward: 70, topic: 'TypeScript Advanced' },
    { id: 'ts3', text: 'What is a conditional type?', options: ['An if/else statement in types', 'T extends U ? X : Y — a type that resolves to X or Y based on a type condition', 'A type that changes at runtime', 'A nullable type'], correctIndex: 1, explanation: 'Conditional type: T extends U ? X : Y. If T is assignable to U, resolves to X, else Y. Foundation of utility types like NonNullable<T>, ReturnType<T>, Parameters<T>.', difficulty: 'Hard', xpReward: 90, topic: 'TypeScript Advanced' },
    { id: 'ts4', text: 'What is `infer` used for in TypeScript?', options: ['Runtime type inference', 'Capturing a type within a conditional type to use on one branch', 'Inferring function parameter names', 'Automatic type widening'], correctIndex: 1, explanation: 'infer: declare a type variable inside a conditional type. type ReturnType<T> = T extends (...args: any) => infer R ? R : never. Extracts the return type of any function.', difficulty: 'Hard', xpReward: 100, topic: 'TypeScript Advanced' },
    { id: 'ts5', text: 'What is a mapped type?', options: ['A type for Maps', 'A type that transforms each property in another type: { [K in keyof T]: ... }', 'A function that maps over typed arrays', 'A generic collection type'], correctIndex: 1, explanation: 'Mapped type: iterates over keys of T to produce a new type. type Optional<T> = { [K in keyof T]?: T[K] }. Foundation of Partial<T>, Required<T>, Readonly<T>, Record<K,V>.', difficulty: 'Hard', xpReward: 90, topic: 'TypeScript Advanced' },
    { id: 'ts6', text: 'What is the difference between `type` and `interface` in TypeScript?', options: ['No difference', 'Interfaces can be extended/merged; types support unions, intersections, and computed types', 'Types are faster to compile', 'Interfaces only work with classes'], correctIndex: 1, explanation: 'Interface: declaration merging (multiple declarations merge), extends. Type alias: unions (A | B), intersections (A & B), conditional, mapped, template literal types. Both work for objects. Prefer interface for extensible object shapes, type for everything else.', difficulty: 'Medium', xpReward: 70, topic: 'TypeScript Advanced' },
    { id: 'ts7', text: 'What is `never` type used for?', options: ['Undefined values', 'Unreachable code, exhaustive checking, and types that can\'t occur', 'Optional values', 'Empty arrays'], correctIndex: 1, explanation: 'never: type of unreachable code. function throws(): never (always throws). In exhaustive switch, default case can assign to never — TypeScript errors if a case is missed. Opposite of unknown.', difficulty: 'Hard', xpReward: 90, topic: 'TypeScript Advanced' },
    { id: 'ts8', text: 'What is a discriminated union?', options: ['A union of different classes', 'A union of types each with a common literal type field used to narrow the type', 'A union with no common types', 'An exclusive OR type'], correctIndex: 1, explanation: 'Discriminated union: type A = { kind: "a", x: number } | { kind: "b", y: string }. The `kind` field narrows the type in switch/if. TypeScript fully narrows each branch — enables safe exhaustive patterns.', difficulty: 'Medium', xpReward: 80, topic: 'TypeScript Advanced' },
    { id: 'ts9', text: 'What does `satisfies` operator do (TS 4.9+)?', options: ['Validates at runtime', 'Checks that an expression satisfies a type WITHOUT widening the inferred type', 'Makes types optional', 'Asserts type equality'], correctIndex: 1, explanation: 'satisfies: const config = { port: 3000 } satisfies Config. TypeScript checks it matches Config but keeps the narrow type (port: 3000, not number). Combines type safety with type inference.', difficulty: 'Hard', xpReward: 100, topic: 'TypeScript Advanced' },
    { id: 'ts10', text: 'What is a template literal type?', options: ['A string interpolation at runtime', 'A type constructed by interpolating other types into a string literal', 'A template for generic types', 'A regex type'], correctIndex: 1, explanation: 'Template literal type: type Greeting = `Hello ${string}`. Combine with unions: type EventName = `on${Capitalize<string>}`. Powerful for type-safe API contracts, event names, CSS values.', difficulty: 'Hard', xpReward: 100, topic: 'TypeScript Advanced' },
    { id: 'ts11', text: 'What is the `as const` assertion?', options: ['Type assertion to any', 'Marks an object/array as deeply readonly with literal types instead of widened types', 'Converts to a constant', 'Prevents variable reassignment'], correctIndex: 1, explanation: 'as const: const colours = ["red", "blue"] as const → type is readonly ["red", "blue"], not string[]. Object properties become readonly literals. Essential for creating union types from arrays.', difficulty: 'Medium', xpReward: 70, topic: 'TypeScript Advanced' },
    { id: 'ts12', text: 'What is the purpose of `Exclude<T, U>`?', options: ['Removes properties from T', 'Creates a type by removing from T all union members assignable to U', 'Prevents using type U with T', 'Filters an array at runtime'], correctIndex: 1, explanation: 'Exclude<T, U>: T extends U ? never : T. For union types. Exclude<"a" | "b" | "c", "a"> = "b" | "c". Opposite of Extract<T, U>. Used with keyof to exclude specific properties.', difficulty: 'Medium', xpReward: 80, topic: 'TypeScript Advanced' },
  ]
},
```

### Step 1: Write failing test for new books in `src/test/content.test.ts`

Add to existing test file:
```typescript
it('has 20 library books total (15 + 5 new)', () => {
  expect(LIBRARY_BOOKS.length).toBeGreaterThanOrEqual(20);
});

const NEW_TOPIC_IDS = ['book_soft_arch', 'book_ai_ml', 'book_mobile', 'book_os', 'book_ts_advanced'];
it('all 5 new topic books exist', () => {
  const ids = LIBRARY_BOOKS.map(b => b.id);
  for (const id of NEW_TOPIC_IDS) {
    expect(ids).toContain(id);
  }
});
```

### Step 2: Run to confirm failure

```bash
npx vitest run src/test/content.test.ts
```

### Step 3: Add the new `LibraryBook` entries to `lib/content/flashcards.ts`

Append the 5 book objects shown above to the `LIBRARY_BOOKS` array.

### Step 4: Run tests

```bash
npx vitest run src/test/content.test.ts
```

Expected: PASS.

### Step 5: Commit

```bash
git add lib/content/flashcards.ts src/test/content.test.ts
git commit -m "feat: add 5 new topic books (Software Architecture, AI/ML, Mobile, OS, TypeScript Advanced)"
```

---

## Task 4: Add 7 new quests

**Files:**
- Modify: `lib/content/quests.ts`

Add these 7 quest definitions to the `QUESTS` array. New quest IDs must not conflict with existing ones.

```typescript
// Software Architecture quests
{
  id: 'q_ddd_golem',
  title: 'The DDD Golem',
  description: 'A golem shaped from bounded contexts and aggregate roots. Prove your domain knowledge!',
  levelRequired: 8,
  enemyName: 'Domain Golem',
  enemyImage: '🏗️',
  enemyMaxHp: 350,
  enemyAttackDamage: 35,
  narrativeIntro: [
    "In the Realm of Architecture, a golem forms from misaligned domain models.",
    "It attacks with inconsistent ubiquitous language!",
    "Apply Domain-Driven Design to dissolve its contradictions."
  ],
  narrativeOutro: "The golem crumbles into well-defined bounded contexts. The domain model is pure!",
  rewardXp: 900,
  rewardTitle: 'Domain Architect',
  questions: [
    { id: 'ddg1', text: 'What is the Ubiquitous Language in DDD?', options: ['A programming language', 'A shared vocabulary between developers and domain experts used consistently in code and conversation', 'Universal translator tool', 'A documentation format'], correctIndex: 1, explanation: 'Ubiquitous Language: same terms used by developers AND business experts, reflected in the code. Eliminates translation layer. "Order" means exactly the same in meetings and in the codebase.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
    { id: 'ddg2', text: 'What is an Aggregate Root?', options: ['The top-level module', 'The single entity through which all changes to an aggregate must flow, enforcing invariants', 'The main database table', 'The root class in inheritance'], correctIndex: 1, explanation: 'Aggregate Root: gateway to the aggregate. External objects can only reference the root. All modifications go through root methods, which enforce business rules for the whole cluster.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    { id: 'ddg3', text: 'What is a Domain Event?', options: ['A user click event', 'Something that happened in the domain that domain experts care about, published for other parts to react to', 'A scheduled task', 'An exception thrown in domain logic'], correctIndex: 1, explanation: 'Domain Event: immutable record of something significant that happened (OrderPlaced, PaymentFailed). Other aggregates/services react asynchronously. Enables loose coupling and event sourcing.', difficulty: 'Medium', xpReward: 80, topic: 'Software Architecture' },
    { id: 'ddg4', text: 'What is the Repository pattern in DDD?', options: ['A git repository', 'An abstraction for data access that provides a collection-like interface for domain objects', 'A factory for objects', 'A caching layer'], correctIndex: 1, explanation: 'Repository: abstraction over data storage. Domain layer sees it as an in-memory collection; infrastructure implements DB queries. Decouples domain from persistence technology.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
    { id: 'ddg5', text: 'Value Object vs Entity in DDD?', options: ['No difference', 'Entity has unique identity (tracked over time); Value Object defined by its attributes (immutable, interchangeable)', 'Value Objects are primitives only', 'Entities are more important'], correctIndex: 1, explanation: 'Entity: identity matters (User #42 is distinct from User #43, even with same name). Value Object: attributes define equality (Money(100, USD) == Money(100, USD)). Value Objects are immutable.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
  ]
},
{
  id: 'q_clean_arch_lich',
  title: 'The Clean Architecture Lich',
  description: 'An undead architect who never lets dependencies point the wrong way. Defeat it — cleanly.',
  levelRequired: 10,
  enemyName: 'Dependency Lich',
  enemyImage: '💀',
  enemyMaxHp: 420,
  enemyAttackDamage: 40,
  narrativeIntro: [
    "The Lich of Clean Architecture rises, screaming about the Dependency Rule.",
    "Its layers are perfectly inverted — it feeds on violations!",
    "Strike it with proper architectural knowledge."
  ],
  narrativeOutro: "The Lich dissolves. Dependencies now point inward. Architecture is clean!",
  rewardXp: 1100,
  rewardTitle: 'Clean Architect',
  questions: [
    { id: 'cal1', text: 'What is the Dependency Rule in Clean Architecture?', options: ['Avoid all dependencies', 'Source code dependencies must point inward (toward domain/business rules)', 'Infrastructure depends on UI', 'All layers can depend on each other'], correctIndex: 1, explanation: 'Clean Architecture: dependencies point inward. Entities (innermost) → Use Cases → Interface Adapters → Frameworks/UI (outermost). Inner layers know nothing of outer layers.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    { id: 'cal2', text: 'What are Use Cases (Interactors) in Clean Architecture?', options: ['UI components', 'Application-specific business rules that orchestrate data flow to/from entities', 'Database queries', 'REST API handlers'], correctIndex: 1, explanation: 'Use Cases: application business rules. Orchestrate entities, call repositories via interfaces. Do NOT know about HTTP, databases, UI. If a use case changes, it\'s because business rules changed.', difficulty: 'Medium', xpReward: 80, topic: 'Software Architecture' },
    { id: 'cal3', text: 'What is the purpose of the Interface Adapters layer?', options: ['HTTP adapters only', 'Converts data between use cases and external systems (databases, UI, APIs)', 'Stores business logic', 'Handles authentication'], correctIndex: 1, explanation: 'Interface Adapters: controllers, presenters, gateways. Convert external formats (HTTP request, DB row) to/from use case formats (DTOs). Keeps use cases free of framework details.', difficulty: 'Medium', xpReward: 80, topic: 'Software Architecture' },
    { id: 'cal4', text: 'What is the Dependency Inversion Principle (DIP)?', options: ['Avoid all dependencies', 'High-level modules should not depend on low-level modules; both should depend on abstractions', 'Low-level modules control high-level ones', 'Inject all dependencies from main()'], correctIndex: 1, explanation: 'DIP: high-level modules (business rules) depend on abstractions (interfaces), not concretions (DB, HTTP). Low-level modules implement those interfaces. Enables swapping implementations without changing business logic.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    { id: 'cal5', text: 'What makes an architecture "screaming"?', options: ['It causes errors loudly', 'The top-level structure reveals the domain (healthcare, e-commerce), not the framework (Rails, Spring)', 'It has extensive logging', 'It uses microservices'], correctIndex: 1, explanation: 'Screaming Architecture (Uncle Bob): your directory structure should scream the system\'s intent — not "this is a Rails app". Top-level folders: /billing, /inventory, /users — not /controllers, /models.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
  ]
},

// AI & ML quests
{
  id: 'q_gradient_wraith',
  title: 'The Gradient Descent Wraith',
  description: 'A spectral entity lost in a loss landscape. Help it find the global minimum!',
  levelRequired: 9,
  enemyName: 'Loss Wraith',
  enemyImage: '👻',
  enemyMaxHp: 380,
  enemyAttackDamage: 38,
  narrativeIntro: [
    "The Gradient Wraith materialises, trapped in a saddle point!",
    "It attacks with exploding gradients and vanishing activations!",
    "Apply your ML knowledge to descend to victory."
  ],
  narrativeOutro: "The Wraith converges. Loss = 0.0001. The model is trained!",
  rewardXp: 1000,
  questions: [
    { id: 'gw1', text: 'What is learning rate in gradient descent?', options: ['Speed of the CPU', 'Step size for parameter updates — too large: diverges; too small: too slow', 'Number of training epochs', 'Size of training data'], correctIndex: 1, explanation: 'Learning rate α: how much to adjust weights per gradient step. Too high → overshoots minimum, may diverge. Too low → slow convergence, may get stuck. Adaptive rates (Adam, RMSProp) adjust per-parameter.', difficulty: 'Easy', xpReward: 60, topic: 'AI & Machine Learning' },
    { id: 'gw2', text: 'What is mini-batch gradient descent?', options: ['Training on one sample at a time', 'Training on a random subset (batch) of data per update step — balances speed and gradient quality', 'Training on the full dataset at once', 'Gradient descent without batches'], correctIndex: 1, explanation: 'Mini-batch: compromise between stochastic (1 sample, noisy) and batch (full data, expensive). Typical batch sizes: 32–512. Better GPU utilisation. Noisy gradients help escape local minima.', difficulty: 'Medium', xpReward: 70, topic: 'AI & Machine Learning' },
    { id: 'gw3', text: 'What is dropout?', options: ['Removing neurons permanently', 'Randomly deactivating neurons during training to prevent co-adaptation and reduce overfitting', 'Removing low-weight connections', 'Reducing training data'], correctIndex: 1, explanation: 'Dropout: randomly zero out p% of neurons each forward pass. Forces network to learn redundant representations. Ensemble effect: like training many smaller networks. Disabled at inference.', difficulty: 'Medium', xpReward: 80, topic: 'AI & Machine Learning' },
    { id: 'gw4', text: 'What is batch normalisation?', options: ['Normalising training data once', 'Normalising activations within a mini-batch to reduce internal covariate shift, speeding up training', 'A type of optimiser', 'Padding batches to equal size'], correctIndex: 1, explanation: 'BatchNorm: normalise layer inputs across the batch (mean 0, std 1), then scale/shift with learnable γ, β. Allows higher learning rates, reduces sensitivity to initialisation, acts as mild regulariser.', difficulty: 'Hard', xpReward: 90, topic: 'AI & Machine Learning' },
    { id: 'gw5', text: 'What does Adam optimiser combine?', options: ['SGD and L2 regularisation', 'Momentum (exponential moving average of gradients) and RMSProp (adaptive learning rates per parameter)', 'Batch norm and dropout', 'L1 and L2 regularisation'], correctIndex: 1, explanation: 'Adam: Adaptive Moment Estimation. Maintains per-parameter moving averages of gradients (momentum) and squared gradients (RMSProp). Adapts learning rate per parameter. Default choice for most deep learning.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
  ]
},
{
  id: 'q_transformer_dragon',
  title: 'The Transformer Dragon',
  description: 'An ancient dragon that speaks in attention heads and feeds on context windows.',
  levelRequired: 12,
  enemyName: 'Attention Dragon',
  enemyImage: '🐉',
  enemyMaxHp: 600,
  enemyAttackDamage: 55,
  narrativeIntro: [
    "The Transformer Dragon awakens, its 96 attention heads scanning you simultaneously!",
    "It can see the entire context window at once!",
    "Only deep understanding of transformer architecture can fell this beast."
  ],
  narrativeOutro: "The Dragon\'s attention fades. Your tokens are safe from its context window!",
  rewardXp: 1500,
  rewardTitle: 'Attention Master',
  questions: [
    { id: 'td1', text: 'In transformer self-attention, what are Q, K, V?', options: ['Queues, Kernels, Values', 'Query, Key, Value — attention score = softmax(QK^T / √d_k) × V', 'Questions, Knowledge, Vision', 'Quantisation, Kernel, Vector'], correctIndex: 1, explanation: 'Q (query): what we\'re looking for. K (key): what each token offers. V (value): what we retrieve. Attention = softmax(QKᵀ/√d_k)V. Scaled dot product prevents vanishing gradients in softmax.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
    { id: 'td2', text: 'What is positional encoding in transformers?', options: ['Encoding the position of the model in memory', 'Adding position information to token embeddings since attention has no inherent sequence order', 'A compression technique', 'The index of a token in the vocabulary'], correctIndex: 1, explanation: 'Attention is permutation-invariant (order-blind). Positional encoding adds sinusoidal (or learned) vectors to embeddings, injecting position information. Without it, "dog bites man" = "man bites dog".', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
    { id: 'td3', text: 'What is multi-head attention?', options: ['Attention with multiple layers', 'Running attention in parallel with different Q/K/V projections to capture different relationship types', 'Attention that processes images', 'A voting mechanism across models'], correctIndex: 1, explanation: 'Multi-head: h parallel attention mechanisms (heads) with different learned projections. Each head attends to different aspects (syntax, coreference, long-range deps). Outputs concatenated + projected.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
    { id: 'td4', text: 'What is a token in the context of LLMs?', options: ['A security token', 'A sub-word unit — roughly 3/4 of a word on average for English text in GPT tokenisers', 'A whole word', 'A sentence'], correctIndex: 1, explanation: 'Tokenisation: text split into sub-word pieces. "tokenization" might be ["token", "ization"]. GPT-2/3/4 use BPE. ~4 chars/token for English. Context window measured in tokens (e.g., 128k tokens).', difficulty: 'Medium', xpReward: 80, topic: 'AI & Machine Learning' },
    { id: 'td5', text: 'What is the difference between BERT and GPT architectures?', options: ['No difference', 'BERT: encoder-only (bidirectional, for understanding); GPT: decoder-only (autoregressive, for generation)', 'BERT is larger', 'GPT is open-source, BERT is not'], correctIndex: 1, explanation: 'BERT: bidirectional encoder. Sees full context. Pre-trained with masked language model. Best for classification, NER, QA. GPT: causal decoder. Generates left-to-right. Pre-trained by predicting next token. Best for generation.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
  ]
},

// Mobile Development quest
{
  id: 'q_react_native_chimera',
  title: 'The React Native Chimera',
  description: 'A beast with an iOS head, an Android body, and a JavaScript soul. Tame it!',
  levelRequired: 7,
  enemyName: 'Platform Chimera',
  enemyImage: '🦁',
  enemyMaxHp: 300,
  enemyAttackDamage: 30,
  narrativeIntro: [
    "The React Native Chimera roars — its left side renders on iOS, right side on Android!",
    "It attacks with platform-specific bugs and native bridge errors!",
    "Only cross-platform wisdom can defeat it."
  ],
  narrativeOutro: "The Chimera is tamed! One codebase, two platforms, zero issues!",
  rewardXp: 800,
  questions: [
    { id: 'rnc1', text: 'What is the `Platform` API used for in React Native?', options: ['Detecting browser type', 'Detecting the OS (ios/android) to apply platform-specific code or styles', 'Checking device platform compatibility', 'Setting platform metadata'], correctIndex: 1, explanation: 'Platform.OS === "ios" | "android" | "web". Platform.select({ ios: ..., android: ..., default: ... }). Use for platform-specific behaviour — ideally minimal; most code should be cross-platform.', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
    { id: 'rnc2', text: 'What is SafeAreaView?', options: ['A secure container for sensitive data', 'A component that renders content within device safe areas (away from notch, home indicator, status bar)', 'A sandboxed web view', 'A permission boundary'], correctIndex: 1, explanation: 'SafeAreaView: renders children in the safe area of the device. Accounts for notches (iPhone X+), home indicator, status bar. Use react-native-safe-area-context for more control.', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
    { id: 'rnc3', text: 'What is the purpose of the `key` prop in React Native lists?', options: ['Unique identifier for the developer', 'Helps React reconcile list items efficiently — must be stable, unique per item', 'Required for accessibility', 'Sets item position in list'], correctIndex: 1, explanation: 'key prop: React uses it to identify which items changed/added/removed. Without stable keys, React re-renders entire list on change. Use item IDs, never array index for dynamic lists.', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
    { id: 'rnc4', text: 'What is Reanimated 2 and why is it preferred over Animated?', options: ['Reanimated 2 uses JS thread for animations', 'Reanimated 2 runs animations on the native UI thread via worklets, avoiding JS thread jank', 'Reanimated 2 is just Animated with better API', 'Reanimated 2 is a library for web animations'], correctIndex: 1, explanation: 'Reanimated 2: animations run as worklets directly on the UI thread — no bridge, no JS thread. Even if JS is busy, animations stay smooth. Use useSharedValue + useAnimatedStyle for butter-smooth 60fps.', difficulty: 'Hard', xpReward: 90, topic: 'Mobile Development' },
    { id: 'rnc5', text: 'What is the difference between `TouchableOpacity` and `Pressable`?', options: ['TouchableOpacity is newer', 'Pressable is the modern replacement with more flexible press-state API; TouchableOpacity is the legacy component', 'Pressable only works on iOS', 'No practical difference'], correctIndex: 1, explanation: 'Pressable (RN 0.63+): modern, flexible API with press state via children-as-function. Supports hover on web. TouchableOpacity: legacy, still works but Pressable is preferred for new code.', difficulty: 'Medium', xpReward: 60, topic: 'Mobile Development' },
  ]
},

// Operating Systems quest
{
  id: 'q_deadlock_daemon',
  title: 'The Deadlock Daemon',
  description: 'A demon that freezes all processes in a circular wait. Break the deadlock!',
  levelRequired: 8,
  enemyName: 'Deadlock Daemon',
  enemyImage: '🔒',
  enemyMaxHp: 340,
  enemyAttackDamage: 32,
  narrativeIntro: [
    "Four processes sit in a circle, each holding one resource the next needs.",
    "The Deadlock Daemon laughs as they all wait forever!",
    "Apply Coffman\'s conditions to break the deadlock."
  ],
  narrativeOutro: "The circular wait is broken! Processes resume. The Daemon dissolves!",
  rewardXp: 900,
  questions: [
    { id: 'dd1', text: 'What are the four Coffman conditions for deadlock?', options: ['Race condition, starvation, livelock, priority inversion', 'Mutual exclusion, hold-and-wait, no preemption, circular wait', 'Lock, unlock, signal, wait', 'Semaphore, mutex, monitor, barrier'], correctIndex: 1, explanation: 'Coffman conditions (all 4 must hold for deadlock): 1. Mutual exclusion, 2. Hold-and-wait, 3. No preemption, 4. Circular wait. Break any one to prevent deadlock.', difficulty: 'Hard', xpReward: 90, topic: 'Operating Systems' },
    { id: 'dd2', text: 'What is livelock (different from deadlock)?', options: ['Processes waiting forever', 'Processes are running but making no progress — they keep responding to each other without advancing', 'A type of memory leak', 'Processes running too fast'], correctIndex: 1, explanation: 'Livelock: processes not blocked but not progressing. Like two people in a corridor both stepping aside to let the other pass — infinitely. They\'re active but stuck. Common in retry loops.', difficulty: 'Medium', xpReward: 80, topic: 'Operating Systems' },
    { id: 'dd3', text: 'What is priority inversion?', options: ['A scheduling bug where high-priority tasks wait for low-priority ones holding a needed resource', 'Reversing thread priorities', 'Giving all tasks equal priority', 'A CPU instruction for priority queues'], correctIndex: 0, explanation: 'Priority inversion: high-priority task waits for a resource held by a low-priority task, which is preempted by medium-priority tasks. Fixed with priority inheritance (low-priority task temporarily inherits high priority).', difficulty: 'Hard', xpReward: 90, topic: 'Operating Systems' },
    { id: 'dd4', text: 'What is the difference between a spinlock and a mutex?', options: ['No difference', 'Spinlock: busy-waits (loops) for the lock — fast for short waits, wastes CPU. Mutex: thread sleeps while waiting', 'Mutex is faster in all cases', 'Spinlocks only work in single-core systems'], correctIndex: 1, explanation: 'Spinlock: keeps checking in a loop (burns CPU). Good for very short critical sections where sleeping would cost more. Mutex: thread blocks (OS scheduler removes it from run queue). Better for longer waits or user-space.', difficulty: 'Hard', xpReward: 90, topic: 'Operating Systems' },
    { id: 'dd5', text: 'What is the purpose of a condition variable?', options: ['Store conditional expressions', 'Allow threads to wait until a specific condition is true — used with a mutex to avoid busy-waiting', 'A boolean state variable', 'A type of semaphore'], correctIndex: 1, explanation: 'Condition variable: thread waits (releases mutex) until another thread signals the condition. Avoids busy-waiting. Pattern: while (!ready) { cv.wait(lock); }. Always check in a loop (spurious wakeups).', difficulty: 'Hard', xpReward: 100, topic: 'Operating Systems' },
  ]
},

// TypeScript Advanced quest
{
  id: 'q_generic_hydra',
  title: 'The Generic Type Hydra',
  description: 'A hydra that grows a new head for every type parameter you add. Type-safe or perish!',
  levelRequired: 9,
  enemyName: 'Type Hydra',
  enemyImage: '🐍',
  enemyMaxHp: 360,
  enemyAttackDamage: 36,
  narrativeIntro: [
    "The Generic Type Hydra rears its parameterised heads!",
    "Each head is a different type constraint — answer correctly to sever them!",
    "Only deep TypeScript mastery can cut all heads at once."
  ],
  narrativeOutro: "All type parameters resolved. The Hydra's head count reaches zero. TypeScript is victorious!",
  rewardXp: 950,
  questions: [
    { id: 'gh1', text: 'What does `extends` do in a generic constraint?', options: ['Creates inheritance', 'Restricts the generic type to be assignable to a specific type: function foo<T extends string>(x: T)', 'Extends the type with new properties', 'Merges two types'], correctIndex: 1, explanation: 'T extends U: T must be assignable to U. function getKey<T extends object>(obj: T, key: keyof T). Prevents T from being primitives/incorrect types — catch errors at call site.', difficulty: 'Medium', xpReward: 70, topic: 'TypeScript Advanced' },
    { id: 'gh2', text: 'What is the utility type `ReturnType<T>`?', options: ['Sets the return type of T', 'Extracts the return type of a function type T', 'Returns T unchanged', 'Makes T\'s return type optional'], correctIndex: 1, explanation: 'ReturnType<T> = T extends (...args: any) => infer R ? R : never. Gets the return type of any function. ReturnType<typeof fetch> = Promise<Response>. Avoids duplicating return type annotations.', difficulty: 'Medium', xpReward: 80, topic: 'TypeScript Advanced' },
    { id: 'gh3', text: 'What is `Awaited<T>` in TypeScript?', options: ['Makes T async', 'Recursively unwraps the type of a Promise: Awaited<Promise<string>> = string', 'Adds awaitable interface to T', 'Converts T to a Promise'], correctIndex: 1, explanation: 'Awaited<T>: unwraps Promise types recursively. Awaited<Promise<Promise<number>>> = number. Useful with ReturnType when the function is async: Awaited<ReturnType<typeof fetchUser>> = User.', difficulty: 'Hard', xpReward: 90, topic: 'TypeScript Advanced' },
    { id: 'gh4', text: 'What is `readonly` modifier and how does it differ from `const`?', options: ['No difference', 'const: variable cannot be reassigned. readonly: property cannot be reassigned after object creation. readonly is for properties, const is for variables.', 'readonly is stricter', 'const makes entire objects immutable'], correctIndex: 1, explanation: 'const: binding cannot be rebound (but object properties can change). readonly: property cannot be changed after construction. For deep immutability: Readonly<T> or `as const`.', difficulty: 'Medium', xpReward: 70, topic: 'TypeScript Advanced' },
    { id: 'gh5', text: 'What is the `NoInfer<T>` utility type (TS 5.4+)?', options: ['Prevents T from existing', 'Blocks TypeScript from using a parameter for type inference, forcing explicit provision', 'Makes T a non-inferrable any', 'Removes inference hints from T'], correctIndex: 1, explanation: 'NoInfer<T>: prevents the parameter from influencing type inference for T. function createStore<T>(initial: T, fallback: NoInfer<T>). Prevents fallback from widening T — caller must pass explicit T or T is inferred only from initial.', difficulty: 'Hard', xpReward: 100, topic: 'TypeScript Advanced' },
  ]
},
```

### Step 1: Update test for new quest count

Add to `src/test/content.test.ts`:
```typescript
import { QUESTS } from '@/lib/content/quests';

describe('QUESTS content', () => {
  it('has at least 42 quests', () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(42);
  });

  it('all quest questions have correctIndex in bounds', () => {
    for (const quest of QUESTS) {
      for (const q of quest.questions) {
        expect(q.correctIndex, `${q.id} out of bounds`).toBeLessThan(q.options.length);
      }
    }
  });
});
```

### Step 2: Run to confirm failure, add quests, run again

```bash
npx vitest run src/test/content.test.ts
# Add quest data to lib/content/quests.ts
npx vitest run src/test/content.test.ts
```

### Step 3: Commit

```bash
git add lib/content/quests.ts src/test/content.test.ts
git commit -m "feat: add 7 new quests for new topic areas"
```

---

## Task 5: Add `migrateStudyGameLoop` to rewardBus.ts

**Files:**
- Modify: `lib/rewardBus.ts`
- Modify: `src/test/rewardBus.test.ts`

### Step 1: Write failing tests

Add to `src/test/rewardBus.test.ts`:

```typescript
import { migrateStudyGameLoop, loadRewardState, saveRewardState, createInitialRewardState } from '@/lib/rewardBus';

describe('migrateStudyGameLoop', () => {
  const OLD_KEY = 'skillhero_study_loop_testuser';
  const username = 'testuser';

  beforeEach(() => {
    localStorage.clear();
  });

  it('merges gold and shards from old key into rewardBus state', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 200, shards: 5, combo: 3 }));
    const before = createInitialRewardState();
    saveRewardState(before, username);

    migrateStudyGameLoop(username);

    const after = loadRewardState(username)!;
    expect(after.gold).toBe(200);
    expect(after.shards).toBe(5);
  });

  it('takes max combo between old and current', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 0, shards: 0, combo: 7 }));
    const before = { ...createInitialRewardState(), combo: 4 };
    saveRewardState(before, username);

    migrateStudyGameLoop(username);

    expect(loadRewardState(username)!.combo).toBe(7);
  });

  it('deletes the old key after migration', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 50, shards: 1, combo: 2 }));
    migrateStudyGameLoop(username);
    expect(localStorage.getItem(OLD_KEY)).toBeNull();
  });

  it('is idempotent — running twice has no additional effect', () => {
    localStorage.setItem(OLD_KEY, JSON.stringify({ version: 1, gold: 100, shards: 2, combo: 0 }));
    migrateStudyGameLoop(username);
    const goldAfterFirst = loadRewardState(username)!.gold;
    migrateStudyGameLoop(username); // key is gone, should no-op
    expect(loadRewardState(username)!.gold).toBe(goldAfterFirst);
  });

  it('is a no-op when old key does not exist', () => {
    // no old key set
    migrateStudyGameLoop(username);
    expect(loadRewardState(username)).toBeNull();
  });
});
```

### Step 2: Run to confirm failure

```bash
npx vitest run src/test/rewardBus.test.ts
```

Expected: FAIL — `migrateStudyGameLoop` is not exported.

### Step 3: Implement `migrateStudyGameLoop` in `lib/rewardBus.ts`

Add this function after `loadRewardState`:

```typescript
/**
 * One-time migration: reads legacy studyGameLoop state and merges gold/shards/combo
 * into the rewardBus state, then deletes the old key.
 * Idempotent — safe to call on every login.
 */
export function migrateStudyGameLoop(username: string): void {
  const oldKey = `skillhero_study_loop_${username.toLowerCase()}`;
  const raw = localStorage.getItem(oldKey);
  if (!raw) return;
  try {
    const old = JSON.parse(raw);
    const current = loadRewardState(username) ?? createInitialRewardState();
    const merged: RewardState = {
      ...current,
      gold: current.gold + (old.gold ?? 0),
      shards: current.shards + (old.shards ?? 0),
      combo: Math.max(current.combo, old.combo ?? 0),
    };
    saveRewardState(merged, username);
  } catch {
    // Corrupted old data — just clean it up
  }
  localStorage.removeItem(oldKey);
}
```

### Step 4: Run tests

```bash
npx vitest run src/test/rewardBus.test.ts
```

Expected: PASS (all 28 existing + 5 new migration tests).

### Step 5: Commit

```bash
git add lib/rewardBus.ts src/test/rewardBus.test.ts
git commit -m "feat: add migrateStudyGameLoop to rewardBus with unit tests"
```

---

## Task 6: Expand rewardBus.ts with perk/consumable API

**Files:**
- Modify: `lib/rewardBus.ts`

Add inventory to state, buff info to result, and the perk/consumable management functions.

### Step 1: Update `RewardState` — add `inventory` field

In `lib/rewardBus.ts`, add `inventory` to `RewardState` after `activeBuffs`:

```typescript
export interface RewardState {
  // ... existing fields ...
  activeBuffs: {
    focusElixir: number;
    luckyCharm: number;
  };
  inventory: {           // <-- ADD THIS
    focusElixir: number;
    luckyCharm: number;
  };
}
```

Update `createInitialRewardState()` to include:
```typescript
inventory: { focusElixir: 0, luckyCharm: 0 },
```

Update `loadRewardState()` merge to include:
```typescript
return {
  ...defaults,
  ...loaded,
  perks: { ...defaults.perks, ...(loaded.perks ?? {}) },
  activeBuffs: { ...defaults.activeBuffs, ...(loaded.activeBuffs ?? {}) },
  inventory: { ...defaults.inventory, ...(loaded.inventory ?? {}) }, // <-- ADD
};
```

### Step 2: Update `RewardResult` — add buff info

```typescript
export interface RewardResult {
  xpAward: number;
  goldGain: number;
  shardGain: number;
  crit: boolean;
  comboMultiplier: number;
  dailyCompletedNow: boolean;
  weeklyCompletedNow: boolean;
  focusBuffActive: boolean;   // <-- ADD
  luckyBuffActive: boolean;   // <-- ADD
}
```

Update the `rewardBus()` function's return statement to include these:
```typescript
return {
  nextState,
  reward: {
    xpAward, goldGain, shardGain: totalShards, crit, comboMultiplier,
    dailyCompletedNow, weeklyCompletedNow,
    focusBuffActive: activeBuffs.focusElixir > 0,   // <-- ADD (pre-action state)
    luckyBuffActive: activeBuffs.luckyCharm > 0,     // <-- ADD (pre-action state)
  },
};
```

### Step 3: Add perk/consumable types and catalog

After the existing types, add:

```typescript
export type PerkId = 'scholarLedger' | 'comboMastery' | 'luckyStrike' | 'shardSiphon';
export type ConsumableId = 'focusElixir' | 'luckyCharm';

export interface PerkDefinition {
  id: PerkId;
  name: string;
  description: string;
  maxLevel: number;
  goldCost: number;
  shardCost: number;
}

export interface ConsumableDefinition {
  id: ConsumableId;
  name: string;
  description: string;
  durationActions: number;
  goldCost: number;
  shardCost: number;
}

export const PERK_DEFS: PerkDefinition[] = [
  { id: 'scholarLedger', name: 'Scholar Ledger', description: '+10% XP gain per level.', maxLevel: 3, goldCost: 180, shardCost: 1 },
  { id: 'comboMastery', name: 'Combo Mastery', description: 'Combo multiplier grows faster.', maxLevel: 3, goldCost: 220, shardCost: 1 },
  { id: 'luckyStrike', name: 'Lucky Strike', description: '+6% crit chance per level.', maxLevel: 2, goldCost: 260, shardCost: 2 },
  { id: 'shardSiphon', name: 'Shard Siphon', description: 'Extra shard every 6 actions per level.', maxLevel: 2, goldCost: 320, shardCost: 2 },
];

export const CONSUMABLE_DEFS: ConsumableDefinition[] = [
  { id: 'focusElixir', name: 'Focus Elixir', description: '+25% XP gain for next 5 study actions.', durationActions: 5, goldCost: 90, shardCost: 1 },
  { id: 'luckyCharm', name: 'Lucky Charm', description: '+15% crit chance for next 4 study actions.', durationActions: 4, goldCost: 110, shardCost: 1 },
];

export interface PurchasePerkResult { ok: boolean; reason?: 'maxed' | 'insufficient_funds'; nextState: RewardState; }
export interface PurchaseConsumableResult { ok: boolean; reason?: 'insufficient_funds'; nextState: RewardState; }
export interface ActivateConsumableResult { ok: boolean; reason?: 'no_stock' | 'already_active'; nextState: RewardState; }

export function purchasePerk(current: RewardState, perkId: PerkId): PurchasePerkResult {
  const perk = PERK_DEFS.find(p => p.id === perkId);
  if (!perk) return { ok: false, reason: 'insufficient_funds', nextState: current };
  const level = current.perks[perkId] ?? 0;
  if (level >= perk.maxLevel) return { ok: false, reason: 'maxed', nextState: current };
  if (current.gold < perk.goldCost || current.shards < perk.shardCost)
    return { ok: false, reason: 'insufficient_funds', nextState: current };
  return {
    ok: true,
    nextState: {
      ...current,
      gold: current.gold - perk.goldCost,
      shards: current.shards - perk.shardCost,
      perks: { ...current.perks, [perkId]: level + 1 },
    },
  };
}

export function purchaseConsumable(current: RewardState, id: ConsumableId): PurchaseConsumableResult {
  const def = CONSUMABLE_DEFS.find(c => c.id === id);
  if (!def) return { ok: false, reason: 'insufficient_funds', nextState: current };
  if (current.gold < def.goldCost || current.shards < def.shardCost)
    return { ok: false, reason: 'insufficient_funds', nextState: current };
  return {
    ok: true,
    nextState: {
      ...current,
      gold: current.gold - def.goldCost,
      shards: current.shards - def.shardCost,
      inventory: { ...current.inventory, [id]: (current.inventory[id] ?? 0) + 1 },
    },
  };
}

export function activateConsumable(current: RewardState, id: ConsumableId): ActivateConsumableResult {
  const def = CONSUMABLE_DEFS.find(c => c.id === id);
  if (!def) return { ok: false, reason: 'no_stock', nextState: current };
  const stock = current.inventory[id] ?? 0;
  if (stock <= 0) return { ok: false, reason: 'no_stock', nextState: current };
  if ((current.activeBuffs[id] ?? 0) > 0) return { ok: false, reason: 'already_active', nextState: current };
  return {
    ok: true,
    nextState: {
      ...current,
      inventory: { ...current.inventory, [id]: stock - 1 },
      activeBuffs: { ...current.activeBuffs, [id]: def.durationActions },
    },
  };
}

export function getPerkCatalog(): PerkDefinition[] { return PERK_DEFS; }
export function getConsumableCatalog(): ConsumableDefinition[] { return CONSUMABLE_DEFS; }
```

### Step 4: Verify — run ALL tests

```bash
npm run test
```

Expected: all 28+ existing tests pass; TypeScript compilation succeeds.

### Step 5: Commit

```bash
git add lib/rewardBus.ts
git commit -m "feat: add inventory, buff flags, perk/consumable API to rewardBus"
```

---

## Task 7: Migrate StudyHub.tsx

**Files:**
- Modify: `components/StudyHub.tsx:1-50` (imports), `1949-2025` (state + handlers)

### Step 1: Update imports

**Remove** these imports:
```typescript
import {
  awardStudyAction,
  loadStudyState,
  saveStudyState,
  purchasePerk,
  purchaseConsumable,
  activateConsumable,
  getStudyRank,
  dailyQuestTarget,
  weeklyQuestTarget,
  getPerkCatalog,
  getConsumableCatalog,
  StudyGameState,
  StudyRewardResult,
  PerkId,
  ConsumableId,
} from '../lib/studyGameLoop';
```

**Add** these imports from rewardBus:
```typescript
import {
  rewardBus,
  loadRewardState,
  saveRewardState,
  purchasePerk,
  purchaseConsumable,
  activateConsumable,
  getStudyRank,
  getPerkCatalog,
  getConsumableCatalog,
  DAILY_TARGET,
  WEEKLY_TARGET,
  RewardState,
  RewardResult,
  PerkId,
  ConsumableId,
} from '../lib/rewardBus';
```

### Step 2: Update `StudyHubProps` (line ~40)

```typescript
interface StudyHubProps {
  user: User;
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  onStudyReward: (baseXp: number) => RewardResult;   // was: onGainXp?: (amount: number) => void
  telemetryUserId?: string | null;
}
```

### Step 3: Update state and handlers (line ~1949)

Replace:
```typescript
const StudyHub: React.FC<StudyHubProps> = ({ user, onBack, onNavigate, onGainXp, telemetryUserId }) => {
  const [studyState, setStudyState] = useState<StudyGameState>(() => loadStudyState(user.username));
  const [rewardFlash, setRewardFlash] = useState<StudyRewardResult | null>(null);
  const studyStateRef = useRef<StudyGameState>(studyState);
```

With:
```typescript
const StudyHub: React.FC<StudyHubProps> = ({ user, onBack, onNavigate, onStudyReward, telemetryUserId }) => {
  const [studyState, setStudyState] = useState<RewardState>(() => loadRewardState(user.username) ?? createInitialRewardState());
  const [rewardFlash, setRewardFlash] = useState<RewardResult | null>(null);
  const studyStateRef = useRef<RewardState>(studyState);
```

Also add `createInitialRewardState` to the rewardBus import above.

### Step 4: Update the useEffect for user change (line ~1956)

Replace `loadStudyState(user.username)` with `loadRewardState(user.username) ?? createInitialRewardState()`.

### Step 5: Update `handleStudyReward` (line ~1978)

Replace:
```typescript
const handleStudyReward = useCallback((baseXp: number) => {
  if (!onGainXp || baseXp <= 0) return;
  const { nextState, reward } = awardStudyAction(studyStateRef.current, baseXp);
  studyStateRef.current = nextState;
  setStudyState(nextState);
  saveStudyState(nextState, user.username);
  onGainXp(reward.xpAward);
  setRewardFlash(reward);
  setTimeout(() => setRewardFlash(null), 1800);
}, [onGainXp, user.username]);
```

With:
```typescript
const handleStudyReward = useCallback((baseXp: number) => {
  if (baseXp <= 0) return;
  const reward = onStudyReward(baseXp);
  // Sync local state from localStorage (App.tsx wrote the new state)
  const synced = loadRewardState(user.username) ?? createInitialRewardState();
  studyStateRef.current = synced;
  setStudyState(synced);
  setRewardFlash(reward);
  setTimeout(() => setRewardFlash(null), 1800);
}, [onStudyReward, user.username]);
```

### Step 6: Update perk/consumable handlers

These already use `purchasePerk`, `purchaseConsumable`, `activateConsumable` — only the state type changes.

Replace `saveStudyState(result.nextState, user.username)` → `saveRewardState(result.nextState, user.username)` in each of the three handlers.

Also update `studyStateRef.current` and `setStudyState` assignments to use `RewardState` type (TypeScript will catch any remaining type errors).

### Step 7: Update perk display (line ~2120)

`studyState.perks[perk.id]` — `perk.id` is now `PerkId` which uses camelCase (`scholarLedger`, etc.), matching `RewardState.perks` keys. This should work without changes since both use the same type.

### Step 8: Update consumable display (line ~2152)

Replace `studyState.inventory[consumable.id]` → same (now consumable IDs are camelCase `focusElixir`, `luckyCharm`).

### Step 9: Update `studyRank` and targets (line ~1989)

Replace `dailyQuestTarget()` → `DAILY_TARGET` and `weeklyQuestTarget()` → `WEEKLY_TARGET` (now constants from rewardBus).

### Step 10: Verify build

```bash
npm run build
```

Fix any TypeScript errors reported.

### Step 11: Run all tests

```bash
npm run test
```

### Step 12: Commit

```bash
git add components/StudyHub.tsx
git commit -m "feat: migrate StudyHub from studyGameLoop to rewardBus"
```

---

## Task 8: App.tsx wiring + delete studyGameLoop.ts

**Files:**
- Modify: `App.tsx`
- Delete: `lib/studyGameLoop.ts`

### Step 1: Add `migrateStudyGameLoop` import to App.tsx

In `App.tsx` line 24, add `migrateStudyGameLoop` to the rewardBus imports:

```typescript
import { rewardBus, loadRewardState, saveRewardState, createInitialRewardState, getStudyRank, DAILY_TARGET, WEEKLY_TARGET, migrateStudyGameLoop, type RewardState } from './lib/rewardBus';
```

### Step 2: Add migration call in the user-change useEffect (line ~65)

```typescript
useEffect(() => {
  if (user?.username) {
    migrateStudyGameLoop(user.username);  // <-- ADD (runs once, deletes old key)
  }
  rewardStateRef.current = user
    ? (loadRewardState(user.username) ?? createInitialRewardState())
    : createInitialRewardState();
}, [user?.username]);
```

### Step 3: Update `StudyHub` render (line ~264)

Replace:
```typescript
case 'STUDY_HUB': return user ? <StudyHub user={user} telemetryUserId={session?.user?.id || null} onBack={() => setScreen('HUB')} onNavigate={(s) => setScreen(s as any)} onGainXp={(xp) => updateXP(xp)} /> : null;
```

With:
```typescript
case 'STUDY_HUB': return user ? <StudyHub
  user={user}
  telemetryUserId={session?.user?.id || null}
  onBack={() => setScreen('HUB')}
  onNavigate={(s) => setScreen(s as any)}
  onStudyReward={(baseXp) => {
    const { nextState, reward } = rewardBus(rewardStateRef.current, { baseXp });
    rewardStateRef.current = nextState;
    setRewardTick(t => t + 1);
    saveRewardState(nextState, user.username);
    if (reward.dailyCompletedNow || reward.weeklyCompletedNow) {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      setShowConfetti(true);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 5000);
    }
    updateXP(reward.xpAward).catch(console.error);
    return reward;
  }}
/> : null;
```

### Step 4: Build to confirm no errors

```bash
npm run build
```

If TypeScript complains about `onStudyReward` prop — verify StudyHub's Props interface was updated in Task 7. If `confettiTimerRef` is not accessible here (it's a local ref), check that it's defined in App.tsx scope (it is — already used in awardGameplay).

### Step 5: Delete `lib/studyGameLoop.ts`

```bash
rm lib/studyGameLoop.ts
```

Then verify no remaining imports:
```bash
grep -r "studyGameLoop" src/ components/ lib/ App.tsx
```

Expected: no matches.

### Step 6: Run all tests

```bash
npm run test
```

Expected: all tests pass.

### Step 7: Final smoke — start dev server and check StudyHub loads

```bash
npm run dev
```

Navigate to StudyHub in browser. Verify:
- Gold/shards/combo display correctly
- Perk Forge and Arcane Market render
- Daily/weekly progress bars visible
- Answering a quiz question triggers reward toast with XP, gold, etc.

### Step 8: Commit

```bash
git add App.tsx
git rm lib/studyGameLoop.ts
git commit -m "feat: wire App.tsx onStudyReward, add migration call, delete studyGameLoop"
```

---

## Completion Checklist

- [ ] `types.ts` has 20 SETopic values
- [ ] `lib/content/flashcards.ts` exists and LIBRARY_BOOKS has 20 books
- [ ] `lib/content/quests.ts` exists and QUESTS has 42+ quests
- [ ] All books have 10+ questions, all correctIndex in bounds, all xpReward ≥ 50
- [ ] `migrateStudyGameLoop` exported from `lib/rewardBus.ts`, unit tests pass
- [ ] `RewardState` has `inventory` field
- [ ] `RewardResult` has `focusBuffActive` and `luckyBuffActive`
- [ ] Perk/consumable API exported from `lib/rewardBus.ts`
- [ ] `StudyHub.tsx` uses `onStudyReward` prop, no studyGameLoop imports
- [ ] `App.tsx` calls `migrateStudyGameLoop` on login, passes `onStudyReward`
- [ ] `lib/studyGameLoop.ts` deleted
- [ ] All tests pass: `npm run test`
- [ ] TypeScript build clean: `npm run build`
