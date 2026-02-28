
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Quest, Position, TileType, Npc, ChatMessage, DialogueNode, DialogueOption, RaceData, ClassData, CosmeticItem, HeroClass, HeroRace, SETopic } from '../types';
import { MAP_LAYOUT, TILE_MAPPING, QUESTS } from '../constants';
import { HeroAvatar } from './HeroAvatar';
import { FantasyButton, ParchmentPanel } from './ui';
import { findPath } from '../lib/pathfinding';
import { pseudoRandom } from '../lib/gameLogic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Map as MapIcon,
  MessageCircle, TreePine, Mountain, Waves, Castle, Compass, Footprints, ChevronRight, Cloud, Flower2, Sword, Send, Users, ShieldAlert, X, Minimize2, Maximize2, Crosshair, ZoomIn, ZoomOut, CloudRain, Snowflake, Flame, MousePointer2, AlertCircle, Hand, Swords,
  BookOpen, Scroll, Globe, Shield, Server, Layout, Database, Cpu, Sparkles, Star, Award, Brain
} from 'lucide-react';

// --- BIOME SYSTEM ---
interface BiomeRegion {
  id: string;
  name: string;
  topic: SETopic;
  emoji: string;
  color: string;
  glowColor: string;
  description: string;
  bounds: { x1: number; y1: number; x2: number; y2: number };
}

const BIOME_REGIONS: BiomeRegion[] = [
  { id: 'algo_forest', name: 'Algorithm Forest', topic: 'Algorithms', emoji: '🌲', color: '#2d5a27', glowColor: 'rgba(45,90,39,0.4)', description: 'Ancient trees hide sorting secrets and search algorithms', bounds: { x1: 0, y1: 0, x2: 13, y2: 8 } },
  { id: 'sys_castle', name: "Architect's Keep", topic: 'System Design', emoji: '🏰', color: '#5c452d', glowColor: 'rgba(92,69,45,0.4)', description: 'Where grand systems are designed and scaled', bounds: { x1: 7, y1: 3, x2: 14, y2: 7 } },
  { id: 'data_lake', name: 'Database Lake', topic: 'SQL & Databases', emoji: '🌊', color: '#1e3a5f', glowColor: 'rgba(30,58,95,0.4)', description: 'Data flows like water — query it wisely', bounds: { x1: 24, y1: 0, x2: 39, y2: 7 } },
  { id: 'network_nexus', name: 'Network Nexus', topic: 'Networking & APIs', emoji: '🌐', color: '#2d3a4a', glowColor: 'rgba(45,58,74,0.4)', description: 'Packets travel through layered protocols', bounds: { x1: 24, y1: 8, x2: 39, y2: 14 } },
  { id: 'security_fortress', name: 'Security Bastion', topic: 'Security', emoji: '🛡️', color: '#3a2020', glowColor: 'rgba(58,32,32,0.4)', description: 'Guard against the OWASP Top 10 threats', bounds: { x1: 0, y1: 13, x2: 13, y2: 19 } },
  { id: 'devops_foundry', name: 'DevOps Foundry', topic: 'Cloud & DevOps', emoji: '🚀', color: '#1a2a3a', glowColor: 'rgba(26,42,58,0.4)', description: 'Containers forged, pipelines automated', bounds: { x1: 24, y1: 15, x2: 33, y2: 22 } },
  { id: 'frontend_gardens', name: 'Frontend Gardens', topic: 'React & Frontend', emoji: '🧚', color: '#1a3a2a', glowColor: 'rgba(26,58,42,0.4)', description: 'Beautiful interfaces bloom from component trees', bounds: { x1: 33, y1: 15, x2: 39, y2: 22 } },
  { id: 'oop_crossroads', name: 'OOP Crossroads', topic: 'OOP & Design Patterns', emoji: '🔮', color: '#2a1a3a', glowColor: 'rgba(42,26,58,0.4)', description: 'Where patterns meet and polymorphism reigns', bounds: { x1: 14, y1: 8, x2: 24, y2: 14 } },
  { id: 'git_grove', name: 'Git Grove', topic: 'Git & Version Control', emoji: '🌿', color: '#1a3020', glowColor: 'rgba(26,48,32,0.4)', description: 'Branches grow, commits are carved in bark', bounds: { x1: 14, y1: 0, x2: 24, y2: 7 } },
  { id: 'backend_mines', name: 'Backend Mines', topic: 'Backend & Servers', emoji: '⛏️', color: '#2a2020', glowColor: 'rgba(42,32,32,0.4)', description: 'Deep server logic and API endpoints below', bounds: { x1: 0, y1: 19, x2: 24, y2: 23 } },
];

const getBiome = (x: number, y: number): BiomeRegion | null => {
  // Check more specific biomes first (smaller regions)
  for (const biome of BIOME_REGIONS) {
    const b = biome.bounds;
    if (x >= b.x1 && x <= b.x2 && y >= b.y1 && y <= b.y2) return biome;
  }
  return null;
};

// --- KNOWLEDGE SCROLLS ---
interface KnowledgeScroll {
  id: string;
  position: Position;
  biomeId: string;
  title: string;
  content: string;
  xpReward: number;
}

