
import React, { useState, useEffect } from 'react';
import { User, GameScreen, Quest, CosmeticItem, CosmeticType, HeroClass, Gender, HeroRace, RaceData, ClassData, CharacterAppearance } from '../types';
import type { RewardState } from '../lib/rewardBus';
import { INITIAL_USER, RACE_SPRITE_URL, getTopicsPracticed } from '../constants';
import { fetchQuests } from '../lib/supabase';
import { getStreak, isDailyBonusClaimed } from '../lib/streak';
import { ParchmentPanel, FantasyButton, LiquidBar, StatBadge } from './ui';
import { HeroAvatar, ICON_MAP } from './HeroAvatar';
import { supabase } from '../lib/supabase';
import { EnhancedQuestSelectScreen } from './EnhancedQuestSelectScreen';
import { XPBar, HPBar } from './premium/AnimatedProgressBar';
import {
    LogOut, Map as MapIcon, Palette, Scroll, Trophy, CheckCircle,
    Lock, Sparkles, User as UserIcon, Sword, Zap, Ghost, Star, ChevronLeft, ChevronRight,
    Shield, Flame, Hammer, Eye, Skull, Coffee, Target, Bug, Compass, Crosshair, BookOpen, Settings, X, Volume2, Music, Play,
    Mail, Key, Terminal, Cpu, Code, Crown, Shirt, Hexagon, PlayCircle, AlertCircle, MousePointer, Pin, Monitor, Wand2, Backpack, Gem, Activity,
    Footprints, Anchor, Box, ArrowUpRight, Keyboard, Timer, Loader, UserCheck, Heart, RotateCcw, Info, Swords, ArrowUp, Database,
    Brain, TrendingUp, Layers
} from 'lucide-react';

const AVATAR_HEADS = ['head_novice', 'head_debugger', 'head_visor', 'head_glasses', 'head_headphones'];

