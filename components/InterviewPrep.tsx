
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Brain, Code, Cpu, Users, Star, ChevronRight,
  Check, X, Zap, Target, Trophy, Flame, Timer, BarChart3,
  MessageCircle, Lightbulb, BookOpen, Shield, Play, RotateCcw
} from 'lucide-react';
import { User, SETopic } from '../types';
import { readBufferedAttempts, recordQuestionAttempt } from '../lib/learningTelemetry';
import { AttemptLite, scoreAdaptivePriority } from '../lib/adaptiveLearning';

// ============================================================================
// TYPES
// ============================================================================

interface InterviewPrepProps {
  user: User;
  onBack: () => void;
  onGainXp?: (amount: number) => void;
  telemetryUserId?: string | null;
}

type InterviewCategory = 'coding' | 'system-design' | 'behavioral' | 'trivia';
type Difficulty = 'junior' | 'mid' | 'senior' | 'staff';

interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  difficulty: Difficulty;
  topic: SETopic;
  question: string;
  context?: string; // Additional context or code
  options?: string[];
  correctIndex?: number;
  explanation: string;
  tips?: string[];
  timeLimit: number; // seconds
  xpReward: number;
}

// ============================================================================
// INTERVIEW QUESTION BANK
// ============================================================================

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // CODING - Junior
  {
    id: 'iv_c1', category: 'coding', difficulty: 'junior', topic: 'Algorithms',
    question: 'What is the time complexity of finding an element in an unsorted array?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 2,
    explanation: 'You must check each element one by one in the worst case, making it O(n) linear time.',
    tips: ['Always clarify if the array is sorted first', 'Mention that a hash set lookup would be O(1)'],
    timeLimit: 30, xpReward: 30
  },
  {
    id: 'iv_c2', category: 'coding', difficulty: 'junior', topic: 'JavaScript/TypeScript',
    question: 'What is the difference between == and === in JavaScript?',
    options: [
      '== compares values with type coercion, === compares without',
      '=== is for strings only',
      'No difference',
      '== is deprecated'
    ],
    correctIndex: 0,
    explanation: '== performs type coercion (1 == "1" is true), while === requires both value and type to match (1 === "1" is false). Always prefer === for predictable comparisons.',
    tips: ['Give examples: 0 == false is true, 0 === false is false', 'Mention this is a common source of bugs'],
    timeLimit: 30, xpReward: 30
  },
  {
    id: 'iv_c3', category: 'coding', difficulty: 'junior', topic: 'Data Structures',
    question: 'When would you use a HashMap over an Array?',
    options: [
      'When you need O(1) lookup by key',
      'When data needs to be sorted',
      'When you need indexed access',
      'When memory is limited'
    ],
    correctIndex: 0,
    explanation: 'HashMaps provide O(1) average lookup, insert, and delete by key. Use them when you need fast access by a unique identifier rather than by position.',
    tips: ['Mention the tradeoff: O(n) space', 'Real-world example: caching, counting occurrences'],
    timeLimit: 45, xpReward: 30
  },
  // CODING - Mid
  {
    id: 'iv_c4', category: 'coding', difficulty: 'mid', topic: 'Algorithms',
    question: 'How would you detect a cycle in a linked list?',
    context: 'You have a singly linked list. Determine if there is a cycle.',
    options: [
      'Floyd\'s Tortoise and Hare (fast/slow pointers)',
      'Use a hash set to track visited nodes',
      'Count the nodes and compare with list length',
      'Both A and B are valid approaches'
    ],
    correctIndex: 3,
    explanation: 'Floyd\'s algorithm uses O(1) space with two pointers moving at different speeds. Hash set uses O(n) space but is simpler. Both work correctly.',
    tips: ['Start with the hash set approach, then optimize to Floyd\'s', 'Ask about space constraints to choose the approach'],
    timeLimit: 60, xpReward: 50
  },
  {
    id: 'iv_c5', category: 'coding', difficulty: 'mid', topic: 'JavaScript/TypeScript',
    question: 'Explain closures in JavaScript and give a practical use case.',
    options: [
      'A function that has access to its outer scope even after the outer function returns',
      'A way to make variables private',
      'A function that closes the browser',
      'A and B are both correct aspects of closures'
    ],
    correctIndex: 3,
    explanation: 'Closures allow inner functions to access outer scope variables. This enables data privacy (module pattern), function factories, and callbacks that remember their creation context.',
    tips: ['Show a counter example: function makeCounter() { let count = 0; return () => ++count; }', 'Mention event handlers as practical closure usage'],
    timeLimit: 60, xpReward: 50
  },
  {
    id: 'iv_c6', category: 'coding', difficulty: 'mid', topic: 'React & Frontend',
    question: 'When should you use useCallback vs useMemo in React?',
    options: [
      'useCallback memoizes functions, useMemo memoizes values',
      'They are the same thing',
      'useCallback is for API calls, useMemo is for math',
      'useMemo is always better'
    ],
    correctIndex: 0,
    explanation: 'useCallback returns a memoized function (prevents recreation on re-render). useMemo returns a memoized value (prevents recomputation). Use useCallback for functions passed as props, useMemo for expensive calculations.',
    tips: ['Mention that premature optimization is bad - only use when needed', 'useCallback(fn, deps) is equivalent to useMemo(() => fn, deps)'],
    timeLimit: 60, xpReward: 50
  },
  // CODING - Senior
  {
    id: 'iv_c7', category: 'coding', difficulty: 'senior', topic: 'Algorithms',
    question: 'Design an LRU Cache with O(1) get and put operations.',
    options: [
      'HashMap + Doubly Linked List',
      'Array with binary search',
      'Balanced BST',
      'Single linked list with hash'
    ],
    correctIndex: 0,
    explanation: 'Use a HashMap for O(1) lookup and a Doubly Linked List for O(1) removal/insertion. The map stores key -> node references. On access, move node to front. On eviction, remove from tail.',
    tips: ['Draw the data structure on a whiteboard', 'Walk through a few operations step by step', 'Mention this is LeetCode #146 - a classic'],
    timeLimit: 120, xpReward: 100
  },
  {
    id: 'iv_c8', category: 'coding', difficulty: 'senior', topic: 'Concurrency',
    question: 'How would you implement a rate limiter for an API?',
    options: [
      'Token Bucket algorithm',
      'Sliding Window Counter',
      'Fixed Window Counter',
      'All are valid approaches with different tradeoffs'
    ],
    correctIndex: 3,
    explanation: 'Token Bucket: smooth rate, allows bursts. Sliding Window: accurate rate, more memory. Fixed Window: simple, but has boundary burst issue. Choose based on requirements.',
    tips: ['Discuss the tradeoffs between each approach', 'Mention Redis for distributed rate limiting', 'Ask about burst tolerance requirements'],
    timeLimit: 120, xpReward: 100
  },

  // SYSTEM DESIGN
  {
    id: 'iv_sd1', category: 'system-design', difficulty: 'mid', topic: 'System Design',
    question: 'How would you design a URL shortener like bit.ly?',
    options: [
      'Generate hash/ID, store mapping in DB, redirect on lookup',
      'Just use a random string and hope there are no collisions',
      'Store the full URL in the short URL itself',
      'Use DNS to redirect'
    ],
    correctIndex: 0,
    explanation: 'Key components: 1) ID generator (counter/hash), 2) Key-value store (URL mapping), 3) Redirect service (301/302). Scale with caching (Redis), DB sharding by key, and CDN for popular URLs.',
    tips: ['Estimate: 100M URLs/month = ~40 URLs/sec write', 'Short code: base62 encoding of auto-increment ID', 'Discuss 301 (permanent) vs 302 (temporary) redirect tradeoffs'],
    timeLimit: 180, xpReward: 80
  },
  {
    id: 'iv_sd2', category: 'system-design', difficulty: 'senior', topic: 'System Design',
    question: 'Design a real-time chat system like Slack/Discord.',
    options: [
      'WebSocket server + message queue + persistent storage',
      'HTTP polling every second',
      'Email-based messaging',
      'Peer-to-peer connections only'
    ],
    correctIndex: 0,
    explanation: 'Architecture: WebSocket connections for real-time delivery, message queue (Kafka) for reliability, database for persistence, presence service for online status, push notifications for offline users.',
    tips: ['Start with single-server, then scale to multiple', 'Discuss message ordering guarantees', 'Mention channel-based pub/sub for group chats'],
    timeLimit: 300, xpReward: 120
  },
  {
    id: 'iv_sd3', category: 'system-design', difficulty: 'mid', topic: 'System Design',
    question: 'How would you design a notification system?',
    options: [
      'Event-driven with message queue, multi-channel delivery, user preferences',
      'Direct API calls to each notification channel',
      'Batch process notifications once per hour',
      'Store notifications and let users poll for them'
    ],
    correctIndex: 0,
    explanation: 'Components: 1) Event collector, 2) Priority/dedup engine, 3) User preference service, 4) Template engine, 5) Channel dispatchers (email, push, SMS, in-app), 6) Delivery tracking.',
    tips: ['Discuss idempotency - same event shouldn\'t send duplicate notifications', 'Mention rate limiting per user', 'Consider time zones and quiet hours'],
    timeLimit: 180, xpReward: 80
  },

  // BEHAVIORAL
  {
    id: 'iv_b1', category: 'behavioral', difficulty: 'junior', topic: 'General CS',
    question: 'Tell me about a time you had to learn a new technology quickly.',
    explanation: 'Use the STAR method: Situation (what was the context), Task (what did you need to learn), Action (how you approached learning), Result (what you achieved). Be specific about the technology and timeline.',
    tips: ['Be specific - name the technology and the project', 'Show your learning process: docs, tutorials, hands-on', 'Quantify the result: "shipped feature in 2 weeks"', 'Show curiosity and growth mindset'],
    timeLimit: 120, xpReward: 40
  },
  {
    id: 'iv_b2', category: 'behavioral', difficulty: 'mid', topic: 'General CS',
    question: 'Describe a situation where you disagreed with a technical decision. How did you handle it?',
    explanation: 'Show mature conflict resolution: present data/evidence, listen to the other side, find common ground, commit to the final decision even if you disagree. Focus on the technical merits, not the person.',
    tips: ['Never badmouth coworkers or managers', 'Show you can disagree respectfully with data', 'Demonstrate "disagree and commit" mentality', 'Emphasize the positive outcome'],
    timeLimit: 120, xpReward: 50
  },
  {
    id: 'iv_b3', category: 'behavioral', difficulty: 'senior', topic: 'General CS',
    question: 'How do you approach mentoring junior developers?',
    explanation: 'Good answers include: setting clear expectations, creating safe spaces for questions, pair programming, code reviews as teaching moments, gradually increasing responsibility, and celebrating growth.',
    tips: ['Give a specific example of someone you mentored', 'Show empathy and patience', 'Mention how mentoring improved your own skills', 'Discuss creating psychological safety'],
    timeLimit: 120, xpReward: 60
  },

  // TRIVIA / Quick Fire
  {
    id: 'iv_t1', category: 'trivia', difficulty: 'junior', topic: 'Networking & APIs',
    question: 'What HTTP method is idempotent?',
    options: ['POST', 'GET', 'PATCH', 'All of the above'],
    correctIndex: 1,
    explanation: 'GET, PUT, and DELETE are idempotent (same request produces same result). POST is NOT idempotent (each call may create a new resource).',
    timeLimit: 15, xpReward: 20
  },
  {
    id: 'iv_t2', category: 'trivia', difficulty: 'junior', topic: 'SQL & Databases',
    question: 'What is the difference between WHERE and HAVING in SQL?',
    options: [
      'WHERE filters rows before grouping, HAVING filters after grouping',
      'They are the same',
      'WHERE is for SELECT, HAVING is for INSERT',
      'HAVING is deprecated'
    ],
    correctIndex: 0,
    explanation: 'WHERE filters individual rows before GROUP BY. HAVING filters aggregated groups after GROUP BY. Example: HAVING COUNT(*) > 5 filters groups with more than 5 rows.',
    timeLimit: 20, xpReward: 20
  },
  {
    id: 'iv_t3', category: 'trivia', difficulty: 'mid', topic: 'Security',
    question: 'What is CORS and why does it exist?',
    options: [
      'Cross-Origin Resource Sharing - browser security policy to control cross-domain requests',
      'A type of encryption',
      'A CSS framework',
      'A database feature'
    ],
    correctIndex: 0,
    explanation: 'CORS is a browser security mechanism that restricts web pages from making requests to a different domain. The server must explicitly allow cross-origin requests via response headers (Access-Control-Allow-Origin).',
    tips: ['Mention preflight OPTIONS request', 'Discuss common CORS headers'],
    timeLimit: 30, xpReward: 30
  },
  {
    id: 'iv_t4', category: 'trivia', difficulty: 'mid', topic: 'Git & Version Control',
    question: 'What is the difference between git rebase and git merge?',
    options: [
      'Rebase replays commits on new base (linear history), merge creates merge commit (preserves history)',
      'They do the same thing',
      'Rebase is for remote only',
      'Merge always causes conflicts'
    ],
    correctIndex: 0,
    explanation: 'Merge preserves the branch history with a merge commit. Rebase rewrites history by replaying commits on top of the target branch, creating a linear history. Never rebase public/shared branches.',
    timeLimit: 30, xpReward: 30
  },
  {
    id: 'iv_t5', category: 'trivia', difficulty: 'junior', topic: 'OOP & Design Patterns',
    question: 'What are the four pillars of OOP?',
    options: [
      'Encapsulation, Abstraction, Inheritance, Polymorphism',
      'Class, Object, Method, Property',
      'Public, Private, Protected, Static',
      'Create, Read, Update, Delete'
    ],
    correctIndex: 0,
    explanation: 'Encapsulation (bundling data + methods), Abstraction (hiding complexity), Inheritance (code reuse via parent-child), Polymorphism (same interface, different behavior).',
    timeLimit: 20, xpReward: 20
  },
  {
    id: 'iv_t6', category: 'trivia', difficulty: 'senior', topic: 'Cloud & DevOps',
    question: 'Explain the CAP theorem.',
    options: [
      'In a distributed system, you can only guarantee 2 of: Consistency, Availability, Partition Tolerance',
      'Create, Alter, Partition',
      'Cache, API, Protocol',
      'It refers to maximum server capacity'
    ],
    correctIndex: 0,
    explanation: 'CAP theorem: during a network partition, you must choose between Consistency (all nodes see same data) and Availability (every request gets a response). Partition Tolerance is mandatory in distributed systems.',
    tips: ['CP systems: HBase, MongoDB', 'AP systems: Cassandra, DynamoDB', 'In practice, it\'s a spectrum, not a binary choice'],
    timeLimit: 45, xpReward: 50
  },
];

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

