
import { User, CosmeticItem, HeroClass, HeroRace, TileType, Npc, SkillNode, Spell, ClassData, RaceData, SETopic } from './types';
import { LIBRARY_BOOKS } from './lib/content/flashcards';
import { QUESTS } from './lib/content/quests';
export { LIBRARY_BOOKS, QUESTS };

// --- SOFTWARE ENGINEERING TOPICS (for study path & mastery) ---
export const SE_TOPICS: SETopic[] = [
  'Algorithms', 'Data Structures', 'OOP & Design Patterns', 'SQL & Databases', 'Git & Version Control',
  'System Design', 'Networking & APIs', 'Security', 'Testing & CI/CD', 'JavaScript/TypeScript',
  'React & Frontend', 'Backend & Servers', 'Cloud & DevOps', 'Concurrency', 'General CS',
  'Software Architecture', 'AI & Machine Learning', 'Mobile Development', 'Operating Systems', 'TypeScript Advanced'
];

// Image assets relative to the project root
export const RACE_SPRITE_URL = "https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNjk1YjBhNTQ5MDQwODE5MWFmYjcxMGIyYTZiMGVlZmQ6ZmlsZV8wMDAwMDAwMDJjNzQ3MWY0YmU0NjZhMDk5YTkzZDM2MiIsInRzIjoiMjA0NTgiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImYzY2YxMDZkNDdmZDVjMjk2MjJjYTg5ZjA3MzUwMTYzMmUxNDhlMjQ2MjJhOGY1YWJjNjAzNjUyMmU1MDQ4YTUiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY3AiOm51bGwsIm1hIjpudWxsfQ==";
export const BOSS_SPRITE_URL = "https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sprites/bosses.png";

// --- AUDIO ASSETS ---
export const AUDIO_URLS = {
  bgm: {
    mainTheme: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/33%20-%20Main%20Theme.mp3',
    goodTheme: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/31%20-%20Good%20Theme.mp3',
    adventure: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/01%20-%20AI%20Theme%20I.mp3',
    mystery: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/02%20-%20AI%20Theme%20II.mp3',
    battle: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/03%20-%20AI%20Theme%20III.mp3',
  },
  sfx: {
    victory: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/07%20-%20Battle%20Victory.mp3',
    defeat: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/04%20-%20Battle%20Defeat.mp3',
    attack: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/05%20-%20Battle%20Attack.mp3', 
    damage: 'https://qnurovjrxgproedytlyk.supabase.co/storage/v1/object/public/sound/themes/06%20-%20Battle%20Damage.mp3',
  }
};

// --- SPELLS (Learned Technologies) ---
export const SPELLS: Record<string, Spell> = {
    'spell_java': { id: 'spell_java', name: 'Java Juggernaut', description: 'Summons a compiled golem of strict typing.', iconId: 'Coffee', school: 'ARCANE', color: 'text-orange-500' },
    'spell_sql': { id: 'spell_sql', name: 'Query Crush', description: 'Joins the earth to crush enemies with relational force.', iconId: 'Database', school: 'TECH', color: 'text-blue-400' },
    'spell_cloud': { id: 'spell_cloud', name: 'Cloud Burst', description: 'Rains scalable instances upon the battlefield.', iconId: 'Cloud', school: 'NATURE', color: 'text-sky-300' },
    'spell_cicd': { id: 'spell_cicd', name: 'Pipeline Pulse', description: 'Automates damage delivery in continuous waves.', iconId: 'Activity', school: 'TECH', color: 'text-green-400' },
    'spell_kotlin': { id: 'spell_kotlin', name: 'Kotlin Kinetic', description: 'Concise and interoperable energy blast.', iconId: 'Zap', school: 'ARCANE', color: 'text-purple-400' },
    'spell_react': { id: 'spell_react', name: 'Virtual DOM Shield', description: 'A reactive barrier that updates on damage.', iconId: 'Code', school: 'TECH', color: 'text-cyan-400' },
    'spell_git': { id: 'spell_git', name: 'Branch Reality', description: 'Creates a fork in time to dodge attacks.', iconId: 'GitBranch', school: 'VOID', color: 'text-red-400' }
};

