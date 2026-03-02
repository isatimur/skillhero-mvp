
import { Quest } from '../../types';

export const QUESTS: Quest[] = [
  // ========== TIER 1: BEGINNER (Level 1-3) ==========
  {
    id: 'q1',
    title: 'The Bugbear of Legacy Code',
    description: 'A shambling beast made of spaghetti code and deprecated APIs. Refactor it into oblivion!',
    levelRequired: 1,
    enemyName: 'Legacy Bugbear',
    enemyImage: '👹',
    enemyMaxHp: 80,
    enemyAttackDamage: 15,
    narrativeIntro: ["You enter the ruins of Monolith City.", "The air smells of burnt coffee and legacy dependencies.", "A shambling creature of tangled code blocks you!"],
    narrativeOutro: "The Bugbear crumbles into clean, refactored modules. Well done, engineer!",
    rewardXp: 300,
    questions: [
      { id: 'q1_1', text: 'What does the Single Responsibility Principle state?', options: ['A class should have one reason to change', 'A function should have one line', 'A file should have one class', 'A developer should work on one thing'], correctIndex: 0, explanation: 'SRP: Each class/module should have only one reason to change, making code easier to maintain.', difficulty: 'Easy', xpReward: 50, topic: 'OOP & Design Patterns' },
      { id: 'q1_2', text: 'What does DRY stand for?', options: ["Don't Repeat Yourself", 'Do Run Yesterday', 'Data Return Yield', 'Default Random Yielder'], correctIndex: 0, explanation: 'DRY means avoid duplicating logic. Extract common code into reusable functions or modules.', difficulty: 'Easy', xpReward: 50, topic: 'OOP & Design Patterns' },
      { id: 'q1_3', text: 'What is refactoring?', options: ['Rewriting from scratch', 'Improving structure without changing behavior', 'Adding features', 'Deleting all comments'], correctIndex: 1, explanation: 'Refactoring improves code design while preserving its external behavior. Tests ensure nothing breaks.', difficulty: 'Easy', xpReward: 50, topic: 'General CS' }
    ]
  },
  {
    id: 'q_sorting_golem',
    title: 'The Sorting Golem',
    description: 'A clay construct that arranges boulders. But which algorithm does it use?',
    levelRequired: 1,
    enemyName: 'Clay Sorter',
    enemyImage: '🗿',
    enemyMaxHp: 90,
    enemyAttackDamage: 12,
    narrativeIntro: ["In the Quarry of Arrays, boulders lie in disarray.", "A stone golem methodically arranges them... slowly.", "It uses bubble sort. You must teach it efficiency!"],
    narrativeOutro: "The Golem now sorts in O(n log n). The quarry is in order!",
    rewardXp: 350,
    questions: [
      { id: 'sg1', text: 'What is the time complexity of Bubble Sort?', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correctIndex: 2, explanation: 'Bubble Sort compares adjacent elements repeatedly. Worst and average case is O(n^2).', difficulty: 'Easy', xpReward: 50, topic: 'Algorithms' },
      { id: 'sg2', text: 'Which sorting algorithm has the best average-case performance?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correctIndex: 2, explanation: 'Merge Sort guarantees O(n log n) in all cases through divide-and-conquer.', difficulty: 'Easy', xpReward: 50, topic: 'Algorithms' },
      { id: 'sg3', text: 'What makes an algorithm "stable"?', options: ['It never crashes', 'Equal elements maintain their relative order', 'It uses less memory', 'It runs in constant time'], correctIndex: 1, explanation: 'A stable sort preserves the original order of elements with equal keys.', difficulty: 'Medium', xpReward: 60, topic: 'Algorithms' },
      { id: 'sg4', text: 'Which data structure does Merge Sort use extra space for?', options: ['Stack', 'Temporary arrays', 'Hash table', 'Linked list'], correctIndex: 1, explanation: 'Merge Sort requires O(n) auxiliary space for merging subarrays.', difficulty: 'Easy', xpReward: 50, topic: 'Algorithms' }
    ]
  },
  {
    id: 'q_linked_list_hydra',
    title: 'The Linked List Hydra',
    description: 'Cut one head, two more grow. Each head points to the next!',
    levelRequired: 2,
    enemyName: 'Node Hydra',
    enemyImage: '🐉',
    enemyMaxHp: 120,
    enemyAttackDamage: 18,
    narrativeIntro: ["Deep in the Swamp of Pointers, the Hydra awaits.", "Each head is a node, each neck a pointer.", "Sever the connections or face infinite loops!"],
    narrativeOutro: "The Hydra's linked list is properly garbage collected. Victory!",
    rewardXp: 400,
    questions: [
      { id: 'llh1', text: 'What is a linked list?', options: ['A contiguous array', 'Nodes connected by pointers/references', 'A hash table variant', 'A sorted array'], correctIndex: 1, explanation: 'A linked list stores elements in nodes, each containing data and a reference to the next node.', difficulty: 'Easy', xpReward: 50, topic: 'Data Structures' },
      { id: 'llh2', text: 'What is O(1) in a linked list but O(n) in an array?', options: ['Search by value', 'Insertion at the head', 'Access by index', 'Finding the length'], correctIndex: 1, explanation: 'Inserting at the head of a linked list is O(1) since you just update the head pointer. Arrays require shifting all elements.', difficulty: 'Medium', xpReward: 60, topic: 'Data Structures' },
      { id: 'llh3', text: 'How do you detect a cycle in a linked list?', options: ['Sort it first', 'Use two pointers at different speeds (Floyd)', 'Count all nodes', 'Reverse it'], correctIndex: 1, explanation: "Floyd's cycle detection: a slow pointer moves 1 step, fast pointer moves 2 steps. If they meet, there's a cycle.", difficulty: 'Medium', xpReward: 70, topic: 'Data Structures' },
      { id: 'llh4', text: 'Doubly linked list vs singly linked list?', options: ['Doubly is faster', 'Doubly has pointers to both next and previous', 'Singly uses more memory', 'They are identical'], correctIndex: 1, explanation: 'Doubly linked lists have both next and prev pointers, enabling O(1) deletion and backward traversal.', difficulty: 'Easy', xpReward: 50, topic: 'Data Structures' }
    ]
  },
  {
    id: 'q_git_minotaur',
    title: 'The Merge Conflict Minotaur',
    description: 'This beast lurks in the labyrinth of branches. Resolve the conflicts or be lost forever!',
    levelRequired: 2,
    enemyName: 'Conflict Minotaur',
    enemyImage: '🐂',
    enemyMaxHp: 100,
    enemyAttackDamage: 14,
    narrativeIntro: ["You enter the Branching Labyrinth.", "Two paths diverge... and their code conflicts!", "The Minotaur guards the main branch. Merge carefully!"],
    narrativeOutro: "Conflicts resolved. The branches are merged cleanly. The Minotaur yields.",
    rewardXp: 350,
    questions: [
      { id: 'gm1', text: 'What causes a merge conflict?', options: ['Same file changed in both branches on the same lines', 'Using git push', 'Having too many branches', 'Committing too often'], correctIndex: 0, explanation: 'Conflicts arise when the same lines are modified differently in two branches being merged.', difficulty: 'Easy', xpReward: 50, topic: 'Git & Version Control' },
      { id: 'gm2', text: 'What does "git stash" do?', options: ['Deletes uncommitted changes', 'Temporarily saves uncommitted changes', 'Creates a new branch', 'Pushes to remote'], correctIndex: 1, explanation: 'git stash saves your working directory changes so you can switch branches, then re-apply later with git stash pop.', difficulty: 'Easy', xpReward: 50, topic: 'Git & Version Control' },
      { id: 'gm3', text: 'What is a "detached HEAD" state?', options: ['A broken repository', 'HEAD points to a commit instead of a branch', 'HEAD is deleted', 'The main branch is gone'], correctIndex: 1, explanation: 'Detached HEAD means you checked out a specific commit rather than a branch tip. Commits here may be lost.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' },
      { id: 'gm4', text: 'git cherry-pick does what?', options: ['Deletes a commit', 'Applies a specific commit to the current branch', 'Reverts all changes', 'Creates a tag'], correctIndex: 1, explanation: 'Cherry-pick applies the changes from a specific commit onto your current branch.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' }
    ]
  },

  // ========== TIER 2: INTERMEDIATE (Level 3-6) ==========
  {
    id: 'q_mem_leak',
    title: 'The Memory Leak Ooze',
    description: 'A viscous slime that grows with every tick. Free the heap before it overflows!',
    levelRequired: 3,
    enemyName: 'Heap Slime',
    enemyImage: '🦠',
    enemyMaxHp: 200,
    enemyAttackDamage: 20,
    narrativeIntro: ["The servers are slowing down...", "A massive green slime consumes the RAM!", "It will overflow if we don't garbage collect it!"],
    narrativeOutro: "The Ooze is collected. The memory is freed. Heap restored to normal.",
    rewardXp: 500,
    questions: [
      { id: 'mem1', text: 'What causes a memory leak?', options: ['Unused objects not freed from memory', 'Too much hard drive space', 'Fast CPU', 'Good coding practices'], correctIndex: 0, explanation: 'Memory leaks occur when objects persist in memory without being reachable, preventing garbage collection.', difficulty: 'Medium', xpReward: 60, topic: 'General CS' },
      { id: 'mem2', text: 'In JavaScript, what commonly causes memory leaks?', options: ['Global variables holding DOM references', 'Using const declarations', 'Arrow functions', 'Template literals'], correctIndex: 0, explanation: 'Holding references to detached DOM nodes prevents garbage collection, causing memory to grow.', difficulty: 'Medium', xpReward: 60, topic: 'JavaScript/TypeScript' },
      { id: 'mem3', text: 'What does garbage collection target?', options: ['Unreachable objects', 'The largest variables', 'The oldest variables', 'Global scope only'], correctIndex: 0, explanation: 'GC identifies and reclaims memory for objects no longer reachable from root references.', difficulty: 'Medium', xpReward: 60, topic: 'General CS' },
      { id: 'mem4', text: 'Stack vs Heap memory?', options: ['Stack is for dynamic allocation', 'Heap is for function call frames', 'Stack is LIFO, Heap is for dynamic objects', 'They are the same thing'], correctIndex: 2, explanation: 'Stack handles function calls (LIFO). Heap stores dynamically allocated objects with longer lifetimes.', difficulty: 'Medium', xpReward: 60, topic: 'General CS' }
    ]
  },
  {
    id: 'q_callback_cerberus',
    title: 'The Callback Cerberus',
    description: 'A three-headed beast: callbacks, promises, and async/await. Master all three to survive!',
    levelRequired: 3,
    enemyName: 'Async Cerberus',
    enemyImage: '🐕',
    enemyMaxHp: 180,
    enemyAttackDamage: 22,
    narrativeIntro: ["You enter the Async Abyss.", "Three heads snarl: callback, promise, await!", "Only mastery of asynchronous code can defeat this beast!"],
    narrativeOutro: "All three heads submit. You have conquered the event loop!",
    rewardXp: 550,
    questions: [
      { id: 'cc1', text: 'What is "callback hell"?', options: ['Deeply nested callbacks making code unreadable', 'A callback that throws errors', 'Using too many event listeners', 'A slow API response'], correctIndex: 0, explanation: 'Callback hell is when callbacks are nested within callbacks, creating a pyramid of doom that is hard to read/maintain.', difficulty: 'Easy', xpReward: 50, topic: 'JavaScript/TypeScript' },
      { id: 'cc2', text: 'What does Promise.all() do?', options: ['Runs promises sequentially', 'Waits for ALL promises to resolve (or any to reject)', 'Cancels all promises', 'Returns the fastest promise'], correctIndex: 1, explanation: 'Promise.all() resolves when all promises resolve, or rejects as soon as any one rejects.', difficulty: 'Medium', xpReward: 60, topic: 'JavaScript/TypeScript' },
      { id: 'cc3', text: 'What is the event loop?', options: ['A for-loop in the DOM', 'The mechanism that handles async operations in JS', 'A recursive function', 'A database cursor'], correctIndex: 1, explanation: 'The event loop continuously checks the call stack and callback queue, executing pending callbacks when the stack is empty.', difficulty: 'Medium', xpReward: 70, topic: 'JavaScript/TypeScript' },
      { id: 'cc4', text: 'async/await is syntactic sugar for?', options: ['Callbacks', 'Promises', 'Web Workers', 'setTimeout'], correctIndex: 1, explanation: 'async/await provides a cleaner syntax for working with Promises, making async code look synchronous.', difficulty: 'Easy', xpReward: 50, topic: 'JavaScript/TypeScript' }
    ]
  },
  {
    id: 'q_hash_djinn',
    title: 'The Hash Map Djinn',
    description: 'A genie of constant-time lookups. But beware the collisions!',
    levelRequired: 3,
    enemyName: 'Hash Djinn',
    enemyImage: '🧞',
    enemyMaxHp: 150,
    enemyAttackDamage: 20,
    narrativeIntro: ["The Cave of O(1) beckons.", "A djinn guards a massive hash table.", "Answer its riddles or face collision chaos!"],
    narrativeOutro: "The Djinn grants you O(1) lookup power. Your data structures are now legendary!",
    rewardXp: 500,
    questions: [
      { id: 'hd1', text: 'What is a hash collision?', options: ['Two keys produce the same hash index', 'The hash table is full', 'A key is not found', 'The hash function is slow'], correctIndex: 0, explanation: 'A collision occurs when two different keys hash to the same bucket/index in the table.', difficulty: 'Easy', xpReward: 50, topic: 'Data Structures' },
      { id: 'hd2', text: 'How does chaining resolve collisions?', options: ['By storing a linked list at each bucket', 'By deleting the old value', 'By resizing the table', 'By using a tree'], correctIndex: 0, explanation: 'Chaining stores multiple entries at the same index using a linked list (or tree in modern implementations like Java 8+).', difficulty: 'Medium', xpReward: 60, topic: 'Data Structures' },
      { id: 'hd3', text: 'Average time complexity of hash table lookup?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], correctIndex: 2, explanation: 'With a good hash function and low load factor, lookups are amortized O(1).', difficulty: 'Easy', xpReward: 50, topic: 'Data Structures' },
      { id: 'hd4', text: 'What is the load factor of a hash table?', options: ['The speed of hashing', 'Number of entries divided by number of buckets', 'The memory used', 'The collision count'], correctIndex: 1, explanation: 'Load factor = n/m (entries/buckets). High load factor means more collisions and slower performance.', difficulty: 'Medium', xpReward: 60, topic: 'Data Structures' }
    ]
  },
  {
    id: 'q_query_kraken',
    title: 'The Query Kraken',
    description: 'Its tentacles are subqueries, its ink is unoptimized JOINs. Write efficient SQL to survive!',
    levelRequired: 4,
    enemyName: 'Query Kraken',
    enemyImage: '🐙',
    enemyMaxHp: 220,
    enemyAttackDamage: 25,
    narrativeIntro: ["The Database Depths darken.", "A massive Kraken wraps its tentacles around your tables!", "Only optimized queries can sever its grip!"],
    narrativeOutro: "The Kraken releases your database. Queries flow freely once more!",
    rewardXp: 600,
    questions: [
      { id: 'qk1', text: 'What is database normalization?', options: ['Making the database faster', 'Organizing data to reduce redundancy', 'Adding more tables', 'Encrypting data'], correctIndex: 1, explanation: 'Normalization structures data to minimize redundancy and dependency, typically through 1NF, 2NF, 3NF forms.', difficulty: 'Medium', xpReward: 60, topic: 'SQL & Databases' },
      { id: 'qk2', text: 'What is an INDEX used for?', options: ['Encrypting data', 'Speeding up data retrieval', 'Compressing tables', 'Backing up data'], correctIndex: 1, explanation: 'An index creates a data structure (B-tree) that speeds up SELECT queries at the cost of slower INSERT/UPDATE.', difficulty: 'Easy', xpReward: 50, topic: 'SQL & Databases' },
      { id: 'qk3', text: 'LEFT JOIN vs INNER JOIN?', options: ['LEFT JOIN includes all rows from left table even without matches', 'They are the same', 'INNER JOIN keeps nulls', 'LEFT JOIN is faster'], correctIndex: 0, explanation: 'LEFT JOIN returns all rows from the left table, with NULLs for non-matching right table rows. INNER JOIN only returns matches.', difficulty: 'Medium', xpReward: 60, topic: 'SQL & Databases' },
      { id: 'qk4', text: 'What is a transaction?', options: ['A payment', 'A unit of work that is atomic', 'A type of table', 'A stored procedure'], correctIndex: 1, explanation: 'A transaction groups operations into an atomic unit: either all succeed (COMMIT) or all fail (ROLLBACK).', difficulty: 'Medium', xpReward: 60, topic: 'SQL & Databases' },
      { id: 'qk5', text: 'N+1 query problem is?', options: ['Having N+1 tables', 'Fetching a list then querying each item individually', 'Using too many JOINs', 'Having N+1 columns'], correctIndex: 1, explanation: 'N+1: 1 query for the list + N queries for each item. Fix with eager loading (JOIN) or batch queries.', difficulty: 'Hard', xpReward: 80, topic: 'SQL & Databases' }
    ]
  },
  {
    id: 'q_solid_sentinel',
    title: 'The SOLID Sentinel',
    description: 'Five principles forged into one guardian. Break any, and your code crumbles!',
    levelRequired: 4,
    enemyName: 'SOLID Guardian',
    enemyImage: '🗽',
    enemyMaxHp: 250,
    enemyAttackDamage: 22,
    narrativeIntro: ["The Temple of Architecture looms ahead.", "Five pillars hold up the roof of clean code.", "The Sentinel tests if you truly understand design!"],
    narrativeOutro: "All five principles understood. The temple accepts you as a true architect!",
    rewardXp: 650,
    questions: [
      { id: 'ss1', text: 'What does the "O" in SOLID stand for?', options: ['Open/Closed Principle', 'Object-Oriented', 'Optimal Performance', 'Override Methods'], correctIndex: 0, explanation: 'Open/Closed: Software entities should be open for extension but closed for modification.', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'ss2', text: 'Liskov Substitution Principle means?', options: ['Use lists everywhere', 'Subclasses must be substitutable for their base classes', 'Always use interfaces', 'Avoid inheritance'], correctIndex: 1, explanation: 'LSP: If class B extends A, you should be able to use B wherever A is expected without breaking behavior.', difficulty: 'Hard', xpReward: 80, topic: 'OOP & Design Patterns' },
      { id: 'ss3', text: 'Interface Segregation Principle states?', options: ['One big interface is best', 'Many specific interfaces are better than one general-purpose', 'Interfaces are optional', 'Use abstract classes instead'], correctIndex: 1, explanation: 'ISP: Clients should not be forced to depend on interfaces they do not use. Split large interfaces.', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'ss4', text: 'Dependency Inversion Principle?', options: ['Dependencies should be inverted in order', 'Depend on abstractions, not concretions', 'Avoid all dependencies', 'Use global variables'], correctIndex: 1, explanation: 'DIP: High-level modules should not depend on low-level modules. Both should depend on abstractions.', difficulty: 'Hard', xpReward: 80, topic: 'OOP & Design Patterns' },
      { id: 'ss5', text: 'Which design pattern creates objects without specifying the exact class?', options: ['Singleton', 'Factory', 'Observer', 'Strategy'], correctIndex: 1, explanation: 'Factory pattern provides an interface for creating objects, letting subclasses decide which class to instantiate.', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' }
    ]
  },
  {
    id: 'q_protocol_sphinx',
    title: 'The Protocol Sphinx',
    description: 'Answer its networking riddles or be lost in packet purgatory!',
    levelRequired: 5,
    enemyName: 'Protocol Sphinx',
    enemyImage: '🦁',
    enemyMaxHp: 230,
    enemyAttackDamage: 28,
    narrativeIntro: ["At the Gateway of Networks, a Sphinx blocks the port.", "It speaks in protocols and headers.", "Only those who understand the OSI layers shall pass!"],
    narrativeOutro: "The Sphinx opens the gateway. All ports are now forwarded to you!",
    rewardXp: 600,
    questions: [
      { id: 'ps1', text: 'TCP vs UDP: which guarantees delivery?', options: ['UDP', 'TCP', 'Both', 'Neither'], correctIndex: 1, explanation: 'TCP (Transmission Control Protocol) provides reliable, ordered delivery through acknowledgments and retransmission.', difficulty: 'Easy', xpReward: 50, topic: 'Networking & APIs' },
      { id: 'ps2', text: 'What HTTP status code means "Not Found"?', options: ['200', '301', '404', '500'], correctIndex: 2, explanation: '404 means the server cannot find the requested resource. 200=OK, 301=Redirect, 500=Server Error.', difficulty: 'Easy', xpReward: 50, topic: 'Networking & APIs' },
      { id: 'ps3', text: 'What is DNS?', options: ['Database Normalization System', 'Domain Name System - translates names to IPs', 'Data Network Service', 'Digital Node Switch'], correctIndex: 1, explanation: 'DNS translates human-readable domain names (google.com) into IP addresses (142.250.80.46).', difficulty: 'Easy', xpReward: 50, topic: 'Networking & APIs' },
      { id: 'ps4', text: 'GraphQL vs REST: key difference?', options: ['GraphQL is faster', 'GraphQL lets clients specify exactly what data they need', 'REST is newer', 'They are identical'], correctIndex: 1, explanation: 'GraphQL allows clients to request exactly the data they need in a single query, avoiding over/under-fetching.', difficulty: 'Medium', xpReward: 60, topic: 'Networking & APIs' },
      { id: 'ps5', text: 'What does HTTPS add over HTTP?', options: ['Speed', 'TLS/SSL encryption', 'More headers', 'Better caching'], correctIndex: 1, explanation: 'HTTPS adds TLS/SSL encryption, ensuring data confidentiality and integrity between client and server.', difficulty: 'Easy', xpReward: 50, topic: 'Networking & APIs' }
    ]
  },

  // ========== TIER 3: ADVANCED (Level 5-8) ==========
  {
    id: 'q_react_specter',
    title: 'The State Mutation Specter',
    description: 'It mutates state directly and causes infinite re-renders! Stop the ghost before React implodes!',
    levelRequired: 5,
    enemyName: 'Mutation Specter',
    enemyImage: '👻',
    enemyMaxHp: 280,
    enemyAttackDamage: 30,
    narrativeIntro: ["The Component Tree shakes violently!", "A ghostly figure mutates state directly...", "The virtual DOM is in chaos! Fix the renders!"],
    narrativeOutro: "Immutability restored. The Component Tree stands tall and properly reconciled!",
    rewardXp: 700,
    questions: [
      { id: 'rs1', text: 'Why should you not mutate state directly in React?', options: ['It is too slow', 'React cannot detect the change and re-render', 'It causes syntax errors', 'It is a security risk'], correctIndex: 1, explanation: 'React compares state references to decide re-renders. Direct mutation keeps the same reference, so React misses the change.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rs2', text: 'What hook replaces lifecycle methods in functional components?', options: ['useState', 'useEffect', 'useContext', 'useMemo'], correctIndex: 1, explanation: 'useEffect combines componentDidMount, componentDidUpdate, and componentWillUnmount into one hook.', difficulty: 'Easy', xpReward: 50, topic: 'React & Frontend' },
      { id: 'rs3', text: 'What is the purpose of React.memo?', options: ['Stores data in memory', 'Prevents unnecessary re-renders by memoizing components', 'Creates memos for developers', 'Adds comments to components'], correctIndex: 1, explanation: 'React.memo wraps a component and skips re-rendering if its props have not changed (shallow comparison).', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rs4', text: 'What is "lifting state up" in React?', options: ['Moving state to a parent component shared by siblings', 'Using Redux', 'Putting state in the URL', 'Using localStorage'], correctIndex: 0, explanation: 'When siblings need shared state, move it to their closest common parent and pass it down as props.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' }
    ]
  },
  {
    id: 'q_race_condition',
    title: 'The Race Condition Cheetah',
    description: 'A beast so fast it writes before it reads. Synchronize or die!',
    levelRequired: 6,
    enemyName: 'Thread Hunter',
    enemyImage: '🐆',
    enemyMaxHp: 300,
    enemyAttackDamage: 35,
    narrativeIntro: ["Data is being corrupted across the realm!", "Two threads fight for the same resource!", "The Cheetah strikes from the async void!"],
    narrativeOutro: "Synchronization achieved. The threads are safe, the data is consistent!",
    rewardXp: 800,
    questions: [
      { id: 'rc1', text: 'How do you prevent a race condition?', options: ['Locks/Mutex', 'Run code faster', 'Delete shared data', 'Use only global variables'], correctIndex: 0, explanation: 'Mutual exclusion (mutex/locks) ensures only one thread accesses shared state at a time.', difficulty: 'Hard', xpReward: 100, topic: 'Concurrency' },
      { id: 'rc2', text: 'When can deadlock occur?', options: ["Two threads wait for each other's locks", 'CPU is overheating', 'No locks are used', 'Too much RAM allocated'], correctIndex: 0, explanation: 'Deadlock: circular wait where thread A holds lock 1 waiting for lock 2, while thread B holds lock 2 waiting for lock 1.', difficulty: 'Hard', xpReward: 100, topic: 'Concurrency' },
      { id: 'rc3', text: 'What is a semaphore?', options: ['A signaling primitive controlling access to a resource', 'A type of CPU', 'A database engine', 'A network protocol'], correctIndex: 0, explanation: 'A semaphore is a counter that controls access to a shared resource. It can allow N concurrent accessors.', difficulty: 'Medium', xpReward: 80, topic: 'Concurrency' },
      { id: 'rc4', text: 'What is the difference between concurrency and parallelism?', options: ['They are the same', 'Concurrency is dealing with many things; parallelism is doing many things', 'Parallelism is slower', 'Concurrency requires multiple CPUs'], correctIndex: 1, explanation: 'Concurrency: structuring a program to handle multiple tasks. Parallelism: executing multiple tasks simultaneously on multiple cores.', difficulty: 'Medium', xpReward: 70, topic: 'Concurrency' }
    ]
  },
  {
    id: 'q_owasp_overlord',
    title: 'The OWASP Overlord',
    description: 'Ten vulnerabilities, one dark lord. Patch them all or the system falls!',
    levelRequired: 6,
    enemyName: 'OWASP Overlord',
    enemyImage: '🦹‍♂️',
    enemyMaxHp: 320,
    enemyAttackDamage: 30,
    narrativeIntro: ["The Fortress of Security has been breached!", "The OWASP Overlord exploits every vulnerability.", "Harden your defenses with secure coding!"],
    narrativeOutro: "All vulnerabilities patched. The Overlord retreats into the dark web!",
    rewardXp: 750,
    questions: [
      { id: 'ow1', text: 'What is Cross-Site Scripting (XSS)?', options: ['Injecting malicious scripts into web pages', 'A CSS framework', 'A JavaScript library', 'Cross-browser compatibility'], correctIndex: 0, explanation: 'XSS allows attackers to inject client-side scripts into web pages viewed by other users, stealing data or sessions.', difficulty: 'Medium', xpReward: 60, topic: 'Security' },
      { id: 'ow2', text: 'How to prevent SQL Injection?', options: ['Use parameterized queries / prepared statements', 'Use longer passwords', 'Add more servers', 'Use a faster database'], correctIndex: 0, explanation: 'Parameterized queries separate SQL code from data, making it impossible for user input to be executed as SQL.', difficulty: 'Easy', xpReward: 50, topic: 'Security' },
      { id: 'ow3', text: 'What is CSRF?', options: ['A database format', 'Cross-Site Request Forgery - tricking users into making unwanted requests', 'A CSS reset method', 'A caching strategy'], correctIndex: 1, explanation: 'CSRF tricks a logged-in user into submitting a malicious request. Prevented with CSRF tokens and SameSite cookies.', difficulty: 'Medium', xpReward: 70, topic: 'Security' },
      { id: 'ow4', text: 'What is the principle of least privilege?', options: ['Give everyone admin access', 'Grant only the minimum permissions needed', 'Use the smallest database', 'Write the least code'], correctIndex: 1, explanation: 'Least privilege: users and processes should only have the minimum access rights needed to perform their tasks.', difficulty: 'Easy', xpReward: 50, topic: 'Security' },
      { id: 'ow5', text: 'What is JWT used for?', options: ['JSON Web Token - secure, stateless authentication', 'JavaScript Widget Tool', 'Java Web Template', 'Just Waiting Time'], correctIndex: 0, explanation: 'JWT encodes claims as a signed JSON token, enabling stateless authentication without server-side sessions.', difficulty: 'Medium', xpReward: 60, topic: 'Security' }
    ]
  },
  {
    id: 'q_coverage_chimera',
    title: 'The Coverage Chimera',
    description: 'Three heads: unit, integration, e2e. Test them all or face untested chaos!',
    levelRequired: 5,
    enemyName: 'Test Chimera',
    enemyImage: '🦬',
    enemyMaxHp: 260,
    enemyAttackDamage: 25,
    narrativeIntro: ["The Testing Grounds are overrun!", "A three-headed beast of untested code rampages!", "Write tests to tame each head!"],
    narrativeOutro: "100% coverage achieved! The Chimera is fully tested and tamed!",
    rewardXp: 650,
    questions: [
      { id: 'tc1', text: 'What is the Testing Pyramid?', options: ['Many unit tests, fewer integration, fewest E2E tests', 'Equal amounts of all tests', 'Only E2E tests', 'No tests needed'], correctIndex: 0, explanation: 'The testing pyramid: many fast unit tests at the base, fewer integration tests in the middle, few slow E2E tests at the top.', difficulty: 'Easy', xpReward: 50, topic: 'Testing & CI/CD' },
      { id: 'tc2', text: 'What is mocking in testing?', options: ['Making fun of code', 'Replacing dependencies with controlled substitutes', 'Running tests faster', 'Deleting test files'], correctIndex: 1, explanation: 'Mocking replaces real dependencies with controlled fakes, isolating the unit under test from external systems.', difficulty: 'Medium', xpReward: 60, topic: 'Testing & CI/CD' },
      { id: 'tc3', text: 'TDD stands for?', options: ['Test-Driven Development', 'Type-Driven Design', 'Total Data Dump', 'Typed Definition Docs'], correctIndex: 0, explanation: 'TDD: Write a failing test first, then write code to make it pass, then refactor. Red-Green-Refactor cycle.', difficulty: 'Easy', xpReward: 50, topic: 'Testing & CI/CD' },
      { id: 'tc4', text: 'What is code coverage?', options: ['How many developers review code', 'Percentage of code executed by tests', 'How many files exist', 'Number of comments'], correctIndex: 1, explanation: 'Code coverage measures the percentage of code lines/branches/functions exercised by your test suite.', difficulty: 'Easy', xpReward: 50, topic: 'Testing & CI/CD' }
    ]
  },

  // ========== TIER 4: EXPERT (Level 7-10) ==========
  {
    id: 'q_scalability_titan',
    title: 'The Scalability Titan',
    description: 'A colossus that grows with every request. Scale horizontally or be crushed!',
    levelRequired: 7,
    enemyName: 'Scale Titan',
    enemyImage: '🦾',
    enemyMaxHp: 400,
    enemyAttackDamage: 40,
    narrativeIntro: ["The Server Peaks shake as traffic surges!", "A colossal titan of unscaled infrastructure appears!", "Design a system that can handle millions of requests!"],
    narrativeOutro: "The Titan shrinks as your auto-scaling takes effect. Infrastructure mastery achieved!",
    rewardXp: 900,
    questions: [
      { id: 'st1', text: 'Horizontal vs Vertical scaling?', options: ['Horizontal = add more machines; Vertical = upgrade one machine', 'They are the same', 'Horizontal is always worse', 'Vertical means more databases'], correctIndex: 0, explanation: 'Horizontal (scale out): add more servers. Vertical (scale up): add more CPU/RAM to existing server. Horizontal is preferred for distributed systems.', difficulty: 'Medium', xpReward: 60, topic: 'System Design' },
      { id: 'st2', text: 'What is a Load Balancer?', options: ['A device that distributes traffic across servers', 'A database optimizer', 'A code formatter', 'A testing tool'], correctIndex: 0, explanation: 'A load balancer distributes incoming requests across multiple servers to prevent any single server from being overwhelmed.', difficulty: 'Easy', xpReward: 50, topic: 'System Design' },
      { id: 'st3', text: 'What is the CAP theorem?', options: ['Code-Architecture-Performance', 'Consistency, Availability, Partition Tolerance - pick 2', 'Cache-API-Proxy', 'Create-Apply-Push'], correctIndex: 1, explanation: 'CAP: In a distributed system, you can only guarantee 2 of 3: Consistency, Availability, Partition Tolerance.', difficulty: 'Hard', xpReward: 100, topic: 'System Design' },
      { id: 'st4', text: 'What is database sharding?', options: ['Encrypting the database', 'Splitting data across multiple database instances', 'Backing up data', 'Deleting old records'], correctIndex: 1, explanation: 'Sharding horizontally partitions data across multiple databases, each holding a subset based on a shard key.', difficulty: 'Hard', xpReward: 100, topic: 'System Design' },
      { id: 'st5', text: 'CDN stands for and does what?', options: ['Content Delivery Network - serves content from edge locations near users', 'Central Data Node', 'Code Deploy Network', 'Cache Distribution Node'], correctIndex: 0, explanation: 'CDN caches content at edge locations worldwide, reducing latency by serving data from the nearest point of presence.', difficulty: 'Medium', xpReward: 60, topic: 'System Design' }
    ]
  },
  {
    id: 'q_container_colossus',
    title: 'The Container Colossus',
    description: 'A massive construct of Docker containers and Kubernetes pods. Orchestrate or be overwhelmed!',
    levelRequired: 7,
    enemyName: 'Container Colossus',
    enemyImage: '🤖',
    enemyMaxHp: 380,
    enemyAttackDamage: 38,
    narrativeIntro: ["The Cloud Citadel is under siege!", "Containers spin up uncontrollably!", "Only a master orchestrator can bring order to this chaos!"],
    narrativeOutro: "Pods are healthy, services are balanced. The Cloud Citadel stands secure!",
    rewardXp: 850,
    questions: [
      { id: 'dc1', text: 'What is a Docker container?', options: ['A virtual machine', 'A lightweight, isolated environment sharing the host OS kernel', 'A physical server', 'A database instance'], correctIndex: 1, explanation: 'Containers share the host OS kernel but isolate processes and filesystem, making them lighter than VMs.', difficulty: 'Easy', xpReward: 50, topic: 'Cloud & DevOps' },
      { id: 'dc2', text: 'Docker image vs container?', options: ['Same thing', 'Image is a blueprint; container is a running instance', 'Container is bigger', 'Image is the running process'], correctIndex: 1, explanation: 'An image is a read-only template. A container is a runnable instance created from an image.', difficulty: 'Medium', xpReward: 60, topic: 'Cloud & DevOps' },
      { id: 'dc3', text: 'What does Kubernetes do?', options: ['Writes code', 'Orchestrates container deployment, scaling, and management', 'Hosts websites', 'Manages databases only'], correctIndex: 1, explanation: 'Kubernetes automates deploying, scaling, and managing containerized applications across clusters.', difficulty: 'Medium', xpReward: 60, topic: 'Cloud & DevOps' },
      { id: 'dc4', text: 'What is a Kubernetes Pod?', options: ['A server rack', 'The smallest deployable unit, one or more containers', 'A type of node', 'A storage volume'], correctIndex: 1, explanation: 'A Pod is the smallest K8s unit, wrapping one or more containers that share networking and storage.', difficulty: 'Medium', xpReward: 60, topic: 'Cloud & DevOps' }
    ]
  },
  {
    id: 'q_microservice_manticore',
    title: 'The Microservice Manticore',
    description: 'A beast with a hundred independent parts. Decouple them or face service mesh mayhem!',
    levelRequired: 8,
    enemyName: 'Micro Manticore',
    enemyImage: '🦂',
    enemyMaxHp: 450,
    enemyAttackDamage: 42,
    narrativeIntro: ["The Monolith has shattered into a hundred services!", "The Manticore feeds on tight coupling!", "Design proper service boundaries or everything collapses!"],
    narrativeOutro: "Services are decoupled, APIs are clean, circuit breakers are in place. Architecture mastery!",
    rewardXp: 950,
    questions: [
      { id: 'mm1', text: 'What is the main advantage of microservices?', options: ['Faster code execution', 'Independent deployment and scaling of services', 'Less code overall', 'No need for testing'], correctIndex: 1, explanation: 'Microservices allow each service to be deployed, scaled, and maintained independently by separate teams.', difficulty: 'Medium', xpReward: 60, topic: 'Backend & Servers' },
      { id: 'mm2', text: 'What is a circuit breaker pattern?', options: ['A hardware component', 'Prevents cascading failures by stopping calls to failing services', 'A type of load balancer', 'A database optimization'], correctIndex: 1, explanation: 'Circuit breaker detects failures and temporarily stops requests to a failing service, allowing it to recover.', difficulty: 'Hard', xpReward: 80, topic: 'Backend & Servers' },
      { id: 'mm3', text: 'What is an API Gateway?', options: ['A firewall', 'A single entry point that routes requests to appropriate microservices', 'A database proxy', 'A code repository'], correctIndex: 1, explanation: 'API Gateway handles routing, rate limiting, auth, and aggregation as a single entry point for client requests.', difficulty: 'Medium', xpReward: 60, topic: 'Backend & Servers' },
      { id: 'mm4', text: 'Event-driven architecture uses?', options: ['Direct API calls for everything', 'Message queues/event buses for async communication', 'Shared databases', 'Global variables'], correctIndex: 1, explanation: 'Event-driven: services communicate via events through message queues (Kafka, RabbitMQ), enabling loose coupling.', difficulty: 'Medium', xpReward: 70, topic: 'Backend & Servers' }
    ]
  },
  {
    id: 'q_blockchain',
    title: 'The Blockchain Basilisk',
    description: 'A decentralized serpent. Its gaze validates blocks and freezes heroes.',
    levelRequired: 8,
    enemyName: 'Crypto Serpent',
    enemyImage: '🐍',
    enemyMaxHp: 500,
    enemyAttackDamage: 45,
    narrativeIntro: ["The ledger is immutable.", "The Basilisk guards the genesis block.", "Decentralize its head from its body!"],
    narrativeOutro: "The chain is broken (in a good way). Consensus achieved!",
    rewardXp: 1000,
    questions: [
      { id: 'bc1', text: 'What is a Smart Contract?', options: ['Self-executing code on the blockchain', 'A legal document', 'An AI Lawyer', 'A handshake agreement'], correctIndex: 0, explanation: 'Smart contracts are programs stored on the blockchain that execute automatically when conditions are met.', difficulty: 'Hard', xpReward: 100, topic: 'System Design' },
      { id: 'bc2', text: 'How are blockchain blocks linked?', options: ['By pointers', 'By hash of the previous block', 'By random IDs', 'By timestamps only'], correctIndex: 1, explanation: 'Each block contains the cryptographic hash of the previous block, creating an immutable chain.', difficulty: 'Medium', xpReward: 80, topic: 'System Design' },
      { id: 'bc3', text: 'What is consensus in distributed systems?', options: ['Everyone agrees on the code', 'Nodes agree on the state of data', 'The fastest server wins', 'A voting system for features'], correctIndex: 1, explanation: 'Consensus algorithms (Proof of Work, Raft, Paxos) ensure all nodes agree on the current state of distributed data.', difficulty: 'Hard', xpReward: 100, topic: 'System Design' }
    ]
  },

  // ========== TIER 5: LEGENDARY (Level 9-12) ==========
  {
    id: 'q_graph_labyrinth',
    title: 'The Graph Labyrinth',
    description: 'An ever-changing maze of vertices and edges. Find the shortest path or wander eternally!',
    levelRequired: 9,
    enemyName: 'Graph Phantom',
    enemyImage: '🌀',
    enemyMaxHp: 500,
    enemyAttackDamage: 50,
    narrativeIntro: ["The Labyrinth shifts with every step.", "Vertices connect and disconnect around you.", "Only graph algorithms can reveal the exit!"],
    narrativeOutro: "The shortest path is found! The Labyrinth straightens into a beautiful tree.",
    rewardXp: 1200,
    questions: [
      { id: 'gl1', text: "What is Dijkstra's algorithm used for?", options: ['Sorting arrays', 'Finding the shortest path in a weighted graph', 'Searching strings', 'Compressing data'], correctIndex: 1, explanation: "Dijkstra's finds the shortest path from a source to all other vertices in a graph with non-negative weights.", difficulty: 'Hard', xpReward: 100, topic: 'Algorithms' },
      { id: 'gl2', text: 'DFS vs BFS: when is DFS preferred?', options: ['When finding shortest path', 'When exploring all possibilities or detecting cycles', 'When the graph is small', 'Never'], correctIndex: 1, explanation: 'DFS explores as far as possible along each branch. Good for cycle detection, topological sort, and maze generation.', difficulty: 'Medium', xpReward: 70, topic: 'Algorithms' },
      { id: 'gl3', text: 'What is the time complexity of BFS on a graph?', options: ['O(V + E)', 'O(V^2)', 'O(V * E)', 'O(log V)'], correctIndex: 0, explanation: 'BFS visits each vertex once and each edge once, giving O(V + E) where V=vertices, E=edges.', difficulty: 'Hard', xpReward: 100, topic: 'Algorithms' },
      { id: 'gl4', text: 'What is a topological sort?', options: ['Sorting by name', 'Linear ordering of vertices so every edge goes from earlier to later', 'Sorting by degree', 'A physical sort'], correctIndex: 1, explanation: 'Topological sort orders DAG vertices such that for every directed edge u->v, u comes before v. Used in build systems.', difficulty: 'Hard', xpReward: 100, topic: 'Algorithms' }
    ]
  },
  {
    id: 'q_dynamic_wyrm',
    title: 'The Dynamic Programming Wyrm',
    description: 'This dragon remembers every subproblem. Can you find the optimal substructure?',
    levelRequired: 10,
    enemyName: 'DP Wyrm',
    enemyImage: '🐲',
    enemyMaxHp: 600,
    enemyAttackDamage: 55,
    narrativeIntro: ["The Cave of Overlapping Subproblems glows with memoized fire.", "A dragon of optimal substructure guards the treasure!", "Think recursively, but remember your results!"],
    narrativeOutro: "The Wyrm is defeated with an optimal solution! O(n) time complexity achieved!",
    rewardXp: 1500,
    questions: [
      { id: 'dp1', text: 'What are the two key properties for dynamic programming?', options: ['Speed and memory', 'Optimal substructure and overlapping subproblems', 'Sorting and searching', 'Input and output'], correctIndex: 1, explanation: 'DP requires: 1) Optimal substructure (optimal solution uses optimal solutions to subproblems) and 2) Overlapping subproblems (same subproblems are solved repeatedly).', difficulty: 'Hard', xpReward: 100, topic: 'Algorithms' },
      { id: 'dp2', text: 'Memoization vs tabulation?', options: ['Same thing', 'Memoization is top-down; tabulation is bottom-up', 'Tabulation is recursive', 'Memoization uses more memory always'], correctIndex: 1, explanation: 'Memoization: recursive + cache (top-down). Tabulation: iterative, fills table from base cases (bottom-up).', difficulty: 'Hard', xpReward: 100, topic: 'Algorithms' },
      { id: 'dp3', text: 'Classic DP problem: what is the Fibonacci sequence approach?', options: ['O(2^n) recursive, O(n) with DP', 'Always O(n^2)', 'Cannot be optimized', 'O(1) always'], correctIndex: 0, explanation: 'Naive recursion is O(2^n). With memoization or tabulation, Fibonacci becomes O(n) time, O(n) or O(1) space.', difficulty: 'Medium', xpReward: 80, topic: 'Algorithms' },
      { id: 'dp4', text: 'What is the Knapsack Problem?', options: ['A sorting problem', 'Maximize value of items that fit within a weight limit', 'A graph traversal', 'A string matching problem'], correctIndex: 1, explanation: 'Given items with weights and values, find the maximum value that fits in a knapsack of limited capacity. Classic DP problem.', difficulty: 'Hard', xpReward: 100, topic: 'Algorithms' }
    ]
  },
  {
    id: 'q_quantum',
    title: 'The Quantum Spider',
    description: 'It exists in two states until observed. Collapse the wave function!',
    levelRequired: 10,
    enemyName: 'Entangled Weaver',
    enemyImage: '🕷️',
    enemyMaxHp: 700,
    enemyAttackDamage: 60,
    narrativeIntro: ["The web spans multiple dimensions.", "Is it dead? Is it alive?", "Collapse the wave function before it collapses you!"],
    narrativeOutro: "Observed and eliminated. The quantum state resolves in your favor!",
    rewardXp: 1800,
    questions: [
      { id: 'qtm1', text: 'What is a Qubit?', options: ['0 or 1 only', '0, 1, or both simultaneously (superposition)', 'A small byte', 'A cube-shaped bit'], correctIndex: 1, explanation: 'A qubit can exist in superposition of 0 and 1 simultaneously until measured, enabling quantum parallelism.', difficulty: 'Hard', xpReward: 120, topic: 'General CS' },
      { id: 'qtm2', text: 'What is Big O notation?', options: ['A way to rate code quality', 'Upper bound of algorithm growth rate', 'A programming language', 'A debugging tool'], correctIndex: 1, explanation: 'Big O describes the upper bound of time/space complexity as input grows. O(n), O(log n), O(n^2), etc.', difficulty: 'Medium', xpReward: 80, topic: 'Algorithms' },
      { id: 'qtm3', text: 'What is the halting problem?', options: ['A bug in loops', 'It is impossible to determine if any program will halt or loop forever', 'A slow algorithm', 'A CPU issue'], correctIndex: 1, explanation: "Turing proved it's impossible to write a general algorithm that determines if any given program will halt. A fundamental limit of computation.", difficulty: 'Hard', xpReward: 120, topic: 'General CS' }
    ]
  },
  {
    id: 'q_tree_guardian',
    title: 'The Binary Tree Guardian',
    description: 'A towering tree of nodes. Traverse it in every order or face unbalanced wrath!',
    levelRequired: 11,
    enemyName: 'Tree Guardian',
    enemyImage: '🌳',
    enemyMaxHp: 550,
    enemyAttackDamage: 48,
    narrativeIntro: ["The Forest of Hierarchies stretches endlessly.", "A massive binary tree blocks your path!", "Prove your traversal mastery to pass!"],
    narrativeOutro: "The tree is balanced. AVL rotation complete. The Guardian bows to your knowledge!",
    rewardXp: 1400,
    questions: [
      { id: 'bt1', text: 'In-order traversal of a BST gives?', options: ['Random order', 'Sorted ascending order', 'Reverse order', 'Level order'], correctIndex: 1, explanation: 'In-order (left, root, right) traversal of a Binary Search Tree visits nodes in ascending sorted order.', difficulty: 'Medium', xpReward: 70, topic: 'Data Structures' },
      { id: 'bt2', text: 'What is a balanced binary tree?', options: ['All leaves at same level', 'Height difference between subtrees is at most 1', 'Has equal number of nodes', 'Is always complete'], correctIndex: 1, explanation: 'A balanced tree (AVL, Red-Black) maintains height difference <= 1 between subtrees, ensuring O(log n) operations.', difficulty: 'Medium', xpReward: 70, topic: 'Data Structures' },
      { id: 'bt3', text: 'Heap data structure is typically used for?', options: ['Sorting only', 'Priority queues - efficient min/max retrieval', 'Linked lists', 'Hash tables'], correctIndex: 1, explanation: 'A heap provides O(1) access to min/max element and O(log n) insertion/deletion. Perfect for priority queues.', difficulty: 'Medium', xpReward: 70, topic: 'Data Structures' },
      { id: 'bt4', text: 'What is a Trie used for?', options: ['Sorting numbers', 'Efficient string prefix lookups (autocomplete)', 'Graph traversal', 'Matrix operations'], correctIndex: 1, explanation: 'A Trie (prefix tree) stores strings character by character, enabling O(m) lookups where m is string length. Great for autocomplete.', difficulty: 'Hard', xpReward: 100, topic: 'Data Structures' }
    ]
  },
  {
    id: 'q_caching_phoenix',
    title: 'The Caching Phoenix',
    description: 'Rises from the ashes of cache misses. Master cache strategies to keep it contained!',
    levelRequired: 12,
    enemyName: 'Cache Phoenix',
    enemyImage: '🔥',
    enemyMaxHp: 650,
    enemyAttackDamage: 55,
    narrativeIntro: ["The phoenix of stale data rises again!", "Every cache miss makes it stronger!", "Implement the right caching strategy to contain it!"],
    narrativeOutro: "Cache hit ratio: 99.9%. The Phoenix is eternally cached and contained!",
    rewardXp: 2000,
    questions: [
      { id: 'cp1', text: 'What is cache-aside (lazy loading) pattern?', options: ['Cache loads everything at startup', 'App checks cache first; on miss, loads from DB and updates cache', 'Cache writes directly to DB', 'Cache is never invalidated'], correctIndex: 1, explanation: 'Cache-aside: App checks cache first. On miss, fetch from database, store in cache, return. Most common pattern.', difficulty: 'Hard', xpReward: 100, topic: 'System Design' },
      { id: 'cp2', text: 'Write-through vs Write-back cache?', options: ['Same thing', 'Write-through writes to cache and DB simultaneously; write-back delays DB write', 'Write-back is always faster', 'Write-through skips the cache'], correctIndex: 1, explanation: 'Write-through: every write goes to cache AND DB (consistent but slower). Write-back: write to cache, async flush to DB (faster but risk of data loss).', difficulty: 'Hard', xpReward: 100, topic: 'System Design' },
      { id: 'cp3', text: 'What is cache invalidation?', options: ['Deleting the cache server', 'Removing or updating stale cache entries', 'Adding more cache', 'Restarting the server'], correctIndex: 1, explanation: '"There are only two hard things in CS: cache invalidation and naming things." Invalidation ensures cached data stays consistent with the source.', difficulty: 'Medium', xpReward: 70, topic: 'System Design' },
      { id: 'cp4', text: 'LRU cache eviction policy?', options: ['Least Recently Used - evicts oldest accessed item', 'Last Random Update', 'Longest Running Unit', 'Least Required Update'], correctIndex: 0, explanation: 'LRU evicts the least recently accessed item when the cache is full. Implemented with a hash map + doubly linked list for O(1) operations.', difficulty: 'Medium', xpReward: 80, topic: 'System Design' },
      { id: 'cp5', text: 'What is a cache stampede?', options: ['Cache grows too large', 'Many requests hit the DB simultaneously when a popular cache entry expires', 'Cache is too fast', 'The cache crashes'], correctIndex: 1, explanation: 'Cache stampede: when a hot key expires, many concurrent requests all miss cache and hammer the DB. Prevent with locking or staggered expiration.', difficulty: 'Hard', xpReward: 100, topic: 'System Design' }
    ]
  },

  // === NEW QUESTS: SOFTWARE ARCHITECTURE ===
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
      { id: 'ddg1', text: 'What is the Ubiquitous Language in DDD?', options: ['A programming language', 'A shared vocabulary between developers and domain experts used consistently in code and conversation', 'Universal translator tool', 'A documentation format'], correctIndex: 1, explanation: "Ubiquitous Language: same terms used by developers AND business experts, reflected in the code. Eliminates translation layer.", difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
      { id: 'ddg2', text: 'What is an Aggregate Root?', options: ['The top-level module', 'The single entity through which all changes to an aggregate must flow, enforcing invariants', 'The main database table', 'The root class in inheritance'], correctIndex: 1, explanation: "Aggregate Root: gateway to the aggregate. External objects can only reference the root. All modifications go through root methods, which enforce business rules.", difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
      { id: 'ddg3', text: 'What is a Domain Event?', options: ['A user click event', 'Something that happened in the domain that domain experts care about, published for other parts to react to', 'A scheduled task', 'An exception thrown in domain logic'], correctIndex: 1, explanation: 'Domain Event: immutable record of something significant that happened (OrderPlaced, PaymentFailed). Other aggregates/services react asynchronously.', difficulty: 'Medium', xpReward: 80, topic: 'Software Architecture' },
      { id: 'ddg4', text: 'What is the Repository pattern in DDD?', options: ['A git repository', 'An abstraction for data access that provides a collection-like interface for domain objects', 'A factory for objects', 'A caching layer'], correctIndex: 1, explanation: 'Repository: abstraction over data storage. Domain layer sees it as an in-memory collection; infrastructure implements DB queries. Decouples domain from persistence technology.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
      { id: 'ddg5', text: 'Value Object vs Entity in DDD?', options: ['No difference', 'Entity has unique identity (tracked over time); Value Object defined by its attributes (immutable, interchangeable)', 'Value Objects are primitives only', 'Entities are more important'], correctIndex: 1, explanation: 'Entity: identity matters (User #42 is distinct from User #43). Value Object: attributes define equality (Money(100, USD) == Money(100, USD)). Value Objects are immutable.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
    ]
  },
  {
    id: 'q_clean_arch_lich',
    title: 'The Clean Architecture Lich',
    description: "An undead architect who never lets dependencies point the wrong way. Defeat it — cleanly.",
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
      { id: 'cal2', text: 'What are Use Cases (Interactors) in Clean Architecture?', options: ['UI components', 'Application-specific business rules that orchestrate data flow to/from entities', 'Database queries', 'REST API handlers'], correctIndex: 1, explanation: "Use Cases: application business rules. Orchestrate entities, call repositories via interfaces. Do NOT know about HTTP, databases, UI.", difficulty: 'Medium', xpReward: 80, topic: 'Software Architecture' },
      { id: 'cal3', text: 'What is the purpose of the Interface Adapters layer?', options: ['HTTP adapters only', 'Converts data between use cases and external systems (databases, UI, APIs)', 'Stores business logic', 'Handles authentication'], correctIndex: 1, explanation: 'Interface Adapters: controllers, presenters, gateways. Convert external formats to/from use case formats. Keeps use cases free of framework details.', difficulty: 'Medium', xpReward: 80, topic: 'Software Architecture' },
      { id: 'cal4', text: 'What is the Dependency Inversion Principle (DIP)?', options: ['Avoid all dependencies', 'High-level modules should not depend on low-level modules; both should depend on abstractions', 'Low-level modules control high-level ones', 'Inject all dependencies from main()'], correctIndex: 1, explanation: 'DIP: high-level modules (business rules) depend on abstractions (interfaces), not concretions (DB, HTTP). Enables swapping implementations without changing business logic.', difficulty: 'Hard', xpReward: 90, topic: 'Software Architecture' },
      { id: 'cal5', text: 'What makes an architecture "screaming"?', options: ['It causes errors loudly', 'The top-level structure reveals the domain (healthcare, e-commerce), not the framework (Rails, Spring)', 'It has extensive logging', 'It uses microservices'], correctIndex: 1, explanation: 'Screaming Architecture (Uncle Bob): your directory structure should scream the system\'s intent — not "this is a Rails app". Top-level folders: /billing, /inventory, /users.', difficulty: 'Medium', xpReward: 70, topic: 'Software Architecture' },
    ]
  },

  // === NEW QUESTS: AI & MACHINE LEARNING ===
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
      { id: 'gw1', text: 'What is learning rate in gradient descent?', options: ['Speed of the CPU', 'Step size for parameter updates — too large: diverges; too small: too slow', 'Number of training epochs', 'Size of training data'], correctIndex: 1, explanation: 'Learning rate α: how much to adjust weights per gradient step. Too high → overshoots. Too low → slow convergence. Adaptive rates (Adam, RMSProp) adjust per-parameter.', difficulty: 'Easy', xpReward: 60, topic: 'AI & Machine Learning' },
      { id: 'gw2', text: 'What is mini-batch gradient descent?', options: ['Training on one sample at a time', 'Training on a random subset (batch) of data per update step — balances speed and gradient quality', 'Training on the full dataset at once', 'Gradient descent without batches'], correctIndex: 1, explanation: 'Mini-batch: compromise between stochastic (1 sample, noisy) and batch (full data, expensive). Typical batch sizes: 32–512. Better GPU utilisation.', difficulty: 'Medium', xpReward: 70, topic: 'AI & Machine Learning' },
      { id: 'gw3', text: 'What is dropout?', options: ['Removing neurons permanently', 'Randomly deactivating neurons during training to prevent co-adaptation and reduce overfitting', 'Removing low-weight connections', 'Reducing training data'], correctIndex: 1, explanation: 'Dropout: randomly zero out p% of neurons each forward pass. Forces redundant representations. Ensemble effect. Disabled at inference.', difficulty: 'Medium', xpReward: 80, topic: 'AI & Machine Learning' },
      { id: 'gw4', text: 'What is batch normalisation?', options: ['Normalising training data once', 'Normalising activations within a mini-batch to reduce internal covariate shift, speeding up training', 'A type of optimiser', 'Padding batches to equal size'], correctIndex: 1, explanation: 'BatchNorm: normalise layer inputs across the batch (mean 0, std 1), then scale/shift with learnable γ, β. Allows higher learning rates, reduces sensitivity to initialisation.', difficulty: 'Hard', xpReward: 90, topic: 'AI & Machine Learning' },
      { id: 'gw5', text: 'What does Adam optimiser combine?', options: ['SGD and L2 regularisation', 'Momentum (exponential moving average of gradients) and RMSProp (adaptive learning rates per parameter)', 'Batch norm and dropout', 'L1 and L2 regularisation'], correctIndex: 1, explanation: 'Adam: Adaptive Moment Estimation. Maintains per-parameter moving averages of gradients (momentum) and squared gradients (RMSProp). Default choice for most deep learning.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
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
    narrativeOutro: "The Dragon's attention fades. Your tokens are safe from its context window!",
    rewardXp: 1500,
    rewardTitle: 'Attention Master',
    questions: [
      { id: 'td1', text: 'In transformer self-attention, what are Q, K, V?', options: ['Queues, Kernels, Values', 'Query, Key, Value — attention score = softmax(QK^T / √d_k) × V', 'Questions, Knowledge, Vision', 'Quantisation, Kernel, Vector'], correctIndex: 1, explanation: "Q (query): what we're looking for. K (key): what each token offers. V (value): what we retrieve. Attention = softmax(QKᵀ/√d_k)V.", difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
      { id: 'td2', text: 'What is positional encoding in transformers?', options: ['Encoding the position of the model in memory', 'Adding position information to token embeddings since attention has no inherent sequence order', 'A compression technique', 'The index of a token in the vocabulary'], correctIndex: 1, explanation: 'Attention is permutation-invariant (order-blind). Positional encoding adds sinusoidal vectors to embeddings, injecting position information.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
      { id: 'td3', text: 'What is multi-head attention?', options: ['Attention with multiple layers', 'Running attention in parallel with different Q/K/V projections to capture different relationship types', 'Attention that processes images', 'A voting mechanism across models'], correctIndex: 1, explanation: 'Multi-head: h parallel attention mechanisms with different learned projections. Each head attends to different aspects (syntax, coreference). Outputs concatenated + projected.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
      { id: 'td4', text: 'What is a token in the context of LLMs?', options: ['A security token', 'A sub-word unit — roughly 3/4 of a word on average for English text in GPT tokenisers', 'A whole word', 'A sentence'], correctIndex: 1, explanation: 'Tokenisation: text split into sub-word pieces. "tokenization" might be ["token", "ization"]. ~4 chars/token for English. Context window measured in tokens.', difficulty: 'Medium', xpReward: 80, topic: 'AI & Machine Learning' },
      { id: 'td5', text: 'What is the difference between BERT and GPT architectures?', options: ['No difference', 'BERT: encoder-only (bidirectional, for understanding); GPT: decoder-only (autoregressive, for generation)', 'BERT is larger', 'GPT is open-source, BERT is not'], correctIndex: 1, explanation: 'BERT: bidirectional encoder. Pre-trained with masked language model. Best for classification, NER, QA. GPT: causal decoder. Pre-trained by predicting next token. Best for generation.', difficulty: 'Hard', xpReward: 100, topic: 'AI & Machine Learning' },
    ]
  },

  // === NEW QUEST: MOBILE DEVELOPMENT ===
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
      { id: 'rnc1', text: 'What is the Platform API used for in React Native?', options: ['Detecting browser type', 'Detecting the OS (ios/android) to apply platform-specific code or styles', 'Checking device platform compatibility', 'Setting platform metadata'], correctIndex: 1, explanation: 'Platform.OS === "ios" | "android" | "web". Platform.select({ ios: ..., android: ..., default: ... }). Use for platform-specific behaviour.', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
      { id: 'rnc2', text: 'What is SafeAreaView?', options: ['A secure container for sensitive data', 'A component that renders content within device safe areas (away from notch, home indicator, status bar)', 'A sandboxed web view', 'A permission boundary'], correctIndex: 1, explanation: "SafeAreaView: renders children in the safe area of the device. Accounts for notches (iPhone X+), home indicator, status bar.", difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
      { id: 'rnc3', text: 'What is the purpose of the key prop in React Native lists?', options: ['Unique identifier for the developer', 'Helps React reconcile list items efficiently — must be stable, unique per item', 'Required for accessibility', 'Sets item position in list'], correctIndex: 1, explanation: 'key prop: React uses it to identify which items changed/added/removed. Use item IDs, never array index for dynamic lists.', difficulty: 'Easy', xpReward: 50, topic: 'Mobile Development' },
      { id: 'rnc4', text: 'What is Reanimated 2 and why is it preferred over Animated?', options: ['Reanimated 2 uses JS thread for animations', 'Reanimated 2 runs animations on the native UI thread via worklets, avoiding JS thread jank', 'Reanimated 2 is just Animated with better API', 'Reanimated 2 is a library for web animations'], correctIndex: 1, explanation: 'Reanimated 2: animations run as worklets directly on the UI thread — no bridge, no JS thread. Even if JS is busy, animations stay smooth.', difficulty: 'Hard', xpReward: 90, topic: 'Mobile Development' },
      { id: 'rnc5', text: 'What is the difference between TouchableOpacity and Pressable?', options: ['TouchableOpacity is newer', 'Pressable is the modern replacement with more flexible press-state API; TouchableOpacity is the legacy component', 'Pressable only works on iOS', 'No practical difference'], correctIndex: 1, explanation: 'Pressable (RN 0.63+): modern, flexible API with press state via children-as-function. TouchableOpacity: legacy, still works but Pressable is preferred for new code.', difficulty: 'Medium', xpReward: 60, topic: 'Mobile Development' },
    ]
  },

  // === NEW QUEST: OPERATING SYSTEMS ===
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
      "Apply Coffman's conditions to break the deadlock."
    ],
    narrativeOutro: "The circular wait is broken! Processes resume. The Daemon dissolves!",
    rewardXp: 900,
    questions: [
      { id: 'dld1', text: 'What are the four Coffman conditions for deadlock?', options: ['Race condition, starvation, livelock, priority inversion', 'Mutual exclusion, hold-and-wait, no preemption, circular wait', 'Lock, unlock, signal, wait', 'Semaphore, mutex, monitor, barrier'], correctIndex: 1, explanation: 'Coffman conditions (all 4 must hold for deadlock): 1. Mutual exclusion, 2. Hold-and-wait, 3. No preemption, 4. Circular wait. Break any one to prevent deadlock.', difficulty: 'Hard', xpReward: 90, topic: 'Operating Systems' },
      { id: 'dld2', text: 'What is livelock (different from deadlock)?', options: ['Processes waiting forever', 'Processes are running but making no progress — they keep responding to each other without advancing', 'A type of memory leak', 'Processes running too fast'], correctIndex: 1, explanation: "Livelock: processes not blocked but not progressing. Like two people in a corridor both stepping aside to let the other pass — infinitely.", difficulty: 'Medium', xpReward: 80, topic: 'Operating Systems' },
      { id: 'dld3', text: 'What is priority inversion?', options: ['A scheduling bug where high-priority tasks wait for low-priority ones holding a needed resource', 'Reversing thread priorities', 'Giving all tasks equal priority', 'A CPU instruction for priority queues'], correctIndex: 0, explanation: 'Priority inversion: high-priority task waits for a resource held by a low-priority task, which is preempted by medium-priority tasks. Fixed with priority inheritance.', difficulty: 'Hard', xpReward: 90, topic: 'Operating Systems' },
      { id: 'dld4', text: 'What is the difference between a spinlock and a mutex?', options: ['No difference', 'Spinlock: busy-waits (loops) for the lock — fast for short waits, wastes CPU. Mutex: thread sleeps while waiting', 'Mutex is faster in all cases', 'Spinlocks only work in single-core systems'], correctIndex: 1, explanation: 'Spinlock: keeps checking in a loop (burns CPU). Good for very short critical sections. Mutex: thread blocks (OS scheduler removes it). Better for longer waits.', difficulty: 'Hard', xpReward: 90, topic: 'Operating Systems' },
      { id: 'dld5', text: 'What is the purpose of a condition variable?', options: ['Store conditional expressions', 'Allow threads to wait until a specific condition is true — used with a mutex to avoid busy-waiting', 'A boolean state variable', 'A type of semaphore'], correctIndex: 1, explanation: 'Condition variable: thread waits (releases mutex) until another thread signals the condition. Pattern: while (!ready) { cv.wait(lock); }. Always check in a loop (spurious wakeups).', difficulty: 'Hard', xpReward: 100, topic: 'Operating Systems' },
    ]
  },

  // === NEW QUEST: TYPESCRIPT ADVANCED ===
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
      { id: 'gh1', text: 'What does extends do in a generic constraint?', options: ['Creates inheritance', 'Restricts the generic type to be assignable to a specific type: function foo<T extends string>(x: T)', 'Extends the type with new properties', 'Merges two types'], correctIndex: 1, explanation: 'T extends U: T must be assignable to U. function getKey<T extends object>(obj: T, key: keyof T). Prevents T from being incorrect types.', difficulty: 'Medium', xpReward: 70, topic: 'TypeScript Advanced' },
      { id: 'gh2', text: 'What is the utility type ReturnType<T>?', options: ['Sets the return type of T', 'Extracts the return type of a function type T', 'Returns T unchanged', "Makes T's return type optional"], correctIndex: 1, explanation: 'ReturnType<T> = T extends (...args: any) => infer R ? R : never. Gets the return type of any function. Avoids duplicating return type annotations.', difficulty: 'Medium', xpReward: 80, topic: 'TypeScript Advanced' },
      { id: 'gh3', text: 'What is Awaited<T> in TypeScript?', options: ['Makes T async', 'Recursively unwraps the type of a Promise: Awaited<Promise<string>> = string', 'Adds awaitable interface to T', 'Converts T to a Promise'], correctIndex: 1, explanation: 'Awaited<T>: unwraps Promise types recursively. Awaited<Promise<Promise<number>>> = number. Useful with ReturnType when the function is async.', difficulty: 'Hard', xpReward: 90, topic: 'TypeScript Advanced' },
      { id: 'gh4', text: 'What is readonly modifier and how does it differ from const?', options: ['No difference', 'const: variable cannot be reassigned. readonly: property cannot be reassigned after object creation', 'readonly is stricter', 'const makes entire objects immutable'], correctIndex: 1, explanation: 'const: binding cannot be rebound (but object properties can change). readonly: property cannot be changed after construction.', difficulty: 'Medium', xpReward: 70, topic: 'TypeScript Advanced' },
      { id: 'gh5', text: 'What is the NoInfer<T> utility type (TS 5.4+)?', options: ["Prevents T from existing", 'Blocks TypeScript from using a parameter for type inference, forcing explicit provision', 'Makes T a non-inferrable any', 'Removes inference hints from T'], correctIndex: 1, explanation: "NoInfer<T>: prevents the parameter from influencing type inference for T. function createStore<T>(initial: T, fallback: NoInfer<T>). Prevents fallback from widening T.", difficulty: 'Hard', xpReward: 100, topic: 'TypeScript Advanced' },
    ]
  },

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
      { id: 'conc1', text: 'Your Node.js server increments a global counter on each request. After 1000 requests you expect 1000 but get 847. What is the root cause?', options: ['Garbage collector interference', 'Race condition — multiple requests read before the write completes', 'Integer overflow at 847', 'Event loop throttling'], correctIndex: 1, explanation: 'JavaScript is single-threaded but async callbacks can interleave. Two handlers can read the same value, both increment it, and one write is lost.', difficulty: 'Medium', xpReward: 60, topic: 'Concurrency' },
      { id: 'conc2', text: 'A Java method is synchronized void increment(). Another method read() is NOT synchronized. What problem remains?', options: ['No problem — synchronized covers the whole object', 'read() may see a stale cached value due to memory visibility', 'Deadlock is guaranteed', 'The synchronized block causes busy-waiting'], correctIndex: 1, explanation: 'Synchronized ensures mutual exclusion but not visibility to unsynchronized readers. read() may see a stale value from CPU cache. Use volatile or synchronize both methods.', difficulty: 'Hard', xpReward: 70, topic: 'Concurrency' },
      { id: 'conc3', text: 'Thread A holds Lock1 and waits for Lock2. Thread B holds Lock2 and waits for Lock1. Your app freezes. What is the fix?', options: ['Add Thread.sleep() between acquisitions', 'Always acquire locks in the same global order', 'Use volatile instead of locks', 'Increase thread pool size'], correctIndex: 1, explanation: 'Deadlock occurs when threads form a circular wait. The standard fix: establish a global lock ordering and acquire locks in that order everywhere.', difficulty: 'Medium', xpReward: 60, topic: 'Concurrency' },
      { id: 'conc4', text: 'A Go service initializes a map once at startup, then only reads it from multiple goroutines. Is this safe?', options: ['No — all map access must use sync.Map', 'Yes — concurrent reads are safe when no writes occur', 'Only safe with sync.RWMutex', 'Only safe if keys are strings'], correctIndex: 1, explanation: 'Go maps are safe for concurrent reads as long as no goroutine is writing simultaneously. Since the map is initialized once before goroutines start, this is safe.', difficulty: 'Medium', xpReward: 60, topic: 'Concurrency' },
      { id: 'conc5', text: 'A Python multiprocessing pool processes items and updates a shared list. After pool.map() finishes, the list is empty. Why?', options: ['Python lists cannot be shared', 'Each process has its own memory space — changes are not reflected in the parent', 'map() does not wait for results', 'The GIL blocks all writes'], correctIndex: 1, explanation: 'multiprocessing spawns separate OS processes, each with their own memory. To share data across processes, use multiprocessing.Manager().list() or a Queue.', difficulty: 'Hard', xpReward: 70, topic: 'Concurrency' },
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
      { id: 'gd1', text: 'You ran git rebase main on your feature branch and hit 3 conflicts — one per commit. After resolving and running git rebase --continue, 2 more conflicts appear. Why?', options: ['rebase failed silently', 'Each commit is replayed individually — each can conflict separately', 'You need to run git add -A first', 'The branch is corrupted'], correctIndex: 1, explanation: 'Rebase replays each commit in sequence. If your branch has 5 commits that all touch the same file, you may resolve a conflict 5 times — once per commit.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' },
      { id: 'gd2', text: 'A teammate force-pushed to a shared feature branch. Your local copy now diverges. What is the correct recovery?', options: ['git push --force back', 'git fetch, then git reset --hard origin/branch, then cherry-pick any unique local commits', 'git merge origin/branch', 'Delete the local branch and reclone'], correctIndex: 1, explanation: 'After a force push, the remote history changed. Reset your local branch to match the remote, then manually re-apply any of your unique commits with cherry-pick.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' },
      { id: 'gd3', text: 'You committed an API key in your last commit. The commit has NOT been pushed yet. What is the safest immediate fix?', options: ['Delete the file', 'git commit --amend to remove the sensitive data from the last commit', 'git revert', 'Close the repository'], correctIndex: 1, explanation: 'Amending the last unpushed commit rewrites it locally without creating a revert commit. Then rotate the key — treat it as compromised regardless.', difficulty: 'Easy', xpReward: 50, topic: 'Git & Version Control' },
      { id: 'gd4', text: 'git log shows A→B→C→D (D is HEAD). You need to undo commit C but keep D changes intact. Which command?', options: ['git reset --hard HEAD~2', 'git revert C (using its hash)', 'git checkout HEAD~1', 'git stash pop'], correctIndex: 1, explanation: 'git revert creates a new commit that undoes a specific commit without touching later history. Perfect when you need to undo a commit while keeping subsequent work.', difficulty: 'Medium', xpReward: 60, topic: 'Git & Version Control' },
      { id: 'gd5', text: 'You want to apply a single commit from branch hotfix to main without merging the entire branch. Which command?', options: ['git merge --squash hotfix', 'git cherry-pick <commit-hash>', 'git rebase hotfix main', 'git patch hotfix'], correctIndex: 1, explanation: 'cherry-pick applies the changes of a specific commit onto the current branch as a new commit. Ideal for backporting individual fixes.', difficulty: 'Easy', xpReward: 50, topic: 'Git & Version Control' },
    ],
  },

  {
    id: 'q_react_hooks_specter',
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
      { id: 'rspec1', text: 'A React component calls setState 3 times synchronously inside one click handler. How many re-renders occur in React 18?', options: ['3 re-renders', '1 re-render (automatic batching)', '0 re-renders until next frame', 'Depends on component type'], correctIndex: 1, explanation: 'React 18 introduced automatic batching: multiple setState calls inside event handlers (and most async contexts) are batched into a single re-render.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rspec2', text: 'In React 18 StrictMode (development), a useEffect with [] fires twice on mount. In production it fires once. Why?', options: ['Bug in your code', 'StrictMode intentionally double-invokes effects in development to surface cleanup issues', 'useEffect is non-deterministic', 'State initialization race condition'], correctIndex: 1, explanation: 'React 18 StrictMode mounts, unmounts, then remounts components in development to help you find effects that lack proper cleanup. This does not happen in production builds.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rspec3', text: 'A list of 1000 items uses key={index}. Inserting a new item at position 0 causes all 1000 items to re-render. What is the fix?', options: ['Wrap the list in React.memo', 'Use key={item.id} — stable keys prevent unnecessary reconciliation', 'Use useReducer instead of useState', 'Virtualize with a windowing library'], correctIndex: 1, explanation: 'When you use index as key and prepend an item, every index shifts by 1. React sees every item as changed. Stable unique IDs as keys let React identify which items actually changed.', difficulty: 'Easy', xpReward: 50, topic: 'React & Frontend' },
      { id: 'rspec4', text: 'You fetch data in useEffect and see the API called twice in StrictMode. The correct fix that works in both dev and prod is:', options: ['Remove StrictMode', 'Return a cleanup function using an AbortController or ignore flag', 'Use useLayoutEffect instead', 'Move the fetch outside the component'], correctIndex: 1, explanation: 'Return a cleanup from useEffect: set an ignored flag or call controller.abort(). The second call cancels and its result is discarded. This is the idiomatic React pattern.', difficulty: 'Medium', xpReward: 60, topic: 'React & Frontend' },
      { id: 'rspec5', text: 'A Context Provider uses value={{ user, theme }}. Children re-render on every parent render even when user/theme are unchanged. The fix?', options: ['Wrap children in React.lazy', 'Memoize the value with useMemo({ user, theme }, [user, theme])', 'Use useReducer for context state', 'Replace Context with prop drilling'], correctIndex: 1, explanation: 'An inline object literal creates a new reference on every render, making React think the context changed. useMemo preserves the reference as long as user and theme are the same.', difficulty: 'Hard', xpReward: 70, topic: 'React & Frontend' },
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
      { id: 'tf1', text: 'A test asserts on a hardcoded timestamp and passes locally but fails in CI at 3am. What is the root cause?', options: ['Node.js version mismatch', 'Test depends on wall-clock time — non-deterministic across environments', 'Missing environment variables in CI', 'Race condition in the test runner'], correctIndex: 1, explanation: 'Never assert on real timestamps. Mock Date or use relative assertions. Hardcoding times makes tests time-zone and clock dependent.', difficulty: 'Easy', xpReward: 50, topic: 'Testing & CI/CD' },
      { id: 'tf2', text: 'Test A mocks an HTTP call. Test B (no mock) fails with unexpected network errors. Tests pass when run in isolation. What is wrong?', options: ['Test B has a bug', 'Test A mock leaks — it was not cleaned up after the test', 'HTTP is blocked in CI', 'Import order of test files matters'], correctIndex: 1, explanation: 'A mock that is not reset/restored after each test bleeds into subsequent tests. Use beforeEach/afterEach to reset mocks, or configure your test framework to auto-restore them.', difficulty: 'Medium', xpReward: 60, topic: 'Testing & CI/CD' },
      { id: 'tf3', text: 'You write: expect(result).toEqual(computeExpected()). The test always passes even when you break the implementation. What is wrong?', options: ['Nothing — this is correct', 'You are comparing the output against itself — any bug affects both sides equally', 'toEqual does not work for objects', 'Missing await'], correctIndex: 1, explanation: 'If computeExpected() calls the same code as the function under test, any bug affects both sides equally. Tests must compare against hardcoded, independently known values.', difficulty: 'Medium', xpReward: 60, topic: 'Testing & CI/CD' },
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
      { id: 'cw1', text: 'Your Lambda function times out processing a user-uploaded file. The actual processing takes 8 seconds but Lambda hits 15s. What is likely causing the extra time?', options: ['Lambda has a bug at 15s', 'Cold start plus loading a large file — Lambda payload limit is 6MB; files should come via S3', 'VPC NAT Gateway latency', 'Memory limit too low'], correctIndex: 1, explanation: 'Lambda has a 6MB payload limit and cold starts of 200-500ms. Large files must be uploaded to S3 first; Lambda reads them from S3, not the event payload.', difficulty: 'Hard', xpReward: 70, topic: 'Cloud & DevOps' },
      { id: 'cw2', text: 'You deploy a new container version to Kubernetes. 20% of users see 503 errors for 90 seconds. What deployment strategy prevents this?', options: ['Recreate strategy (stop all old, start all new)', 'Rolling update with readiness probes that gate traffic until pods are healthy', 'Blue/green with immediate traffic switch and no health checks', 'Canary releasing 100% of traffic immediately'], correctIndex: 1, explanation: 'Rolling updates with readiness probes ensure new pods only receive traffic once they pass health checks. Old pods stay running until new ones are healthy.', difficulty: 'Medium', xpReward: 60, topic: 'Cloud & DevOps' },
      { id: 'cw3', text: 'An S3 bucket has public-read ACL on all objects. A security audit flags this as critical. What is the minimal fix that still lets your app serve images?', options: ['Keep it — it is the only option for public images', 'Generate pre-signed URLs with short expiry from your backend', 'Encrypt objects with KMS', 'Move all images to EFS'], correctIndex: 1, explanation: 'Pre-signed URLs grant time-limited access to private S3 objects. Your backend generates them on demand. Objects stay private; access is auditable and controlled.', difficulty: 'Medium', xpReward: 60, topic: 'Cloud & DevOps' },
      { id: 'cw4', text: 'A DynamoDB table is throttled every day at 8am. The partition key is the date (e.g. "2026-03-01"). What is the architectural fix?', options: ['Add a GSI on user_id', 'Add a random suffix to the partition key (write sharding) to distribute load', 'Increase RCU/WCU provisioning', 'Switch to RDS Aurora'], correctIndex: 1, explanation: 'Using a date as partition key creates a hot partition — all traffic for today goes to one shard. Write sharding (appending a random 0-N suffix) distributes writes across N partitions.', difficulty: 'Hard', xpReward: 70, topic: 'Cloud & DevOps' },
    ],
  },

  {
    id: 'q_backend_ogre',
    title: 'The N+1 Ogre',
    description: 'One endpoint, 150 queries. The database weeps. The ogre feasts on unoptimized ORM calls.',
    levelRequired: 3,
    enemyName: 'N+1 Query',
    enemyImage: '👾',
    enemyMaxHp: 165,
    enemyAttackDamage: 21,
    narrativeIntro: ['The API endpoint takes 2.3 seconds.', 'A profiler reveals 150 SQL queries for a single request.', 'The N+1 Ogre has invaded your data layer!'],
    narrativeOutro: 'One query. 50 users with posts. The ogre is slain.',
    rewardXp: 500,
    questions: [
      { id: 'bo1', text: 'An API endpoint returns 50 users with their posts and takes 2.3s. Profiling shows 151 SQL queries. What is the problem?', options: ['Database is undersized', 'N+1 query problem — one query fetches users, then one per user fetches posts', 'Missing index on user_id', 'Connection pool exhausted'], correctIndex: 1, explanation: 'N+1 is a classic ORM problem: 1 query for users + N queries for posts. Fix with eager loading (JOIN or include in ORM) to fetch everything in 1-2 queries.', difficulty: 'Medium', xpReward: 60, topic: 'Backend & Servers' },
      { id: 'bo2', text: 'An endpoint builds: SELECT * FROM users WHERE id = ${req.params.id}. A tester sends id = "1 OR 1=1". What happens?', options: ['Database returns an error', 'SQL injection — the query returns all users', 'The app returns a 404', 'ORMs automatically prevent this'], correctIndex: 1, explanation: 'String interpolation directly into SQL enables injection. Always use parameterized queries: WHERE id = $1 with [req.params.id] as the bound parameter.', difficulty: 'Easy', xpReward: 50, topic: 'Backend & Servers' },
      { id: 'bo3', text: 'Your Node.js Express server does CPU-intensive image resizing synchronously in the request handler. Throughput drops to 5 req/s. The correct fix is:', options: ['Add more await calls', 'Offload to a worker thread or message queue to keep the event loop free', 'Increase Node.js heap with --max-old-space-size', 'Use async/await around the resize call'], correctIndex: 1, explanation: 'Node.js is single-threaded. CPU-bound work blocks the event loop, preventing other requests from being served. Worker threads or a queue keep the main thread free.', difficulty: 'Hard', xpReward: 70, topic: 'Backend & Servers' },
      { id: 'bo4', text: 'A REST API returns HTTP 200 with body { "error": "User not found" }. Why is this a problem?', options: ['200 is only for HTML responses', 'Clients cannot detect errors without parsing the body — use HTTP 404 instead', 'The key "error" is not valid JSON', 'JSON error bodies are not allowed in REST'], correctIndex: 1, explanation: 'HTTP status codes are the contract. A 200 with an error body forces clients to inspect the body on every call. Use the correct status (404, 400, 500) so clients and monitoring tools work correctly.', difficulty: 'Easy', xpReward: 50, topic: 'Backend & Servers' },
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
      { id: 'gi3', text: 'You need a data structure that returns the maximum element in O(1) and supports O(log n) insertion and deletion. Which fits?', options: ['Sorted array', 'Max-heap', 'Hash map', 'Balanced BST'], correctIndex: 1, explanation: 'A max-heap keeps the maximum at the root (O(1) access) and rebalances on insert/delete in O(log n). A BST has O(log n) max access (requires traversal to rightmost node).', difficulty: 'Medium', xpReward: 60, topic: 'General CS' },
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
      { id: 'oi1', text: 'Class Square extends Rectangle. Setting Square width also sets height. A function that doubles a Rectangle width breaks when given a Square. Which SOLID principle is violated?', options: ['Single Responsibility', 'Liskov Substitution Principle — Square cannot be used wherever Rectangle is expected', 'Interface Segregation', 'Dependency Inversion'], correctIndex: 1, explanation: 'LSP: subtypes must be substitutable for their base types without breaking behavior. Square violates this because it changes the Rectangle contract (independent width/height).', difficulty: 'Hard', xpReward: 70, topic: 'OOP & Design Patterns' },
      { id: 'oi2', text: 'A Logger class writes to file, writes to a database, AND sends email alerts in one class. A bug in the email code breaks file logging. Which principle is violated?', options: ['DRY', 'Single Responsibility Principle — Logger has three unrelated reasons to change', 'Open/Closed', 'Dependency Inversion'], correctIndex: 1, explanation: 'SRP: a class should have one reason to change. Mixing file I/O, database writes, and SMTP in one class means any of three external systems can break the whole thing.', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'oi3', text: 'An interface has 20 methods. A class implementing it throws NotImplementedException for 15 of them. Which principle is violated?', options: ['DRY', 'Interface Segregation Principle — the interface is too fat; split into smaller focused interfaces', 'Open/Closed', 'Liskov Substitution'], correctIndex: 1, explanation: 'ISP: clients should not be forced to implement methods they do not use. Split the 20-method interface into smaller role interfaces (e.g., Readable, Writable, Configurable).', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'oi4', text: 'OrderService directly instantiates MySQLOrderRepository in its constructor: this.repo = new MySQLOrderRepository(). What is the key problem?', options: ['Performance overhead of construction', 'Tight coupling — OrderService cannot be tested or reconfigured without modifying its source (violates DIP)', 'Memory leak from new keyword', 'Thread safety issue'], correctIndex: 1, explanation: 'DIP: high-level modules should depend on abstractions, not concretions. Inject an IOrderRepository interface; let the caller decide the implementation. Now you can swap MySQL for a mock.', difficulty: 'Medium', xpReward: 60, topic: 'OOP & Design Patterns' },
      { id: 'oi5', text: 'You add PDF export to a class that already exports CSV and JSON by adding if (format === "PDF") inside the existing method. Which principle does this violate?', options: ['Single Responsibility', 'Open/Closed Principle — the class should be open for extension but closed for modification', 'Liskov Substitution', 'Interface Segregation'], correctIndex: 1, explanation: 'OCP: adding new behavior should not require modifying existing code. Use polymorphism: create a PDFExporter that implements IExporter, just like CSVExporter and JSONExporter.', difficulty: 'Hard', xpReward: 70, topic: 'OOP & Design Patterns' },
    ],
  },
];
