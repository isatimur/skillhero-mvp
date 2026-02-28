import React, { useState, useEffect, useMemo } from 'react';
import { User, Quest, SETopic } from '../types';
import { QUESTS } from '../constants';
import { FantasyButton } from './ui';
import { ArrowLeft, Search, Filter, Trophy, Lock, Sparkles, Scroll, Sword, Star, ChevronDown, ChevronRight, Zap, BookOpen, Target, Shield, Brain, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';

interface EnhancedQuestSelectScreenProps {
    user: User;
    onSelectQuest: (q: Quest) => void;
    onBack: () => void;
}

// Topic metadata for visual organization
const TOPIC_META: Record<string, { color: string; borderColor: string; bgColor: string; icon: string; description: string }> = {
    'Algorithms': { color: 'text-cyan-400', borderColor: 'border-cyan-500/50', bgColor: 'from-cyan-950/40 to-cyan-900/20', icon: '🧮', description: 'Sorting, searching, graph algorithms, dynamic programming' },
    'Data Structures': { color: 'text-emerald-400', borderColor: 'border-emerald-500/50', bgColor: 'from-emerald-950/40 to-emerald-900/20', icon: '🏗️', description: 'Arrays, linked lists, trees, hash tables, heaps' },
    'OOP & Design Patterns': { color: 'text-purple-400', borderColor: 'border-purple-500/50', bgColor: 'from-purple-950/40 to-purple-900/20', icon: '🏛️', description: 'SOLID principles, factory, observer, strategy patterns' },
    'SQL & Databases': { color: 'text-blue-400', borderColor: 'border-blue-500/50', bgColor: 'from-blue-950/40 to-blue-900/20', icon: '🗄️', description: 'Queries, joins, normalization, indexing, transactions' },
    'Git & Version Control': { color: 'text-orange-400', borderColor: 'border-orange-500/50', bgColor: 'from-orange-950/40 to-orange-900/20', icon: '🔀', description: 'Branches, merges, conflicts, rebasing, workflows' },
    'System Design': { color: 'text-gold-400', borderColor: 'border-gold-500/50', bgColor: 'from-gold-950/40 to-gold-900/20', icon: '🏰', description: 'Scalability, load balancing, caching, sharding, CAP theorem' },
    'Networking & APIs': { color: 'text-indigo-400', borderColor: 'border-indigo-500/50', bgColor: 'from-indigo-950/40 to-indigo-900/20', icon: '🌐', description: 'HTTP, TCP/UDP, DNS, REST, GraphQL, WebSockets' },
    'Security': { color: 'text-red-400', borderColor: 'border-red-500/50', bgColor: 'from-red-950/40 to-red-900/20', icon: '🛡️', description: 'XSS, CSRF, SQL injection, JWT, encryption' },
    'Testing & CI/CD': { color: 'text-green-400', borderColor: 'border-green-500/50', bgColor: 'from-green-950/40 to-green-900/20', icon: '🧪', description: 'Unit tests, TDD, mocking, pipelines, deployment' },
    'JavaScript/TypeScript': { color: 'text-yellow-400', borderColor: 'border-yellow-500/50', bgColor: 'from-yellow-950/40 to-yellow-900/20', icon: '⚡', description: 'Async/await, closures, event loop, promises, types' },
    'React & Frontend': { color: 'text-sky-400', borderColor: 'border-sky-500/50', bgColor: 'from-sky-950/40 to-sky-900/20', icon: '⚛️', description: 'Hooks, state, components, virtual DOM, rendering' },
    'Backend & Servers': { color: 'text-amber-400', borderColor: 'border-amber-500/50', bgColor: 'from-amber-950/40 to-amber-900/20', icon: '🖥️', description: 'Microservices, API gateway, circuit breaker, events' },
    'Cloud & DevOps': { color: 'text-teal-400', borderColor: 'border-teal-500/50', bgColor: 'from-teal-950/40 to-teal-900/20', icon: '☁️', description: 'Docker, Kubernetes, AWS, CI/CD, containers' },
    'Concurrency': { color: 'text-pink-400', borderColor: 'border-pink-500/50', bgColor: 'from-pink-950/40 to-pink-900/20', icon: '🔄', description: 'Threads, locks, mutex, semaphores, deadlocks' },
    'General CS': { color: 'text-slate-300', borderColor: 'border-slate-500/50', bgColor: 'from-slate-800/40 to-slate-900/20', icon: '💻', description: 'Computer science fundamentals and theory' },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bgColor: string; stars: number }> = {
    'Beginner': { label: 'Beginner', color: 'text-green-400', bgColor: 'bg-green-500/20', stars: 1 },
    'Easy': { label: 'Easy', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', stars: 1 },
    'Medium': { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', stars: 2 },
    'Hard': { label: 'Hard', color: 'text-orange-400', bgColor: 'bg-orange-500/20', stars: 3 },
    'Expert': { label: 'Expert', color: 'text-red-400', bgColor: 'bg-red-500/20', stars: 4 },
    'Legendary': { label: 'Legendary', color: 'text-gold-400', bgColor: 'bg-gold-500/20', stars: 5 },
};

function getDifficultyTier(level: number): string {
    if (level <= 2) return 'Beginner';
    if (level <= 4) return 'Easy';
    if (level <= 6) return 'Medium';
    if (level <= 9) return 'Hard';
    if (level <= 11) return 'Expert';
    return 'Legendary';
}

function getQuestTopics(quest: Quest): SETopic[] {
    const topics = new Set<SETopic>();
    quest.questions.forEach(q => { if (q.topic) topics.add(q.topic); });
    return Array.from(topics);
}

// Group quests by their primary topic
function groupQuestsByTopic(quests: Quest[]): Map<string, Quest[]> {
    const groups = new Map<string, Quest[]>();

    quests.forEach(quest => {
        const topics = getQuestTopics(quest);
        const primaryTopic = topics[0] || 'General CS';
        if (!groups.has(primaryTopic)) groups.set(primaryTopic, []);
        groups.get(primaryTopic)!.push(quest);
    });

    // Sort quests within each group by level
    groups.forEach((quests) => {
        quests.sort((a, b) => a.levelRequired - b.levelRequired);
    });

    return groups;
}

export const EnhancedQuestSelectScreen: React.FC<EnhancedQuestSelectScreenProps> = ({
    user,
    onSelectQuest,
    onBack,
}) => {
    const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'topics' | 'list'>('topics');

    // Use QUESTS constant directly (no need for async fetch since data is local)
    const quests = QUESTS.filter(q => !q.isPvP);

    const filteredQuests = useMemo(() => {
        return quests.filter((quest) => {
            const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quest.description.toLowerCase().includes(searchTerm.toLowerCase());
            const isCompleted = user.completedQuests.includes(quest.id);
            const isAvailable = user.level >= quest.levelRequired;

            if (filter === 'available') return matchesSearch && isAvailable && !isCompleted;
            if (filter === 'completed') return matchesSearch && isCompleted;
            return matchesSearch;
        });
    }, [quests, filter, searchTerm, user]);

    const groupedQuests = useMemo(() => groupQuestsByTopic(filteredQuests), [filteredQuests]);

    const totalCompleted = quests.filter(q => user.completedQuests.includes(q.id)).length;
    const totalAvailable = quests.filter(q => user.level >= q.levelRequired && !user.completedQuests.includes(q.id)).length;
    const totalQuests = quests.length;

    const toggleTopic = (topic: string) => {
        setExpandedTopics(prev => {
            const next = new Set(prev);
            if (next.has(topic)) next.delete(topic);
            else next.add(topic);
            return next;
        });
    };

    // Auto-expand topics with available quests
    useEffect(() => {
        const autoExpand = new Set<string>();
        groupedQuests.forEach((qs, topic) => {
            if (qs.some(q => user.level >= q.levelRequired && !user.completedQuests.includes(q.id))) {
                autoExpand.add(topic);
            }
        });
        setExpandedTopics(autoExpand);
    }, [filter, searchTerm]);

    return (
        <div className="max-w-7xl mx-auto w-full pt-6 pb-12 px-4 relative z-10 min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-fantasy text-gold-400 mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                            Quest Board
                        </h1>
                        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
                            Master every topic. Defeat every boss. Become legendary.
                        </p>
                    </div>
                    <FantasyButton onClick={onBack} variant="secondary" size="sm">
                        <ArrowLeft size={16} className="mr-2" />
                        Hub
                    </FantasyButton>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gold-500/20 rounded-lg"><Scroll className="text-gold-400" size={24} /></div>
                            <div>
                                <div className="text-2xl font-bold text-white">{totalQuests}</div>
                                <div className="text-xs text-slate-500 uppercase">Total Quests</div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/20 border border-emerald-700/50 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg"><Trophy className="text-emerald-400" size={24} /></div>
                            <div>
                                <div className="text-2xl font-bold text-white">{totalCompleted}</div>
                                <div className="text-xs text-emerald-400 uppercase">Completed</div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-cyan-950/50 to-cyan-900/20 border border-cyan-700/50 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg"><Sparkles className="text-cyan-400" size={24} /></div>
                            <div>
                                <div className="text-2xl font-bold text-white">{totalAvailable}</div>
                                <div className="text-xs text-cyan-400 uppercase">Available</div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-gold-950/50 to-gold-900/20 border border-gold-700/50 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gold-500/20 rounded-lg"><Star className="text-gold-400" size={24} /></div>
                            <div>
                                <div className="text-2xl font-bold text-white">Lvl {user.level}</div>
                                <div className="text-xs text-gold-400 uppercase">Your Level</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Overall Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Quest Mastery</span>
                        <span>{totalCompleted}/{totalQuests} ({Math.round(totalCompleted / totalQuests * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(totalCompleted / totalQuests) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                        />
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search quests by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/70 border border-slate-700/50 rounded-lg pl-12 pr-4 py-3 text-white text-sm focus:border-gold-500 outline-none transition-colors backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {[
                            { value: 'all', label: 'All', icon: Filter },
                            { value: 'available', label: 'Ready', icon: Sparkles },
                            { value: 'completed', label: 'Done', icon: Trophy },
                        ].map(btn => {
                            const Icon = btn.icon;
                            return (
                                <button
                                    key={btn.value}
                                    onClick={() => setFilter(btn.value as any)}
                                    className={`px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                                        filter === btn.value
                                            ? 'bg-gold-600 text-black'
                                            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    <Icon size={14} />{btn.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Quest Board - Topic Groups */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
            >
                {Array.from(groupedQuests.entries()).map(([topic, topicQuests], groupIdx) => {
                    const meta = TOPIC_META[topic] || TOPIC_META['General CS'];
                    const isExpanded = expandedTopics.has(topic);
                    const completedInTopic = topicQuests.filter(q => user.completedQuests.includes(q.id)).length;
                    const progress = completedInTopic / topicQuests.length;

                    return (
                        <motion.div
                            key={topic}
                            variants={staggerItem}
                            className={`border ${meta.borderColor} rounded-xl overflow-hidden backdrop-blur-sm`}
                        >
                            {/* Topic Header */}
                            <button
                                onClick={() => toggleTopic(topic)}
                                className={`w-full bg-gradient-to-r ${meta.bgColor} p-4 flex items-center gap-4 hover:brightness-110 transition-all`}
                            >
                                <span className="text-2xl">{meta.icon}</span>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`text-lg font-fantasy ${meta.color}`}>{topic}</h3>
                                        <span className="text-xs text-slate-500 font-mono">{topicQuests.length} quest{topicQuests.length !== 1 ? 's' : ''}</span>
                                        {completedInTopic === topicQuests.length && topicQuests.length > 0 && (
                                            <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs font-bold rounded border border-gold-500/30">MASTERED</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                                </div>
                                {/* Mini Progress */}
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500`} style={{ width: `${progress * 100}%`, background: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                                            <div className={`h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400`} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono w-12">{completedInTopic}/{topicQuests.length}</span>
                                    {isExpanded ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                                </div>
                            </button>

                            {/* Quests List */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-3 space-y-2 bg-black/30">
                                            {topicQuests.map((quest, qi) => {
                                                const isCompleted = user.completedQuests.includes(quest.id);
                                                const isLocked = user.level < quest.levelRequired;
                                                const difficulty = getDifficultyTier(quest.levelRequired);
                                                const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG['Medium'];
                                                const allTopics = getQuestTopics(quest);

                                                return (
                                                    <motion.div
                                                        key={quest.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: qi * 0.05 }}
                                                        onClick={() => !isLocked && !isCompleted && onSelectQuest(quest)}
                                                        className={`relative flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer group ${
                                                            isCompleted
                                                                ? 'bg-emerald-950/20 border-emerald-800/30 opacity-70'
                                                                : isLocked
                                                                    ? 'bg-slate-900/30 border-slate-800/30 opacity-50 cursor-not-allowed'
                                                                    : 'bg-slate-900/50 border-slate-700/40 hover:border-gold-500/50 hover:bg-slate-800/50'
                                                        }`}
                                                    >
                                                        {/* Boss Icon */}
                                                        <div className={`text-4xl w-14 h-14 flex items-center justify-center rounded-lg ${
                                                            isCompleted ? 'bg-emerald-900/30' : isLocked ? 'bg-slate-800/50 grayscale' : 'bg-slate-800/80'
                                                        }`}>
                                                            {isLocked ? <Lock size={24} className="text-slate-600" /> : quest.enemyImage}
                                                        </div>

                                                        {/* Quest Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className={`font-bold text-sm ${isCompleted ? 'text-emerald-400 line-through' : isLocked ? 'text-slate-600' : 'text-white group-hover:text-gold-400'}`}>
                                                                    {quest.title}
                                                                </h4>
                                                                {/* Difficulty Badge */}
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${diffConfig.bgColor} ${diffConfig.color} border border-current/20`}>
                                                                    {Array.from({ length: diffConfig.stars }).map((_, i) => '★').join('')} {diffConfig.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{quest.description}</p>
                                                            {/* Topic Tags */}
                                                            <div className="flex gap-1 mt-1.5 flex-wrap">
                                                                {allTopics.map(t => {
                                                                    const tm = TOPIC_META[t];
                                                                    return tm ? (
                                                                        <span key={t} className={`px-1.5 py-0.5 rounded text-[9px] ${tm.color} bg-current/10 border border-current/20`}>
                                                                            {t}
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Stats */}
                                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                                            {isCompleted ? (
                                                                <div className="flex items-center gap-1 text-emerald-400">
                                                                    <Trophy size={16} />
                                                                    <span className="text-xs font-bold">CLEARED</span>
                                                                </div>
                                                            ) : isLocked ? (
                                                                <div className="text-xs text-slate-600 font-mono">Lvl {quest.levelRequired}</div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-1 text-gold-400">
                                                                        <Zap size={12} />
                                                                        <span className="text-xs font-bold">+{quest.rewardXp} XP</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-slate-500">
                                                                        <BookOpen size={10} />
                                                                        <span className="text-[10px]">{quest.questions.length} questions</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-red-400/60">
                                                                        <Sword size={10} />
                                                                        <span className="text-[10px]">HP: {quest.enemyMaxHp || 100}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Hover Arrow */}
                                                        {!isLocked && !isCompleted && (
                                                            <ChevronRight size={18} className="text-slate-600 group-hover:text-gold-400 transition-colors shrink-0" />
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Empty State */}
            {filteredQuests.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <div className="text-6xl mb-4 opacity-30">🗡️</div>
                    <h3 className="text-2xl font-fantasy text-slate-500 mb-2">No Quests Found</h3>
                    <p className="text-slate-600 text-sm">Try adjusting your filters or level up to unlock more quests!</p>
                </motion.div>
            )}

            {/* Footer Tips */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
            >
                <p className="text-xs text-slate-600 font-mono">
                    <Brain size={12} className="inline mr-1" />
                    Each quest battle tests your knowledge. Answer correctly to deal damage. Wrong answers hurt you!
                </p>
            </motion.div>
        </div>
    );
};
