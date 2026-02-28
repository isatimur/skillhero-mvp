
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  BookOpen, Brain, Code, Coffee, Clock, Flame, Trophy, Star, Sparkles,
  ChevronRight, ChevronLeft, RotateCcw, Check, X, Zap, Target, Map,
  Award, Crown, Shield, Sword, Heart, TrendingUp, Play, Pause,
  Volume2, ArrowLeft, Lock, Unlock, GitBranch, Database, Cloud,
  Terminal, Bug, Cpu, Wifi, TestTube, Layers, Server, Eye,
  MessageCircle, Lightbulb, GraduationCap, Bookmark, Hash, RefreshCw
} from 'lucide-react';
import { User, SETopic, Question, LibraryBook } from '../types';
import { SE_TOPICS, LIBRARY_BOOKS, QUESTS, getTopicsPracticed } from '../constants';
import { FantasyButton, ParchmentPanel, LiquidBar } from './ui';
import { readBufferedAttempts, recordQuestionAttempt } from '../lib/learningTelemetry';
import { AttemptLite, pickWeakestTopic, scoreAdaptivePriority } from '../lib/adaptiveLearning';
import { generateAIQuiz } from '../lib/aiTraining';
import {
  activateConsumable,
  ConsumableId,
  createInitialRewardState,
  getConsumableCatalog,
  getStudyRank,
  getPerkCatalog,
  loadRewardState,
  purchaseConsumable,
  purchasePerk,
  saveRewardState,
  DAILY_TARGET,
  WEEKLY_TARGET,
  PerkId,
  RewardState,
  RewardResult,
} from '../lib/rewardBus';

// ============================================================================
// TYPES
// ============================================================================

interface StudyHubProps {
  user: User;
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  onStudyReward: (baseXp: number) => RewardResult;
  telemetryUserId?: string | null;
}

type HubTab = 'dashboard' | 'constellation' | 'flashcards' | 'challenges' | 'pomodoro' | 'achievements' | 'daily';

