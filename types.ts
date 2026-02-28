
export interface User {
  username: string;
  level: number;
  xp: number;
  maxXp: number;
  completedQuests: string[]; // IDs
  completedBooks: string[]; // IDs
  unlockedItems: string[]; // IDs of cosmetics unlocked via special means (bypassing level)
  title: string;
  appearance: CharacterAppearance;
  heroClass?: HeroClass;
  heroRace?: HeroRace;
  gender?: Gender;
  stats?: {
    str: number;
    int: number;
    agi: number;
  };
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export type HeroClass = 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PALADIN' | 'BARD' | 'NECROMANCER' | 'MONK';
export type HeroRace = 'HUMAN' | 'ELF' | 'DWARF' | 'ORC' | 'HALFLING' | 'DRAGONKIN' | 'FAIRY' | 'DEMON' | 'UNDEAD' | 'CONSTRUCT' | 'GOBLIN' | 'CELESTIAL' | 'CYBORG';
export type Gender = 'MALE' | 'FEMALE';

export type CosmeticType = 'HEAD' | 'BODY' | 'WEAPON';

export interface CosmeticItem {
  id: string;
  name: string;
  type: CosmeticType;
  levelRequired: number;
  iconId: string; // Key to map to icon component
  styleClass: string; // Tailwind classes for color/border
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CharacterAppearance {
  headId: string;
  bodyId: string;
  weaponId: string;
}

/** Software engineering topic for study tracking and filtering */
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

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  /** Topic for study path and "Topics Practiced" */
  topic?: SETopic;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  description: string;
  content: string[]; // Paragraphs of "Lore/Learning"
  questions: Question[];
  rewardXp: number;
  rewardItemId?: string; // ID of a cosmetic item
  spellId?: string; // Links to a Spell
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  iconId: string;
  school: 'ARCANE' | 'FIRE' | 'ICE' | 'NATURE' | 'HOLY' | 'VOID' | 'TECH';
  color: string;
}

export interface SkillNode {
  id: string;
  bookId: string; // Links to LibraryBook
  x: number; // Percent 0-100 (Left)
  y: number; // Percent 0-100 (Top)
  parents: string[]; // IDs of parent nodes (Prerequisites)
  label: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  levelRequired: number;
  narrativeIntro: string[];
  narrativeOutro: string;
  questions: Question[];
  rewardXp: number;
  rewardTitle?: string;
  enemyName: string;
  enemyImage?: string; // Emoji or placeholder URL
  enemySpritePos?: string; // Background position for bosses.png (e.g., '0% 0%')
  enemyMaxHp?: number;
  enemyAttackDamage?: number;
  nextQuestIds?: string[]; // For branching
  isPvP?: boolean; // If true, uses Stance System instead of Quiz
  enemyUser?: User; // For PvP simulation
}

export interface RaceData {
  id: HeroRace;
  name: string;
  iconId: string;
  desc: string;
  stats: { str: number; int: number; agi: number };
  spritePos?: string;
  imgUrl?: string;
  passiveName?: string;
  passiveDesc?: string;
}

export interface ClassData {
  id: HeroClass;
  name: string;
  iconId: string;
  desc: string;
  stats: { str: number; int: number; agi: number };
  bodyId: string;
  weaponId: string;
}

export type GameScreen = 'LOGIN' | 'HUB' | 'QUEST_SELECT' | 'BATTLE' | 'PROFILE' | 'CUSTOMIZE' | 'TRAINING' | 'WORLD' | 'LIBRARY' | 'PVP_LOBBY' | 'SPELLBOOK' | 'ADMIN' | 'STUDY_HUB' | 'CS_REFERENCE' | 'ALGO_VISUALIZER' | 'INTERVIEW_PREP' | 'PROGRESS' | 'SYSTEM_DESIGN';

export interface GameState {
  user: User | null;
  currentScreen: GameScreen;
  activeQuestId: string | null;
}

// --- World Map Types ---
export type TileType = 'GRASS' | 'FOREST' | 'MOUNTAIN' | 'WATER' | 'PATH' | 'CASTLE_FLOOR';

export interface Position {
  x: number;
  y: number;
}

// --- New Dialogue System ---
export interface DialogueOption {
  text: string;
  nextId: string;
  trigger?: 'HEAL' | 'GIVE_XP' | 'UNLOCK_ITEM' | 'CLOSE';
  // Requirements for option to appear
  reqQuestId?: string; // Quest must be in completedQuests
  reqItemId?: string; // Item must be in unlockedItems OR currently equipped
  reqLevel?: number;
}

export interface DialogueNode {
  id: string;
  text: string;
  speaker?: string; // If different from NPC name
  options?: DialogueOption[]; // If null, click to continue to nextId or close
  nextId?: string; // Linear progression
}

export interface Npc {
  id: string;
  name: string;
  sprite: string; // Emoji or Icon ID
  position: Position;
  dialogueTree: Record<string, DialogueNode>; // ID -> Node
  startingNodeId: string;
  // Dynamic entry points based on state. Checked in order.
  dynamicStart?: {
    reqQuestId?: string;
    reqItemId?: string;
    reqLevel?: number;
    nodeId: string;
  }[];
  rewardXp?: number; // Legacy, kept for simple interactions
  hasMet: boolean;
  isPlayer?: boolean;
  level?: number;
  race?: HeroRace;
  class?: HeroClass;
}

// --- Combat Types ---
export type BodyZone = 'HEAD' | 'TORSO' | 'ARMS' | 'LEGS';

// --- Chat Types ---
export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: 'GLOBAL' | 'LOCAL' | 'WHISPER' | 'SYSTEM';
  timestamp: number;
}

export type CombatPhase =
  | { phase: 'INTRO' }
  | { phase: 'PLAYER_TURN' }
  | { phase: 'RESOLVING'; wasCorrect: boolean }
  | { phase: 'ENEMY_TURN' }
  | { phase: 'VICTORY' }
  | { phase: 'DEFEAT' };