// --- SKILL TREE (CONSTELLATION) LAYOUT ---
export const SKILL_TREE: SkillNode[] = [
  { id: 'node_algo', bookId: 'book_algo', label: 'Algorithms', x: 50, y: 90, parents: [] },
  { id: 'node_ds', bookId: 'book_datastruct', label: 'Data Structures', x: 50, y: 75, parents: ['node_algo'] },
  
  // Left: Backend/Data
  { id: 'node_java', bookId: 'book_java', label: 'Java Core', x: 25, y: 65, parents: ['node_ds'] },
  { id: 'node_sql', bookId: 'book_sql', label: 'SQL Mastery', x: 10, y: 55, parents: ['node_java'] },
  { id: 'node_kotlin', bookId: 'book_kotlin', label: 'Kotlin', x: 35, y: 55, parents: ['node_java'] },

  // Right: Web/Cloud
  { id: 'node_react', bookId: 'book_react', label: 'React UI', x: 75, y: 65, parents: ['node_ds'] },
  { id: 'node_cloud', bookId: 'book_cloud', label: 'Cloud Ops', x: 85, y: 50, parents: ['node_react'] },
  { id: 'node_cicd', bookId: 'book_cicd', label: 'DevOps & CI/CD', x: 65, y: 50, parents: ['node_react'] },

  // Top
  { id: 'node_security', bookId: 'book_security', label: 'Cyber Security', x: 50, y: 30, parents: ['node_sql', 'node_cloud'] },
];

// --- WORLD MAP CONFIGURATION ---
// (Same as before, abbreviated for brevity)
export const MAP_LAYOUT: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 3, 3, 2, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 3, 3, 3, 2, 1, 0, 0, 1, 2, 0, 0, 0, 0, 0, 1, 0, 1, 2, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 3, 3, 3, 2, 1, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 1, 2, 3, 3, 3, 0, 0, 4, 4, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 0, 0, 0, 2],
  [2, 2, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 4, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 0, 0, 0, 0, 2],
  [2, 1, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 4, 0, 1, 1, 0, 4, 0, 0, 4, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 1, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 4, 0, 1, 1, 0, 4, 0, 0, 4, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 1, 1, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 4, 0, 0, 4, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 2],
  [2, 1, 1, 1, 2, 0, 0, 1, 1, 0, 4, 0, 1, 1, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 4, 0, 0, 4, 0, 4, 0, 0, 4, 0, 4, 0, 0, 2],
  [2, 1, 1, 1, 2, 2, 2, 2, 1, 0, 4, 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 3, 2, 0, 1, 1, 1, 1, 1, 0, 0, 0, 4, 0, 1, 4, 0, 0, 4, 0, 1, 4, 0, 4, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 3, 2, 0, 1, 1, 1, 1, 1, 0, 0, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 2],
  [2, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 2, 3, 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 2, 0, 0, 0, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 4, 0, 3, 3, 3, 3, 3, 0, 0, 0, 2, 3, 2, 2, 2, 2, 4, 2, 2, 2, 2, 4, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 1, 1, 4, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 1, 1, 1, 0, 0, 0, 2],
  [2, 1, 1, 4, 0, 3, 3, 3, 3, 3, 0, 1, 1, 1, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 4, 0, 0, 1, 0, 1, 0, 0, 2],
  [2, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 4, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 4, 0, 1, 0, 1, 0, 0, 0, 2],
  [2, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];

export const TILE_MAPPING: Record<number, TileType> = {
  0: 'GRASS',
  1: 'FOREST',
  2: 'MOUNTAIN',
  3: 'WATER',
  4: 'PATH',
  5: 'CASTLE_FLOOR'
};