interface FlashCard {
  id: string;
  question: string;
  answer: string;
  topic: SETopic;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  confidence: 'new' | 'learning' | 'familiar' | 'mastered';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  category: 'study' | 'streak' | 'mastery' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface CodeChallenge {
  id: string;
  code: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: SETopic;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

const MASCOT_MESSAGES = [
  "Let's learn something amazing today!",
  "Every line of code is a spell waiting to be cast!",
  "You're doing great, keep it up!",
  "Knowledge is the ultimate power-up!",
  "One concept at a time, hero!",
  "The best engineers never stop learning!",
  "Bugs fear the well-studied coder!",
  "Your brain is leveling up right now!",
  "Consistency beats talent every time!",
  "You're becoming legendary!",
];

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  'Algorithms': <Brain size={18} />,
  'Data Structures': <Layers size={18} />,
  'OOP & Design Patterns': <GitBranch size={18} />,
  'SQL & Databases': <Database size={18} />,
  'Git & Version Control': <GitBranch size={18} />,
  'System Design': <Cpu size={18} />,
  'Networking & APIs': <Wifi size={18} />,
  'Security': <Shield size={18} />,
  'Testing & CI/CD': <TestTube size={18} />,
  'JavaScript/TypeScript': <Code size={18} />,
  'React & Frontend': <Layers size={18} />,
  'Backend & Servers': <Server size={18} />,
  'Cloud & DevOps': <Cloud size={18} />,
  'Concurrency': <Zap size={18} />,
  'General CS': <GraduationCap size={18} />,
  'Software Architecture': <Layers size={18} />,
  'AI & Machine Learning': <Brain size={18} />,
  'Mobile Development': <Cpu size={18} />,
  'Operating Systems': <Terminal size={18} />,
  'TypeScript Advanced': <Code size={18} />,
};

const TOPIC_COLORS: Record<string, string> = {
  'Algorithms': 'from-amber-500/20 to-orange-600/20 border-amber-500/40',
  'Data Structures': 'from-blue-500/20 to-indigo-600/20 border-blue-500/40',
  'OOP & Design Patterns': 'from-purple-500/20 to-violet-600/20 border-purple-500/40',
  'SQL & Databases': 'from-cyan-500/20 to-blue-600/20 border-cyan-500/40',
  'Git & Version Control': 'from-red-500/20 to-rose-600/20 border-red-500/40',
  'System Design': 'from-emerald-500/20 to-green-600/20 border-emerald-500/40',
  'Networking & APIs': 'from-sky-500/20 to-blue-600/20 border-sky-500/40',
  'Security': 'from-red-500/20 to-orange-600/20 border-red-500/40',
  'Testing & CI/CD': 'from-green-500/20 to-emerald-600/20 border-green-500/40',
  'JavaScript/TypeScript': 'from-yellow-500/20 to-amber-600/20 border-yellow-500/40',
  'React & Frontend': 'from-cyan-500/20 to-sky-600/20 border-cyan-500/40',
  'Backend & Servers': 'from-slate-500/20 to-gray-600/20 border-slate-500/40',
  'Cloud & DevOps': 'from-indigo-500/20 to-blue-600/20 border-indigo-500/40',
  'Concurrency': 'from-violet-500/20 to-purple-600/20 border-violet-500/40',
  'General CS': 'from-gold-400/20 to-amber-600/20 border-gold-500/40',
  'Software Architecture': 'from-violet-500/20 to-purple-600/20 border-violet-500/40',
  'AI & Machine Learning': 'from-fuchsia-500/20 to-pink-600/20 border-fuchsia-500/40',
  'Mobile Development': 'from-teal-500/20 to-cyan-600/20 border-teal-500/40',
  'Operating Systems': 'from-orange-500/20 to-amber-600/20 border-orange-500/40',
  'TypeScript Advanced': 'from-blue-500/20 to-sky-600/20 border-blue-500/40',
};

const TOPIC_ACCENT: Record<string, string> = {
  'Algorithms': 'text-amber-400',
  'Data Structures': 'text-blue-400',
  'OOP & Design Patterns': 'text-purple-400',
  'SQL & Databases': 'text-cyan-400',
  'Git & Version Control': 'text-red-400',
  'System Design': 'text-emerald-400',
  'Networking & APIs': 'text-sky-400',
  'Security': 'text-red-400',
  'Testing & CI/CD': 'text-green-400',
  'JavaScript/TypeScript': 'text-yellow-400',
  'React & Frontend': 'text-cyan-400',
  'Backend & Servers': 'text-slate-400',
  'Cloud & DevOps': 'text-indigo-400',
  'Concurrency': 'text-violet-400',
  'General CS': 'text-gold-400',
  'Software Architecture': 'text-violet-400',
  'AI & Machine Learning': 'text-fuchsia-400',
  'Mobile Development': 'text-teal-400',
  'Operating Systems': 'text-orange-400',
  'TypeScript Advanced': 'text-blue-400',
};

// Constellation node positions (x%, y%) in a beautiful galaxy layout
const CONSTELLATION_NODES: { topic: SETopic; x: number; y: number; connections: SETopic[] }[] = [
  { topic: 'General CS', x: 50, y: 12, connections: ['Algorithms', 'Data Structures'] },
  { topic: 'Algorithms', x: 30, y: 25, connections: ['Data Structures', 'Concurrency'] },
  { topic: 'Data Structures', x: 70, y: 25, connections: ['OOP & Design Patterns'] },
  { topic: 'OOP & Design Patterns', x: 85, y: 40, connections: ['System Design', 'Backend & Servers'] },
  { topic: 'JavaScript/TypeScript', x: 50, y: 42, connections: ['React & Frontend', 'Backend & Servers', 'Testing & CI/CD'] },
  { topic: 'React & Frontend', x: 30, y: 55, connections: ['Testing & CI/CD'] },
  { topic: 'Backend & Servers', x: 70, y: 55, connections: ['SQL & Databases', 'Networking & APIs'] },
  { topic: 'SQL & Databases', x: 85, y: 70, connections: ['Security'] },
  { topic: 'Networking & APIs', x: 55, y: 68, connections: ['Security', 'Cloud & DevOps'] },
  { topic: 'System Design', x: 15, y: 40, connections: ['Cloud & DevOps'] },
  { topic: 'Git & Version Control', x: 15, y: 65, connections: ['Testing & CI/CD'] },
  { topic: 'Testing & CI/CD', x: 38, y: 72, connections: ['Cloud & DevOps'] },
  { topic: 'Cloud & DevOps', x: 25, y: 85, connections: [] },
  { topic: 'Security', x: 70, y: 85, connections: [] },
  { topic: 'Concurrency', x: 12, y: 25, connections: ['System Design', 'Operating Systems'] },
  { topic: 'Software Architecture', x: 50, y: 28, connections: ['System Design', 'OOP & Design Patterns'] },
  { topic: 'AI & Machine Learning', x: 65, y: 42, connections: ['Data Structures', 'General CS'] },
  { topic: 'Mobile Development', x: 18, y: 78, connections: ['React & Frontend'] },
  { topic: 'Operating Systems', x: 42, y: 88, connections: ['Concurrency'] },
  { topic: 'TypeScript Advanced', x: 75, y: 73, connections: ['JavaScript/TypeScript'] },
];

const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: 'cc1', topic: 'JavaScript/TypeScript', difficulty: 'Easy',
    code: `const arr = [1, 2, 3];\nconsole.log(arr.map(x => x * 2));`,
    question: 'What does this code output?',
    options: ['[2, 4, 6]', '[1, 2, 3]', '[1, 4, 9]', 'undefined'],
    correctIndex: 0,
    explanation: '.map() creates a new array by applying the function to each element. 1*2=2, 2*2=4, 3*2=6.'
  },
  {
    id: 'cc2', topic: 'JavaScript/TypeScript', difficulty: 'Medium',
    code: `let a = [1, 2, 3];\nlet b = a;\nb.push(4);\nconsole.log(a.length);`,
    question: 'What is logged?',
    options: ['3', '4', 'undefined', 'Error'],
    correctIndex: 1,
    explanation: 'Arrays are reference types. b = a makes both point to the same array. Pushing to b also affects a.'
  },
  {
    id: 'cc3', topic: 'JavaScript/TypeScript', difficulty: 'Medium',
    code: `console.log(typeof null);`,
    question: 'What does this output?',
    options: ['"null"', '"undefined"', '"object"', '"number"'],
    correctIndex: 2,
    explanation: 'This is a famous JS quirk. typeof null returns "object" due to a legacy bug in the language.'
  },
  {
    id: 'cc4', topic: 'Algorithms', difficulty: 'Easy',
    code: `function mystery(n) {\n  if (n <= 1) return n;\n  return mystery(n-1) + mystery(n-2);\n}\nconsole.log(mystery(6));`,
    question: 'What is the output?',
    options: ['5', '8', '13', '6'],
    correctIndex: 1,
    explanation: 'This is the Fibonacci sequence. F(6) = F(5) + F(4) = 5 + 3 = 8.'
  },
  {
    id: 'cc5', topic: 'Data Structures', difficulty: 'Easy',
    code: `const stack = [];\nstack.push(1);\nstack.push(2);\nstack.push(3);\nstack.pop();\nconsole.log(stack[stack.length-1]);`,
    question: 'What is printed?',
    options: ['1', '2', '3', 'undefined'],
    correctIndex: 1,
    explanation: 'After pushing 1,2,3 and popping once (removes 3), the top of stack is 2.'
  },
  {
    id: 'cc6', topic: 'JavaScript/TypeScript', difficulty: 'Hard',
    code: `const p = new Promise((res) => {\n  console.log("A");\n  res("B");\n});\np.then(v => console.log(v));\nconsole.log("C");`,
    question: 'What is the output order?',
    options: ['A, B, C', 'A, C, B', 'C, A, B', 'B, A, C'],
    correctIndex: 1,
    explanation: 'Promise constructor runs synchronously (logs A), then C runs, then the microtask .then(B) resolves.'
  },
  {
    id: 'cc7', topic: 'SQL & Databases', difficulty: 'Easy',
    code: `SELECT COUNT(*)\nFROM users\nWHERE active = true\nGROUP BY department;`,
    question: 'What does this query return?',
    options: ['Total active users', 'Active user count per department', 'All user records', 'Department names only'],
    correctIndex: 1,
    explanation: 'GROUP BY department with COUNT(*) gives the count of active users in each department.'
  },
  {
    id: 'cc8', topic: 'React & Frontend', difficulty: 'Medium',
    code: `function App() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    setCount(c => c + 1);\n  }, []);\n  return <p>{count}</p>;\n}`,
    question: 'What does the component render after mount?',
    options: ['0', '1', '2', 'Infinite loop'],
    correctIndex: 1,
    explanation: 'useEffect with [] runs once after mount, incrementing count from 0 to 1.'
  },
  {
    id: 'cc9', topic: 'Algorithms', difficulty: 'Medium',
    code: `function search(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    let mid = Math.floor((lo+hi)/2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}`,
    question: 'What algorithm is this?',
    options: ['Linear Search', 'Binary Search', 'Interpolation Search', 'Jump Search'],
    correctIndex: 1,
    explanation: 'Classic binary search: divides the sorted array in half each iteration. O(log n) time.'
  },
  {
    id: 'cc10', topic: 'JavaScript/TypeScript', difficulty: 'Easy',
    code: `const obj = { a: 1, b: 2, c: 3 };\nconst { a, ...rest } = obj;\nconsole.log(rest);`,
    question: 'What is logged?',
    options: ['{ a: 1 }', '{ b: 2, c: 3 }', '[2, 3]', 'undefined'],
    correctIndex: 1,
    explanation: 'Destructuring with rest collects remaining properties. After extracting a, rest = { b: 2, c: 3 }.'
  },
  {
    id: 'cc11', topic: 'JavaScript/TypeScript', difficulty: 'Medium',
    code: `const a = { x: 1 };\nconst b = { x: 1 };\nconsole.log(a === b);`,
    question: 'What is the output?',
    options: ['true', 'false', 'undefined', 'Error'],
    correctIndex: 1,
    explanation: 'Objects are compared by reference, not value. a and b are different objects in memory, so === returns false.'
  },
  {
    id: 'cc12', topic: 'JavaScript/TypeScript', difficulty: 'Hard',
    code: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}`,
    question: 'What is printed?',
    options: ['0, 1, 2', '3, 3, 3', '0, 0, 0', 'undefined x3'],
    correctIndex: 1,
    explanation: 'var is function-scoped, not block-scoped. By the time setTimeout callbacks run, the loop has finished and i is 3. Use let to fix this.'
  },
  {
    id: 'cc13', topic: 'Data Structures', difficulty: 'Medium',
    code: `class MinStack {\n  constructor() { this.stack = []; this.min = []; }\n  push(val) {\n    this.stack.push(val);\n    this.min.push(\n      this.min.length === 0 ? val\n      : Math.min(val, this.min[this.min.length-1])\n    );\n  }\n}`,
    question: 'What does the min array track?',
    options: ['All values', 'Current minimum at each level', 'Maximum values', 'Sorted values'],
    correctIndex: 1,
    explanation: 'This is the MinStack pattern. The min array maintains the minimum value at each stack level, enabling O(1) getMin().'
  },
  {
    id: 'cc14', topic: 'Algorithms', difficulty: 'Hard',
    code: `function fn(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 2) return 1;\n  memo[n] = fn(n-1, memo) + fn(n-2, memo);\n  return memo[n];\n}`,
    question: 'What technique is this?',
    options: ['Greedy', 'Memoization (Top-Down DP)', 'Binary Search', 'Backtracking'],
    correctIndex: 1,
    explanation: 'This is memoized recursion (top-down dynamic programming). The memo object caches results to avoid redundant computations, reducing Fibonacci from O(2^n) to O(n).'
  },
  {
    id: 'cc15', topic: 'React & Frontend', difficulty: 'Hard',
    code: `function App() {\n  const [items, setItems] = useState([1,2,3]);\n  const add = () => {\n    items.push(4);\n    setItems(items);\n  };\n  return <button onClick={add}>{items.length}</button>;\n}`,
    question: 'Does clicking the button update the UI?',
    options: ['Yes, shows 4', 'No, stays at 3', 'Error thrown', 'Shows undefined'],
    correctIndex: 1,
    explanation: 'React uses referential equality to detect state changes. items.push(4) mutates the same array reference. setItems(items) passes the same reference, so React thinks nothing changed. Fix: setItems([...items, 4]).'
  },
  {
    id: 'cc16', topic: 'Security', difficulty: 'Medium',
    code: `const query = "SELECT * FROM users WHERE name = '" + userInput + "'";`,
    question: 'What vulnerability does this code have?',
    options: ['XSS', 'SQL Injection', 'CSRF', 'Buffer Overflow'],
    correctIndex: 1,
    explanation: "String concatenation in SQL queries allows attackers to inject malicious SQL. If userInput contains a closing quote and malicious SQL, the table could be dropped. Use parameterized queries instead."
  },
  {
    id: 'cc17', topic: 'Networking & APIs', difficulty: 'Easy',
    code: `fetch('/api/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ name: 'Ada' })\n});`,
    question: 'What HTTP method is used?',
    options: ['GET', 'POST', 'PUT', 'PATCH'],
    correctIndex: 1,
    explanation: 'The method property explicitly sets this to a POST request. POST is used to create new resources on the server.'
  },
  {
    id: 'cc18', topic: 'Git & Version Control', difficulty: 'Easy',
    code: `git checkout -b feature/login\n# ... make changes ...\ngit add .\ngit commit -m "Add login form"\ngit push origin feature/login`,
    question: 'What does this workflow do?',
    options: ['Deletes a branch', 'Creates a branch, commits changes, and pushes', 'Merges branches', 'Reverts changes'],
    correctIndex: 1,
    explanation: 'checkout -b creates and switches to a new branch. After making changes, add stages them, commit saves them locally, and push uploads to the remote.'
  },
  {
    id: 'cc19', topic: 'Cloud & DevOps', difficulty: 'Medium',
    code: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]`,
    question: 'What is this file?',
    options: ['package.json', 'Dockerfile', '.env file', 'nginx.conf'],
    correctIndex: 1,
    explanation: 'This is a Dockerfile that builds a Node.js container image. FROM sets the base image, COPY adds files, RUN executes commands, CMD sets the startup command.'
  },
  {
    id: 'cc20', topic: 'Testing & CI/CD', difficulty: 'Easy',
    code: `test('adds numbers', () => {\n  expect(add(1, 2)).toBe(3);\n  expect(add(-1, 1)).toBe(0);\n  expect(add(0, 0)).toBe(0);\n});`,
    question: 'What type of test is this?',
    options: ['E2E test', 'Integration test', 'Unit test', 'Stress test'],
    correctIndex: 2,
    explanation: 'This is a unit test - it tests a single function (add) in isolation with various inputs. Unit tests are the foundation of the testing pyramid.'
  },
];

// Build flashcards from all questions in the game
function buildFlashCards(): FlashCard[] {
  const cards: FlashCard[] = [];

  for (const book of LIBRARY_BOOKS) {
    for (const q of book.questions) {
      cards.push({
        id: q.id,
        question: q.text,
        answer: `${q.options[q.correctIndex]} — ${q.explanation}`,
        topic: q.topic || 'General CS',
        difficulty: q.difficulty,
        confidence: 'new',
      });
    }
  }

  for (const quest of QUESTS) {
    for (const q of quest.questions) {
      if (!cards.find(c => c.id === q.id)) {
        cards.push({
          id: q.id,
          question: q.text,
          answer: `${q.options[q.correctIndex]} — ${q.explanation}`,
          topic: q.topic || 'General CS',
          difficulty: q.difficulty,
          confidence: 'new',
        });
      }
    }
  }

  return cards;
}

function buildAchievements(user: User): Achievement[] {
  const topicsPracticed = getTopicsPracticed(user.completedQuests, user.completedBooks);
  return [
    { id: 'a1', title: 'First Steps', description: 'Complete your first quest', icon: <Sword size={20} />, unlocked: user.completedQuests.length >= 1, category: 'study', rarity: 'common' },
    { id: 'a2', title: 'Bookworm', description: 'Read 3 library books', icon: <BookOpen size={20} />, unlocked: user.completedBooks.length >= 3, category: 'study', rarity: 'common' },
    { id: 'a3', title: 'Scholar', description: 'Read all library books', icon: <GraduationCap size={20} />, unlocked: user.completedBooks.length >= LIBRARY_BOOKS.length, category: 'mastery', rarity: 'epic' },
    { id: 'a4', title: 'Algorithm Adept', description: 'Practice Algorithms topic', icon: <Brain size={20} />, unlocked: topicsPracticed.includes('Algorithms'), category: 'mastery', rarity: 'rare' },
    { id: 'a5', title: 'Data Wrangler', description: 'Practice Data Structures', icon: <Layers size={20} />, unlocked: topicsPracticed.includes('Data Structures'), category: 'mastery', rarity: 'rare' },
    { id: 'a6', title: 'Full Stack Hero', description: 'Practice both Frontend and Backend', icon: <Code size={20} />, unlocked: topicsPracticed.includes('React & Frontend') && topicsPracticed.includes('Backend & Servers'), category: 'mastery', rarity: 'epic' },
    { id: 'a7', title: 'Security Guardian', description: 'Complete Security studies', icon: <Shield size={20} />, unlocked: topicsPracticed.includes('Security'), category: 'mastery', rarity: 'rare' },
    { id: 'a8', title: 'Cloud Walker', description: 'Study Cloud & DevOps', icon: <Cloud size={20} />, unlocked: topicsPracticed.includes('Cloud & DevOps'), category: 'mastery', rarity: 'rare' },
    { id: 'a9', title: 'Level 5 Hero', description: 'Reach level 5', icon: <Star size={20} />, unlocked: user.level >= 5, category: 'study', rarity: 'common' },
    { id: 'a10', title: 'Level 10 Legend', description: 'Reach level 10', icon: <Crown size={20} />, unlocked: user.level >= 10, category: 'study', rarity: 'legendary' },
    { id: 'a11', title: 'Quest Hunter', description: 'Complete 3 quests', icon: <Target size={20} />, unlocked: user.completedQuests.length >= 3, category: 'study', rarity: 'rare' },
    { id: 'a12', title: 'Polyglot', description: 'Study 5+ different topics', icon: <MessageCircle size={20} />, unlocked: topicsPracticed.length >= 5, category: 'mastery', rarity: 'epic' },
    { id: 'a13', title: 'Dedicated Learner', description: 'Reach 1000+ XP total', icon: <TrendingUp size={20} />, unlocked: (user.level - 1) * 500 + user.xp >= 1000, category: 'study', rarity: 'common' },
    { id: 'a14', title: 'Knowledge Titan', description: 'Study 10+ topics', icon: <Award size={20} />, unlocked: topicsPracticed.length >= 10, category: 'mastery', rarity: 'legendary' },
    { id: 'a15', title: 'Bug Slayer', description: 'Complete all quests', icon: <Bug size={20} />, unlocked: user.completedQuests.length >= QUESTS.length, category: 'study', rarity: 'legendary' },
  ];
}

// ============================================================================
// SPARKLE COMPONENT
// ============================================================================

const Sparkle: React.FC<{ delay?: number; size?: number; x?: string; y?: string }> = ({ delay = 0, size = 4, x = '50%', y = '50%' }) => (
  <motion.div
    className="absolute rounded-full bg-gold-400 pointer-events-none"
    style={{ width: size, height: size, left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
  />
);

// ============================================================================
// OWL MASCOT
// ============================================================================

const OwlMascot: React.FC<{ mood?: 'idle' | 'happy' | 'studying' | 'sleeping'; size?: 'sm' | 'md' | 'lg'; message?: string }> = ({ mood = 'idle', size = 'md', message }) => {
  const [currentMessage, setCurrentMessage] = useState(message || MASCOT_MESSAGES[0]);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    if (message) { setCurrentMessage(message); setShowBubble(true); return; }
    const interval = setInterval(() => {
      setCurrentMessage(MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 5000);
    }, 8000);
    return () => clearInterval(interval);
  }, [message]);

  const sizeClass = size === 'sm' ? 'text-3xl' : size === 'md' ? 'text-5xl' : 'text-7xl';

  const owlFaces: Record<string, string> = {
    idle: '\u{1F989}',
    happy: '\u{1F973}',
    studying: '\u{1F9D0}',
    sleeping: '\u{1F634}',
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-obsidian-800/95 border border-gold-500/30 rounded-xl px-4 py-2 text-xs text-gold-300 whitespace-nowrap backdrop-blur-sm z-10 max-w-[200px] text-center"
            style={{ whiteSpace: 'normal' }}
          >
            {currentMessage}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-obsidian-800/95 border-r border-b border-gold-500/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Owl */}
      <motion.div
        className={`${sizeClass} cursor-pointer select-none`}
        animate={mood === 'sleeping' ? { rotate: [0, -5, 0] } : { y: [0, -6, 0] }}
        transition={{ duration: mood === 'sleeping' ? 3 : 2, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setCurrentMessage(MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]);
          setShowBubble(true);
          setTimeout(() => setShowBubble(false), 4000);
        }}
      >
        {owlFaces[mood]}
      </motion.div>

      {/* Glow under owl */}
      <div className="w-12 h-2 bg-gold-500/20 rounded-full blur-md mt-1" />
    </div>
  );
};

// ============================================================================
// FLOATING PARTICLES (stars for constellation)
// ============================================================================

const FloatingStars: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-gold-400/40 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          opacity: [0.2, 0.8, 0.2],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2 + Math.random() * 3,
          delay: Math.random() * 2,
          repeat: Infinity,
        }}
      />
    ))}
  </div>
);

// ============================================================================
// TAB BAR
// ============================================================================

const TabBar: React.FC<{ activeTab: HubTab; onTabChange: (tab: HubTab) => void }> = ({ activeTab, onTabChange }) => {
  const tabs: { id: HubTab; label: string; icon: React.ReactNode; emoji: string }[] = [
    { id: 'dashboard', label: 'Home', icon: <Coffee size={16} />, emoji: '\u{1F3E0}' },
    { id: 'constellation', label: 'Map', icon: <Map size={16} />, emoji: '\u{2728}' },
    { id: 'flashcards', label: 'Cards', icon: <BookOpen size={16} />, emoji: '\u{1F0CF}' },
    { id: 'challenges', label: 'Code', icon: <Code size={16} />, emoji: '\u{1F4BB}' },
    { id: 'pomodoro', label: 'Timer', icon: <Clock size={16} />, emoji: '\u{23F0}' },
    { id: 'achievements', label: 'Awards', icon: <Trophy size={16} />, emoji: '\u{1F3C6}' },
    { id: 'daily', label: 'Daily', icon: <Star size={16} />, emoji: '\u{1F31F}' },
  ];

  return (
    <div className="flex gap-1 p-1.5 bg-obsidian-900/80 backdrop-blur-lg rounded-2xl border border-gold-600/20 overflow-x-auto no-scrollbar">
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-gold-400 bg-gold-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-sm">{tab.emoji}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute inset-0 border border-gold-500/30 rounded-xl"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

// ============================================================================
// STREAK FIRE
// ============================================================================

const StreakFire: React.FC<{ streak: number }> = ({ streak }) => {
  const intensity = Math.min(streak, 7);
  return (
    <motion.div
      className="relative flex items-center gap-2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -3, 3, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Flame
          size={28}
          className={intensity > 3 ? 'text-orange-400' : intensity > 1 ? 'text-amber-400' : 'text-slate-600'}
          fill={intensity > 0 ? 'currentColor' : 'none'}
        />
        {intensity > 5 && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Sparkles size={12} className="text-yellow-300" />
          </motion.div>
        )}
      </motion.div>
      <div>
        <div className="text-xs text-slate-500 font-mono uppercase">Streak</div>
        <div className="text-lg font-bold text-gold-400 font-fantasy">{streak} days</div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// DASHBOARD TAB
// ============================================================================

const DashboardTab: React.FC<{ user: User; onTabChange: (tab: HubTab) => void }> = ({ user, onTabChange }) => {
  const topicsPracticed = getTopicsPracticed(user.completedQuests, user.completedBooks);
  const studyStreak = parseInt(localStorage.getItem('skillHero_studyStreak') || '0');
  const totalTopics = SE_TOPICS.length;
  const masteryPercent = Math.round((topicsPracticed.length / totalTopics) * 100);

  // Recommend a topic the user hasn't studied yet
  const unstudiedTopics = SE_TOPICS.filter(t => !topicsPracticed.includes(t));
  const recommendedTopic = unstudiedTopics.length > 0 ? unstudiedTopics[Math.floor(Date.now() / 86400000) % unstudiedTopics.length] : SE_TOPICS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-800/90 to-obsidian-900/90 border border-gold-500/20 p-6">
        <FloatingStars />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1">
            <motion.h2
              className="text-2xl md:text-3xl font-fantasy text-gold-400 mb-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Welcome back, {user.username}!
            </motion.h2>
            <motion.p
              className="text-slate-400 text-sm mb-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {user.title} &middot; Level {user.level}
            </motion.p>
            <LiquidBar current={user.xp} max={user.maxXp} color="gold" label="Experience" size="sm" />
          </div>
          <div className="hidden sm:block">
            <OwlMascot mood="happy" size="md" />
          </div>
        </div>

        {/* Decorative corner sparkles */}
        <Sparkle x="5%" y="10%" delay={0} size={3} />
        <Sparkle x="90%" y="15%" delay={0.5} size={4} />
        <Sparkle x="85%" y="80%" delay={1} size={3} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Level', value: user.level, icon: <Star size={16} />, color: 'text-gold-400' },
          { label: 'Quests Done', value: user.completedQuests.length, icon: <Sword size={16} />, color: 'text-red-400' },
          { label: 'Books Read', value: user.completedBooks.length, icon: <BookOpen size={16} />, color: 'text-blue-400' },
          { label: 'Topics', value: `${topicsPracticed.length}/${totalTopics}`, icon: <Brain size={16} />, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-obsidian-800/60 border border-gold-600/15 rounded-xl p-3 text-center hover:border-gold-500/30 transition-all group"
          >
            <div className={`${stat.color} mb-1 flex justify-center group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <div className="text-lg font-bold text-white font-mono">{stat.value}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Focus */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${TOPIC_COLORS[recommendedTopic]} border p-5 cursor-pointer group`}
          onClick={() => onTabChange('flashcards')}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-gold-400" />
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Today's Focus</span>
          </div>
          <div className={`text-lg font-fantasy ${TOPIC_ACCENT[recommendedTopic]} mb-1`}>
            {recommendedTopic}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {unstudiedTopics.length > 0 ? "New territory awaits! Start exploring this topic." : "Review and strengthen your knowledge."}
          </p>
          <div className="flex items-center gap-1 text-gold-400 text-xs font-bold group-hover:gap-2 transition-all">
            Study Now <ChevronRight size={14} />
          </div>

          {/* Decorative icon */}
          <div className="absolute right-4 bottom-4 opacity-10 text-6xl">
            {TOPIC_ICONS[recommendedTopic]}
          </div>
        </motion.div>

        {/* Mastery Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-obsidian-800/60 border border-gold-600/15 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Mastery</span>
            </div>
            <span className="text-2xl font-bold text-white font-mono">{masteryPercent}%</span>
          </div>

          {/* Mastery ring */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" stroke="url(#masteryGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - masteryPercent / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="masteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-slate-400 font-mono">{topicsPracticed.length}/{totalTopics}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onTabChange('constellation')}
            className="w-full text-center text-xs text-gold-400 hover:text-gold-300 font-bold flex items-center justify-center gap-1 transition-colors"
          >
            View Knowledge Map <ChevronRight size={12} />
          </button>
        </motion.div>
      </div>

      {/* Quick Access Topics */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Hash size={14} /> Topic Explorer
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {SE_TOPICS.slice(0, 10).map((topic, i) => {
            const practiced = topicsPracticed.includes(topic);
            return (
              <motion.button
                key={topic}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('flashcards')}
                className={`relative p-3 rounded-xl border text-center transition-all ${
                  practiced
                    ? `bg-gradient-to-br ${TOPIC_COLORS[topic]}`
                    : 'bg-obsidian-800/40 border-gold-600/10 hover:border-gold-500/30'
                }`}
              >
                <div className={`flex justify-center mb-1 ${practiced ? TOPIC_ACCENT[topic] : 'text-slate-600'}`}>
                  {TOPIC_ICONS[topic]}
                </div>
                <div className={`text-[10px] font-bold ${practiced ? 'text-slate-300' : 'text-slate-600'} truncate`}>
                  {topic.split(' ')[0]}
                </div>
                {practiced && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// CONSTELLATION TAB
// ============================================================================

const ConstellationTab: React.FC<{ user: User }> = ({ user }) => {
  const topicsPracticed = getTopicsPracticed(user.completedQuests, user.completedBooks);
  const [hoveredTopic, setHoveredTopic] = useState<SETopic | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SETopic | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="text-center mb-2">
        <h2 className="text-xl font-fantasy text-gold-400 mb-1">Knowledge Constellation</h2>
        <p className="text-xs text-slate-500">Your journey through the stars of knowledge</p>
      </div>

      {/* Constellation Map */}
      <div className="relative w-full aspect-square max-w-lg mx-auto bg-obsidian-900/80 rounded-2xl border border-gold-500/10 overflow-hidden">
        <FloatingStars />

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {CONSTELLATION_NODES.map(node =>
            node.connections.map(conn => {
              const target = CONSTELLATION_NODES.find(n => n.topic === conn);
              if (!target) return null;
              const bothPracticed = topicsPracticed.includes(node.topic) && topicsPracticed.includes(conn);
              return (
                <line
                  key={`${node.topic}-${conn}`}
                  x1={`${node.x}%`} y1={`${node.y}%`}
                  x2={`${target.x}%`} y2={`${target.y}%`}
                  stroke={bothPracticed ? 'rgba(251,191,36,0.4)' : 'rgba(148,163,184,0.1)'}
                  strokeWidth={bothPracticed ? 2 : 1}
                  strokeDasharray={bothPracticed ? 'none' : '4,4'}
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {CONSTELLATION_NODES.map((node, i) => {
          const practiced = topicsPracticed.includes(node.topic);
          const isHovered = hoveredTopic === node.topic;
          const isSelected = selectedTopic === node.topic;

          return (
            <motion.div
              key={node.topic}
              className="absolute z-20 flex flex-col items-center cursor-pointer"
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, type: 'spring' }}
              onHoverStart={() => setHoveredTopic(node.topic)}
              onHoverEnd={() => setHoveredTopic(null)}
              onClick={() => setSelectedTopic(isSelected ? null : node.topic)}
            >
              {/* Glow ring */}
              {practiced && (
                <motion.div
                  className="absolute w-10 h-10 rounded-full bg-gold-500/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ type: 'tween', duration: 3, repeat: Infinity }}
                />
              )}

              {/* Node circle */}
              <motion.div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  practiced
                    ? 'bg-gold-500/30 border-gold-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                    : 'bg-obsidian-800/80 border-slate-700 hover:border-slate-500'
                }`}
                animate={practiced ? { boxShadow: ['0 0 8px rgba(251,191,36,0.3)', '0 0 16px rgba(251,191,36,0.6)', '0 0 8px rgba(251,191,36,0.3)'] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.3 }}
              >
                <div className={`${practiced ? 'text-gold-400' : 'text-slate-600'}`} style={{ fontSize: 12 }}>
                  {TOPIC_ICONS[node.topic]}
                </div>
              </motion.div>

              {/* Label */}
              <div className={`mt-1 text-[9px] font-bold text-center max-w-[60px] leading-tight ${
                practiced ? 'text-gold-300' : 'text-slate-600'
              } ${isHovered ? 'text-white' : ''}`}>
                {node.topic.split('&')[0].trim()}
              </div>

              {/* Tooltip on select */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 bg-obsidian-800/95 border border-gold-500/30 rounded-xl p-3 z-50 min-w-[140px] backdrop-blur-sm"
                  >
                    <div className={`text-xs font-bold ${TOPIC_ACCENT[node.topic]} mb-1`}>{node.topic}</div>
                    <div className="text-[10px] text-slate-400">
                      {practiced ? 'Explored! Review to strengthen.' : 'Unexplored territory. Begin your journey!'}
                    </div>
                    <div className={`mt-1 text-[10px] font-bold ${practiced ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {practiced ? 'Studied' : 'Locked'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gold-500/30 border border-gold-400" />
          <span>Studied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-obsidian-800 border border-slate-700" />
          <span>Unexplored</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// FLASHCARD TAB
// ============================================================================

const FlashcardTab: React.FC<{ user: User }> = ({ user }) => {
  const allCards = useMemo(() => buildFlashCards(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardConfidence, setCardConfidence] = useState<Record<string, FlashCard['confidence']>>({});
  const [shuffled, setShuffled] = useState<FlashCard[]>([]);
  const [topicFilter, setTopicFilter] = useState<SETopic | 'all'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('skillHero_cardConfidence');
    if (saved) try { setCardConfidence(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('skillHero_cardConfidence', JSON.stringify(cardConfidence));
  }, [cardConfidence]);

  useEffect(() => {
    let filtered = topicFilter === 'all' ? [...allCards] : allCards.filter(c => c.topic === topicFilter);
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    setShuffled(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [allCards, topicFilter]);

  const currentCard = shuffled[currentIndex];
  if (!currentCard) return (
    <div className="text-center text-slate-500 py-20">
      <BookOpen size={48} className="mx-auto mb-4 text-slate-700" />
      <p>No flashcards available for this topic yet.</p>
    </div>
  );

  const confidence = cardConfidence[currentCard.id] || 'new';
  const confidenceColors = {
    new: 'border-slate-600 bg-slate-800/20',
    learning: 'border-orange-500/40 bg-orange-500/10',
    familiar: 'border-blue-500/40 bg-blue-500/10',
    mastered: 'border-emerald-500/40 bg-emerald-500/10',
  };
  const confidenceLabels = { new: 'New', learning: 'Learning', familiar: 'Familiar', mastered: 'Mastered' };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(i => (i + 1) % shuffled.length), 200);
  };

  const markConfidence = (level: FlashCard['confidence']) => {
    setCardConfidence(prev => ({ ...prev, [currentCard.id]: level }));
    nextCard();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-fantasy text-gold-400">Flashcards</h2>
          <p className="text-xs text-slate-500">{currentIndex + 1} of {shuffled.length} cards</p>
        </div>
        <select
          value={topicFilter}
          onChange={e => setTopicFilter(e.target.value as SETopic | 'all')}
          className="bg-obsidian-800 border border-gold-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-gold-500/50"
        >
          <option value="all">All Topics</option>
          {SE_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Confidence bar */}
      <div className="flex gap-1">
        {shuffled.map((card, i) => (
          <div
            key={card.id}
            className={`h-1 flex-1 rounded-full transition-all ${
              i === currentIndex ? 'bg-gold-400' :
              i < currentIndex ? 'bg-gold-500/30' : 'bg-slate-800'
            }`}
            style={{ maxWidth: '20px' }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="perspective-1000 mx-auto max-w-md" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative w-full aspect-[3/4] cursor-pointer preserve-3d"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 ${confidenceColors[confidence]} p-6 flex flex-col justify-between backface-hidden`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${TOPIC_COLORS[currentCard.topic]} ${TOPIC_ACCENT[currentCard.topic]} border`}>
                  {currentCard.topic}
                </span>
                <span className={`text-xs font-mono ${
                  currentCard.difficulty === 'Easy' ? 'text-emerald-400' :
                  currentCard.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {currentCard.difficulty}
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg text-white font-bold text-center leading-relaxed">{currentCard.question}</p>
              </div>
            </div>
            <div className="text-center text-xs text-slate-600 flex items-center justify-center gap-1">
              <RotateCcw size={10} /> Tap to reveal answer
            </div>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 border-gold-500/30 bg-gradient-to-br from-obsidian-800/95 to-obsidian-900/95 p-6 flex flex-col justify-between`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div>
              <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                <Sparkles size={12} /> Answer
              </div>
              <p className="text-base text-emerald-300 font-bold leading-relaxed mb-4">{currentCard.answer}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-wider">How well did you know this?</p>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={e => { e.stopPropagation(); markConfidence('learning'); }}
                  className="py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-all"
                >
                  Study More
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={e => { e.stopPropagation(); markConfidence('mastered'); }}
                  className="py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                >
                  Got it!
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentIndex(i => Math.max(0, i - 1)), 200); }}
          className="p-3 rounded-full bg-obsidian-800/60 border border-gold-600/20 text-slate-400 hover:text-white hover:border-gold-500/40 transition-all"
        >
          <ChevronLeft size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            let cards = topicFilter === 'all' ? [...allCards] : allCards.filter(c => c.topic === topicFilter);
            for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
            setShuffled(cards);
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className="p-3 rounded-full bg-obsidian-800/60 border border-gold-600/20 text-slate-400 hover:text-white hover:border-gold-500/40 transition-all"
        >
          <RefreshCw size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextCard}
          className="p-3 rounded-full bg-obsidian-800/60 border border-gold-600/20 text-slate-400 hover:text-white hover:border-gold-500/40 transition-all"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* Confidence legend */}
      <div className="flex justify-center gap-3 flex-wrap">
        {Object.entries(confidenceLabels).map(([key, label]) => {
          const count = shuffled.filter(c => (cardConfidence[c.id] || 'new') === key).length;
          return (
            <div key={key} className="flex items-center gap-1 text-[10px] text-slate-500">
              <div className={`w-2 h-2 rounded-full border ${confidenceColors[key as FlashCard['confidence']]}`} />
              {label} ({count})
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ============================================================================
// CODE CHALLENGE TAB
// ============================================================================

const CodeChallengeTab: React.FC<{ user: User; onGainXp?: (amount: number) => void; telemetryUserId?: string | null; recentAttempts: AttemptLite[] }> = ({ user, onGainXp, telemetryUserId, recentAttempts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const challengeStartedAtRef = useRef<number>(Date.now());
  const orderedChallenges = useMemo(() => {
    const prioritized = [...CODE_CHALLENGES]
      .map((challenge) => ({
        challenge,
        priority: scoreAdaptivePriority(challenge.id, challenge.topic, recentAttempts),
      }))
      .sort((a, b) => b.priority - a.priority)
      .map((item) => item.challenge);
    return prioritized.length ? prioritized : CODE_CHALLENGES;
  }, [recentAttempts]);

  useEffect(() => {
    setCurrentIndex(0);
    challengeStartedAtRef.current = Date.now();
  }, [orderedChallenges]);

  const challenge = orderedChallenges[currentIndex % orderedChallenges.length];
  const isCorrect = selectedAnswer === challenge.correctIndex;

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const isCorrectAnswer = index === challenge.correctIndex;
    void recordQuestionAttempt({
      userId: telemetryUserId,
      questionId: challenge.id,
      source: 'CODE_CHALLENGE',
      topic: challenge.topic,
      difficulty: challenge.difficulty,
      isCorrect: isCorrectAnswer,
      responseMs: Date.now() - challengeStartedAtRef.current,
      metadata: { type: 'code-challenge' },
    });

    if (isCorrectAnswer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setTotalCorrect(prev => prev + 1);
      if (newStreak % 3 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        onGainXp?.(25 * newStreak);
      }
    } else {
      setStreak(0);
    }
  };

  const nextChallenge = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentIndex(i => (i + 1) % orderedChallenges.length);
    challengeStartedAtRef.current = Date.now();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Header with streak */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-fantasy text-gold-400">Code Arena</h2>
          <p className="text-xs text-slate-500">Read the code, predict the output</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Score</div>
            <div className="text-lg font-mono font-bold text-white">{totalCorrect}</div>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 rounded-lg px-2 py-1"
            >
              <Flame size={14} className="text-orange-400" fill="currentColor" />
              <span className="text-sm font-bold text-orange-400">{streak}x</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ type: 'tween', duration: 0.45, ease: 'easeOut' }}
              className="text-4xl font-fantasy text-gold-400"
            >
              Combo x{streak}!
            </motion.div>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#a855f7'][i % 5] }}
                initial={{ x: 0, y: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 1, delay: i * 0.03 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Display */}
      <div className="rounded-2xl bg-[#0d1117] border border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-slate-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono ml-2">{challenge.topic}</span>
          <span className={`ml-auto text-[10px] font-mono ${
            challenge.difficulty === 'Easy' ? 'text-emerald-400' :
            challenge.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
          }`}>{challenge.difficulty}</span>
        </div>
        <pre className="p-4 text-sm font-mono text-slate-200 overflow-x-auto">
          <code>{challenge.code}</code>
        </pre>
      </div>

      {/* Question */}
      <p className="text-sm text-white font-bold text-center">{challenge.question}</p>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2">
        {challenge.options.map((option, i) => {
          let optionStyle = 'bg-obsidian-800/60 border-gold-600/20 text-slate-300 hover:border-gold-500/40 hover:bg-obsidian-800/80';

          if (showResult) {
            if (i === challenge.correctIndex) {
              optionStyle = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
            } else if (i === selectedAnswer && !isCorrect) {
              optionStyle = 'bg-red-500/10 border-red-500/50 text-red-400';
            } else {
              optionStyle = 'bg-obsidian-800/30 border-gold-600/10 text-slate-600';
            }
          }

          return (
            <motion.button
              key={i}
              whileHover={!showResult ? { scale: 1.02, x: 4 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left p-3 rounded-xl border text-sm font-mono transition-all ${optionStyle}`}
              disabled={showResult}
            >
              <span className="text-slate-600 mr-2">{String.fromCharCode(65 + i)}.</span>
              {option}
              {showResult && i === challenge.correctIndex && (
                <Check size={16} className="inline ml-2 text-emerald-400" />
              )}
              {showResult && i === selectedAnswer && !isCorrect && (
                <X size={16} className="inline ml-2 text-red-400" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation & Next */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className={`p-4 rounded-xl border ${
              isCorrect
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <><Check size={16} className="text-emerald-400" /><span className="text-sm font-bold text-emerald-400">Correct!</span></>
                ) : (
                  <><X size={16} className="text-red-400" /><span className="text-sm font-bold text-red-400">Not quite!</span></>
                )}
              </div>
              <p className="text-xs text-slate-400">{challenge.explanation}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextChallenge}
              className="w-full py-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 font-bold text-sm hover:bg-gold-500/20 transition-all flex items-center justify-center gap-2"
            >
              Next Challenge <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// POMODORO TIMER TAB
// ============================================================================

const PomodoroTab: React.FC<{ onGainXp?: (amount: number) => void }> = ({ onGainXp }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [sessions, setSessions] = useState(0);
  const totalTime = isBreak ? 5 * 60 : 25 * 60;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            onGainXp?.(50);
            setIsBreak(true);
            return 5 * 60;
          } else {
            setIsBreak(false);
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak, sessions, onGainXp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 text-center"
    >
      <div>
        <h2 className="text-xl font-fantasy text-gold-400 mb-1">Study Timer</h2>
        <p className="text-xs text-slate-500">{isBreak ? 'Take a break! You earned it.' : 'Focus time. You got this!'}</p>
      </div>

      {/* Mascot */}
      <OwlMascot
        mood={isRunning ? 'studying' : isBreak ? 'sleeping' : 'idle'}
        size="sm"
        message={isRunning ? (isBreak ? 'Rest well, hero...' : 'Studying hard!') : 'Ready when you are!'}
      />

      {/* Timer Ring */}
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          {/* Progress ring */}
          <motion.circle
            cx="100" cy="100" r="80" fill="none"
            stroke={isBreak ? '#10b981' : '#fbbf24'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
            transition={{ duration: 0.5 }}
          />
          {/* Inner glow */}
          <circle cx="100" cy="100" r="70" fill="rgba(251,191,36,0.02)" />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-mono font-bold text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${isBreak ? 'text-emerald-400' : 'text-gold-400'}`}>
            {isBreak ? 'Break' : 'Focus'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsRunning(!isRunning)}
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
            isRunning
              ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
              : 'bg-gold-500/10 border-gold-500/50 text-gold-400 hover:bg-gold-500/20'
          }`}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsRunning(false);
            setIsBreak(false);
            setTimeLeft(25 * 60);
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 bg-obsidian-800/60 border-gold-600/20 text-slate-400 hover:text-white hover:border-gold-500/40 transition-all"
        >
          <RotateCcw size={20} />
        </motion.button>
      </div>

      {/* Sessions completed */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: Math.max(4, sessions) }).map((_, i) => (
          <motion.div
            key={i}
            initial={i === sessions - 1 ? { scale: 0 } : {}}
            animate={{ scale: 1 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
              i < sessions
                ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                : 'bg-obsidian-800/40 border-gold-600/10 text-slate-700'
            }`}
          >
            {i < sessions ? <Check size={10} /> : (i + 1)}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500">{sessions} sessions completed (+{sessions * 50} XP earned)</p>
    </motion.div>
  );
};