const KNOWLEDGE_SCROLLS: KnowledgeScroll[] = [
  { id: 'scroll_bigo', position: { x: 3, y: 5 }, biomeId: 'algo_forest', title: 'Big O Notation', content: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ). Always aim for the lowest complexity!', xpReward: 30 },
  { id: 'scroll_sort', position: { x: 6, y: 2 }, biomeId: 'algo_forest', title: 'Sorting Algorithms', content: 'QuickSort averages O(n log n). MergeSort guarantees it. BubbleSort? Only in nightmares — O(n²).', xpReward: 30 },
  { id: 'scroll_acid', position: { x: 26, y: 3 }, biomeId: 'data_lake', title: 'ACID Properties', content: 'Atomicity (all or nothing), Consistency (valid states), Isolation (transactions don\'t interfere), Durability (committed = permanent).', xpReward: 30 },
  { id: 'scroll_index', position: { x: 33, y: 5 }, biomeId: 'data_lake', title: 'Database Indexes', content: 'Indexes are like a book\'s table of contents. They speed up reads but slow down writes. B-trees are the most common type.', xpReward: 30 },
  { id: 'scroll_tcp', position: { x: 29, y: 10 }, biomeId: 'network_nexus', title: 'TCP vs UDP', content: 'TCP: reliable, ordered, connection-based (HTTP, email). UDP: fast, no guarantees (gaming, video, DNS).', xpReward: 30 },
  { id: 'scroll_rest', position: { x: 34, y: 11 }, biomeId: 'network_nexus', title: 'REST Principles', content: 'Stateless, client-server, cacheable, uniform interface, layered system. Use proper HTTP verbs: GET, POST, PUT, DELETE.', xpReward: 30 },
  { id: 'scroll_xss', position: { x: 11, y: 15 }, biomeId: 'security_fortress', title: 'XSS Prevention', content: 'Never trust user input. Sanitize output, use Content-Security-Policy, escape HTML entities, avoid innerHTML.', xpReward: 30 },
  { id: 'scroll_solid', position: { x: 18, y: 11 }, biomeId: 'oop_crossroads', title: 'SOLID Principles', content: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion — the pillars of clean OOP.', xpReward: 30 },
  { id: 'scroll_docker', position: { x: 27, y: 17 }, biomeId: 'devops_foundry', title: 'Docker Basics', content: 'Dockerfile → Image → Container. Images are blueprints, containers are running instances. Compose orchestrates multi-container apps.', xpReward: 30 },
  { id: 'scroll_react', position: { x: 35, y: 18 }, biomeId: 'frontend_gardens', title: 'React Lifecycle', content: 'Mount → Render → Effect → Update → Cleanup → Unmount. useEffect handles side effects; return a cleanup function!', xpReward: 30 },
  { id: 'scroll_git', position: { x: 15, y: 3 }, biomeId: 'git_grove', title: 'Git Workflow', content: 'Feature branches, pull requests, code review, merge. Rebase for clean history, merge for preserving context.', xpReward: 30 },
  { id: 'scroll_api', position: { x: 10, y: 20 }, biomeId: 'backend_mines', title: 'API Design', content: 'Version your APIs. Use pagination. Return proper status codes. Document with OpenAPI/Swagger. Rate limit everything.', xpReward: 30 },
];

// --- COMPONENTS ---

interface WorldScreenProps {
  user: User;
  onBattle: (quest: Quest) => void;
  onGainXp: (amount: number) => void;
  onBack: () => void;
  initialPosition: Position;
  onUpdatePosition: (pos: Position) => void;
  gameData: { races: RaceData[], classes: ClassData[], items: CosmeticItem[] };
  exploredTiles: string[];
  setExploredTiles: (tiles: string[]) => void;
  npcs: Npc[];
}

const TILE_SIZE = 64;
const VISIBILITY_RADIUS = 8;
const MAP_ROWS = 24;
const MAP_COLS = 40;
const CULL_BUFFER = 2;
const ENCOUNTER_COOLDOWN_TILES = 8;
const VIEW_ANGLE = 26;
const SCROLL_SPRITE = '/sprites/world/ancient-scroll.svg';
const DEFAULT_ZOOM = 0.64;
const MIN_ZOOM = 0.34;
const MAX_ZOOM = 1.35;
const WORLD_ZOOM_STORAGE_KEY = 'skillhero_world_zoom';

const renderWorldSprite = (sprite?: string, alt?: string, className?: string) => {
    if (!sprite) return null;
    const isAssetPath = sprite.startsWith('/');
    if (!isAssetPath) return <span className={className}>{sprite}</span>;
    return <img src={sprite} alt={alt || 'sprite'} className={`object-contain [image-rendering:pixelated] drop-shadow-xl ${className || ''}`} />;
};

let messageSeq = 0;
const makeMessageId = () => {
    messageSeq = (messageSeq + 1) % Number.MAX_SAFE_INTEGER;
    return `${Date.now()}-${messageSeq}-${Math.random().toString(36).slice(2, 8)}`;
};

const getBiomeTopicIcon = (topic: SETopic) => {
    switch (topic) {
        case 'Algorithms': return <Brain size={16} className="text-emerald-300" />;
        case 'System Design': return <Layout size={16} className="text-amber-300" />;
        case 'SQL & Databases': return <Database size={16} className="text-blue-300" />;
        case 'Networking & APIs': return <Globe size={16} className="text-cyan-300" />;
        case 'Security': return <Shield size={16} className="text-red-300" />;
        case 'Cloud & DevOps': return <Server size={16} className="text-indigo-300" />;
        case 'React & Frontend': return <Sparkles size={16} className="text-teal-300" />;
        case 'OOP & Design Patterns': return <BookOpen size={16} className="text-fuchsia-300" />;
        case 'Git & Version Control': return <Scroll size={16} className="text-lime-300" />;
        case 'Backend & Servers': return <Cpu size={16} className="text-orange-300" />;
        default: return <Star size={16} className="text-gold-300" />;
    }
};

const BiomeWeather: React.FC<{ biome: BiomeRegion | null; tileType: TileType }> = ({ biome, tileType }) => {
    const biomeId = biome?.id || '';
    if (biomeId === 'algo_forest' || tileType === 'FOREST') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-30">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="absolute w-1.5 h-1.5 bg-green-300 rounded-full animate-float blur-[1px]" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDuration: `${4+Math.random()*6}s` }}></div>
                ))}
            </div>
        );
    }
    if (biomeId === 'data_lake' || tileType === 'WATER') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-20">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="absolute w-[1px] h-4 bg-blue-300 opacity-60" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, transform: 'rotate(15deg)', animation: `rain 0.5s linear infinite ${Math.random()}s` }}></div>
                ))}
            </div>
        );
    }
    if (biomeId === 'network_nexus') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-15">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-2 bg-cyan-400 rounded-full" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animation: `ping 2s ease-in-out infinite ${Math.random()*2}s` }}></div>
                ))}
            </div>
        );
    }
    if (biomeId === 'devops_foundry') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-20">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-8 bg-orange-400/40 blur-sm" style={{ left: `${20+Math.random()*60}%`, bottom: 0, animation: `float ${3+Math.random()*4}s ease-in-out infinite ${Math.random()*3}s` }}></div>
                ))}
            </div>
        );
    }
    if (tileType === 'MOUNTAIN') {
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-20">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="absolute text-white animate-spin-slow" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDuration: `${5+Math.random()*10}s`, fontSize: `${Math.random()*10+5}px` }}>❄</div>
                ))}
            </div>
        );
    }
    return null;
};