// --- WORLD NPCS ---
export const WORLD_NPCS: Npc[] = [
  {
    id: 'npc_mentor',
    name: 'Grandmaster Code',
    sprite: '/sprites/world/npc-mentor.svg',
    position: { x: 10, y: 5 },
    hasMet: false,
    startingNodeId: 'start',
    dialogueTree: {
        'start': { id: 'start', text: "Greetings, Initiate. The digital realm is vast. Have you studied your Spellbook?", options: [{ text: "Not yet.", nextId: 'end' }, { text: "I seek battle.", nextId: 'bugs' }, { text: "Tell me about the Glitch.", nextId: 'lore' }] },
        'bugs': { id: 'bugs', text: "Then venture into the tall grass. But beware the Legacy Code.", options: [{ text: "I will.", nextId: 'end' }] },
        'lore': { id: 'lore', text: "Long ago, the Source Code was pure. Then the Spaghettification began. We rely on heroes like you to refactor reality.", options: [{ text: "I won't let you down.", nextId: 'end' }]},
        'end': { id: 'end', text: "Go forth.", options: [] }
    }
  },
  {
    id: 'npc_duelist',
    name: 'Rival Red',
    sprite: '/sprites/world/npc-duelist.svg',
    position: { x: 12, y: 7 },
    hasMet: false,
    level: 3,
    class: 'ROGUE',
    race: 'ORC',
    isPlayer: true, 
    startingNodeId: 'intro',
    dialogueTree: {
        'intro': { id: 'intro', text: "You think you can code? Let's settle this in the arena!", options: [{ text: "Duel me!", nextId: 'fight', trigger: 'CLOSE' }, { text: "Maybe later.", nextId: 'end' }] },
        'end': { id: 'end', text: "Coward.", options: [] }
    }
  },
  {
    id: 'npc_db_master',
    name: 'Oracle DBA',
    sprite: '/sprites/world/npc-oracle.svg',
    position: { x: 32, y: 8 },
    hasMet: false,
    startingNodeId: 'start',
    dialogueTree: {
        'start': { id: 'start', text: "The data flows like a river here. But beware the deadlocks.", options: [{ text: "I seek knowledge of ACID.", nextId: 'acid' }, { text: "Just passing through.", nextId: 'end' }] },
        'acid': { id: 'acid', text: "Atomicity, Consistency, Isolation, Durability. Without these, we are but chaos.", options: [{ text: "I understand.", nextId: 'end' }] },
        'end': { id: 'end', text: "Commit your changes often.", options: [] }
    }
  },
  {
    id: 'npc_linux',
    name: 'Linus the Kernellord',
    sprite: '/sprites/world/npc-kernellord.svg',
    position: { x: 10, y: 15 },
    hasMet: false,
    startingNodeId: 'intro',
    dialogueTree: {
        'intro': { id: 'intro', text: "You do not have sudo privileges here, traveler. What is your business?", options: [{ text: "I want to learn the command line.", nextId: 'cli' }, { text: "Just browsing.", nextId: 'end' }] },
        'cli': { id: 'cli', text: "The CLI is a weapon of precision. Are you ready to hunt the Memory Leak Ooze?", options: [{ text: "I am ready.", nextId: 'quest_mem_leak', trigger: 'CLOSE' }, { text: "Sounds dangerous.", nextId: 'end' }] },
        'quest_mem_leak': { id: 'quest_mem_leak', text: "Go then. Find the Ooze in the Swamp of Overflow and terminate its process.", options: [] },
        'end': { id: 'end', text: "Exit code 0.", options: [] }
    }
  },
  {
    id: 'npc_merchant',
    name: 'The Merchant of Nodes',
    sprite: '/sprites/world/npc-merchant.svg',
    position: { x: 25, y: 12 },
    hasMet: false,
    startingNodeId: 'intro',
    dialogueTree: {
        'intro': { id: 'intro', text: "Dependencies... I have them all. Some deprecated, some experimental.", options: [{ text: "Show me your wares.", nextId: 'shop' }, { text: "Is this package safe?", nextId: 'lore' }] },
        'shop': { id: 'shop', text: "Ah, I see you eye the Scroll of Deadlocks. A risky choice.", options: [{ text: "I'll take it.", nextId: 'buy', trigger: 'UNLOCK_ITEM' }, { text: "Too expensive.", nextId: 'end' }] },
        'lore': { id: 'lore', text: "Safe? Nothing in the npm jungle is safe, friend. Always audit your supply chain.", options: [{ text: "Wise words.", nextId: 'end' }] },
        'buy': { id: 'buy', text: "A pleasure doing business. No refunds on beta versions.", options: [] },
        'end': { id: 'end', text: "Come back when you need an upgrade.", options: [] }
    }
  },
  {
    id: 'npc_network_sage',
    name: 'Packet the Sage',
    sprite: '/sprites/world/npc-network-sage.svg',
    position: { x: 30, y: 10 },
    hasMet: false,
    rewardXp: 75,
    startingNodeId: 'start',
    dialogueTree: {
        'start': { id: 'start', text: "Every message must traverse the layers. Do you know TCP from UDP?", options: [{ text: "Teach me about protocols.", nextId: 'teach' }, { text: "What is the OSI model?", nextId: 'osi' }, { text: "Just exploring.", nextId: 'end' }] },
        'teach': { id: 'teach', text: "TCP guarantees delivery with handshakes. UDP is fire-and-forget — fast but unreliable. Choose wisely for each use case.", options: [{ text: "When should I use UDP?", nextId: 'udp' }, { text: "Understood!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'osi': { id: 'osi', text: "Physical, Data Link, Network, Transport, Session, Presentation, Application. Seven layers between you and the user.", options: [{ text: "That's a lot of layers!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'udp': { id: 'udp', text: "Video streaming, gaming, DNS lookups — anywhere speed matters more than perfect delivery.", options: [{ text: "Thanks!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'end': { id: 'end', text: "May your packets never be lost.", options: [] }
    }
  },
  {
    id: 'npc_devops_bot',
    name: 'Captain Deploy',
    sprite: '/sprites/world/npc-captain-deploy.svg',
    position: { x: 28, y: 17 },
    hasMet: false,
    rewardXp: 75,
    startingNodeId: 'start',
    dialogueTree: {
        'start': { id: 'start', text: "Infrastructure as Code, soldier! We deploy at dawn.", options: [{ text: "What is CI/CD?", nextId: 'cicd' }, { text: "Tell me about containers.", nextId: 'docker' }, { text: "At ease.", nextId: 'end' }] },
        'cicd': { id: 'cicd', text: "Continuous Integration: merge & build often. Continuous Delivery: always be ready to ship. Automate everything!", options: [{ text: "What tools should I use?", nextId: 'tools' }, { text: "Understood!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'docker': { id: 'docker', text: "Containers package your app and its dependencies. Docker builds them, Kubernetes orchestrates them at scale.", options: [{ text: "Container vs VM?", nextId: 'vm' }, { text: "Roger that!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'tools': { id: 'tools', text: "GitHub Actions, Jenkins, GitLab CI, ArgoCD — pick one and master the pipeline.", options: [{ text: "Thanks, Captain!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'vm': { id: 'vm', text: "VMs virtualize hardware (full OS). Containers virtualize the OS (share the kernel). Containers are lighter and faster.", options: [{ text: "Great lesson!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'end': { id: 'end', text: "Ship it! 🚢", options: [] }
    }
  },
  {
    id: 'npc_frontend_fairy',
    name: 'Pixel the Fairy',
    sprite: '/sprites/world/npc-pixel-fairy.svg',
    position: { x: 34, y: 20 },
    hasMet: false,
    rewardXp: 75,
    startingNodeId: 'start',
    dialogueTree: {
        'start': { id: 'start', text: "Welcome to the Gardens of UI! Every pixel tells a story here.", options: [{ text: "Teach me about React.", nextId: 'react' }, { text: "What makes good UI?", nextId: 'design' }, { text: "Just admiring the views.", nextId: 'end' }] },
        'react': { id: 'react', text: "Components are reusable building blocks. State drives what you see. Props flow data down. Effects handle side effects.", options: [{ text: "What about hooks?", nextId: 'hooks' }, { text: "Cool!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'hooks': { id: 'hooks', text: "useState for state, useEffect for side effects, useRef for refs, useMemo for caching, useCallback for stable functions. Learn these five and you're dangerous!", options: [{ text: "Thank you, Pixel!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'design': { id: 'design', text: "Consistency, hierarchy, whitespace, and feedback. Your interface should feel alive — responsive to every touch.", options: [{ text: "Wise words!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'end': { id: 'end', text: "May your layouts never break! ✨", options: [] }
    }
  },
  {
    id: 'npc_security_warden',
    name: 'Warden Firewall',
    sprite: '/sprites/world/npc-firewall-warden.svg',
    position: { x: 4, y: 14 },
    hasMet: false,
    rewardXp: 75,
    startingNodeId: 'start',
    dialogueTree: {
        'start': { id: 'start', text: "Halt! Do you know the OWASP Top 10? These lands are full of vulnerabilities.", options: [{ text: "What is OWASP?", nextId: 'owasp' }, { text: "Tell me about XSS.", nextId: 'xss' }, { text: "I'm just passing through.", nextId: 'end' }] },
        'owasp': { id: 'owasp', text: "Open Web Application Security Project. Their Top 10 lists the most critical web security risks: injection, broken auth, XSS, and more.", options: [{ text: "How do I defend against injection?", nextId: 'injection' }, { text: "I'll study the list!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'xss': { id: 'xss', text: "Cross-Site Scripting: attackers inject malicious scripts into web pages. Always sanitize user input and use Content Security Policy headers.", options: [{ text: "Good to know!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'injection': { id: 'injection', text: "Never build SQL queries with string concatenation. Use parameterized queries, ORMs, and input validation. Trust nothing from the user!", options: [{ text: "Solid advice!", nextId: 'end', trigger: 'GIVE_XP' }] },
        'end': { id: 'end', text: "Stay vigilant, traveler. The attackers never rest.", options: [] }
    }
  }
];

// --- CLASSES & RACES ---
export const CLASS_OPTIONS: ClassData[] = [
  { id: 'WARRIOR', name: 'Warrior', iconId: 'Sword', desc: 'Strength and valor.', stats: { str: 4, int: 1, agi: 2 }, bodyId: 'body_red', weaponId: 'weapon_sword' },
  { id: 'MAGE', name: 'Mage', iconId: 'Zap', desc: 'Arcane mastery.', stats: { str: 1, int: 4, agi: 2 }, bodyId: 'body_novice', weaponId: 'weapon_wand' },
  { id: 'ROGUE', name: 'Rogue', iconId: 'Ghost', desc: 'Swift and unseen.', stats: { str: 2, int: 2, agi: 4 }, bodyId: 'body_hoodie', weaponId: 'weapon_sword' },
  { id: 'PALADIN', name: 'Paladin', iconId: 'Shield', desc: 'Holy warrior of clean code.', stats: { str: 3, int: 2, "agi": 0 }, bodyId: 'body_gold', weaponId: 'weapon_hammer' },
  { id: 'BARD', name: 'Bard', iconId: 'Music', desc: 'Weaves code into song.', stats: { str: 1, int: 3, "agi": 3 }, bodyId: 'body_green', weaponId: 'weapon_scroll' },
  { id: 'NECROMANCER', name: 'Necromancer', iconId: 'Skull', desc: 'Revives dead processes.', stats: { str: 1, int: 5, "agi": 1 }, bodyId: 'body_midnight', weaponId: 'weapon_python_staff' },
  { id: 'MONK', name: 'Monk', iconId: 'Crosshair', desc: 'Disciplined syntax.', stats: { str: 2, int: 2, "agi": 5 }, bodyId: 'body_novice', weaponId: 'weapon_keyboard' }
];

export const RACE_OPTIONS: RaceData[] = [
  { id: 'HUMAN', name: 'Human', iconId: 'User', desc: 'Versatile.', stats: { str: 1, int: 1, agi: 1 }, spritePos: '0% 0%', passiveName: 'Resourceful', passiveDesc: '15% heal chance.' },
  { id: 'ELF', name: 'Elf', iconId: 'Eye', desc: 'Ancient and wise.', stats: { str: 0, int: 2, agi: 1 }, spritePos: '50% 0%', passiveName: 'Elven Accuracy', passiveDesc: 'Increased Crit chance.' },
  { id: 'DWARF', name: 'Dwarf', iconId: 'Hammer', desc: 'Stout and skilled.', stats: { str: 2, int: 1, agi: 0 }, spritePos: '100% 0%', passiveName: 'Iron Skin', passiveDesc: 'Damage reduction.' },
  { id: 'ORC', name: 'Orc', iconId: 'Shield', desc: 'Fierce and strong.', stats: { str: 3, int: 0, "agi": 0 }, spritePos: '0% 50%', passiveName: 'Blood Rage', passiveDesc: 'Damage increases at low HP.' },
  { id: 'HALFLING', name: 'Halfling', iconId: 'Coffee', desc: 'Lucky and nimble.', stats: { str: 0, int: 1, agi: 2 }, spritePos: '50% 50%', passiveName: 'Lucky Dodge', passiveDesc: 'Chance to avoid damage.' },
  { id: 'DRAGONKIN', name: 'Dragonkin', iconId: 'Flame', desc: 'Born of fire.', stats: { str: 2, int: 1, agi: 0 }, spritePos: '100% 50%', passiveName: 'Inner Fire', passiveDesc: 'Bonus damage.' },
  { id: 'FAIRY', name: 'Fairy', iconId: 'Zap', desc: 'Magical and quick.', stats: { str: 0, int: 2, agi: 2 }, spritePos: '0% 100%', passiveName: 'Pixie Dust', passiveDesc: 'Passive healing.' },
  { id: 'DEMON', name: 'Demon', iconId: 'Ghost', desc: 'Power at a cost.', stats: { str: 2, int: 0, agi: 2 }, spritePos: '50% 100%', passiveName: 'Soul Siphon', passiveDesc: 'Heal on Crit.' },
  { id: 'UNDEAD', name: 'Undead', iconId: 'Skull', desc: 'Eternal coding.', stats: { str: 1, int: 3, agi: 0 }, spritePos: '100% 100%', passiveName: 'Grim Resolve', passiveDesc: 'Survive fatal damage once.' },
  { id: 'CONSTRUCT', name: 'Construct', iconId: 'Cpu', desc: 'Built, not born.', stats: { str: 2, int: 2, agi: 0 }, spritePos: '0% 0%', passiveName: 'Compiled', passiveDesc: 'Immune to fatigue.' },
  { id: 'GOBLIN', name: 'Goblin', iconId: 'Bug', desc: 'Greedy and chaotic.', stats: { str: 1, int: 1, agi: 3 }, passiveName: 'Scavenge', passiveDesc: 'Increases loot drops.' },
  { id: 'CELESTIAL', name: 'Celestial', iconId: 'Star', desc: 'Divine logic.', stats: { str: 1, int: 4, agi: 1 }, passiveName: 'Divine Compile', passiveDesc: 'Perfect syntax grants bonus XP.' },
  { id: 'CYBORG', name: 'Cyborg', iconId: 'Terminal', desc: 'Flesh and chrome.', stats: { str: 2, int: 2, agi: 2 }, passiveName: 'Overclock', passiveDesc: 'Chance to attack twice.' }
];

export const COSMETIC_ITEMS: CosmeticItem[] = [
  { id: 'head_novice', name: 'Novice Hood', type: 'HEAD', levelRequired: 1, iconId: 'User', styleClass: 'border-slate-500', rarity: 'common' },
  // ... others
];

export const INITIAL_USER: User = {
  username: 'Guest Hero',
  level: 1,
  xp: 0,
  maxXp: 500,
  completedQuests: [],
  completedBooks: [],
  unlockedItems: [],
  title: 'Novice Engineer',
  appearance: { headId: 'head_novice', bodyId: 'body_novice', weaponId: 'weapon_scroll' }
};

/** Unique topics the user has practiced (from completed quests + books). */
export function getTopicsPracticed(completedQuests: string[], completedBooks: string[]): SETopic[] {
  const set = new Set<SETopic>();
  for (const q of QUESTS) {
    if (!completedQuests.includes(q.id)) continue;
    for (const qu of q.questions) {
      if (qu.topic) set.add(qu.topic);
    }
  }
  for (const b of LIBRARY_BOOKS) {
    if (!completedBooks.includes(b.id)) continue;
    for (const qu of b.questions) {
      if (qu.topic) set.add(qu.topic);
    }
  }
  return Array.from(set).sort();
}
