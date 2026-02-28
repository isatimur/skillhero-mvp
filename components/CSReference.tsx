
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, BookOpen, Copy, Check, ChevronDown, ChevronRight,
  Brain, Layers, GitBranch, Database, Shield, Cpu, Wifi, Cloud,
  Code, Server, TestTube, Zap, GraduationCap, Terminal, Hash,
  Star, Bookmark, BookmarkCheck, Filter
} from 'lucide-react';
import { SETopic } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface CSReferenceProps {
  onBack: () => void;
}

interface CheatSheet {
  topic: SETopic;
  icon: React.ReactNode;
  color: string;
  accent: string;
  sections: CheatSection[];
}

interface CheatSection {
  title: string;
  type: 'table' | 'code' | 'list' | 'keyvalue';
  content: any;
}

// ============================================================================
// CHEAT SHEET DATA - genuinely useful reference material
// ============================================================================

const CHEAT_SHEETS: CheatSheet[] = [
  {
    topic: 'Algorithms',
    icon: <Brain size={20} />,
    color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30',
    accent: 'text-amber-400',
    sections: [
      {
        title: 'Sorting Algorithms Complexity',
        type: 'table',
        content: {
          headers: ['Algorithm', 'Best', 'Average', 'Worst', 'Space', 'Stable'],
          rows: [
            ['Bubble Sort', 'O(n)', 'O(n\u00B2)', 'O(n\u00B2)', 'O(1)', 'Yes'],
            ['Selection Sort', 'O(n\u00B2)', 'O(n\u00B2)', 'O(n\u00B2)', 'O(1)', 'No'],
            ['Insertion Sort', 'O(n)', 'O(n\u00B2)', 'O(n\u00B2)', 'O(1)', 'Yes'],
            ['Merge Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Yes'],
            ['Quick Sort', 'O(n log n)', 'O(n log n)', 'O(n\u00B2)', 'O(log n)', 'No'],
            ['Heap Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'No'],
            ['Counting Sort', 'O(n+k)', 'O(n+k)', 'O(n+k)', 'O(k)', 'Yes'],
            ['Radix Sort', 'O(nk)', 'O(nk)', 'O(nk)', 'O(n+k)', 'Yes'],
          ]
        }
      },
      {
        title: 'Search Algorithms',
        type: 'table',
        content: {
          headers: ['Algorithm', 'Time', 'Space', 'Requirement'],
          rows: [
            ['Linear Search', 'O(n)', 'O(1)', 'None'],
            ['Binary Search', 'O(log n)', 'O(1)', 'Sorted array'],
            ['BFS', 'O(V + E)', 'O(V)', 'Graph'],
            ['DFS', 'O(V + E)', 'O(V)', 'Graph'],
            ['Dijkstra', 'O(V\u00B2) / O(E log V)', 'O(V)', 'Weighted graph'],
            ['A*', 'O(E)', 'O(V)', 'Heuristic function'],
          ]
        }
      },
      {
        title: 'Common Patterns',
        type: 'list',
        content: [
          'Two Pointers \u2014 sorted arrays, palindromes, pair sums',
          'Sliding Window \u2014 subarrays, substrings of fixed/variable size',
          'Binary Search \u2014 sorted data, search space reduction',
          'BFS/DFS \u2014 graphs, trees, connected components',
          'Dynamic Programming \u2014 overlapping subproblems, optimal substructure',
          'Greedy \u2014 local optimum leads to global optimum',
          'Backtracking \u2014 constraint satisfaction, permutations',
          'Divide & Conquer \u2014 split, solve, merge (merge sort, quicksort)',
        ]
      },
      {
        title: 'Binary Search Template',
        type: 'code',
        content: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; // not found
}`
      },
      {
        title: 'BFS Template',
        type: 'code',
        content: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}`
      }
    ]
  },
  {
    topic: 'Data Structures',
    icon: <Layers size={20} />,
    color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30',
    accent: 'text-blue-400',
    sections: [
      {
        title: 'Time Complexity Comparison',
        type: 'table',
        content: {
          headers: ['Structure', 'Access', 'Search', 'Insert', 'Delete'],
          rows: [
            ['Array', 'O(1)', 'O(n)', 'O(n)', 'O(n)'],
            ['Linked List', 'O(n)', 'O(n)', 'O(1)', 'O(1)'],
            ['Stack', 'O(n)', 'O(n)', 'O(1)', 'O(1)'],
            ['Queue', 'O(n)', 'O(n)', 'O(1)', 'O(1)'],
            ['Hash Table', 'N/A', 'O(1)*', 'O(1)*', 'O(1)*'],
            ['BST', 'O(log n)*', 'O(log n)*', 'O(log n)*', 'O(log n)*'],
            ['AVL Tree', 'O(log n)', 'O(log n)', 'O(log n)', 'O(log n)'],
            ['Heap', 'O(1) top', 'O(n)', 'O(log n)', 'O(log n)'],
            ['Trie', 'O(m)', 'O(m)', 'O(m)', 'O(m)'],
          ]
        }
      },
      {
        title: 'When to Use What',
        type: 'list',
        content: [
          'Array \u2014 indexed access, known size, cache-friendly',
          'Linked List \u2014 frequent insertions/deletions, unknown size',
          'Stack (LIFO) \u2014 undo, backtracking, DFS, parenthesis matching',
          'Queue (FIFO) \u2014 BFS, task scheduling, buffering',
          'Hash Map \u2014 fast lookup, counting, caching, deduplication',
          'BST/AVL \u2014 sorted data, range queries, ordered iteration',
          'Heap \u2014 priority queue, top-K elements, scheduling',
          'Trie \u2014 prefix search, autocomplete, spell check',
          'Graph \u2014 networks, relationships, paths, dependencies',
        ]
      },
      {
        title: 'Stack & Queue in JS',
        type: 'code',
        content: `// Stack (LIFO)
const stack = [];
stack.push(1);  // [1]
stack.push(2);  // [1, 2]
stack.pop();    // 2, stack = [1]

// Queue (FIFO)
const queue = [];
queue.push(1);    // [1]
queue.push(2);    // [1, 2]
queue.shift();    // 1, queue = [2]

// Map (Hash Table)
const map = new Map();
map.set('key', 'value');
map.get('key');    // 'value'
map.has('key');    // true
map.delete('key');`
      }
    ]
  },
  {
    topic: 'JavaScript/TypeScript',
    icon: <Code size={20} />,
    color: 'from-yellow-500/20 to-amber-600/20 border-yellow-500/30',
    accent: 'text-yellow-400',
    sections: [
      {
        title: 'ES6+ Features',
        type: 'list',
        content: [
          'const/let \u2014 block-scoped variables (avoid var)',
          'Arrow functions \u2014 (a, b) => a + b (lexical this)',
          'Template literals \u2014 `Hello ${name}`',
          'Destructuring \u2014 const { a, b } = obj; const [x, y] = arr;',
          'Spread/Rest \u2014 [...arr], {...obj}, function(...args)',
          'Optional chaining \u2014 obj?.nested?.value',
          'Nullish coalescing \u2014 value ?? defaultValue',
          'Promise.all / Promise.race / Promise.allSettled',
          'async/await \u2014 cleaner promise handling',
          'Map, Set, WeakMap, WeakSet \u2014 new collection types',
        ]
      },
      {
        title: 'Array Methods Cheat Sheet',
        type: 'code',
        content: `// Transform
arr.map(x => x * 2)        // [2, 4, 6]
arr.filter(x => x > 1)     // [2, 3]
arr.reduce((sum, x) => sum + x, 0) // 6

// Search
arr.find(x => x > 1)       // 2
arr.findIndex(x => x > 1)  // 1
arr.includes(2)             // true
arr.some(x => x > 2)       // true
arr.every(x => x > 0)      // true

// Mutate
arr.push(4)     // add to end
arr.pop()       // remove from end
arr.unshift(0)  // add to start
arr.shift()     // remove from start
arr.splice(1,1) // remove at index

// Other
arr.flat()       // flatten nested
arr.flatMap(fn)  // map + flat
arr.sort((a,b) => a - b) // numeric sort
[...new Set(arr)] // unique values`
      },
      {
        title: 'Async Patterns',
        type: 'code',
        content: `// Promise
fetch('/api').then(r => r.json()).catch(console.error);

// Async/Await
async function getData() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

// Parallel execution
const [users, posts] = await Promise.all([
  fetch('/users').then(r => r.json()),
  fetch('/posts').then(r => r.json()),
]);

// Race (first to resolve)
const fastest = await Promise.race([
  fetch('/api1'), fetch('/api2')
]);`
      },
      {
        title: 'TypeScript Essentials',
        type: 'code',
        content: `// Basic types
let name: string = "hero";
let level: number = 10;
let active: boolean = true;

// Interfaces
interface User {
  id: number;
  name: string;
  email?: string; // optional
  readonly role: string;
}

// Generics
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Utility types
type Partial<T>  // all optional
type Required<T> // all required
type Pick<T, K>  // subset of keys
type Omit<T, K>  // exclude keys
type Record<K,V> // key-value map

// Union & Intersection
type Status = "active" | "inactive";
type Admin = User & { permissions: string[] };`
      }
    ]
  },
  {
    topic: 'React & Frontend',
    icon: <Layers size={20} />,
    color: 'from-cyan-500/20 to-sky-600/20 border-cyan-500/30',
    accent: 'text-cyan-400',
    sections: [
      {
        title: 'React Hooks Reference',
        type: 'table',
        content: {
          headers: ['Hook', 'Purpose', 'When to Use'],
          rows: [
            ['useState', 'Local state', 'Component-level data'],
            ['useEffect', 'Side effects', 'API calls, subscriptions, DOM'],
            ['useContext', 'Shared state', 'Theme, auth, i18n'],
            ['useRef', 'Mutable ref', 'DOM refs, timers, prev values'],
            ['useMemo', 'Memoize value', 'Expensive calculations'],
            ['useCallback', 'Memoize function', 'Prevent child re-renders'],
            ['useReducer', 'Complex state', 'Multiple sub-values, transitions'],
          ]
        }
      },
      {
        title: 'Component Patterns',
        type: 'code',
        content: `// Functional component
const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

// useEffect patterns
useEffect(() => {
  // Runs after every render
});

useEffect(() => {
  // Runs once on mount
  return () => { /* cleanup on unmount */ };
}, []);

useEffect(() => {
  // Runs when 'dep' changes
}, [dep]);

// Conditional rendering
{isLoading ? <Spinner /> : <Content />}
{items.length > 0 && <List items={items} />}

// Event handling
<input onChange={(e) => setValue(e.target.value)} />
<form onSubmit={(e) => { e.preventDefault(); }}>
`
      },
      {
        title: 'Performance Tips',
        type: 'list',
        content: [
          'React.memo() \u2014 prevent re-renders if props unchanged',
          'useMemo() \u2014 cache expensive computations',
          'useCallback() \u2014 cache functions passed as props',
          'Key prop \u2014 always use unique, stable keys in lists',
          'Code splitting \u2014 React.lazy() + Suspense',
          'Virtualization \u2014 react-virtual for large lists',
          'Debounce \u2014 delay search input handlers',
          'Avoid inline objects/arrays as props \u2014 causes re-renders',
        ]
      }
    ]
  },
  {
    topic: 'SQL & Databases',
    icon: <Database size={20} />,
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30',
    accent: 'text-cyan-400',
    sections: [
      {
        title: 'SQL Command Reference',
        type: 'code',
        content: `-- SELECT with conditions
SELECT name, age FROM users
WHERE age > 18 AND active = true
ORDER BY name ASC
LIMIT 10 OFFSET 20;

-- Aggregations
SELECT department, COUNT(*), AVG(salary)
FROM employees
GROUP BY department
HAVING COUNT(*) > 5;

-- JOINs
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;  -- matching rows only
LEFT JOIN  -- all from left + matching right
RIGHT JOIN -- all from right + matching left
FULL JOIN  -- all rows from both

-- Subquery
SELECT * FROM users WHERE id IN (
  SELECT user_id FROM orders WHERE total > 100
);

-- Insert / Update / Delete
INSERT INTO users (name, email) VALUES ('Ada', 'ada@cs.com');
UPDATE users SET level = 5 WHERE id = 1;
DELETE FROM users WHERE active = false;`
      },
      {
        title: 'ACID Properties',
        type: 'keyvalue',
        content: [
          { key: 'Atomicity', value: 'All or nothing \u2014 transaction fully completes or fully rolls back' },
          { key: 'Consistency', value: 'Database moves from one valid state to another' },
          { key: 'Isolation', value: 'Concurrent transactions don\'t interfere with each other' },
          { key: 'Durability', value: 'Committed data persists even after system failure' },
        ]
      },
      {
        title: 'Indexes & Normalization',
        type: 'list',
        content: [
          'B-Tree index \u2014 default, good for range queries and equality',
          'Hash index \u2014 fast equality lookups only',
          'Composite index \u2014 multi-column, leftmost prefix matters',
          '1NF \u2014 atomic values, no repeating groups',
          '2NF \u2014 1NF + no partial dependencies on composite keys',
          '3NF \u2014 2NF + no transitive dependencies',
          'Denormalization \u2014 trade normalization for read performance',
        ]
      }
    ]
  },
  {
    topic: 'System Design',
    icon: <Cpu size={20} />,
    color: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30',
    accent: 'text-emerald-400',
    sections: [
      {
        title: 'Design Interview Framework',
        type: 'list',
        content: [
          '1. Clarify Requirements \u2014 functional & non-functional, scale, constraints',
          '2. Estimate Scale \u2014 users, requests/sec, data size, bandwidth',
          '3. Define API \u2014 endpoints, request/response format',
          '4. Design Data Model \u2014 entities, relationships, DB choice',
          '5. High-Level Architecture \u2014 boxes and arrows diagram',
          '6. Deep Dive \u2014 pick critical component and detail it',
          '7. Address Bottlenecks \u2014 caching, sharding, replication',
          '8. Tradeoffs \u2014 CAP theorem, consistency vs availability',
        ]
      },
      {
        title: 'Key Concepts',
        type: 'keyvalue',
        content: [
          { key: 'Load Balancer', value: 'Distributes traffic across servers (Round Robin, Least Connections, IP Hash)' },
          { key: 'CDN', value: 'Content Delivery Network \u2014 caches static assets at edge locations' },
          { key: 'Cache', value: 'Redis/Memcached \u2014 reduce DB load (Cache-aside, Write-through, Write-back)' },
          { key: 'Message Queue', value: 'Kafka/RabbitMQ \u2014 async processing, decoupling services' },
          { key: 'Database Sharding', value: 'Split data across multiple DB instances by key' },
          { key: 'Replication', value: 'Leader-Follower for reads, Multi-Leader for writes' },
          { key: 'CAP Theorem', value: 'Choose 2 of 3: Consistency, Availability, Partition Tolerance' },
          { key: 'Rate Limiting', value: 'Token Bucket / Sliding Window to prevent abuse' },
        ]
      },
      {
        title: 'Back-of-Envelope Estimates',
        type: 'table',
        content: {
          headers: ['Metric', 'Value'],
          rows: [
            ['L1 cache access', '~0.5 ns'],
            ['L2 cache access', '~7 ns'],
            ['RAM access', '~100 ns'],
            ['SSD read', '~150 \u00B5s'],
            ['HDD seek', '~10 ms'],
            ['Network round trip (same DC)', '~0.5 ms'],
            ['Network round trip (cross-continent)', '~150 ms'],
            ['1 MB from memory', '~250 \u00B5s'],
            ['1 MB from SSD', '~1 ms'],
            ['1 MB over 1 Gbps network', '~10 ms'],
          ]
        }
      }
    ]
  },
  {
    topic: 'Git & Version Control',
    icon: <GitBranch size={20} />,
    color: 'from-red-500/20 to-rose-600/20 border-red-500/30',
    accent: 'text-red-400',
    sections: [
      {
        title: 'Essential Commands',
        type: 'code',
        content: `# Setup & Config
git init                    # Initialize repo
git clone <url>             # Clone remote repo
git config --global user.name "Name"

# Daily Workflow
git status                  # Check changes
git add .                   # Stage all changes
git add <file>              # Stage specific file
git commit -m "message"     # Commit staged changes
git push origin main        # Push to remote
git pull origin main        # Pull & merge remote

# Branching
git branch feature-x        # Create branch
git checkout feature-x       # Switch branch
git checkout -b feature-x   # Create & switch
git merge feature-x         # Merge into current
git branch -d feature-x     # Delete branch

# History & Undo
git log --oneline           # Compact history
git diff                    # See unstaged changes
git stash                   # Save work temporarily
git stash pop               # Restore stashed work
git reset HEAD~1            # Undo last commit (keep changes)
git revert <hash>           # Create undo commit`
      },
      {
        title: 'Git Flow',
        type: 'list',
        content: [
          'main \u2014 production-ready code, always stable',
          'develop \u2014 integration branch for features',
          'feature/* \u2014 new features, branch from develop',
          'release/* \u2014 release preparation, bug fixes',
          'hotfix/* \u2014 urgent production fixes from main',
          'Rebase vs Merge: rebase for linear history, merge for context',
          'Squash commits before merging to keep history clean',
          'Write meaningful commit messages: "fix: resolve login timeout"',
        ]
      }
    ]
  },
  {
    topic: 'Networking & APIs',
    icon: <Wifi size={20} />,
    color: 'from-sky-500/20 to-blue-600/20 border-sky-500/30',
    accent: 'text-sky-400',
    sections: [
      {
        title: 'HTTP Status Codes',
        type: 'table',
        content: {
          headers: ['Code', 'Meaning', 'Use Case'],
          rows: [
            ['200', 'OK', 'Successful GET/PUT'],
            ['201', 'Created', 'Successful POST'],
            ['204', 'No Content', 'Successful DELETE'],
            ['301', 'Moved Permanently', 'URL redirect'],
            ['304', 'Not Modified', 'Cached response valid'],
            ['400', 'Bad Request', 'Invalid input'],
            ['401', 'Unauthorized', 'Not authenticated'],
            ['403', 'Forbidden', 'No permission'],
            ['404', 'Not Found', 'Resource missing'],
            ['429', 'Too Many Requests', 'Rate limited'],
            ['500', 'Internal Server Error', 'Server bug'],
            ['502', 'Bad Gateway', 'Upstream server down'],
            ['503', 'Service Unavailable', 'Server overloaded'],
          ]
        }
      },
      {
        title: 'REST API Design',
        type: 'list',
        content: [
          'GET /users \u2014 list all users',
          'GET /users/:id \u2014 get single user',
          'POST /users \u2014 create new user',
          'PUT /users/:id \u2014 update entire user',
          'PATCH /users/:id \u2014 partial update',
          'DELETE /users/:id \u2014 remove user',
          'Use nouns for resources, not verbs',
          'Use query params for filtering: /users?role=admin&sort=name',
          'Version your API: /api/v1/users',
          'Return proper status codes and error messages',
        ]
      },
      {
        title: 'OSI Model (Simplified)',
        type: 'keyvalue',
        content: [
          { key: '7. Application', value: 'HTTP, HTTPS, WebSocket, gRPC' },
          { key: '4. Transport', value: 'TCP (reliable), UDP (fast)' },
          { key: '3. Network', value: 'IP addressing, routing' },
          { key: '2. Data Link', value: 'MAC addresses, Ethernet, Wi-Fi' },
          { key: '1. Physical', value: 'Cables, radio waves, hardware' },
        ]
      }
    ]
  },
  {
    topic: 'Security',
    icon: <Shield size={20} />,
    color: 'from-red-500/20 to-orange-600/20 border-red-500/30',
    accent: 'text-red-400',
    sections: [
      {
        title: 'OWASP Top 10 (Simplified)',
        type: 'keyvalue',
        content: [
          { key: 'Injection', value: 'SQL/NoSQL/OS injection \u2014 use parameterized queries' },
          { key: 'Broken Auth', value: 'Weak passwords, session hijacking \u2014 use MFA, secure tokens' },
          { key: 'XSS', value: 'Cross-Site Scripting \u2014 sanitize output, use CSP headers' },
          { key: 'CSRF', value: 'Cross-Site Request Forgery \u2014 use CSRF tokens, SameSite cookies' },
          { key: 'Broken Access', value: 'Missing authorization checks \u2014 check permissions server-side' },
          { key: 'Security Misconfig', value: 'Default credentials, open ports \u2014 harden configurations' },
          { key: 'Sensitive Data', value: 'Unencrypted data \u2014 use HTTPS, encrypt at rest' },
        ]
      },
      {
        title: 'Authentication vs Authorization',
        type: 'list',
        content: [
          'Authentication \u2014 "Who are you?" (login, passwords, tokens)',
          'Authorization \u2014 "What can you do?" (permissions, roles)',
          'JWT \u2014 stateless tokens: header.payload.signature',
          'OAuth 2.0 \u2014 delegated authorization (Google, GitHub login)',
          'Session cookies \u2014 server stores state, httpOnly + secure flags',
          'API keys \u2014 simple auth for server-to-server, never expose client-side',
          'bcrypt/scrypt \u2014 hash passwords with salt, never store plaintext',
          'HTTPS everywhere \u2014 TLS encrypts data in transit',
        ]
      }
    ]
  },
  {
    topic: 'Testing & CI/CD',
    icon: <TestTube size={20} />,
    color: 'from-green-500/20 to-emerald-600/20 border-green-500/30',
    accent: 'text-green-400',
    sections: [
      {
        title: 'Testing Pyramid',
        type: 'keyvalue',
        content: [
          { key: 'Unit Tests (base)', value: 'Test single functions/components in isolation. Fast, many. Jest, Vitest.' },
          { key: 'Integration Tests (middle)', value: 'Test modules working together. API + DB, component + state.' },
          { key: 'E2E Tests (top)', value: 'Test full user flows. Slow, few. Playwright, Cypress.' },
        ]
      },
      {
        title: 'Jest/Vitest Patterns',
        type: 'code',
        content: `// Basic test
test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});

// Async test
test('fetches users', async () => {
  const users = await getUsers();
  expect(users).toHaveLength(3);
});

// Mock
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
expect(mockFn()).toBe(42);
expect(mockFn).toHaveBeenCalledTimes(1);

// Describe block
describe('Calculator', () => {
  it('should add', () => { ... });
  it('should subtract', () => { ... });
});`
      },
      {
        title: 'CI/CD Pipeline Stages',
        type: 'list',
        content: [
          '1. Source \u2014 Git push triggers pipeline (GitHub Actions, GitLab CI)',
          '2. Build \u2014 Compile code, install dependencies',
          '3. Test \u2014 Run unit, integration, lint checks',
          '4. Security \u2014 Dependency audit, SAST scanning',
          '5. Package \u2014 Docker build, artifact creation',
          '6. Deploy Staging \u2014 Deploy to test environment',
          '7. Acceptance Tests \u2014 E2E tests on staging',
          '8. Deploy Production \u2014 Blue/green or canary deployment',
          '9. Monitor \u2014 Health checks, error tracking, rollback if needed',
        ]
      }
    ]
  },
  {
    topic: 'OOP & Design Patterns',
    icon: <GitBranch size={20} />,
    color: 'from-purple-500/20 to-violet-600/20 border-purple-500/30',
    accent: 'text-purple-400',
    sections: [
      {
        title: 'SOLID Principles',
        type: 'keyvalue',
        content: [
          { key: 'S \u2014 Single Responsibility', value: 'A class should have only one reason to change' },
          { key: 'O \u2014 Open/Closed', value: 'Open for extension, closed for modification' },
          { key: 'L \u2014 Liskov Substitution', value: 'Subtypes must be substitutable for their base types' },
          { key: 'I \u2014 Interface Segregation', value: 'Many specific interfaces > one general interface' },
          { key: 'D \u2014 Dependency Inversion', value: 'Depend on abstractions, not concretions' },
        ]
      },
      {
        title: 'Common Design Patterns',
        type: 'keyvalue',
        content: [
          { key: 'Singleton', value: 'One instance globally (database connection, config)' },
          { key: 'Factory', value: 'Create objects without specifying exact class' },
          { key: 'Observer', value: 'Subscribe to events (EventEmitter, pub/sub)' },
          { key: 'Strategy', value: 'Swap algorithms at runtime (sorting, payment processing)' },
          { key: 'Adapter', value: 'Convert interface to compatible one (API wrappers)' },
          { key: 'Decorator', value: 'Add behavior without modifying original (middleware)' },
          { key: 'MVC', value: 'Model-View-Controller separation of concerns' },
        ]
      }
    ]
  },
  {
    topic: 'Backend & Servers',
    icon: <Server size={20} />,
    color: 'from-slate-500/20 to-gray-600/20 border-slate-500/30',
    accent: 'text-slate-400',
    sections: [
      {
        title: 'Node.js / Express Essentials',
        type: 'code',
        content: `const express = require('express');
const app = express();
app.use(express.json()); // Parse JSON body

// Routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  // validate, save to DB...
  res.status(201).json({ id: 1, name, email });
});

// Middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  next(); // pass to next handler
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000);`
      },
      {
        title: 'Architecture Patterns',
        type: 'list',
        content: [
          'Monolith \u2014 single deployable, simpler to start, harder to scale',
          'Microservices \u2014 independent services, complex but scalable',
          'Serverless \u2014 functions as a service (AWS Lambda, Vercel)',
          'Event-Driven \u2014 services communicate via events/messages',
          'GraphQL \u2014 client specifies exact data needed, single endpoint',
          'REST \u2014 resource-based URLs, standard HTTP methods',
          'WebSocket \u2014 persistent bidirectional connection for real-time',
        ]
      }
    ]
  },
  {
    topic: 'Cloud & DevOps',
    icon: <Cloud size={20} />,
    color: 'from-indigo-500/20 to-blue-600/20 border-indigo-500/30',
    accent: 'text-indigo-400',
    sections: [
      {
        title: 'Cloud Service Models',
        type: 'keyvalue',
        content: [
          { key: 'IaaS', value: 'Infrastructure as a Service \u2014 VMs, storage, networks (AWS EC2, GCP Compute)' },
          { key: 'PaaS', value: 'Platform as a Service \u2014 managed runtime (Heroku, Vercel, Railway)' },
          { key: 'SaaS', value: 'Software as a Service \u2014 full application (Gmail, Slack, Figma)' },
          { key: 'FaaS', value: 'Functions as a Service \u2014 serverless (AWS Lambda, Cloudflare Workers)' },
        ]
      },
      {
        title: 'Docker Essentials',
        type: 'code',
        content: `# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

# Commands
docker build -t myapp .       # Build image
docker run -p 3000:3000 myapp # Run container
docker-compose up -d           # Start services
docker ps                      # List containers
docker logs <id>               # View logs`
      },
      {
        title: 'Key AWS Services',
        type: 'table',
        content: {
          headers: ['Service', 'Category', 'Purpose'],
          rows: [
            ['EC2', 'Compute', 'Virtual machines'],
            ['S3', 'Storage', 'Object storage (files, images)'],
            ['RDS', 'Database', 'Managed PostgreSQL/MySQL'],
            ['DynamoDB', 'Database', 'NoSQL key-value store'],
            ['Lambda', 'Compute', 'Serverless functions'],
            ['CloudFront', 'CDN', 'Content delivery'],
            ['SQS/SNS', 'Messaging', 'Queues & notifications'],
            ['ECS/EKS', 'Containers', 'Docker/Kubernetes'],
            ['Route 53', 'DNS', 'Domain name management'],
            ['IAM', 'Security', 'Access management'],
          ]
        }
      }
    ]
  },
  {
    topic: 'Concurrency',
    icon: <Zap size={20} />,
    color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30',
    accent: 'text-violet-400',
    sections: [
      {
        title: 'Key Concepts',
        type: 'keyvalue',
        content: [
          { key: 'Process', value: 'Independent execution unit with own memory space' },
          { key: 'Thread', value: 'Lightweight unit within a process, shares memory' },
          { key: 'Mutex', value: 'Mutual exclusion lock \u2014 only one thread at a time' },
          { key: 'Semaphore', value: 'Counter-based lock \u2014 allows N concurrent accesses' },
          { key: 'Deadlock', value: 'Two+ threads waiting for each other\'s locks forever' },
          { key: 'Race Condition', value: 'Output depends on non-deterministic timing of threads' },
          { key: 'Starvation', value: 'Thread never gets access to shared resource' },
          { key: 'Atomic Operation', value: 'Indivisible operation, cannot be interrupted' },
        ]
      },
      {
        title: 'JS Concurrency Model',
        type: 'list',
        content: [
          'Single-threaded \u2014 one call stack, one task at a time',
          'Event Loop \u2014 processes callbacks from task queue',
          'Microtasks (Promises) run before macrotasks (setTimeout)',
          'Web Workers \u2014 true parallelism in separate threads',
          'async/await \u2014 non-blocking I/O via promises',
          'Promise.all \u2014 parallel async operations',
          'AbortController \u2014 cancel pending async operations',
          'SharedArrayBuffer \u2014 shared memory between workers',
        ]
      },
      {
        title: 'Deadlock Prevention',
        type: 'list',
        content: [
          'Lock ordering \u2014 always acquire locks in the same order',
          'Lock timeout \u2014 give up if lock not acquired within time',
          'Deadlock detection \u2014 detect cycles in wait-for graph',
          'Avoid nested locks \u2014 minimize lock scope',
        ]
      }
    ]
  },
  {
    topic: 'General CS',
    icon: <GraduationCap size={20} />,
    color: 'from-gold-400/20 to-amber-600/20 border-gold-500/30',
    accent: 'text-gold-400',
    sections: [
      {
        title: 'Big-O Complexity',
        type: 'table',
        content: {
          headers: ['Notation', 'Name', 'Example', 'n=1000'],
          rows: [
            ['O(1)', 'Constant', 'Hash lookup', '1'],
            ['O(log n)', 'Logarithmic', 'Binary search', '10'],
            ['O(n)', 'Linear', 'Loop through array', '1,000'],
            ['O(n log n)', 'Linearithmic', 'Merge sort', '10,000'],
            ['O(n\u00B2)', 'Quadratic', 'Nested loops', '1,000,000'],
            ['O(2\u207F)', 'Exponential', 'Subsets', '~10\u00B3\u2070\u2070'],
            ['O(n!)', 'Factorial', 'Permutations', '\u221E'],
          ]
        }
      },
      {
        title: 'Fundamental Concepts',
        type: 'keyvalue',
        content: [
          { key: 'Recursion', value: 'Function calls itself. Needs base case + recursive case.' },
          { key: 'Memoization', value: 'Cache results of expensive function calls' },
          { key: 'Bit Manipulation', value: 'AND(&), OR(|), XOR(^), NOT(~), Shift(<<, >>)' },
          { key: 'Big-O', value: 'Describes upper bound of algorithm growth rate' },
          { key: 'Stack vs Heap', value: 'Stack: local vars, auto cleanup. Heap: dynamic alloc, manual/GC.' },
          { key: 'Garbage Collection', value: 'Automatic memory management (mark & sweep, ref counting)' },
          { key: 'Compilation vs Interpretation', value: 'Compiled: ahead-of-time (C). Interpreted: line-by-line (Python). JIT: both (JS).' },
        ]
      }
    ]
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl bg-obsidian-800 border border-gold-600/20 overflow-hidden group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-obsidian-900/80 border-b border-gold-600/15">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <button
          onClick={handleCopy}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const DataTable: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-gold-600/20">
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-obsidian-800/80">
          {headers.map((h, i) => (
            <th key={i} className="px-3 py-2 text-left text-gold-400 font-bold uppercase tracking-wider border-b border-gold-600/15">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={`${i % 2 === 0 ? 'bg-obsidian-900/40' : 'bg-obsidian-900/20'} hover:bg-gold-500/5 transition-colors`}>
            {row.map((cell, j) => (
              <td key={j} className={`px-3 py-2 border-b border-gold-600/10 ${j === 0 ? 'font-mono text-white font-bold' : 'text-slate-400'}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const KeyValueList: React.FC<{ items: { key: string; value: string }[] }> = ({ items }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="p-3 rounded-xl bg-obsidian-800/40 border border-gold-600/15 hover:border-gold-500/30 transition-all">
        <div className="text-sm font-bold text-white mb-0.5">{item.key}</div>
        <div className="text-xs text-slate-400 leading-relaxed">{item.value}</div>
      </div>
    ))}
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="space-y-1.5">
    {items.map((item, i) => {
      const [main, detail] = item.split(' \u2014 ');
      return (
        <div key={i} className="flex gap-2 text-xs">
          <span className="text-gold-500 mt-0.5 shrink-0">\u25B8</span>
          <span>
            <span className="text-white font-bold">{main}</span>
            {detail && <span className="text-slate-400"> \u2014 {detail}</span>}
          </span>
        </div>
      );
    })}
  </div>
);

const SectionRenderer: React.FC<{ section: CheatSection }> = ({ section }) => {
  switch (section.type) {
    case 'code': return <CodeBlock code={section.content} />;
    case 'table': return <DataTable headers={section.content.headers} rows={section.content.rows} />;
    case 'keyvalue': return <KeyValueList items={section.content} />;
    case 'list': return <BulletList items={section.content} />;
    default: return null;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CSReference: React.FC<CSReferenceProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<CheatSheet | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('skillHero_bookmarkedSheets');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleBookmark = (topic: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic); else next.add(topic);
      localStorage.setItem('skillHero_bookmarkedSheets', JSON.stringify([...next]));
      return next;
    });
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const filteredSheets = useMemo(() => {
    if (!searchQuery.trim()) return CHEAT_SHEETS;
    const q = searchQuery.toLowerCase();
    return CHEAT_SHEETS.filter(sheet => {
      if (sheet.topic.toLowerCase().includes(q)) return true;
      return sheet.sections.some(s => {
        if (s.title.toLowerCase().includes(q)) return true;
        if (typeof s.content === 'string' && s.content.toLowerCase().includes(q)) return true;
        if (Array.isArray(s.content)) return s.content.some((item: any) =>
          (typeof item === 'string' && item.toLowerCase().includes(q)) ||
          (item.key && item.key.toLowerCase().includes(q)) ||
          (item.value && item.value.toLowerCase().includes(q))
        );
        return false;
      });
    });
  }, [searchQuery]);

  // Detail view for a single cheat sheet
  if (selectedSheet) {
    return (
      <div className="min-h-screen bg-transparent text-slate-200 relative">
        <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedSheet(null)}
              className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 transition-all"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <div className={`${selectedSheet.accent}`}>{selectedSheet.icon}</div>
            <h1 className="text-xl font-fantasy text-gold-400 flex-1">{selectedSheet.topic}</h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleBookmark(selectedSheet.topic)}
              className="p-2"
            >
              {bookmarked.has(selectedSheet.topic)
                ? <BookmarkCheck size={18} className="text-gold-400" />
                : <Bookmark size={18} className="text-slate-600" />}
            </motion.button>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {selectedSheet.sections.map((section, i) => {
              const key = `${selectedSheet.topic}-${i}`;
              const isExpanded = expandedSections.has(key) || true; // default expanded
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-xl bg-obsidian-800/40 border border-gold-600/15 overflow-hidden ornament-corners"
                >
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-bold text-white">{section.title}</span>
                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3">
                      <SectionRenderer section={section} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Grid view of all cheat sheets
  return (
    <div className="min-h-screen bg-transparent text-slate-200 relative">
      <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-stardust opacity-5 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 transition-all"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <h1 className="text-lg font-fantasy text-gold-400 flex items-center gap-2">
            <BookOpen size={16} /> CS Reference
          </h1>
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topics, concepts, syntax..."
            className="w-full pl-10 pr-4 py-3 bg-obsidian-800/60 border border-gold-600/15 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-gold-500/40 transition-colors"
          />
        </div>

        {/* Bookmarked section */}
        {bookmarked.size > 0 && !searchQuery && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <BookmarkCheck size={12} /> Bookmarked
            </h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CHEAT_SHEETS.filter(s => bookmarked.has(s.topic)).map(sheet => (
                <motion.button
                  key={sheet.topic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br ${sheet.color} border text-xs font-bold ${sheet.accent}`}
                >
                  {sheet.icon}
                  <span className="text-slate-300">{sheet.topic.split(' ')[0]}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredSheets.map((sheet, i) => (
            <motion.div
              key={sheet.topic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedSheet(sheet)}
              className={`relative p-4 rounded-xl bg-gradient-to-br ${sheet.color} border cursor-pointer group overflow-hidden`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/20 ${sheet.accent}`}>
                  {sheet.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{sheet.topic}</div>
                  <div className="text-[10px] text-slate-500">
                    {sheet.sections.length} sections &middot; {sheet.sections.map(s => s.title).join(', ').slice(0, 60)}...
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bookmarked.has(sheet.topic) && <BookmarkCheck size={14} className="text-gold-400" />}
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-gold-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSheets.length === 0 && (
          <div className="text-center text-slate-600 py-12">
            <Search size={32} className="mx-auto mb-3 text-slate-700" />
            <p className="text-sm">No results for "{searchQuery}"</p>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CSReference;