const ChatPanel: React.FC<{ messages: ChatMessage[]; onSend: (text: string, type: 'GLOBAL' | 'LOCAL' | 'WHISPER') => void }> = ({ messages, onSend }) => {
    const [input, setInput] = useState('');
    const [expanded, setExpanded] = useState(true);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (expanded) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, expanded]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault(); if (!input.trim()) return;
        let type: 'GLOBAL' | 'LOCAL' | 'WHISPER' = 'LOCAL';
        let text = input;
        if (input.startsWith('/g ')) { type = 'GLOBAL'; text = input.substring(3); }
        else if (input.startsWith('/w ')) { type = 'WHISPER'; text = input; }
        onSend(text, type); setInput('');
    };

    return (
        <div className={`pointer-events-auto transition-all duration-300 ease-in-out flex flex-col ${expanded ? 'h-48 md:h-64 w-72 md:w-96' : 'h-10 w-10'} bg-black/70 backdrop-blur-md border border-white/10 rounded-tr-lg overflow-hidden shadow-2xl relative z-50`}>
            <div className="flex justify-between items-center p-2 bg-black/40 cursor-pointer border-b border-white/5" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-2"><MessageCircle size={14} className="text-gold-500" /><span className={`text-[10px] font-bold uppercase tracking-wider text-gray-300 ${!expanded && 'hidden'}`}>Chat</span></div>
                <button className="text-gray-500 hover:text-white transition-colors">{expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}</button>
            </div>
            {expanded && (
                <>
                    <div className="flex-grow overflow-y-auto p-2 space-y-1 text-xs font-mono custom-scrollbar">
                        {messages.map(msg => (
                            <div key={msg.id} className="break-words leading-tight animate-fade-in opacity-90">
                                <span className="opacity-50 text-[9px] mr-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                {msg.type === 'GLOBAL' && <span className="text-cyan-400 font-bold">[G] {msg.sender}: </span>}
                                {msg.type === 'LOCAL' && <span className="text-yellow-400 font-bold">[L] {msg.sender}: </span>}
                                {msg.type === 'WHISPER' && <span className="text-purple-400 font-bold">[W] {msg.sender}: </span>}
                                {msg.type === 'SYSTEM' && <span className="text-green-400 font-bold">[SYS]: </span>}
                                <span className="text-gray-200">{msg.text}</span>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-1.5 border-t border-white/10 flex gap-1 bg-black/40">
                        <input className="flex-grow bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-gold-500 placeholder-gray-600" placeholder="Type..." value={input} onChange={(e) => setInput(e.target.value)} />
                        <button type="submit" className="text-gold-500 hover:text-white p-1 bg-gold-500/10 rounded"><Send size={12}/></button>
                    </form>
                </>
            )}
        </div>
    );
};

const WorldTile: React.FC<{ x: number; y: number; type: TileType; visibility: 'VISIBLE' | 'FOG' | 'HIDDEN'; biome: BiomeRegion | null; isPath?: boolean; isTarget?: boolean; isInteractable?: boolean; onClick: (x: number, y: number) => void; }> = React.memo(({ x, y, type, visibility, biome, isPath, isTarget, isInteractable, onClick }) => {
    if (visibility === 'HIDDEN') return null;
    let content = null;
    let className = `absolute flex items-center justify-center backface-hidden cursor-pointer transition-filter duration-200 overflow-hidden`;
    let style: React.CSSProperties = { left: x * TILE_SIZE, top: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
    const rand = pseudoRandom(x, y);

    switch (type) {
        case 'GRASS':
            className += ' bg-[#2a4525] shadow-inner';
            content = (
                <>
                    <div className="absolute inset-0 opacity-25 [background:repeating-linear-gradient(45deg,rgba(255,255,255,.05)_0_2px,transparent_2px_6px)]" />
                    {rand > 0.72 && <Flower2 size={10} className={rand > 0.86 ? 'text-pink-400/60' : 'text-yellow-300/60'} />}
                </>
            );
            break;
        case 'FOREST':
            className += ' bg-[#1a311d]';
            content = (
                <div className="relative w-full h-full flex items-end justify-center pb-1 pointer-events-none">
                    <div className="transform origin-bottom transition-transform duration-500 group-hover:scale-110" style={{ transform: `rotateX(-${VIEW_ANGLE}deg) scale(${1.25 + rand * 0.45}) translateY(-12px)` }}>
                        <TreePine size={64} className="text-[#2f5d2e] fill-[#17301a] drop-shadow-xl" strokeWidth={1.5} />
                    </div>
                </div>
            );
            break;
        case 'MOUNTAIN':
            className += ' bg-stone-800';
            content = (
                <div className="relative w-full h-full flex items-end justify-center pointer-events-none">
                    <div className="transform origin-bottom" style={{ transform: `rotateX(-${VIEW_ANGLE}deg) scale(${1.45 + rand * 0.35}) translateY(-22px)` }}>
                        <Mountain size={64} className="text-stone-600 fill-stone-800 drop-shadow-2xl" />
                    </div>
                </div>
            );
            break;
        case 'WATER':
            className += ' bg-[#133b64] shadow-inner';
            content = (
                <>
                    <div className="absolute inset-0 opacity-25 [background:repeating-linear-gradient(0deg,rgba(147,197,253,.3)_0_2px,transparent_2px_7px)] animate-pulse" />
                    {rand > 0.6 ? <Waves size={16} className="text-blue-300/30" /> : null}
                </>
            );
            break;
        case 'PATH':
            className += ' bg-[#5f472d] border border-[#2f2215]/30';
            content = <div className="absolute inset-0 opacity-20 [background:repeating-linear-gradient(45deg,rgba(0,0,0,.25)_0_3px,transparent_3px_8px)]" />;
            break;
        case 'CASTLE_FLOOR':
            className += ' bg-slate-700 border border-slate-600';
            content = <div className="absolute inset-0 opacity-25 [background:linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:16px_16px]" />;
            break;
    }

    // Biome tinting overlay
    if (biome && visibility === 'VISIBLE') {
        style.boxShadow = `inset 0 0 20px ${biome.glowColor}`;
    }

    if (!isInteractable) className += ' hover:brightness-110';

    return (
        <div className={className} style={style} onClick={() => onClick(x, y)}>
            {content}
            <div className="absolute inset-0 border border-black/20 pointer-events-none"></div>
            {isPath && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><div className="w-3 h-3 bg-gold-400/80 rounded-full shadow-[0_0_8px_#facc15] animate-pulse"></div></div>}
            {isTarget && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"><div className="w-full h-full border-4 border-gold-500 rounded-full animate-ping opacity-50"></div><div className="absolute w-2/3 h-2/3 bg-gold-500/30 rounded-full blur-sm"></div></div>}
            {isInteractable && <div className="absolute inset-0 border-2 border-gold-400/80 rounded shadow-[0_0_20px_rgba(250,204,21,0.5)] z-20 pointer-events-none animate-pulse"><div className="absolute inset-0 bg-gold-500/10"></div></div>}
            {visibility === 'FOG' && <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-20 flex items-center justify-center"><Cloud size={32} className="text-gray-600/30" /></div>}
        </div>
    );
});

// --- BIOME HUD ---
const BiomeIndicator: React.FC<{ biome: BiomeRegion | null; scrollsCollected: number; scrollsTotal: number }> = ({ biome, scrollsCollected, scrollsTotal }) => {
    if (!biome) return null;
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={biome.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-lg"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-black/40 border border-gold-500/30 flex items-center justify-center">
                        {getBiomeTopicIcon(biome.topic)}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gold-400 font-fantasy">{biome.name}</div>
                        <div className="text-[10px] text-gray-400">{biome.topic}</div>
                    </div>
                    {scrollsTotal > 0 && (
                        <div className="ml-2 flex items-center gap-1 text-[10px] text-amber-300">
                            <Scroll size={12} />
                            <span>{scrollsCollected}/{scrollsTotal}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- SCROLL POPUP ---
const ScrollPopup: React.FC<{ scroll: KnowledgeScroll; onClose: () => void }> = ({ scroll, onClose }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute inset-0 bg-black/70 z-[70] flex items-center justify-center pointer-events-auto backdrop-blur-sm"
        onClick={onClose}
    >
        <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            className="bg-gradient-to-b from-amber-900 to-amber-950 border-2 border-gold-500 rounded-xl p-6 max-w-md mx-4 shadow-[0_0_40px_rgba(234,179,8,0.3)] relative"
            onClick={e => e.stopPropagation()}
        >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Scroll size={14} /> Knowledge Scroll
            </div>
            <div className="mt-3">
                <h3 className="text-xl font-fantasy text-gold-400 mb-3">{scroll.title}</h3>
                <p className="text-amber-100 text-sm leading-relaxed font-mono">{scroll.content}</p>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                        <Star size={14} /> +{scroll.xpReward} XP
                    </div>
                    <button onClick={onClose} className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                        Got it!
                    </button>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

// --- MINI MAP ---
const MiniMap: React.FC<{ playerPos: Position; exploredSet: Set<string> }> = React.memo(({ playerPos, exploredSet }) => {
    const mapH = MAP_LAYOUT.length;
    const mapW = MAP_LAYOUT[0].length;
    const scale = 3;

    return (
        <div className="bg-black/80 border border-white/10 rounded-lg overflow-hidden shadow-lg" style={{ width: mapW * scale, height: mapH * scale }}>
            <canvas
                ref={canvas => {
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    canvas.width = mapW * scale;
                    canvas.height = mapH * scale;
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    for (let y = 0; y < mapH; y++) {
                        for (let x = 0; x < mapW; x++) {
                            if (!exploredSet.has(`${x},${y}`)) continue;
                            const tile = MAP_LAYOUT[y][x];
                            const biome = getBiome(x, y);
                            let color = '#1a2a1a';
                            if (tile === 2) color = '#444';
                            else if (tile === 3) color = '#1a3a5f';
                            else if (tile === 4) color = '#5c452d';
                            else if (tile === 5) color = '#3a3a4a';
                            else if (tile === 1) color = '#1a2f1a';
                            else if (biome) color = biome.color;
                            ctx.fillStyle = color;
                            ctx.fillRect(x * scale, y * scale, scale, scale);
                        }
                    }

                    // Player dot
                    ctx.fillStyle = '#fbbf24';
                    ctx.beginPath();
                    ctx.arc(playerPos.x * scale + scale/2, playerPos.y * scale + scale/2, scale * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }}
                style={{ width: mapW * scale, height: mapH * scale }}
            />
        </div>
    );
});

// --- MAIN COMPONENT ---
export const WorldScreen: React.FC<WorldScreenProps> = ({
  user, onBattle, onGainXp, onBack, initialPosition, onUpdatePosition, gameData, exploredTiles, setExploredTiles, npcs
}) => {
  const [gridPos, setGridPos] = useState<Position>(initialPosition);
  const [visualPos, setVisualPos] = useState<{x: number, y: number}>(initialPosition);
  const [zoom, setZoom] = useState(() => {
    try {
      const raw = localStorage.getItem(WORLD_ZOOM_STORAGE_KEY);
      const parsed = raw ? Number(raw) : DEFAULT_ZOOM;
      if (!Number.isFinite(parsed)) return DEFAULT_ZOOM;
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parsed));
    } catch {
      return DEFAULT_ZOOM;
    }
  });
  const [currentNpcs, setCurrentNpcs] = useState<Npc[]>(npcs);
  const [otherPlayers, setOtherPlayers] = useState<Npc[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ id: '1', sender: 'System', text: 'Explore biomes to learn! Collect glowing scrolls for knowledge & XP. Space to interact.', type: 'SYSTEM', timestamp: Date.now() }]);
  const [currentDialogueNode, setCurrentDialogueNode] = useState<DialogueNode | null>(null);
  const [activeNpc, setActiveNpc] = useState<Npc | null>(null);
  const [pathQueue, setPathQueue] = useState<Position[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [destination, setDestination] = useState<Position | null>(null);
  const [autoInteractNpcId, setAutoInteractNpcId] = useState<string | null>(null);
  const [clickRipple, setClickRipple] = useState<{x:number, y:number} | null>(null);

  // Biome & Scroll state
  const [collectedScrolls, setCollectedScrolls] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('skillHero_scrolls');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [activeScroll, setActiveScroll] = useState<KnowledgeScroll | null>(null);
  const [biomeNotification, setBiomeNotification] = useState<string | null>(null);
  const [lastBiomeId, setLastBiomeId] = useState<string | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [biomeFlash, setBiomeFlash] = useState<string | null>(null);
  const prevBiomeRef = useRef<string | null>(null);

  const moveIntervalRef = useRef<number | null>(null);
  const lastEncounterTileRef = useRef<number>(0);
  const totalTilesWalkedRef = useRef<number>(0);

  const exploredSet = useMemo(() => new Set(exploredTiles), [exploredTiles]);
  const clampZoom = useCallback((value: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value)), []);
  const nudgeZoom = useCallback((delta: number) => setZoom((z) => clampZoom(z + delta)), [clampZoom]);
  const resetZoom = useCallback(() => setZoom(DEFAULT_ZOOM), []);

  const currentBiome = useMemo(() => getBiome(gridPos.x, gridPos.y), [gridPos]);

  const visibleBounds = useMemo(() => {
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    return {
      minCol: Math.max(0, gridPos.x - Math.ceil(vpW / (2 * TILE_SIZE)) - CULL_BUFFER),
      maxCol: Math.min(MAP_COLS - 1, gridPos.x + Math.ceil(vpW / (2 * TILE_SIZE)) + CULL_BUFFER),
      minRow: Math.max(0, gridPos.y - Math.ceil(vpH / (2 * TILE_SIZE)) - CULL_BUFFER),
      maxRow: Math.min(MAP_ROWS - 1, gridPos.y + Math.ceil(vpH / (2 * TILE_SIZE)) + CULL_BUFFER),
    };
  }, [gridPos]);

  useEffect(() => {
    try {
      localStorage.setItem(WORLD_ZOOM_STORAGE_KEY, String(zoom));
    } catch {
      // Non-blocking.
    }
  }, [zoom]);

  // Save collected scrolls
  useEffect(() => {
    localStorage.setItem('skillHero_scrolls', JSON.stringify([...collectedScrolls]));
  }, [collectedScrolls]);

  // Biome entry notification
  useEffect(() => {
    if (currentBiome && currentBiome.id !== lastBiomeId) {
      setLastBiomeId(currentBiome.id);
      setBiomeNotification(`Entering ${currentBiome.name}`);
      setChatMessages(prev => [...prev, { id: makeMessageId(), sender: 'System', text: `📍 ${currentBiome.name} — ${currentBiome.description}`, type: 'SYSTEM', timestamp: Date.now() }]);
      setTimeout(() => setBiomeNotification(null), 3000);
    }
  }, [currentBiome]);

  // Biome transition overlay flash
  useEffect(() => {
    const biomeName = currentBiome ? currentBiome.name : null;
    if (prevBiomeRef.current !== null && prevBiomeRef.current !== biomeName) {
      setBiomeFlash(biomeName);
      prevBiomeRef.current = biomeName;
      const id = setTimeout(() => setBiomeFlash(null), 1500);
      return () => clearTimeout(id);
    }
    prevBiomeRef.current = biomeName;
  }, [currentBiome]);

  // Count scrolls per biome
  const biomeScrollStats = useMemo(() => {
    if (!currentBiome) return { collected: 0, total: 0 };
    const biomeScrolls = KNOWLEDGE_SCROLLS.filter(s => s.biomeId === currentBiome.id);
    const collected = biomeScrolls.filter(s => collectedScrolls.has(s.id)).length;
    return { collected, total: biomeScrolls.length };
  }, [currentBiome, collectedScrolls]);

  // Check for scroll pickup
  const checkScrollPickup = useCallback((pos: Position) => {
    const scroll = KNOWLEDGE_SCROLLS.find(s => s.position.x === pos.x && s.position.y === pos.y && !collectedScrolls.has(s.id));
    if (scroll) {
      setActiveScroll(scroll);
      setCollectedScrolls(prev => new Set([...prev, scroll.id]));
      onGainXp(scroll.xpReward);
    }
  }, [collectedScrolls, onGainXp]);

  // Sync prop changes to state
  useEffect(() => { setCurrentNpcs(npcs); }, [npcs]);

  // Spawn mock players
  useEffect(() => {
      const mockPlayers: Npc[] = [];
      const races: HeroRace[] = ['HUMAN', 'ORC', 'ELF', 'UNDEAD', 'DWARF', 'DEMON'];
      const classes: HeroClass[] = ['WARRIOR', 'MAGE', 'ROGUE', 'PALADIN', 'BARD'];
      const takenPositions = new Set([...currentNpcs.map(n => `${n.position.x},${n.position.y}`)]);

      for(let i=0; i<6; i++) {
          let x, y, attempts = 0;
          do {
              x = Math.floor(Math.random() * MAP_LAYOUT[0].length);
              y = Math.floor(Math.random() * MAP_LAYOUT.length);
              attempts++;
          } while ((MAP_LAYOUT[y][x] === 2 || MAP_LAYOUT[y][x] === 3 || takenPositions.has(`${x},${y}`)) && attempts < 100);

          if (attempts < 100) {
              takenPositions.add(`${x},${y}`);
              mockPlayers.push({
                  id: `player_${i}`, name: `Duelist ${i+1}`, sprite: '', race: races[Math.floor(Math.random() * races.length)], class: classes[Math.floor(Math.random() * classes.length)], level: Math.max(1, user.level + Math.floor(Math.random() * 5) - 2), position: { x, y }, hasMet: false, isPlayer: true, startingNodeId: 'intro',
                  dialogueTree: { 'intro': { id: 'intro', text: "Care for a spar?", options: [{ text: "Duel!", nextId: '', trigger: 'CLOSE' }, { text: "No thanks.", nextId: '', trigger: 'CLOSE' }] } }
              });
          }
      }
      setOtherPlayers(mockPlayers);
  }, []);

  const handleTileClick = useCallback((tx: number, ty: number) => {
      if (activeNpc || activeScroll) return;
      setClickRipple({x: tx, y: ty});
      setTimeout(() => setClickRipple(null), 500);
      const path = findPath(gridPos, {x: tx, y: ty}, MAP_LAYOUT);
      if (path && path.length > 0) { setPathQueue(path); setDestination({x: tx, y: ty}); setAutoInteractNpcId(null); }
  }, [gridPos, activeNpc, activeScroll]);

  const checkForInteraction = useCallback(() => {
      const allEntities = [...currentNpcs, ...otherPlayers];
      const adjacentNpc = allEntities.find(npc => {
          const dist = Math.abs(npc.position.x - gridPos.x) + Math.abs(npc.position.y - gridPos.y);
          return dist <= 1;
      });
      if (adjacentNpc) startDialogue(adjacentNpc);
  }, [currentNpcs, otherPlayers, gridPos]);

  const triggerEncounter = useCallback((specificQuest?: Quest) => {
    setPathQueue([]); setDestination(null); setAutoInteractNpcId(null);
    let encounter = specificQuest;
    if (!encounter) {
        // Biome-specific encounters: filter quests by topic matching current biome
        const biome = getBiome(gridPos.x, gridPos.y);
        let candidates = QUESTS;
        if (biome) {
            const topicQuests = QUESTS.filter(q => q.questions.some(question => question.topic === biome.topic));
            if (topicQuests.length > 0) candidates = topicQuests;
        }
        const randomQuest = candidates[Math.floor(Math.random() * candidates.length)];
        const biomeEmoji = biome?.emoji || '👾';
        const biomeName = biome?.name || 'the Wilds';
        encounter = {
            ...randomQuest,
            title: `${biomeName} Encounter!`,
            narrativeIntro: [`A wild bug emerges from ${biomeName}!`, `Test your ${biome?.topic || 'CS'} knowledge!`],
            narrativeOutro: "Knowledge prevails.",
            rewardXp: 60,
            enemyName: `${biomeName} Bug`,
            enemyImage: biomeEmoji,
            enemyMaxHp: 60 + (user.level * 5),
            questions: randomQuest.questions.slice(0, 2),
            isPvP: false
        };
    }
    onBattle(encounter);
  }, [gridPos, user.level, onBattle]);

  const attemptMove = useCallback((dx: number, dy: number) => {
        if (isMoving || activeNpc || activeScroll) return;
        const nextX = gridPos.x + dx; const nextY = gridPos.y + dy;
        if (nextX < 0 || nextX >= MAP_LAYOUT[0].length || nextY < 0 || nextY >= MAP_LAYOUT.length) return;
        const tileType = MAP_LAYOUT[nextY][nextX];
        if (tileType === 2 || tileType === 3) return;
        setIsMoving(true); setGridPos({ x: nextX, y: nextY }); setPathQueue([]); setDestination(null);
        totalTilesWalkedRef.current += 1;
        setTimeout(() => {
            setIsMoving(false);
            const typeStr = TILE_MAPPING[tileType];
            checkScrollPickup({ x: nextX, y: nextY });
            const tilesSinceLast = totalTilesWalkedRef.current - lastEncounterTileRef.current;
            const canEncounter = tilesSinceLast >= ENCOUNTER_COOLDOWN_TILES;
            if (canEncounter) {
                if (typeStr === 'FOREST' && Math.random() < 0.12) { lastEncounterTileRef.current = totalTilesWalkedRef.current; triggerEncounter(); }
                // Lower encounter rate in non-forest biomes
                else if (typeStr === 'GRASS' && getBiome(nextX, nextY) && Math.random() < 0.04) { lastEncounterTileRef.current = totalTilesWalkedRef.current; triggerEncounter(); }
            }
        }, 300);
  }, [gridPos, isMoving, activeNpc, activeScroll, checkScrollPickup, triggerEncounter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        let dx = 0, dy = 0;
        switch(e.key.toLowerCase()) {
          case 'w': case 'arrowup': dy = -1; break;
          case 's': case 'arrowdown': dy = 1; break;
          case 'a': case 'arrowleft': dx = -1; break;
          case 'd': case 'arrowright': dx = 1; break;
          case ' ': case 'f': checkForInteraction(); return;
          case 'm': setShowMiniMap(p => !p); return;
          case 'q': case '-': nudgeZoom(-0.08); return;
          case 'e': case '=': case '+': nudgeZoom(0.08); return;
          case 'r': resetZoom(); return;
          default: return;
        }
        if (dx !== 0 || dy !== 0) attemptMove(dx, dy);
    };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [attemptMove, checkForInteraction, nudgeZoom, resetZoom]);

  const handleNpcClick = useCallback((npc: Npc) => {
      if (activeNpc) return;
      const neighbors = [{x: npc.position.x + 1, y: npc.position.y}, {x: npc.position.x - 1, y: npc.position.y}, {x: npc.position.x, y: npc.position.y + 1}, {x: npc.position.x, y: npc.position.y - 1}];
      const walkable = neighbors.filter(n => { if (n.x < 0 || n.y < 0 || n.y >= MAP_LAYOUT.length || n.x >= MAP_LAYOUT[0].length) return false; const type = MAP_LAYOUT[n.y][n.x]; return type !== 2 && type !== 3; });
      walkable.sort((a,b) => (Math.abs(a.x - gridPos.x) + Math.abs(a.y - gridPos.y)) - (Math.abs(b.x - gridPos.x) + Math.abs(b.y - gridPos.y)));
      if (walkable.length > 0) {
          const target = walkable[0];
          if (target.x === gridPos.x && target.y === gridPos.y) startDialogue(npc);
          else { const path = findPath(gridPos, target, MAP_LAYOUT); if (path && path.length > 0) { setPathQueue(path); setDestination(target); setAutoInteractNpcId(npc.id); } }
      }
  }, [gridPos, activeNpc]);

  useEffect(() => {
      if (pathQueue.length > 0 && !isMoving) {
          setIsMoving(true);
          const nextStep = pathQueue[0];
          const remainingPath = pathQueue.slice(1);
          moveIntervalRef.current = window.setTimeout(() => {
              setGridPos(nextStep); setPathQueue(remainingPath); setIsMoving(false);
              totalTilesWalkedRef.current += 1;
              checkScrollPickup(nextStep);
              if (remainingPath.length === 0) {
                  setDestination(null);
                  if (autoInteractNpcId) { const allEntities = [...currentNpcs, ...otherPlayers]; const npc = allEntities.find(n => n.id === autoInteractNpcId); if (npc) startDialogue(npc); setAutoInteractNpcId(null); }
                  else {
                      const tileType = TILE_MAPPING[MAP_LAYOUT[nextStep.y][nextStep.x]];
                      const tilesSinceLast = totalTilesWalkedRef.current - lastEncounterTileRef.current;
                      const canEncounter = tilesSinceLast >= ENCOUNTER_COOLDOWN_TILES;
                      if (canEncounter && tileType === 'FOREST' && Math.random() < 0.12) { lastEncounterTileRef.current = totalTilesWalkedRef.current; triggerEncounter(); }
                      else if (canEncounter && tileType === 'GRASS' && getBiome(nextStep.x, nextStep.y) && Math.random() < 0.04) { lastEncounterTileRef.current = totalTilesWalkedRef.current; triggerEncounter(); }
                  }
              }
          }, 300);
      }
      return () => { if (moveIntervalRef.current) clearTimeout(moveIntervalRef.current); };
  }, [pathQueue, isMoving, gridPos, autoInteractNpcId, currentNpcs, otherPlayers, checkScrollPickup, triggerEncounter]);

  useEffect(() => { setVisualPos(gridPos); onUpdatePosition(gridPos); updateExplored(gridPos); }, [gridPos]);

  const updateExplored = (pos: Position) => {
      const range = VISIBILITY_RADIUS; let changed = false; const newExplored = [...exploredTiles]; const set = new Set(newExplored);
      for (let y = -range; y <= range; y++) { for (let x = -range; x <= range; x++) { const tx = pos.x + x; const ty = pos.y + y; if (Math.sqrt(x*x + y*y) <= range) { if (tx >= 0 && tx < MAP_LAYOUT[0].length && ty >= 0 && ty < MAP_LAYOUT.length) { const key = `${tx},${ty}`; if (!set.has(key)) { set.add(key); newExplored.push(key); changed = true; } } } } }
      if (changed) setExploredTiles(newExplored);
  };

  const startDialogue = (npc: Npc) => { setActiveNpc(npc); let startNodeId = npc.startingNodeId; if (npc.dynamicStart) { for (const ds of npc.dynamicStart) { if (npc.dialogueTree[ds.nodeId]) { startNodeId = ds.nodeId; break; } } } setCurrentDialogueNode(npc.dialogueTree[startNodeId]); };

  const handleOptionSelect = (option: DialogueOption) => {
      if (!activeNpc) return;
      if (option.trigger === 'GIVE_XP' && activeNpc.rewardXp && !activeNpc.hasMet) { onGainXp(activeNpc.rewardXp); setCurrentNpcs(prev => prev.map(n => n.id === activeNpc.id ? {...n, hasMet: true} : n)); }
      if (option.trigger === 'CLOSE') { setActiveNpc(null); setCurrentDialogueNode(null); return; }
      const txt = option.text.toLowerCase();
      if (txt.includes("battle") || txt.includes("fight") || txt.includes("duel") || txt.includes("attack")) {
          // Biome-aware duel: use biome-topic questions
          const biome = getBiome(activeNpc.position.x, activeNpc.position.y);
          let questions = QUESTS[0].questions;
          if (biome) {
              const topicQuests = QUESTS.filter(q => q.questions.some(question => question.topic === biome.topic));
              if (topicQuests.length > 0) questions = topicQuests[0].questions;
          }
          const npcQuest: Quest = {
              id: `npc_fight_${activeNpc.id}`, title: `Duel: ${activeNpc.name}`, description: `A spar with ${activeNpc.name}.`, levelRequired: activeNpc.level || 1, narrativeIntro: [`${activeNpc.name} steps into a combat stance!`, "Show me your skills!"], narrativeOutro: "Well fought.", rewardXp: activeNpc.rewardXp || 100, enemyName: activeNpc.name, enemyImage: activeNpc.sprite, enemyMaxHp: 100 + (activeNpc.level || 1) * 20, enemyAttackDamage: 10 + (activeNpc.level || 1) * 2, questions, isPvP: true,
              enemyUser: { ...user, username: activeNpc.name, heroRace: activeNpc.race || 'HUMAN', heroClass: activeNpc.class || 'WARRIOR', level: activeNpc.level || 1, stats: { str: activeNpc.class === 'WARRIOR' ? 4 : 2, int: activeNpc.class === 'MAGE' ? 4 : 1, agi: activeNpc.class === 'ROGUE' ? 4 : 2 }, appearance: { headId: 'head_novice', bodyId: 'body_novice', weaponId: 'weapon_sword' } } as User
          };
          setActiveNpc(null); setCurrentDialogueNode(null); triggerEncounter(npcQuest); return;
      }
      if (option.nextId && activeNpc.dialogueTree[option.nextId]) setCurrentDialogueNode(activeNpc.dialogueTree[option.nextId]); else { setActiveNpc(null); setCurrentDialogueNode(null); }
  };

  const mapTiles = useMemo(() => {
      const tiles = [];
      const interactableKeys = new Set<string>();
      const allEntities = [...currentNpcs, ...otherPlayers];
      allEntities.forEach(ent => {
          const dist = Math.abs(ent.position.x - gridPos.x) + Math.abs(ent.position.y - gridPos.y);
          if (dist <= 1) interactableKeys.add(`${ent.position.x},${ent.position.y}`);
      });

      for (let y = visibleBounds.minRow; y <= visibleBounds.maxRow; y++) {
          for (let x = visibleBounds.minCol; x <= visibleBounds.maxCol; x++) {
              const tileCode = MAP_LAYOUT[y][x];
              const dist = Math.sqrt(Math.pow(x - gridPos.x, 2) + Math.pow(y - gridPos.y, 2));
              let visibility: 'VISIBLE' | 'FOG' | 'HIDDEN' = 'HIDDEN';
              if (dist <= VISIBILITY_RADIUS) visibility = 'VISIBLE'; else if (exploredSet.has(`${x},${y}`)) visibility = 'FOG';
              if (visibility !== 'HIDDEN') {
                  const isPath = pathQueue.some(p => p.x === x && p.y === y);
                  const isTarget = destination?.x === x && destination?.y === y;
                  const isInteractable = interactableKeys.has(`${x},${y}`);
                  const biome = visibility === 'VISIBLE' ? getBiome(x, y) : null;
                  tiles.push(<WorldTile key={`${x}-${y}`} x={x} y={y} type={TILE_MAPPING[tileCode]} visibility={visibility} biome={biome} isPath={isPath} isTarget={isTarget} isInteractable={isInteractable} onClick={handleTileClick} />);
              }
          }
      }
      return tiles;
  }, [gridPos, visibleBounds, exploredSet, pathQueue, destination, handleTileClick, currentNpcs, otherPlayers]);

  // Render scrolls on map
  const scrollElements = useMemo(() => {
    return KNOWLEDGE_SCROLLS.filter(s => {
      if (collectedScrolls.has(s.id)) return false;
      const dist = Math.sqrt(Math.pow(s.position.x - gridPos.x, 2) + Math.pow(s.position.y - gridPos.y, 2));
      return dist <= VISIBILITY_RADIUS;
    }).map(scroll => (
      <div
        key={scroll.id}
        className="absolute cursor-pointer group"
        style={{ left: scroll.position.x * TILE_SIZE, top: scroll.position.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, zIndex: 15 + scroll.position.y }}
        onClick={(e) => { e.stopPropagation(); handleTileClick(scroll.position.x, scroll.position.y); }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-float transform" style={{ transform: `rotateX(-${VIEW_ANGLE}deg) translateY(-15px)` }}>
            <div className="relative">
              <div className="absolute inset-0 w-10 h-10 bg-gold-500/30 rounded-full blur-xl animate-pulse -translate-x-1 -translate-y-1"></div>
              <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                <img src={SCROLL_SPRITE} alt="Knowledge scroll" className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }, [gridPos, collectedScrolls, handleTileClick]);

  return (
    <div className="fixed inset-0 overflow-hidden select-none font-sans bg-gradient-to-b from-[#0f1729] via-[#121124] to-[#0c0d17]">
        <div className="absolute inset-0 pointer-events-none z-0 [background:radial-gradient(circle_at_20%_15%,rgba(59,130,246,.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(20,184,166,.12),transparent_32%),radial-gradient(circle_at_50%_95%,rgba(251,191,36,.15),transparent_45%)]" />
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.13] [background:repeating-linear-gradient(0deg,rgba(255,255,255,.35)_0_1px,transparent_1px_4px)]" />
        <div className="absolute inset-[10px] z-0 border border-gold-500/20 rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.55),0_0_30px_rgba(218,165,32,0.08)] pointer-events-none" />

        <div className="absolute inset-0 z-0 cursor-default perspective-container">
            <div className="absolute transition-transform duration-300 ease-linear will-change-transform preserve-3d" style={{ transform: `translate(50vw, 58vh) scale(${zoom}) rotateX(${VIEW_ANGLE}deg) translate(-${visualPos.x * TILE_SIZE + TILE_SIZE/2}px, -${visualPos.y * TILE_SIZE + TILE_SIZE/2}px)` }}>
                {mapTiles}

                {/* Knowledge Scrolls */}
                {scrollElements}

                {/* NPCs and Players */}
                {[...currentNpcs, ...otherPlayers].map(ent => {
                    const dist = Math.abs(ent.position.x - gridPos.x) + Math.abs(ent.position.y - gridPos.y);
                    const isInteractable = dist <= 1;
                    const isVisible = dist <= 3;
                    if (!isVisible) return null;

                    return (
                        <div key={ent.id} onClick={(e) => { e.stopPropagation(); handleNpcClick(ent); }} className="absolute transition-all duration-1000 ease-linear cursor-pointer group hover:z-[100]" style={{ left: ent.position.x * TILE_SIZE, top: ent.position.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, zIndex: 10 + ent.position.y }}>
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <div className={`absolute bottom-2 w-16 h-8 border-2 rounded-[100%] transition-all duration-300 transform ${isInteractable ? 'scale-100 border-gold-500 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'scale-0 group-hover:scale-100 border-gold-500/0 group-hover:border-gold-500/70'}`}></div>
                                    <div className="absolute bottom-2 w-10 h-4 bg-black/40 rounded-[100%] blur-[2px]"></div>
                                    <div className="transform origin-bottom animate-float group-hover:scale-125 transition-transform duration-300" style={{ transform: `rotateX(-${VIEW_ANGLE}deg) translateY(-20px) scale(1.4)` }}>
                                        <div className="w-12 h-12 flex items-center justify-center select-none">
                                            {ent.sprite ? renderWorldSprite(ent.sprite, ent.name, 'w-12 h-12') : <HeroAvatar race={ent.race} size="sm" />}
                                        </div>
                                        {isInteractable && <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gold-500 text-black p-1 rounded-full shadow-lg animate-bounce border-2 border-white z-50"><MessageCircle size={16} /></div>}
                                        {!ent.hasMet && !ent.isPlayer && !isInteractable && <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-gold-400 animate-bounce text-3xl font-bold drop-shadow-md">!</div>}
                                        {ent.isPlayer && <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-red-900/80 text-white px-2 py-0.5 rounded text-[10px] border border-red-500 font-bold whitespace-nowrap">Lvl {ent.level}</div>}
                                    </div>
                                </div>
                        </div>
                    );
                })}

                {/* Player Character */}
                <div className="absolute pointer-events-none" style={{ left: `${gridPos.x * TILE_SIZE}px`, top: `${gridPos.y * TILE_SIZE}px`, transition: 'left 300ms ease-out, top 300ms ease-out', width: TILE_SIZE, height: TILE_SIZE, zIndex: 20 + gridPos.y }}>
                    <div className="w-full h-full flex items-center justify-center relative">
                        <div className="absolute w-[600px] h-[600px] bg-radial-gradient from-gold-500/10 to-transparent rounded-full pointer-events-none blur-3xl mix-blend-screen -translate-y-10"></div>
                        <div className="absolute bottom-2 w-12 h-5 bg-black/60 rounded-[100%] blur-[3px]"></div>
                        <div className="transform origin-bottom transition-transform" style={{ transform: `rotateX(-${VIEW_ANGLE}deg) translateY(-25px) scale(1.5)` }}><HeroAvatar appearance={user.appearance} race={user.heroRace} size="md" className={`shadow-[0_0_25px_rgba(255,255,255,0.4)] border-2 border-white relative z-10 ${isMoving ? 'animate-bounce' : ''}`} items={gameData.items} raceOptions={gameData.races} /></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Weather overlay */}
        <BiomeWeather biome={currentBiome} tileType={TILE_MAPPING[MAP_LAYOUT[gridPos.y][gridPos.x]]} />

        {/* HUD Layer */}
        <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-70 pointer-events-none">
                <img src="/art/fantasy/world-border-ornament.svg" alt="" aria-hidden="true" className="w-[520px] max-w-[80vw] h-auto" />
            </div>
            {/* Top-left: Exit + Biome indicator */}
            <div className="absolute top-4 left-4 pointer-events-auto flex flex-col gap-2">
                <FantasyButton onClick={onBack} variant="secondary" size="sm">Exit World</FantasyButton>
                <BiomeIndicator biome={currentBiome} scrollsCollected={biomeScrollStats.collected} scrollsTotal={biomeScrollStats.total} />
            </div>

            {/* Top-right: Coordinates + zoom + minimap */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
                <div className="bg-black/55 backdrop-blur-md p-2 px-4 rounded-full text-white font-mono text-xs border border-gold-500/20 shadow-lg flex items-center gap-3">
                    <Compass size={14} className="text-gold-500 animate-spin-slow" />
                    <span className="text-gray-300">{gridPos.x}, {gridPos.y} • <span className="text-gold-400 font-bold uppercase">{TILE_MAPPING[MAP_LAYOUT[gridPos.y][gridPos.x]]}</span></span>
                    <span className="text-cyan-300">Zoom {Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex gap-1">
                    <div className="flex bg-black/55 rounded-lg border border-gold-500/20 overflow-hidden">
                        <button onClick={() => nudgeZoom(0.12)} className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white"><ZoomIn size={16}/></button>
                        <button onClick={() => nudgeZoom(-0.12)} className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white"><ZoomOut size={16}/></button>
                        <button onClick={resetZoom} className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white" title="Reset Zoom (R)">
                            <Crosshair size={16}/>
                        </button>
                    </div>
                    <button onClick={() => setShowMiniMap(p => !p)} className={`p-1.5 rounded-lg border border-gold-500/20 ${showMiniMap ? 'bg-gold-500/20 text-gold-400' : 'bg-black/60 text-gray-400'} hover:text-white`}>
                        <MapIcon size={16}/>
                    </button>
                </div>
                {showMiniMap && <MiniMap playerPos={gridPos} exploredSet={exploredSet} />}

                {/* Scroll collection progress */}
                <div className="bg-black/55 backdrop-blur-md p-2 px-3 rounded-lg border border-gold-500/20 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                        <Scroll size={12} className="text-gold-400" />
                        <span>Scrolls: {collectedScrolls.size}/{KNOWLEDGE_SCROLLS.length}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">Move: WASD/Arrows • Interact: F/Space • Zoom: Q/E • Reset: R</div>
                </div>
            </div>

            {/* Biome entry notification */}
            <AnimatePresence>
                {biomeNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none"
                    >
                        <div className="bg-black/80 text-gold-400 px-6 py-3 rounded-full font-fantasy text-lg border border-gold-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur-md flex items-center gap-3">
                            <Sparkles size={20} className="animate-pulse" />
                            {biomeNotification}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {autoInteractNpcId && <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto"><div className="bg-gold-500/90 text-black px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs animate-pulse shadow-[0_0_20px_#fbbf24] flex items-center gap-2"><MousePointer2 size={16} /> Moving to Target...</div></div>}

            {/* Bottom-left: Chat */}
            <div className="absolute bottom-4 left-4 pointer-events-auto transition-transform origin-bottom-left"><ChatPanel messages={chatMessages} onSend={(txt, type) => setChatMessages(prev => [...prev, { id: makeMessageId(), sender: user.username, text: txt, type, timestamp: Date.now() }])} /></div>

            {/* Bottom-right: D-pad + Interact */}
            <div className="absolute bottom-4 right-4 pointer-events-auto flex flex-col items-end gap-3">
                 <div className="grid grid-cols-3 gap-1 p-2 bg-black/50 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
                    <div/><button className="w-12 h-12 bg-white/5 hover:bg-white/20 rounded-t-lg flex items-center justify-center text-gold-500 active:bg-gold-500 active:text-black transition-colors" onClick={() => attemptMove(0, -1)}><ArrowUp size={24}/></button><div/><button className="w-12 h-12 bg-white/5 hover:bg-white/20 rounded-l-lg flex items-center justify-center text-gold-500 active:bg-gold-500 active:text-black transition-colors" onClick={() => attemptMove(-1, 0)}><ArrowLeft size={24}/></button><button className="w-12 h-12 bg-white/5 hover:bg-white/20 rounded-b-lg flex items-center justify-center text-gold-500 active:bg-gold-500 active:text-black transition-colors" onClick={() => attemptMove(0, 1)}><ArrowDown size={24}/></button><button className="w-12 h-12 bg-white/5 hover:bg-white/20 rounded-r-lg flex items-center justify-center text-gold-500 active:bg-gold-500 active:text-black transition-colors" onClick={() => attemptMove(1, 0)}><ArrowRight size={24}/></button>
                 </div>
                 <button onClick={checkForInteraction} className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black font-bold uppercase rounded-lg shadow-lg active:scale-95 transition-transform text-xs tracking-wider flex items-center justify-center gap-2 border border-gold-400"><Hand size={18}/> Interact</button>
            </div>
        </div>

        {/* Scroll Popup */}
        <AnimatePresence>
            {activeScroll && <ScrollPopup scroll={activeScroll} onClose={() => setActiveScroll(null)} />}
        </AnimatePresence>

        {/* Dialogue Overlay */}
        {activeNpc && currentDialogueNode && (
            <div className="absolute inset-0 bg-black/60 z-[60] flex items-end justify-center pb-8 px-4 pointer-events-auto backdrop-blur-sm animate-fade-in">
                <ParchmentPanel className="w-full max-w-3xl flex gap-6 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] border-4 border-[#3e2e1e] bg-[#e3d5b8]">
                    <div className="flex-shrink-0 -mt-12"><div className="w-28 h-28 bg-black/80 border-4 border-gold-500 rounded-lg flex items-center justify-center shadow-xl overflow-hidden relative"><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-50"></div><span className="relative z-10 drop-shadow-lg animate-float">{activeNpc.sprite ? renderWorldSprite(activeNpc.sprite, activeNpc.name, 'w-20 h-20') : <HeroAvatar race={activeNpc.race} size="lg" className="transform scale-125" />}</span></div></div>
                    <div className="flex-grow flex flex-col">
                        <h3 className="text-xl font-fantasy text-[#3e2e1e] mb-1">{activeNpc.name}</h3>
                        <p className="text-[#5c452d] text-lg font-serif italic mb-4 leading-relaxed">"{currentDialogueNode.text}"</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
                            {(currentDialogueNode.options || []).map((opt, i) => (
                                <button key={i} onClick={() => handleOptionSelect(opt)} className={`text-left bg-white/50 hover:bg-white border p-3 rounded shadow-sm text-[#3e2e1e] font-bold text-sm transition-all group flex items-center gap-2 ${opt.text.toLowerCase().includes('fight') || opt.text.toLowerCase().includes('battle') || opt.text.toLowerCase().includes('duel') ? 'border-red-500 hover:bg-red-50 text-red-900' : 'border-[#8c7b60] hover:border-gold-500'}`}>
                                        <span className={`${opt.text.toLowerCase().includes('fight') ? 'text-red-600' : 'text-gold-600'} group-hover:translate-x-1 transition-transform`}>{opt.text.toLowerCase().includes('fight') ? '⚔️' : '➤'}</span> {opt.text}
                                    </button>
                            ))}
                            {(activeNpc.isPlayer || activeNpc.level) && (!currentDialogueNode.options || currentDialogueNode.options.length === 0 || currentDialogueNode.options.some(o => o.trigger === 'CLOSE')) && (
                                <button onClick={() => handleOptionSelect({ text: 'Challenge to Duel', nextId: '', trigger: 'CLOSE' })} className="text-left bg-red-100 hover:bg-red-200 border border-red-500 p-3 rounded shadow-sm text-red-900 font-bold text-sm transition-all group flex items-center gap-2"><span className="text-red-600 group-hover:translate-x-1 transition-transform">⚔️</span> Challenge</button>
                            )}
                            {(!currentDialogueNode.options || currentDialogueNode.options.length === 0) && (
                                <button onClick={() => handleOptionSelect({ text: 'Continue', nextId: currentDialogueNode.nextId || '', trigger: 'CLOSE' })} className="col-span-full bg-gold-500 hover:bg-gold-400 text-black font-bold p-3 rounded shadow uppercase tracking-widest text-sm">Continue</button>
                            )}
                        </div>
                    </div>
                </ParchmentPanel>
            </div>
        )}

        {/* Biome transition overlay */}
        {biomeFlash && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-fade-in-out">
            <div className="text-3xl font-fantasy text-yellow-300 tracking-widest drop-shadow-lg">
              ⚔ {biomeFlash}
            </div>
          </div>
        )}
    </div>
  );
};