// ============================================================================
// ACHIEVEMENTS TAB
// ============================================================================

const AchievementsTab: React.FC<{ user: User }> = ({ user }) => {
  const achievements = buildAchievements(user);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const rarityStyles = {
    common: 'border-slate-600 bg-slate-800/20',
    rare: 'border-blue-500/40 bg-blue-500/10',
    epic: 'border-purple-500/40 bg-purple-500/10',
    legendary: 'border-gold-500/40 bg-gold-500/10',
  };
  const rarityGlow = {
    common: '',
    rare: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    epic: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    legendary: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="text-center">
        <h2 className="text-xl font-fantasy text-gold-400 mb-1">Achievement Wall</h2>
        <p className="text-xs text-slate-500">{unlockedCount} of {achievements.length} unlocked</p>
      </div>

      {/* Progress bar */}
      <div className="max-w-xs mx-auto">
        <LiquidBar current={unlockedCount} max={achievements.length} color="gold" label="Achievements" size="sm" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {achievements.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.03 * i, type: 'spring' }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAchievement(selectedAchievement?.id === achievement.id ? null : achievement)}
            className={`relative p-3 rounded-xl border text-center cursor-pointer transition-all ${
              achievement.unlocked
                ? `${rarityStyles[achievement.rarity]} ${rarityGlow[achievement.rarity]}`
                : 'bg-obsidian-900/40 border-gold-600/10 opacity-40 grayscale'
            }`}
          >
            <div className={`mb-1 flex justify-center ${
              achievement.unlocked ? (
                achievement.rarity === 'legendary' ? 'text-gold-400' :
                achievement.rarity === 'epic' ? 'text-purple-400' :
                achievement.rarity === 'rare' ? 'text-blue-400' : 'text-slate-400'
              ) : 'text-slate-700'
            }`}>
              {achievement.unlocked ? achievement.icon : <Lock size={20} />}
            </div>
            <div className="text-[9px] font-bold text-slate-400 leading-tight">{achievement.title}</div>

            {/* Sparkle on legendary unlocked */}
            {achievement.unlocked && achievement.rarity === 'legendary' && (
              <>
                <Sparkle x="10%" y="10%" delay={0} size={3} />
                <Sparkle x="80%" y="20%" delay={0.7} size={2} />
                <Sparkle x="50%" y="80%" delay={1.3} size={3} />
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected detail */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`p-4 rounded-xl border ${rarityStyles[selectedAchievement.rarity]} text-center`}
          >
            <div className="text-sm font-bold text-white mb-1">{selectedAchievement.title}</div>
            <div className="text-xs text-slate-400 mb-2">{selectedAchievement.description}</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${
              selectedAchievement.unlocked ? 'text-emerald-400' : 'text-slate-600'
            }`}>
              {selectedAchievement.unlocked ? 'Unlocked' : 'Locked'}
            </div>
            <div className={`text-[10px] uppercase tracking-widest mt-1 ${
              selectedAchievement.rarity === 'legendary' ? 'text-gold-400' :
              selectedAchievement.rarity === 'epic' ? 'text-purple-400' :
              selectedAchievement.rarity === 'rare' ? 'text-blue-400' : 'text-slate-500'
            }`}>
              {selectedAchievement.rarity}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// DAILY QUIZ TAB
// ============================================================================

const DailyQuizTab: React.FC<{ user: User; onGainXp?: (amount: number) => void; telemetryUserId?: string | null; recentAttempts: AttemptLite[] }> = ({ user, onGainXp, telemetryUserId, recentAttempts }) => {
  const localDateKey = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);
  const daySeed = useMemo(() => {
    const [y, m, d] = localDateKey.split('-').map(Number);
    return Math.floor(new Date(y, m - 1, d).getTime() / 86400000);
  }, [localDateKey]);
  const seededTopic = SE_TOPICS[daySeed % SE_TOPICS.length];
  const todayTopic = useMemo(
    () => pickWeakestTopic(SE_TOPICS, recentAttempts, seededTopic),
    [recentAttempts, seededTopic]
  );

  // Gather all questions for this topic
  const allQuestions = useMemo(() => {
    const qs: Question[] = [];
    for (const book of LIBRARY_BOOKS) {
      for (const q of book.questions) {
        if (q.topic === todayTopic) qs.push(q);
      }
    }
    for (const quest of QUESTS) {
      for (const q of quest.questions) {
        if (q.topic === todayTopic && !qs.find(x => x.id === q.id)) qs.push(q);
      }
    }
    // If not enough topic questions, pad with general
    if (qs.length < 5) {
      for (const book of LIBRARY_BOOKS) {
        for (const q of book.questions) {
          if (!qs.find(x => x.id === q.id) && qs.length < 5) qs.push(q);
        }
      }
    }
    const prioritized = qs
      .map((q) => ({
        question: q,
        priority: scoreAdaptivePriority(q.id, q.topic, recentAttempts),
      }))
      .sort((a, b) => b.priority - a.priority)
      .map((item) => item.question);
    return prioritized.slice(0, 5);
  }, [todayTopic, recentAttempts]);

  const [aiQuestions, setAiQuestions] = useState<Question[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPracticeMode, setAiPracticeMode] = useState(false);
  const activeQuestions = aiQuestions && aiQuestions.length > 0 ? aiQuestions : allQuestions;
  const xpPerQuestion = aiPracticeMode ? 25 : 30;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const questionStartedAtRef = useRef<number>(Date.now());

  const userScope = encodeURIComponent((user.username || 'guest').toLowerCase());
  const todayKey = `skillHero_daily_${userScope}_${localDateKey}`;
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(todayKey);
    if (done) setAlreadyDone(true);
  }, [todayKey]);

  useEffect(() => {
    setAnswers(new Array(activeQuestions.length).fill(null));
    setCurrentQ(0);
    setShowResult(false);
    setCompleted(false);
    questionStartedAtRef.current = Date.now();
  }, [activeQuestions]);

  const question = activeQuestions[currentQ];
  const correctCount = answers.filter((a, i) => a === activeQuestions[i]?.correctIndex).length;

  const summonAIQuiz = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const generated = await generateAIQuiz(todayTopic, 5);
      setAiQuestions(generated);
      setAiPracticeMode(true);
    } catch (err: any) {
      setAiError(err?.message || 'Failed to generate AI quiz.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    const currentQuestion = activeQuestions[currentQ];
    if (currentQuestion) {
      void recordQuestionAttempt({
        userId: telemetryUserId,
        questionId: currentQuestion.id,
        source: 'DAILY_QUIZ',
        topic: currentQuestion.topic,
        difficulty: currentQuestion.difficulty,
        isCorrect: index === currentQuestion.correctIndex,
        responseMs: Date.now() - questionStartedAtRef.current,
        metadata: { topicOfDay: todayTopic },
      });
    }
    const newAnswers = [...answers];
    newAnswers[currentQ] = index;
    setAnswers(newAnswers);
    setShowResult(true);
  };

  const next = () => {
    setShowResult(false);
    if (currentQ < activeQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      questionStartedAtRef.current = Date.now();
    } else {
      setCompleted(true);
      if (!aiPracticeMode) localStorage.setItem(todayKey, 'true');
      const xpReward = correctCount * xpPerQuestion;
      if (xpReward > 0) onGainXp?.(xpReward);
    }
  };

  if (alreadyDone && !aiPracticeMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 space-y-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          \u{2705}
        </motion.div>
        <h2 className="text-xl font-fantasy text-gold-400">Daily Complete!</h2>
        <p className="text-sm text-slate-400">You've already completed today's daily quiz. Come back tomorrow!</p>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Clock size={12} />
          <span>Next quiz resets at midnight</span>
        </div>
        <div className="pt-2">
          <FantasyButton onClick={summonAIQuiz} variant="primary" size="sm" icon={<Sparkles size={14} />}>
            {aiLoading ? 'Summoning...' : 'Practice with AI Questions'}
          </FantasyButton>
          {aiError && <div className="mt-2 text-xs text-red-400">{aiError}</div>}
        </div>
      </motion.div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
          className="text-5xl"
        >
          {correctCount === activeQuestions.length ? '\u{1F3C6}' : correctCount >= 3 ? '\u{2B50}' : '\u{1F4AA}'}
        </motion.div>
        <h2 className="text-2xl font-fantasy text-gold-400">
          {correctCount === activeQuestions.length ? 'Perfect Score!' : correctCount >= 3 ? 'Great Job!' : 'Keep Studying!'}
        </h2>
        <p className="text-lg text-white font-mono">{correctCount}/{activeQuestions.length} Correct</p>
        <p className="text-sm text-emerald-400 font-bold">+{correctCount * xpPerQuestion} XP earned!</p>

        <div className="flex justify-center gap-1 mt-4">
          {activeQuestions.map((q, i) => (
            <div
              key={q.id}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                answers[i] === q.correctIndex
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {answers[i] === q.correctIndex ? <Check size={12} /> : <X size={12} />}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (!question) return <div className="text-center text-slate-500 py-20">No questions available today.</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-fantasy text-gold-400 mb-1">Daily Challenge</h2>
        <div className="mb-2 flex justify-center gap-2">
          <FantasyButton onClick={summonAIQuiz} variant="secondary" size="sm" icon={<Sparkles size={14} />}>
            {aiLoading ? 'Summoning...' : 'Summon AI Set'}
          </FantasyButton>
          {aiPracticeMode && (
            <FantasyButton
              onClick={() => { setAiQuestions(null); setAiPracticeMode(false); setAiError(null); }}
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={14} />}
            >
              Back to Daily
            </FantasyButton>
          )}
        </div>
        {aiError && <div className="mb-2 text-xs text-red-400">{aiError}</div>}
        <div className={`text-xs font-bold px-3 py-1 rounded-lg inline-flex items-center gap-1.5 ${TOPIC_COLORS[todayTopic]} ${TOPIC_ACCENT[todayTopic]} border`}>
          {TOPIC_ICONS[todayTopic]} {todayTopic} {aiPracticeMode ? '• AI Drill' : '• Daily'}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {activeQuestions.map((_, i) => (
          <div
            key={i}
            className={`w-8 h-2 rounded-full transition-all ${
              i === currentQ ? 'bg-gold-400' :
              i < currentQ ? (answers[i] === activeQuestions[i]?.correctIndex ? 'bg-emerald-500' : 'bg-red-500') :
              'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="bg-obsidian-800/60 border border-gold-600/15 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500 font-mono">Question {currentQ + 1}/{activeQuestions.length}</span>
          <span className={`text-xs font-mono ${
            question.difficulty === 'Easy' ? 'text-emerald-400' :
            question.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
          }`}>{question.difficulty}</span>
        </div>
        <p className="text-base text-white font-bold mb-6">{question.text}</p>

        <div className="space-y-2">
          {question.options.map((option, i) => {
            let style = 'bg-obsidian-900/60 border-gold-600/20 text-slate-300 hover:border-gold-500/40';
            if (showResult) {
              if (i === question.correctIndex) style = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
              else if (i === answers[currentQ]) style = 'bg-red-500/10 border-red-500/50 text-red-400';
              else style = 'bg-obsidian-900/30 border-gold-600/10 text-slate-600';
            }
            return (
              <motion.button
                key={i}
                whileHover={!showResult ? { x: 4 } : {}}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${style}`}
              >
                <span className="font-mono text-slate-600 mr-2">{String.fromCharCode(65 + i)}.</span>
                {option}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Explanation & Next */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }}
          >
            <div className={`p-3 rounded-xl border mb-3 ${
              answers[currentQ] === question.correctIndex
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <p className="text-xs text-slate-400">{question.explanation}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={next}
              className="w-full py-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 font-bold text-sm flex items-center justify-center gap-2"
            >
              {currentQ < activeQuestions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// MAIN STUDY HUB
// ============================================================================

const StudyHub: React.FC<StudyHubProps> = ({ user, onBack, onNavigate, onStudyReward, telemetryUserId }) => {
  const [activeTab, setActiveTab] = useState<HubTab>('dashboard');
  const [recentAttempts, setRecentAttempts] = useState<AttemptLite[]>([]);
  const [studyState, setStudyState] = useState<RewardState>(() => loadRewardState(user.username) ?? createInitialRewardState());
  const [rewardFlash, setRewardFlash] = useState<RewardResult | null>(null);
  const studyStateRef = useRef<RewardState>(studyState);

  useEffect(() => {
    const loaded = loadRewardState(user.username) ?? createInitialRewardState();
    setStudyState(loaded);
    studyStateRef.current = loaded;
  }, [user.username]);

  useEffect(() => {
    studyStateRef.current = studyState;
  }, [studyState]);

  useEffect(() => {
    const buffered = readBufferedAttempts(1500);
    setRecentAttempts(
      buffered.map((row) => ({
        questionId: row.questionId,
        topic: row.topic || null,
        isCorrect: row.isCorrect,
        attemptedAt: row.attemptedAt,
      }))
    );
  }, [telemetryUserId]);

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

  const studyRank = useMemo(() => getStudyRank(studyState.totalStudyXp), [studyState.totalStudyXp]);
  const dailyTarget = DAILY_TARGET;
  const weeklyTarget = WEEKLY_TARGET;
  const perkCatalog = useMemo(() => getPerkCatalog(), []);
  const consumableCatalog = useMemo(() => getConsumableCatalog(), []);

  const handlePurchasePerk = useCallback((perkId: PerkId) => {
    const result = purchasePerk(studyStateRef.current, perkId);
    if (!result.ok) {
      if (result.reason === 'maxed') {
        setRewardFlash(null);
      }
      return;
    }
    studyStateRef.current = result.nextState;
    setStudyState(result.nextState);
    saveRewardState(result.nextState, user.username);
    setRewardFlash(null);
  }, [user.username]);

  const handleBuyConsumable = useCallback((consumableId: ConsumableId) => {
    const result = purchaseConsumable(studyStateRef.current, consumableId);
    if (!result.ok) return;
    studyStateRef.current = result.nextState;
    setStudyState(result.nextState);
    saveRewardState(result.nextState, user.username);
  }, [user.username]);

  const handleActivateConsumable = useCallback((consumableId: ConsumableId) => {
    const result = activateConsumable(studyStateRef.current, consumableId);
    if (!result.ok) return;
    studyStateRef.current = result.nextState;
    setStudyState(result.nextState);
    saveRewardState(result.nextState, user.username);
  }, [user.username]);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab user={user} onTabChange={setActiveTab} />;
      case 'constellation': return <ConstellationTab user={user} />;
      case 'flashcards': return <FlashcardTab user={user} />;
      case 'challenges': return <CodeChallengeTab user={user} onGainXp={handleStudyReward} telemetryUserId={telemetryUserId} recentAttempts={recentAttempts} />;
      case 'pomodoro': return <PomodoroTab onGainXp={handleStudyReward} />;
      case 'achievements': return <AchievementsTab user={user} />;
      case 'daily': return <DailyQuizTab user={user} onGainXp={handleStudyReward} telemetryUserId={telemetryUserId} recentAttempts={recentAttempts} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 relative">
      {/* Background atmosphere */}
      <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-stardust opacity-5 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 hover:border-gold-500/30 transition-all"
          >
            <ArrowLeft size={18} />
          </motion.button>

          <h1 className="text-lg font-fantasy text-gold-400 tracking-wide flex items-center gap-2">
            <Sparkles size={16} className="text-gold-500" />
            Study Hub
          </h1>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 font-mono">Lv.{user.level}</div>
            <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-sm">
              {'\u{1F989}'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="rounded-xl border border-gold-600/20 bg-obsidian-800/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Rank</div>
            <div className="text-sm text-gold-400 font-bold flex items-center gap-1"><Crown size={13} />{studyRank}</div>
          </div>
          <div className="rounded-xl border border-gold-600/20 bg-obsidian-800/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Gold</div>
            <div className="text-sm text-amber-300 font-bold flex items-center gap-1"><Trophy size={13} />{studyState.gold}</div>
          </div>
          <div className="rounded-xl border border-gold-600/20 bg-obsidian-800/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Shards</div>
            <div className="text-sm text-cyan-300 font-bold flex items-center gap-1"><Star size={13} />{studyState.shards}</div>
          </div>
          <div className="rounded-xl border border-gold-600/20 bg-obsidian-800/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Combo</div>
            <div className="text-sm text-red-300 font-bold flex items-center gap-1"><Flame size={13} />x{studyState.combo}</div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gold-600/20 bg-gradient-to-r from-obsidian-900/70 to-obsidian-800/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gold-400 font-bold uppercase tracking-widest">Daily Raid</span>
            <span className="text-slate-400 font-mono">{Math.min(studyState.dailyActions, dailyTarget)}/{dailyTarget}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-black/40 overflow-hidden border border-gold-600/20">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-600 to-amber-400"
              animate={{ width: `${Math.min(100, (studyState.dailyActions / dailyTarget) * 100)}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-cyan-400 font-bold uppercase tracking-widest">Weekly Raid</span>
            <span className="text-slate-400 font-mono">{Math.min(studyState.weeklyActions, weeklyTarget)}/{weeklyTarget}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-black/40 overflow-hidden border border-cyan-600/20">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-600 to-sky-400"
              animate={{ width: `${Math.min(100, (studyState.weeklyActions / weeklyTarget) * 100)}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gold-600/20 bg-obsidian-900/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest font-bold text-gold-400">Perk Forge</span>
            <span className="text-[10px] text-slate-500">Spend Gold + Shards</span>
          </div>
          <div className="space-y-2">
            {perkCatalog.map((perk) => {
              const level = studyState.perks[perk.id] || 0;
              const maxed = level >= perk.maxLevel;
              const canBuy = !maxed && studyState.gold >= perk.goldCost && studyState.shards >= perk.shardCost;
              return (
                <div key={perk.id} className="rounded-lg border border-gold-600/15 bg-black/25 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm text-white font-bold">{perk.name} <span className="text-gold-400 text-xs">Lv.{level}/{perk.maxLevel}</span></div>
                      <div className="text-[10px] text-slate-500">{perk.description}</div>
                    </div>
                    <FantasyButton
                      size="sm"
                      variant={canBuy ? 'primary' : 'ghost'}
                      onClick={() => handlePurchasePerk(perk.id)}
                      disabled={!canBuy}
                    >
                      {maxed ? 'Maxed' : `${perk.goldCost}G • ${perk.shardCost}S`}
                    </FantasyButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-cyan-600/20 bg-obsidian-900/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-300">Arcane Market</span>
            <span className="text-[10px] text-slate-500">Consumables + Temporary Buffs</span>
          </div>
          <div className="space-y-2">
            {consumableCatalog.map((consumable) => {
              const stock = studyState.inventory[consumable.id] || 0;
              const activeLeft = studyState.activeBuffs[consumable.id] || 0;
              const canBuy = studyState.gold >= consumable.goldCost && studyState.shards >= consumable.shardCost;
              const canUse = stock > 0 && activeLeft <= 0;
              return (
                <div key={consumable.id} className="rounded-lg border border-cyan-700/20 bg-black/25 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm text-white font-bold">
                        {consumable.name}
                        <span className="text-cyan-300 text-xs ml-2">x{stock}</span>
                        {activeLeft > 0 && <span className="text-emerald-300 text-xs ml-2">Active: {activeLeft}</span>}
                      </div>
                      <div className="text-[10px] text-slate-500">{consumable.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FantasyButton
                        size="sm"
                        variant={canBuy ? 'primary' : 'ghost'}
                        onClick={() => handleBuyConsumable(consumable.id)}
                        disabled={!canBuy}
                      >
                        {consumable.goldCost}G • {consumable.shardCost}S
                      </FantasyButton>
                      <FantasyButton
                        size="sm"
                        variant={canUse ? 'secondary' : 'ghost'}
                        onClick={() => handleActivateConsumable(consumable.id)}
                        disabled={!canUse}
                      >
                        {activeLeft > 0 ? 'Active' : 'Use'}
                      </FantasyButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="mb-6">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}>
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom safe area spacer for mobile */}
      <div className="h-8" />

      <AnimatePresence>
        {rewardFlash && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[220] px-4 py-2 rounded-xl border border-gold-500/40 bg-obsidian-900/90 backdrop-blur-md text-xs text-slate-200 flex items-center gap-3"
          >
            <span className="text-emerald-400 font-bold">+{rewardFlash.xpAward} XP</span>
            <span className="text-amber-300">+{rewardFlash.goldGain} Gold</span>
            {rewardFlash.shardGain > 0 && <span className="text-cyan-300">+{rewardFlash.shardGain} Shard</span>}
            {rewardFlash.crit && <span className="text-fuchsia-300 font-bold">CRIT</span>}
            {rewardFlash.focusBuffActive && <span className="text-emerald-300 font-bold">Focus</span>}
            {rewardFlash.luckyBuffActive && <span className="text-violet-300 font-bold">Lucky</span>}
            {rewardFlash.dailyCompletedNow && <span className="text-gold-300 font-bold">Daily Raid Cleared</span>}
            {rewardFlash.weeklyCompletedNow && <span className="text-cyan-300 font-bold">Weekly Raid Cleared</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudyHub;