const CATEGORIES: { id: InterviewCategory; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: 'coding', label: 'Coding', icon: <Code size={20} />, color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400', desc: 'Data structures, algorithms, language specifics' },
  { id: 'system-design', label: 'System Design', icon: <Cpu size={20} />, color: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 text-emerald-400', desc: 'Architecture, scaling, distributed systems' },
  { id: 'behavioral', label: 'Behavioral', icon: <Users size={20} />, color: 'from-purple-500/20 to-violet-600/20 border-purple-500/30 text-purple-400', desc: 'STAR method, leadership, collaboration' },
  { id: 'trivia', label: 'Quick Fire', icon: <Zap size={20} />, color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400', desc: 'Rapid-fire technical knowledge' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; xpMult: number }> = {
  junior: { label: 'Junior', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', xpMult: 1 },
  mid: { label: 'Mid-Level', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', xpMult: 1.5 },
  senior: { label: 'Senior', color: 'text-red-400 bg-red-500/10 border-red-500/30', xpMult: 2 },
  staff: { label: 'Staff+', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', xpMult: 3 },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InterviewPrep: React.FC<InterviewPrepProps> = ({ user, onBack, onGainXp, telemetryUserId }) => {
  const [mode, setMode] = useState<'menu' | 'session' | 'results'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('junior');

  // Session state
  const [sessionQuestions, setSessionQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const questionStartedAtRef = React.useRef<number>(Date.now());
  const [recentAttempts, setRecentAttempts] = useState<AttemptLite[]>([]);

  useEffect(() => {
    const buffered = readBufferedAttempts(1200);
    setRecentAttempts(
      buffered.map((row) => ({
        questionId: row.questionId,
        topic: row.topic || null,
        isCorrect: row.isCorrect,
        attemptedAt: row.attemptedAt,
      }))
    );
  }, [telemetryUserId]);

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          setShowExplanation(true);
          const timedOutQuestion = sessionQuestions[currentQIndex];
          if (timedOutQuestion) {
            setAnswers(prevAnswers => [...prevAnswers, null]);
            void recordQuestionAttempt({
              userId: telemetryUserId,
              questionId: timedOutQuestion.id,
              source: 'INTERVIEW',
              topic: timedOutQuestion.topic,
              difficulty: timedOutQuestion.difficulty,
              isCorrect: false,
              responseMs: timedOutQuestion.timeLimit * 1000,
              metadata: { category: timedOutQuestion.category, timedOut: true },
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, currentQIndex, sessionQuestions, telemetryUserId]);

  const startSession = (category: InterviewCategory) => {
    setSelectedCategory(category);
    const filtered = INTERVIEW_QUESTIONS.filter(q =>
      q.category === category &&
      (selectedDifficulty === 'staff' || q.difficulty === selectedDifficulty || (selectedDifficulty === 'senior' && q.difficulty !== 'junior'))
    );

    const prioritized = [...filtered]
      .map((q) => ({
        q,
        priority: scoreAdaptivePriority(q.id, q.topic, recentAttempts),
      }))
      .sort((a, b) => b.priority - a.priority);

    // Keep a small top pool adaptive, but randomize within it for variation.
    const adaptivePool = prioritized.slice(0, Math.min(10, prioritized.length)).map((item) => item.q);
    const adaptiveSelection = [...adaptivePool].sort(() => Math.random() - 0.5).slice(0, 5);

    if (adaptiveSelection.length === 0) {
      // fallback to all in category
      const all = INTERVIEW_QUESTIONS.filter(q => q.category === category).sort(() => Math.random() - 0.5).slice(0, 5);
      setSessionQuestions(all);
    } else {
      setSessionQuestions(adaptiveSelection);
    }

    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setTotalXpEarned(0);
    setMode('session');

    const q = adaptiveSelection[0] || filtered[0];
    if (q) {
      setTimeLeft(q.timeLimit);
      setTimerActive(true);
      questionStartedAtRef.current = Date.now();
    }
  };

  const handleAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    setTimerActive(false);

    const q = sessionQuestions[currentQIndex];
    const isCorrect = q.correctIndex !== undefined && index === q.correctIndex;
    const responseMs = Date.now() - questionStartedAtRef.current;
    const xp = isCorrect ? q.xpReward : 0;
    setTotalXpEarned(prev => prev + xp);
    setAnswers(prev => [...prev, index]);
    void recordQuestionAttempt({
      userId: telemetryUserId,
      questionId: q.id,
      source: 'INTERVIEW',
      topic: q.topic,
      difficulty: q.difficulty,
      isCorrect,
      responseMs,
      metadata: { category: q.category, mode: 'mcq' },
    });
  };

  const nextQuestion = () => {
    if (currentQIndex < sessionQuestions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(sessionQuestions[nextIdx].timeLimit);
      setTimerActive(true);
      questionStartedAtRef.current = Date.now();
    } else {
      setMode('results');
      if (totalXpEarned > 0) onGainXp?.(totalXpEarned);
    }
  };

  const currentQuestion = sessionQuestions[currentQIndex];

  // MENU
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-transparent text-slate-200 relative">
        <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onBack}
              className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 transition-all">
              <ArrowLeft size={18} />
            </motion.button>
            <h1 className="text-lg font-fantasy text-gold-400 flex items-center gap-2">
              <Target size={16} /> Interview Prep
            </h1>
            <div className="w-10" />
          </div>

          {/* Difficulty selector */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Difficulty Level</h3>
            <div className="flex gap-2">
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
                <motion.button
                  key={diff}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    selectedDifficulty === diff
                      ? DIFFICULTY_CONFIG[diff].color
                      : 'text-slate-600 bg-obsidian-800/40 border-gold-600/10 hover:border-gold-600/20'
                  }`}
                >
                  {DIFFICULTY_CONFIG[diff].label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category cards */}
          <div className="space-y-3">
            {CATEGORIES.map((cat, i) => {
              const count = INTERVIEW_QUESTIONS.filter(q => q.category === cat.id).length;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => startSession(cat.id)}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${cat.color} border cursor-pointer group`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-black/20">{cat.icon}</div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-white">{cat.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{cat.desc}</div>
                      <div className="text-[10px] text-slate-600 mt-1">{count} questions available</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 rounded-xl bg-obsidian-800/40 border border-gold-600/15">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-gold-400" />
              <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Interview Tips</span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>\u25B8 Think out loud \u2014 interviewers want to see your thought process</p>
              <p>\u25B8 Ask clarifying questions before jumping into a solution</p>
              <p>\u25B8 Start with a brute force approach, then optimize</p>
              <p>\u25B8 For system design, always start with requirements and scale estimates</p>
              <p>\u25B8 Use the STAR method for behavioral questions</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (mode === 'results') {
    const correctCount = sessionQuestions.filter((q, i) =>
      q.correctIndex !== undefined && answers[i] === q.correctIndex
    ).length;
    const totalQuestions = sessionQuestions.length;

    return (
      <div className="min-h-screen bg-transparent text-slate-200 relative">
        <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ type: 'tween', duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="text-6xl"
            >
              {correctCount === totalQuestions ? '\u{1F3C6}' : correctCount >= totalQuestions * 0.7 ? '\u{1F31F}' : '\u{1F4AA}'}
            </motion.div>

            <div>
              <h2 className="text-2xl font-fantasy text-gold-400">
                {correctCount === totalQuestions ? 'Perfect Interview!' : correctCount >= totalQuestions * 0.7 ? 'Strong Performance!' : 'Keep Practicing!'}
              </h2>
              <p className="text-lg text-white font-mono mt-2">{correctCount}/{totalQuestions} Correct</p>
              <p className="text-sm text-emerald-400 font-bold mt-1">+{totalXpEarned} XP earned</p>
            </div>

            {/* Question breakdown */}
            <div className="space-y-2 max-w-md mx-auto">
              {sessionQuestions.map((q, i) => {
                const isCorrect = q.correctIndex !== undefined && answers[i] === q.correctIndex;
                return (
                  <div key={q.id} className={`p-3 rounded-xl border text-left ${
                    isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                  }`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <Check size={14} className="text-emerald-400 mt-0.5" /> : <X size={14} className="text-red-400 mt-0.5" />}
                      <div>
                        <p className="text-xs text-white font-bold">{q.question.slice(0, 80)}...</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{q.topic} &middot; {DIFFICULTY_CONFIG[q.difficulty].label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('menu')}
                className="px-6 py-3 rounded-xl bg-obsidian-800/60 border border-gold-600/20 text-slate-300 font-bold text-sm flex items-center gap-2 hover:border-gold-500/40 transition-all"
              >
                <ArrowLeft size={16} /> Back to Menu
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (selectedCategory) startSession(selectedCategory);
                  else setMode('menu');
                }}
                className="px-6 py-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 font-bold text-sm flex items-center gap-2"
              >
                <RotateCcw size={16} /> Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // SESSION
  if (!currentQuestion) return null;

  const isCorrect = currentQuestion.correctIndex !== undefined && selectedAnswer === currentQuestion.correctIndex;
  const timerPercent = (timeLeft / currentQuestion.timeLimit) * 100;
  const isBehavioral = currentQuestion.category === 'behavioral';

  return (
    <div className="min-h-screen bg-transparent text-slate-200 relative">
      <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { setTimerActive(false); setMode('menu'); }}
            className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 transition-all">
            <ArrowLeft size={18} />
          </motion.button>
          <div className="text-center">
            <span className="text-xs text-slate-500 font-mono">Question {currentQIndex + 1}/{sessionQuestions.length}</span>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-lg border ${DIFFICULTY_CONFIG[currentQuestion.difficulty].color}`}>
            {DIFFICULTY_CONFIG[currentQuestion.difficulty].label}
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1.5 bg-obsidian-800 rounded-full mb-4 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all ${
              timerPercent > 50 ? 'bg-emerald-500' : timerPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Timer & topic */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500">{currentQuestion.topic}</span>
          <div className={`flex items-center gap-1.5 font-mono text-sm ${
            timeLeft <= 10 ? 'text-red-400' : timeLeft <= 30 ? 'text-amber-400' : 'text-slate-400'
          }`}>
            <Clock size={14} />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>

        {/* Question */}
        <div className="bg-obsidian-800/60 border border-gold-600/15 rounded-2xl p-6 mb-4 ornament-corners">
          <p className="text-base text-white font-bold leading-relaxed">{currentQuestion.question}</p>
          {currentQuestion.context && (
            <pre className="mt-3 p-3 bg-[#0d1117] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800">
              <code>{currentQuestion.context}</code>
            </pre>
          )}
        </div>

        {/* Options (for non-behavioral) */}
        {currentQuestion.options && (
          <div className="space-y-2 mb-4">
            {currentQuestion.options.map((option, i) => {
              const romanNumerals = ['I', 'II', 'III', 'IV'];
              let style = 'bg-obsidian-900/60 border-gold-600/20 text-slate-300 hover:border-gold-500/40 hover:bg-obsidian-800/80';
              if (showExplanation) {
                if (i === currentQuestion.correctIndex) style = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
                else if (i === selectedAnswer) style = 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
                else style = 'bg-obsidian-900/30 border-gold-600/10 text-slate-600 opacity-40';
              }
              return (
                <motion.button
                  key={i}
                  whileHover={!showExplanation ? { x: 4 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={showExplanation}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${style}`}
                >
                  <span className="font-fantasy text-gold-500/60 mr-3">{romanNumerals[i]}</span>
                  {option}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Behavioral - self-assessment */}
        {isBehavioral && !showExplanation && (
          <div className="text-center mb-4">
            <p className="text-xs text-slate-500 mb-3">Take a moment to formulate your answer, then reveal the guide.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowExplanation(true);
                setTimerActive(false);
                setAnswers(prev => [...prev, 0]);
                setTotalXpEarned(prev => prev + currentQuestion.xpReward);
                void recordQuestionAttempt({
                  userId: telemetryUserId,
                  questionId: currentQuestion.id,
                  source: 'INTERVIEW',
                  topic: currentQuestion.topic,
                  difficulty: currentQuestion.difficulty,
                  isCorrect: true,
                  responseMs: Date.now() - questionStartedAtRef.current,
                  metadata: { category: currentQuestion.category, mode: 'behavioral-self-assessed' },
                });
              }}
              className="px-6 py-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 font-bold text-sm"
            >
              Show Answer Guide
            </motion.button>
          </div>
        )}

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {!isBehavioral && (
                <div className={`p-3 rounded-xl border ${
                  isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-red-400" />}
                    <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCorrect ? 'Correct!' : 'Not quite!'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{currentQuestion.explanation}</p>
                </div>
              )}

              {isBehavioral && (
                <div className="p-4 rounded-xl bg-obsidian-800/40 border border-gold-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-gold-400" />
                    <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Answer Guide</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}

              {currentQuestion.tips && (
                <div className="p-3 rounded-xl bg-obsidian-800/30 border border-gold-600/15">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Interview Tips</div>
                  {currentQuestion.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-400 mt-1">
                      <span className="text-gold-500 shrink-0">\u25B8</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextQuestion}
                className="w-full py-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 font-bold text-sm flex items-center justify-center gap-2"
              >
                {currentQIndex < sessionQuestions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewPrep;