export const LoginScreen: React.FC<{ session: any; onProfileCreated: (user: User) => void; gameData: { races: RaceData[], classes: ClassData[], items: CosmeticItem[] } }> = ({ session, onProfileCreated, gameData }) => {
    const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState<Gender>('MALE');
    const [selectedClass, setSelectedClass] = useState<HeroClass>('WARRIOR');
    const [selectedRace, setSelectedRace] = useState<HeroRace>('HUMAN');
    const [headIndex, setHeadIndex] = useState(0);
    const [legacyStep, setLegacyStep] = useState<'NAME' | 'GENDER' | 'RACE' | 'CLASS' | 'CONFIRM'>('NAME');

    const currentClass = gameData.classes.find(c => c.id === selectedClass) || gameData.classes[0];
    const currentRace = gameData.races.find(r => r.id === selectedRace) || gameData.races[0];
    const classStats = currentClass?.stats || { str: 1, int: 1, agi: 1 };
    const raceStats = currentRace?.stats || { str: 1, int: 1, agi: 1 };
    const totalStats = { str: classStats.str + raceStats.str, int: classStats.int + raceStats.int, agi: classStats.agi + raceStats.agi };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError(null);
        try {
            if (authMode === 'SIGNUP') { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; }
            else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

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

    useEffect(() => {
        if (session?.user?.app_metadata?.provider === 'google' && !username) {
            const name: string =
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                '';
            if (name) setUsername(name.split(' ')[0].slice(0, 15));
        }
    }, [session, username]);

    const handleCreateProfile = async () => {
        if (!session?.user || !currentClass) return;
        setLoading(true); setError(null);
        const finalName = username.trim() || 'Hero';
        const newUser: User = {
            ...INITIAL_USER, username: finalName, heroClass: selectedClass, heroRace: selectedRace, gender: gender,
            appearance: { headId: AVATAR_HEADS[headIndex], bodyId: currentClass.bodyId, weaponId: currentClass.weaponId }, stats: totalStats
        };
        try {
            const { error } = await supabase.from('profiles').insert({ id: session.user.id, username: finalName, hero_class: selectedClass, hero_race: selectedRace, gender: gender, appearance: newUser.appearance, stats: totalStats, level: 1, xp: 0, max_xp: 500, completed_quests: [], title: 'Novice' });
            if (error) throw error;
            onProfileCreated(newUser);
        } catch (err: any) { setError(err.message); setLoading(false); }
    };

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 pointer-events-none">
                    <img src="/art/fantasy/login-citadel.svg" alt="Citadel" className="w-full h-full object-cover opacity-45" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/55" />
                </div>
                <h1 className="text-5xl md:text-7xl font-fantasy text-gold-400 mb-8 drop-shadow-[0_0_20px_rgba(218,165,32,0.5)] animate-pulse-slow text-center">SkillHero</h1>
                <ParchmentPanel className="max-w-md w-full" title={authMode === 'LOGIN' ? "Identify Yourself" : "New Registration"}>
                    <form onSubmit={handleAuth} className="space-y-6 mt-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gold-500 mb-1 tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="email" required className="w-full pl-10 pr-3 py-3 bg-black/40 border border-slate-700 rounded text-white focus:border-gold-500 outline-none transition-colors" placeholder="mage@guild.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gold-500 mb-1 tracking-widest">Passcode</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="password" required className="w-full pl-10 pr-3 py-3 bg-black/40 border border-slate-700 rounded text-white focus:border-gold-500 outline-none transition-colors" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                        </div>
                        {error && <div className="p-3 bg-red-900/50 text-red-300 text-sm rounded border border-red-500 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
                        <FantasyButton fullWidth disabled={loading} type="submit" variant="primary" isLoading={loading}>{authMode === 'LOGIN' ? 'Enter the Realm' : 'Inscribe Name'}</FantasyButton>
                    </form>
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
                </ParchmentPanel>
            </div>
        );
    }

    if (!currentClass || !currentRace) return <div className="text-center p-10 text-gold-500 font-fantasy text-xl animate-pulse">Summoning Archives...</div>;

    const canAdvanceFromName = username.trim().length >= 2;
    const chosenName = username.trim() || 'Unnamed';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8 relative z-10">
            <ParchmentPanel className="w-full max-w-7xl mx-auto" title="Forge Your Hero">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8 space-y-6">
                        <div className="rounded-xl border border-slate-600 bg-[#d8d8dd]/90 text-[#101217] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                            <div className="flex items-center justify-between border-b border-slate-500/40 pb-2 mb-3">
                                <h3 className="font-fantasy text-red-700 text-xl">Приветствие</h3>
                                <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Legacy Chronicle</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                Добро пожаловать, студент. Сейчас мы заполним краткую анкету героя и занесем тебя в книгу выпускников Академии Четвертой Стены.
                            </p>
                            <div className="mt-3 p-3 rounded border border-slate-500/40 bg-white/50 text-sm">
                                {legacyStep === 'NAME' && (
                                    <div>
                                        <p className="mb-2">Для начала: как тебя зовут?</p>
                                        <div className="space-y-1 text-[#0b3d91] font-bold">
                                            <button
                                                type="button"
                                                onClick={() => canAdvanceFromName && setLegacyStep('GENDER')}
                                                className={`block text-left ${canAdvanceFromName ? 'hover:underline' : 'opacity-50 cursor-not-allowed'}`}
                                                disabled={!canAdvanceFromName}
                                            >
                                                • Назвать себя «{chosenName}» и продолжить.
                                            </button>
                                            <button type="button" className="block text-left hover:underline" onClick={() => setUsername('Anon')}>
                                                • Временно остаться Анонимом.
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {legacyStep === 'GENDER' && (
                                    <div>
                                        <p className="mb-2">Отметим пол персонажа:</p>
                                        <div className="space-y-1 text-[#0b3d91] font-bold">
                                            <button type="button" className="block text-left hover:underline" onClick={() => { setGender('FEMALE'); setLegacyStep('RACE'); }}>
                                                • Я - прекрасная воительница!
                                            </button>
                                            <button type="button" className="block text-left hover:underline" onClick={() => { setGender('MALE'); setLegacyStep('RACE'); }}>
                                                • Я - отважный воин!
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {legacyStep === 'RACE' && (
                                    <div>
                                        <p className="mb-2">Теперь выбери народ, из которого ты происходишь:</p>
                                        <div className="space-y-1 text-[#0b3d91] font-bold">
                                            <button type="button" className="block text-left hover:underline" onClick={() => setLegacyStep('CLASS')}>
                                                • Подтвердить выбор расы: {currentRace.name}.
                                            </button>
                                            <button type="button" className="block text-left hover:underline" onClick={() => setLegacyStep('NAME')}>
                                                • Вернуться и изменить данные.
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {legacyStep === 'CLASS' && (
                                    <div>
                                        <p className="mb-2">Определи путь обучения в академии:</p>
                                        <div className="space-y-1 text-[#0b3d91] font-bold">
                                            <button type="button" className="block text-left hover:underline" onClick={() => setLegacyStep('CONFIRM')}>
                                                • Подтвердить дисциплину: {currentClass.name}.
                                            </button>
                                            <button type="button" className="block text-left hover:underline" onClick={() => setLegacyStep('RACE')}>
                                                • Сначала хочу изменить расу.
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {legacyStep === 'CONFIRM' && (
                                    <div>
                                        <p className="mb-2">Проверим анкету: Имя - {chosenName}, Пол - {gender === 'MALE' ? 'мужской' : 'женский'}, Раса - {currentRace.name}, Класс - {currentClass.name}.</p>
                                        <div className="space-y-1 text-[#0b3d91] font-bold">
                                            <button type="button" className="block text-left hover:underline" onClick={handleCreateProfile}>
                                                • Да, все верно, подписать анкету.
                                            </button>
                                            <button type="button" className="block text-left hover:underline" onClick={() => setLegacyStep('NAME')}>
                                                • Нет, хочу изменить данные.
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gold-600/20 bg-obsidian-900/60 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-fantasy text-gold-400 text-lg">Step I - Choose Ancestry</h3>
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Race</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {gameData.races.map((race) => (
                                    <button
                                        key={race.id}
                                        onClick={() => setSelectedRace(race.id)}
                                        className={`text-left p-3 border rounded-lg transition-all ${
                                            selectedRace === race.id
                                                ? 'bg-gold-500/15 border-gold-400 text-gold-300 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]'
                                                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-gold-500/50'
                                        }`}
                                    >
                                        <div className="font-bold uppercase tracking-wide text-xs">{race.name}</div>
                                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{race.passiveName || race.desc}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 p-3 rounded bg-black/30 border border-slate-800">
                                <div className="text-xs uppercase tracking-widest text-gold-500 font-bold">Racial Trait</div>
                                <div className="text-sm text-slate-300 mt-1">{currentRace.passiveName || currentRace.name}</div>
                                <div className="text-xs text-slate-400 mt-1">{currentRace.passiveDesc || currentRace.desc}</div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gold-600/20 bg-obsidian-900/60 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-fantasy text-gold-400 text-lg">Step II - Pick Discipline</h3>
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Class</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {gameData.classes.map((cls) => {
                                    const Icon = ICON_MAP[cls.iconId] || Sword;
                                    return (
                                        <button
                                            key={cls.id}
                                            onClick={() => setSelectedClass(cls.id)}
                                            className={`text-left p-3 border rounded-lg transition-all ${
                                                selectedClass === cls.id
                                                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-[0_0_0_1px_rgba(129,140,248,0.4)]'
                                                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-indigo-400/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon size={16} />
                                                <span className="font-bold uppercase tracking-wide text-xs">{cls.name}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{cls.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gold-600/20 bg-obsidian-900/60 p-4">
                            <h3 className="font-fantasy text-gold-400 text-lg mb-3">Step III - Name and Appearance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Hero Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-slate-600 p-3 rounded font-fantasy text-xl text-white focus:border-gold-500 outline-none"
                                        placeholder="Arius Stormborn"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        maxLength={15}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Gender</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setGender('MALE')} className={`flex-1 text-xs font-bold uppercase px-3 py-2 rounded border transition-all ${gender === 'MALE' ? 'bg-blue-600/40 border-blue-400 text-white' : 'border-slate-600 text-slate-400 hover:border-blue-400/50'}`}>Male</button>
                                        <button onClick={() => setGender('FEMALE')} className={`flex-1 text-xs font-bold uppercase px-3 py-2 rounded border transition-all ${gender === 'FEMALE' ? 'bg-pink-600/40 border-pink-400 text-white' : 'border-slate-600 text-slate-400 hover:border-pink-400/50'}`}>Female</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-4">
                        <div className="rounded-xl border border-gold-500/30 bg-gradient-to-b from-obsidian-800/90 to-black/80 p-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(251,191,36,0.12),transparent_55%)] pointer-events-none" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="transform scale-125 mt-4">
                                    <HeroAvatar race={selectedRace} appearance={{ headId: AVATAR_HEADS[headIndex], bodyId: currentClass.bodyId, weaponId: currentClass.weaponId }} size="xl" showWeapon items={gameData.items} raceOptions={gameData.races} />
                                </div>
                                <div className="mt-10 text-center">
                                    <div className="font-fantasy text-2xl text-white">{currentRace.name} {currentClass.name}</div>
                                    <div className="text-xs uppercase tracking-wider text-gold-500 mt-1">{username.trim() || 'Unnamed Hero'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-obsidian-900/70 p-4">
                            <h4 className="font-fantasy text-gold-400 text-lg mb-3">Total Attributes</h4>
                            <div className="space-y-3">
                                <LiquidBar current={totalStats.str} max={10} label="Strength" color="red" />
                                <LiquidBar current={totalStats.int} max={10} label="Intelligence" color="blue" />
                                <LiquidBar current={totalStats.agi} max={10} label="Agility" color="green" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <FantasyButton fullWidth onClick={handleCreateProfile} disabled={loading || !username.trim()} isLoading={loading}>
                                    Begin Adventure
                                </FantasyButton>
                            </div>
                        </div>
                    </div>
                </div>
            </ParchmentPanel>
        </div>
    );
};

export const HubScreen: React.FC<{
    user: User;
    onNavigate: (screen: GameScreen) => void;
    onLogout: () => void;
    onOpenSettings: () => void;
    gameData: any;
    rewardState?: RewardState;
    progressionMeta?: {
        rank: string;
        gold: number;
        shards: number;
        combo: number;
        dailyActions: number;
        dailyTarget: number;
        weeklyActions: number;
        weeklyTarget: number;
    };
}> = ({ user, onNavigate, onLogout, onOpenSettings, gameData, rewardState, progressionMeta }) => {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const streak = getStreak();
    const dailyAvailable = !isDailyBonusClaimed();

    return (
        <div className="max-w-7xl mx-auto w-full animate-fade-in flex flex-col gap-8 relative z-10">
            {/* Daily Challenge + Streak banner */}
            <div className="flex flex-wrap items-center gap-4 px-4">
                {dailyAvailable && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/15 border border-gold-500/50 text-gold-400 font-mono text-sm">
                        <Flame size={18} />
                        <span className="font-bold uppercase tracking-wider">Daily Challenge</span>
                        <span className="text-slate-400">— Win a quest today for +50% XP</span>
                    </div>
                )}
                {streak > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/50 text-cyan-400 font-mono text-sm">
                        <Flame size={18} />
                        <span className="font-bold">{streak} day streak</span>
                    </div>
                )}
                {progressionMeta && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/15 border border-purple-500/50 text-purple-300 font-mono text-sm">
                        <Crown size={16} />
                        <span className="font-bold">{progressionMeta.rank}</span>
                    </div>
                )}
            </div>
            {/* Fantasy Divider */}
            <div className="fantasy-divider px-4"><span className="text-gold-500 text-xs">◆</span></div>

            {/* Top Profile Strip */}
            <div className="bg-gradient-to-r from-obsidian-900/90 via-obsidian-800/80 to-obsidian-900/90 border-y border-gold-600/30 backdrop-blur-md p-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative">
                {/* Gold ornamental lines */}
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
                <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
                <div className="flex items-center gap-6">
                    <div className="relative cursor-pointer group" onClick={() => onNavigate('PROFILE')}>
                        <HeroAvatar appearance={user.appearance} race={user.heroRace} size="lg" className="border-4 border-gold-600 shadow-[0_0_20px_rgba(218,165,32,0.4)]" items={gameData.items} raceOptions={gameData.races} />
                        <div className="absolute -bottom-2 -right-2 bg-obsidian-900 text-gold-500 border border-gold-500 rounded-full p-1"><Settings size={14} /></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-fantasy text-gold-400 tracking-wide text-shadow-gold">{user.username}</h1>
                        <div className="flex items-center gap-2 text-xs font-mono text-gold-500 uppercase tracking-widest">
                            <span>Lvl {user.level} {user.heroClass}</span>
                            {isAdmin && <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-500">ADMIN</span>}
                        </div>
                        <div className="w-48 mt-2"><LiquidBar current={user.xp} max={user.maxXp} size="sm" color="gold" /></div>
                        {rewardState && rewardState.combo > 1 && (
                            <div className="flex items-center gap-2 text-yellow-400 mt-1">
                                <span className="text-lg">🔥</span>
                                <span className="font-fantasy font-bold">{rewardState.combo}x Streak</span>
                            </div>
                        )}
                    </div>
                </div>

	                <div className="flex items-center gap-3">
	                    {progressionMeta && (
	                        <div className="hidden lg:flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-slate-300 bg-black/25 border border-gold-600/20 rounded-lg px-3 py-2">
	                            <span className="text-amber-300 flex items-center gap-1"><Trophy size={12} />{progressionMeta.gold}</span>
	                            <span className="text-cyan-300 flex items-center gap-1"><Gem size={12} />{progressionMeta.shards}</span>
	                            {(!rewardState || rewardState.combo <= 1) && progressionMeta.combo > 0 && (
                                <span className="text-red-300 flex items-center gap-1"><Flame size={12} />x{progressionMeta.combo}</span>
                            )}
	                        </div>
	                    )}
	                    {isAdmin && <FantasyButton variant="admin" size="sm" onClick={() => onNavigate('ADMIN')} icon={<Database size={16} />}>CMS</FantasyButton>}
	                    <FantasyButton variant="ghost" size="sm" onClick={onOpenSettings} icon={<Settings size={16} />}>Config</FantasyButton>
	                    <FantasyButton variant="secondary" size="sm" onClick={onLogout} icon={<LogOut size={16} />}>Logout</FantasyButton>
	                </div>
	            </div>

                {progressionMeta && (
                    <div className="mx-4 -mt-2 rounded-xl border border-gold-600/20 bg-gradient-to-r from-obsidian-900/70 to-obsidian-800/40 p-3">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-mono">
                            <span className="text-gold-400">Daily Raid</span>
                            <span className="text-slate-400">{Math.min(progressionMeta.dailyActions, progressionMeta.dailyTarget)}/{progressionMeta.dailyTarget}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-black/40 border border-gold-600/20 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-gold-600 to-amber-400 transition-all duration-500"
                                style={{ width: `${Math.min(100, (progressionMeta.dailyActions / progressionMeta.dailyTarget) * 100)}%` }}
                            />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest font-mono">
                            <span className="text-cyan-400">Weekly Raid</span>
                            <span className="text-slate-400">{Math.min(progressionMeta.weeklyActions, progressionMeta.weeklyTarget)}/{progressionMeta.weeklyTarget}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-black/40 border border-cyan-600/20 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-500"
                                style={{ width: `${Math.min(100, (progressionMeta.weeklyActions / progressionMeta.weeklyTarget) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                <div className="md:col-span-2 lg:col-span-2 relative group cursor-pointer" onClick={() => onNavigate('QUEST_SELECT')}>
                    {/* Multi-layer gold glow behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold-600/20 via-gold-400/30 to-gold-600/20 rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-600/10 to-gold-600/10 rounded-xl opacity-60" />
                    <div className="relative h-64 bg-gradient-to-b from-obsidian-800 to-[#0c0c14] border-2 border-gold-600/50 rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-2xl group-hover:border-gold-400 transition-all">
                        <img src="/art/fantasy/hub-adventure-panel.svg" alt="Adventure panel art" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-hex-pattern opacity-[0.04]" />
                        {/* 4 larger ornamental corners */}
                        <div className="absolute top-2 left-2 w-[10px] h-[10px] border-t-2 border-l-2 border-gold-500/50 pointer-events-none z-20" />
                        <div className="absolute top-2 right-2 w-[10px] h-[10px] border-t-2 border-r-2 border-gold-500/50 pointer-events-none z-20" />
                        <div className="absolute bottom-2 left-2 w-[10px] h-[10px] border-b-2 border-l-2 border-gold-500/50 pointer-events-none z-20" />
                        <div className="absolute bottom-2 right-2 w-[10px] h-[10px] border-b-2 border-r-2 border-gold-500/50 pointer-events-none z-20" />
                        {/* Gold divider lines top/bottom */}
                        <div className="absolute top-3 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent z-20" />
                        <div className="absolute bottom-3 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent z-20" />
                        {/* Vignette */}
                        <div className="absolute inset-0 vignette z-10" />
                        <Sword size={64} className="text-gold-500 mb-4 animate-pulse-slow drop-shadow-[0_0_10px_rgba(218,165,32,0.8)] relative z-20" />
                        <h2 className="text-4xl font-fantasy text-embossed-gold tracking-widest relative z-20">Adventure</h2>
                        {/* Divider between title and subtitle */}
                        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mt-2 relative z-20" />
                        <p className="text-slate-400 text-xs uppercase tracking-widest mt-2 relative z-20">Slay Bugs • Earn XP • Level Up</p>
                    </div>
                </div>

                <HubCard title="Study Hub" icon={<Compass size={40} />} color="text-gold-400" onClick={() => onNavigate('STUDY_HUB')} desc="Learn & Master CS" />
                <HubCard title="Grand Arena" icon={<Swords size={40} />} color="text-red-500" onClick={() => onNavigate('PVP_LOBBY')} desc="PvP Duels" />
                <HubCard title="World Map" icon={<MapIcon size={40} />} color="text-emerald-500" onClick={() => onNavigate('WORLD')} desc="Exploration" />
                <HubCard title="Skill Tree" icon={<Star size={40} />} color="text-indigo-500" onClick={() => onNavigate('LIBRARY')} desc="Knowledge Graph" />
                <HubCard title="CS Reference" icon={<BookOpen size={40} />} color="text-blue-400" onClick={() => onNavigate('CS_REFERENCE')} desc="Cheat Sheets" />
                <HubCard title="Algo Lab" icon={<Brain size={40} />} color="text-amber-400" onClick={() => onNavigate('ALGO_VISUALIZER')} desc="Visual Algorithms" />
                <HubCard title="Interview Prep" icon={<Target size={40} />} color="text-green-400" onClick={() => onNavigate('INTERVIEW_PREP')} desc="FAANG Ready" />
                <HubCard title="Analytics" icon={<TrendingUp size={40} />} color="text-cyan-400" onClick={() => onNavigate('PROGRESS')} desc="Your Progress" />
                <HubCard title="System Design" icon={<Database size={40} />} color="text-blue-400" onClick={() => onNavigate('SYSTEM_DESIGN')} desc="Architecture" />
                <HubCard title="Grimoire" icon={<Layers size={40} />} color="text-purple-500" onClick={() => onNavigate('SPELLBOOK')} desc="Spells & Arts" />
                <HubCard title="Neural Dojo" icon={<Code size={40} />} color="text-cyan-500" onClick={() => onNavigate('TRAINING')} desc="Minigames" />
                <HubCard title="Armory" icon={<Palette size={40} />} color="text-pink-500" onClick={() => onNavigate('CUSTOMIZE')} desc="Gear & Skins" />
            </div>
        </div>
    );
};

const CARD_GLOW_MAP: Record<string, string> = {
    'text-gold-400': 'card-glow-gold',
    'text-red-500': 'card-glow-red',
    'text-emerald-500': 'card-glow-emerald',
    'text-indigo-500': 'card-glow-indigo',
    'text-blue-400': 'card-glow-blue',
    'text-amber-400': 'card-glow-amber',
    'text-green-400': 'card-glow-green',
    'text-cyan-400': 'card-glow-cyan',
    'text-cyan-500': 'card-glow-cyan',
    'text-purple-500': 'card-glow-purple',
    'text-pink-500': 'card-glow-pink',
};

const HubCard: React.FC<{ title: string, icon: React.ReactNode, color: string, onClick: () => void, desc: string }> = ({ title, icon, color, onClick, desc }) => (
    <div onClick={onClick} className={`relative h-48 bg-gradient-to-b from-obsidian-800 to-[#0c0c14] border border-gold-600/15 rounded-xl overflow-hidden cursor-pointer group hover:border-gold-500/40 transition-all shadow-lg ${CARD_GLOW_MAP[color] || 'card-glow-gold'}`}>
        <img src="/art/fantasy/hub-card-stars.svg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
        {/* Hex texture */}
        <div className="absolute inset-0 bg-hex-pattern opacity-[0.04]" />
        {/* Ornamental corners */}
        <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-gold-500/30 pointer-events-none" />
        <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-gold-500/30 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-gold-500/30 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-gold-500/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className={`mb-3 ${color} drop-shadow-md group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_currentColor] transition-all duration-300`}>{icon}</div>
            <h3 className="text-xl font-fantasy text-slate-200 group-hover:text-gold-400 transition-colors">{title}</h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">{desc}</p>
        </div>
    </div>
);

// Use enhanced quest select screen
export const QuestSelectScreen = EnhancedQuestSelectScreen;

export const ProfileScreen: React.FC<{ user: User; gameData: any; onBack: () => void }> = ({ user, gameData, onBack }) => {
    return (
        <div className="max-w-5xl mx-auto w-full animate-fade-in relative z-10">
            <div className="flex justify-between items-center mb-6 px-4">
                <h2 className="text-4xl font-fantasy text-gold-500 text-shadow-gold">Hero Record</h2>
                <FantasyButton onClick={onBack} variant="secondary" size="sm">Close</FantasyButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                <ParchmentPanel className="md:col-span-1 flex flex-col items-center">
                    <HeroAvatar appearance={user.appearance} race={user.heroRace} size="xl" showWeapon className="border-4 border-gold-600 shadow-2xl mb-6" items={gameData.items} raceOptions={gameData.races} />
                    <h3 className="text-2xl font-fantasy text-white">{user.username}</h3>
                    <p className="text-sm text-gold-500 font-mono mb-6">{user.heroRace} {user.heroClass}</p>

                    <div className="w-full space-y-4 mb-6">
                        <LiquidBar current={user.stats?.str || 0} max={15} label="Strength" color="red" />
                        <LiquidBar current={user.stats?.int || 0} max={15} label="Intelligence" color="blue" />
                        <LiquidBar current={user.stats?.agi || 0} max={15} label="Agility" color="green" />
                    </div>
                </ParchmentPanel>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-obsidian-900 border border-gold-600/30 p-6 rounded-xl flex items-center gap-4">
                            <Trophy size={32} className="text-gold-500" />
                            <div>
                                <div className="text-3xl font-fantasy text-white">{user.completedQuests.length}</div>
                                <div className="text-xs uppercase text-slate-500 font-bold tracking-widest">Quests Complete</div>
                            </div>
                        </div>
                        <div className="bg-obsidian-900 border border-blue-600/30 p-6 rounded-xl flex items-center gap-4">
                            <Scroll size={32} className="text-blue-500" />
                            <div>
                                <div className="text-3xl font-fantasy text-white">{user.completedBooks.length}</div>
                                <div className="text-xs uppercase text-slate-500 font-bold tracking-widest">Books Mastered</div>
                            </div>
                        </div>
                    </div>

                    {getTopicsPracticed(user.completedQuests, user.completedBooks).length > 0 && (
                        <ParchmentPanel title="Topics Practiced">
                            <div className="flex flex-wrap gap-2 p-2">
                                {getTopicsPracticed(user.completedQuests, user.completedBooks).map((topic) => (
                                    <span key={topic} className="px-3 py-1.5 rounded-lg bg-gold-500/15 border border-gold-500/40 text-gold-400 text-xs font-bold uppercase tracking-wider">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </ParchmentPanel>
                    )}

                    <ParchmentPanel title="Inventory (Unlocks)">
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto custom-scrollbar p-2">
                            {user.unlockedItems.map(id => {
                                const item = gameData.items.find((i: CosmeticItem) => i.id === id);
                                if (!item) return null;
                                const Icon = ICON_MAP[item.iconId] || Box;
                                return (
                                    <div key={id} className={`aspect-square bg-slate-900 border rounded flex items-center justify-center text-slate-400 hover:text-white hover:border-gold-500 hover:bg-slate-800 transition-all cursor-help ${item.rarity === 'legendary' ? 'border-gold-500/50' : 'border-slate-700'}`} title={item.name}>
                                        <Icon size={24} />
                                    </div>
                                )
                            })}
                            {/* Empty Slots Filler */}
                            {[...Array(Math.max(0, 18 - user.unlockedItems.length))].map((_, i) => (
                                <div key={i} className="aspect-square bg-black/20 border border-slate-800 rounded"></div>
                            ))}
                        </div>
                    </ParchmentPanel>
                </div>
            </div>
        </div>
    );
};

import { SyntaxSyncGame, AlgoTyperGame, BugHunterGame, CodeFillGame } from './DojoMinigames';
import { CLASS_OPTIONS } from '../constants';

const AVATAR_HEADS_CUSTOMIZE = [
  { id: 'head_novice', name: 'Novice Hood', iconId: 'User' },
  { id: 'head_debugger', name: 'Debugger', iconId: 'Bug' },
  { id: 'head_visor', name: 'Visor', iconId: 'Eye' },
  { id: 'head_glasses', name: 'Glasses', iconId: 'Glasses' },
  { id: 'head_headphones', name: 'Headphones', iconId: 'Headphones' },
];

const uniqById = <T extends { id: string }>(items: T[]): T[] => {
  const seen: Record<string, T> = {};
  for (const item of items) {
    seen[item.id] = item;
  }
  return Object.values(seen);
};

export const CustomizeScreen: React.FC<{
  user: User;
  gameData: { items: CosmeticItem[]; classes: ClassData[] };
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onBack: () => void;
  onNotify: (msg: string) => void;
}> = ({ user, gameData, setUser, onBack, onNotify }) => {
  const [appearance, setAppearance] = useState<CharacterAppearance>(user.appearance);
  const [saving, setSaving] = useState(false);
  const headOptions = gameData.items?.filter((i: CosmeticItem) => i.type === 'HEAD').length
    ? gameData.items.filter((i: CosmeticItem) => i.type === 'HEAD')
    : AVATAR_HEADS_CUSTOMIZE.map(h => ({ id: h.id, name: h.name, type: 'HEAD' as CosmeticType, levelRequired: 1, iconId: h.iconId, styleClass: '', rarity: 'common' as const }));
  const bodyOptions: CosmeticItem[] = gameData.items?.filter((i: CosmeticItem) => i.type === 'BODY').length
    ? gameData.items.filter((i: CosmeticItem) => i.type === 'BODY')
    : uniqById(CLASS_OPTIONS.map(c => ({ id: c.bodyId, name: c.name + ' body', type: 'BODY' as CosmeticType, levelRequired: 1, iconId: c.iconId, styleClass: '', rarity: 'common' as const })));
  const weaponOptions: CosmeticItem[] = gameData.items?.filter((i: CosmeticItem) => i.type === 'WEAPON').length
    ? gameData.items.filter((i: CosmeticItem) => i.type === 'WEAPON')
    : uniqById(CLASS_OPTIONS.map(c => ({ id: c.weaponId, name: c.name + ' weapon', type: 'WEAPON' as CosmeticType, levelRequired: 1, iconId: c.iconId, styleClass: '', rarity: 'common' as const })));

  const handleSave = async () => {
    setSaving(true);
    setUser(prev => prev ? { ...prev, appearance } : null);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { error } = await supabase.from('profiles').update({ appearance }).eq('id', authUser.id);
        if (error) throw error;
      }
      onNotify('Appearance saved.');
    } catch (e: any) {
      onNotify(e?.message || 'Failed to save.');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in relative z-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-fantasy text-gold-500 text-shadow-gold">Armory</h2>
        <div className="flex gap-2">
          <FantasyButton onClick={onBack} variant="ghost" size="sm">Back</FantasyButton>
          <FantasyButton onClick={handleSave} variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</FantasyButton>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col items-center">
          <HeroAvatar appearance={appearance} race={user.heroRace} size="xl" showWeapon className="border-4 border-gold-600 shadow-2xl mb-4" items={gameData.items} raceOptions={gameData.races || []} />
          <p className="text-slate-500 text-sm font-mono">Preview</p>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <ParchmentPanel title="Head">
            <div className="flex flex-wrap gap-2 p-2">
              {headOptions.map((item: CosmeticItem) => (
                <button key={item.id} onClick={() => setAppearance(a => ({ ...a, headId: item.id }))} className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${appearance.headId === item.id ? 'border-gold-500 bg-gold-500/20' : 'border-slate-700 hover:border-slate-500'}`}>
                  {(ICON_MAP as any)[item.iconId] ? React.createElement((ICON_MAP as any)[item.iconId], { size: 24 }) : null}
                  <span className="text-sm font-bold">{item.name}</span>
                </button>
              ))}
            </div>
          </ParchmentPanel>
          <ParchmentPanel title="Body">
            <div className="flex flex-wrap gap-2 p-2">
              {bodyOptions.map((item: CosmeticItem) => (
                <button key={item.id} onClick={() => setAppearance(a => ({ ...a, bodyId: item.id }))} className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${appearance.bodyId === item.id ? 'border-gold-500 bg-gold-500/20' : 'border-slate-700 hover:border-slate-500'}`}>
                  {(ICON_MAP as any)[item.iconId] ? React.createElement((ICON_MAP as any)[item.iconId], { size: 24 }) : null}
                  <span className="text-sm font-bold">{item.name}</span>
                </button>
              ))}
            </div>
          </ParchmentPanel>
          <ParchmentPanel title="Weapon">
            <div className="flex flex-wrap gap-2 p-2">
              {weaponOptions.map((item: CosmeticItem) => (
                <button key={item.id} onClick={() => setAppearance(a => ({ ...a, weaponId: item.id }))} className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${appearance.weaponId === item.id ? 'border-gold-500 bg-gold-500/20' : 'border-slate-700 hover:border-slate-500'}`}>
                  {(ICON_MAP as any)[item.iconId] ? React.createElement((ICON_MAP as any)[item.iconId], { size: 24 }) : null}
                  <span className="text-sm font-bold">{item.name}</span>
                </button>
              ))}
            </div>
          </ParchmentPanel>
        </div>
      </div>
    </div>
  );
};

export const TrainingScreen: React.FC<{ user: User; onTrain: (xp: number) => void; onBack: () => void }> = ({ user, onTrain, onBack }) => {
    const [game, setGame] = useState<'pick' | 'syntax' | 'typer' | 'bug' | 'fill'>('pick');

    const handleComplete = (score: number, gameId: string) => {
        const xp = Math.min(150, 20 + score * 15);
        onTrain(xp);
        setGame('pick');
    };

    if (game === 'pick') {
        return (
            <div className="max-w-4xl mx-auto w-full animate-fade-in relative z-10 p-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-fantasy text-gold-500 text-shadow-gold">Neural Dojo</h2>
                    <FantasyButton onClick={onBack} variant="secondary" size="sm">Back</FantasyButton>
                </div>
                <p className="text-slate-400 mb-8">Practice software engineering with minigames. Earn XP per round.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div onClick={() => setGame('syntax')} className="p-6 bg-obsidian-800 border border-slate-700 rounded-xl cursor-pointer hover:border-gold-500 transition-all flex flex-col items-center gap-3">
                        <div className="text-gold-500"><Activity size={40} /></div>
                        <h3 className="font-fantasy text-xl text-white">Syntax Sync</h3>
                        <p className="text-slate-500 text-sm text-center">Rhythm cast when the bar is in the zone.</p>
                    </div>
                    <div onClick={() => setGame('typer')} className="p-6 bg-obsidian-800 border border-slate-700 rounded-xl cursor-pointer hover:border-gold-500 transition-all flex flex-col items-center gap-3">
                        <Keyboard size={40} className="text-cyan-500" />
                        <h3 className="font-fantasy text-xl text-white">Algo Typer</h3>
                        <p className="text-slate-500 text-sm text-center">Type falling keywords before they hit the line.</p>
                    </div>
                    <div onClick={() => setGame('bug')} className="p-6 bg-obsidian-800 border border-slate-700 rounded-xl cursor-pointer hover:border-gold-500 transition-all flex flex-col items-center gap-3">
                        <Bug size={40} className="text-red-500" />
                        <h3 className="font-fantasy text-xl text-white">Bug Hunter</h3>
                        <p className="text-slate-500 text-sm text-center">Find the correct fix for broken code.</p>
                    </div>
                    <div onClick={() => setGame('fill')} className="p-6 bg-obsidian-800 border border-slate-700 rounded-xl cursor-pointer hover:border-gold-500 transition-all flex flex-col items-center gap-3">
                        <Code size={40} className="text-emerald-500" />
                        <h3 className="font-fantasy text-xl text-white">Code Fill</h3>
                        <p className="text-slate-500 text-sm text-center">Complete the code with the right snippet.</p>
                    </div>
                </div>
            </div>
        );
    }

    const containerClass = "max-w-4xl mx-auto w-full h-[70vh] relative z-10 p-4";
    return (
        <div className={containerClass}>
            <div className="flex justify-between items-center mb-4">
                <FantasyButton onClick={() => setGame('pick')} variant="ghost" size="sm">← Back to Dojo</FantasyButton>
            </div>
            <div className="h-full min-h-[400px] bg-obsidian-900/80 border border-slate-700 rounded-xl overflow-hidden">
                {game === 'syntax' && <SyntaxSyncGame onComplete={(s) => handleComplete(s, 'syntax')} />}
                {game === 'typer' && <AlgoTyperGame onComplete={(s) => handleComplete(s, 'typer')} />}
                {game === 'bug' && <BugHunterGame onComplete={(s) => handleComplete(s, 'bug')} />}
                {game === 'fill' && <CodeFillGame onComplete={(s) => handleComplete(s, 'fill')} />}
            </div>
        </div>
    );
};

export const PvPLobbyScreen: React.FC<{ user: User; onBack: () => void; onFindMatch?: () => void }> = ({ user, onBack, onFindMatch }) => {
    return (
        <div className="max-w-2xl mx-auto w-full animate-fade-in relative z-10 p-4">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-fantasy text-gold-500 text-shadow-gold">Grand Arena</h2>
                <FantasyButton onClick={onBack} variant="secondary" size="sm">Back</FantasyButton>
            </div>
            <ParchmentPanel className="text-center" title="PvP Duels">
                <div className="py-8 space-y-6">
                    <Swords size={64} className="mx-auto text-red-500 opacity-80" />
                    <p className="text-slate-400 font-mono text-sm">Challenge other heroes in real-time quiz duels. Matchmaking pairs you by level.</p>
                    <FantasyButton variant="primary" size="lg" onClick={() => onFindMatch?.()} icon={<Swords size={20} />}>
                        Find Match
                    </FantasyButton>
                    <p className="text-slate-500 text-xs">Coming soon: live PvP will use the same combat system as quests.</p>
                </div>
            </ParchmentPanel>
        </div>
    );
};

export const SettingsModal: React.FC<{
    onClose: () => void;
    settings: { music: number; sfx: number };
    setSettings: React.Dispatch<React.SetStateAction<{ music: number; sfx: number }>>;
    onLogout: () => void;
}> = ({ onClose, settings, setSettings, onLogout }) => {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-obsidian-900 border-2 border-gold-600/50 rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-fantasy text-gold-400">Settings</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-2"><Music size={16} /> Music</label>
                        <input type="range" min={0} max={100} value={settings.music} onChange={e => setSettings(s => ({ ...s, music: Number(e.target.value) }))} className="w-full h-2 rounded-full bg-slate-700 accent-gold-500" />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-2"><Volume2 size={16} /> SFX</label>
                        <input type="range" min={0} max={100} value={settings.sfx} onChange={e => setSettings(s => ({ ...s, sfx: Number(e.target.value) }))} className="w-full h-2 rounded-full bg-slate-700 accent-gold-500" />
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                        <FantasyButton fullWidth variant="danger" onClick={onLogout} icon={<LogOut size={16} />}>Logout</FantasyButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
