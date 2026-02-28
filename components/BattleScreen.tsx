
import React, { useState, useEffect, useRef } from 'react';
import { User, Quest, Question, BodyZone, RaceData, ClassData, CosmeticItem } from '../types';
import type { CombatPhase } from '../types';
import { nextCombatPhase, type CombatAction } from '../lib/battleFsm';
import { ParchmentPanel, FantasyButton, LiquidBar, StatBadge } from './ui';
import { HeroAvatar, ICON_MAP } from './HeroAvatar';
import { BOSS_SPRITE_URL } from '../constants';
import { calculateDamage, calculateCritChance } from '../lib/gameLogic';
import { recordQuestionAttempt } from '../lib/learningTelemetry';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trophy, Skull, Brain, Sparkles, Scroll, Heart, Zap, Shield, Sword, Crosshair, Ban, User as UserIcon, Clock, Activity, AlertTriangle, Terminal, Code, HelpCircle, ChevronRight, Flame, Star, Eye, EyeOff, BookOpen } from 'lucide-react';
import FloatingText, { type FloatingTextType } from './FloatingText';
import { ComboMeter } from './premium/ComboMeter';

type BattlePhase = 'NARRATIVE' | 'COMBAT' | 'VICTORY' | 'DEFEAT';

interface LegacyFloatingText { id: number; text: string; x: number; y: number; color: string; size: 'sm' | 'md' | 'lg' | 'xl'; }
interface BattleLogEntry { id: string; timestamp: string; text: string; type: 'info' | 'player-hit' | 'enemy-hit' | 'crit' | 'heal' | 'streak'; }

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const STREAK_MESSAGES = [
    '', '', 'Nice!', 'Great!', 'Excellent!', 'AMAZING!', 'UNSTOPPABLE!', 'LEGENDARY!', 'GOD MODE!', 'TRANSCENDENT!'
];

export const BattleScreen: React.FC<{
    quest: Quest; user: User; playSfx?: (key: string) => void; onComplete: (xp: number, isPerfect: boolean) => void; onExit: () => void; gameData: { races: RaceData[], classes: ClassData[], items: CosmeticItem[] }; telemetryUserId?: string | null;
}> = ({ quest, user, playSfx, onComplete, onExit, gameData, telemetryUserId }) => {
    // --- STATE ---
    const [phase, setPhase] = useState<BattlePhase>('NARRATIVE');
    const [combatPhase, setCombatPhase] = useState<CombatPhase>({ phase: 'INTRO' });
    const [narrativeIndex, setNarrativeIndex] = useState(0);
    const [qIndex, setQIndex] = useState(0);
    const [battleQuestions, setBattleQuestions] = useState<Question[]>([]);
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(quest.enemyMaxHp || 100);
    const [limitGauge, setLimitGauge] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [logs, setLogs] = useState<BattleLogEntry[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'HIT' | 'MISS' | 'BLOCKED' | null>(null);
    const [floatingTexts, setFloatingTexts] = useState<LegacyFloatingText[]>([]);
    const [playerAnim, setPlayerAnim] = useState('');
    const [enemyAnim, setEnemyAnim] = useState('');
    const [shaking, setShaking] = useState(false);
    const [flashType, setFlashType] = useState<'correct' | 'wrong' | null>(null);
    const [limitBreakMode, setLimitBreakMode] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [comboVisible, setComboVisible] = useState(false);
    const [timer, setTimer] = useState(0);
    const [floats, setFloats] = useState<Array<{ id: number; value: string; type: FloatingTextType }>>([]);
    const timerRef = useRef<any>(null);
    const questionStartedAtRef = useRef<number>(Date.now());
    const enemyHpRef = useRef<number>(quest.enemyMaxHp || 100);
    const playerHpRef = useRef<number>(100);
    const floatIdRef = useRef(0);
    const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // PvP State
    const [playerAttackZone, setPlayerAttackZone] = useState<BodyZone | null>(null);
    const [playerBlockZone, setPlayerBlockZone] = useState<BodyZone | null>(null);
    const [enemyAttackZone, setEnemyAttackZone] = useState<BodyZone | null>(null);
    const [enemyBlockZone, setEnemyBlockZone] = useState<BodyZone | null>(null);
    const [roundProcessing, setRoundProcessing] = useState(false);
    const [showZoneSelect, setShowZoneSelect] = useState(true);

    // --- LOGIC ---
    const addLog = (text: string, type: BattleLogEntry['type'] = 'info') => {
        const now = new Date();
        setLogs(prev => [...prev, { id: Math.random().toString(), timestamp: now.toLocaleTimeString(), text, type }]);
    };

    const spawnFloatingText = (text: string, x: number, y: number, color: string, size: any = 'md') => {
        const id = Date.now() + Math.random();
        setFloatingTexts(prev => [...prev, { id, text, x, y, color, size }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1200);
    };

    const addFloat = (value: string, type: FloatingTextType) => {
        const id = ++floatIdRef.current;
        setFloats(f => [...f, { id, value, type }]);
    };

    useEffect(() => {
        if (!quest.isPvP) {
            const shuffledQs = shuffleArray<Question>(quest.questions);
            const processedQs = shuffledQs.map((q: Question) => {
                const optionsWithIndices = q.options.map((opt, idx) => ({ txt: opt, originalIdx: idx }));
                const shuffledOptions = shuffleArray(optionsWithIndices);
                const newCorrectIndex = shuffledOptions.findIndex(item => item.originalIdx === q.correctIndex);
                return { ...q, options: shuffledOptions.map(item => item.txt), correctIndex: newCorrectIndex };
            });
            setBattleQuestions(processedQs);
        }
    }, [quest.id]);

    useEffect(() => { if (phase === 'VICTORY') playSfx?.('VICTORY'); if (phase === 'DEFEAT') playSfx?.('DEFEAT'); }, [phase]);

    useEffect(() => { enemyHpRef.current = enemyHp; }, [enemyHp]);
    useEffect(() => { playerHpRef.current = playerHp; }, [playerHp]);
    useEffect(() => { if (limitGauge >= 100) { addFloat('LIMIT BREAK!', 'limit'); } }, [limitGauge]);
    useEffect(() => {
        if (phase === 'COMBAT') questionStartedAtRef.current = Date.now();
    }, [phase, qIndex]);

    // Timer for combat phase
    useEffect(() => {
        if (phase === 'COMBAT') {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    useEffect(() => {
        return () => {
            if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        };
    }, []);

    const handleNextNarrative = () => {
        if (narrativeIndex < quest.narrativeIntro.length - 1) setNarrativeIndex(prev => prev + 1);
        else {
            setPhase('COMBAT');
            setCombatPhase(nextCombatPhase({ phase: 'INTRO' }, 'ADVANCE'));
            addLog("Combat System Initialized.", 'info');
        }
    };

    // Generate a hint by eliminating one wrong answer
    const getHintText = (): string => {
        const q = battleQuestions[qIndex];
        if (!q) return '';
        const wrongOptions = q.options.filter((_, i) => i !== q.correctIndex);
        const eliminated = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        return `It's NOT "${eliminated}"`;
    };

    // PvP Zone Combat Logic
    const handlePvPAnswer = (optionIndex: number) => {
        if (selectedOption !== null || !playerAttackZone || !playerBlockZone) return;
        const question = battleQuestions[qIndex];
        if (!question) return;
        const responseMs = Date.now() - questionStartedAtRef.current;
        setSelectedOption(optionIndex);
        setTotalAnswered(a => a + 1);
        const isCorrect = optionIndex === question.correctIndex;

        void recordQuestionAttempt({
            userId: telemetryUserId,
            questionId: question.id,
            source: 'BATTLE',
            topic: question.topic,
            difficulty: question.difficulty,
            isCorrect,
            responseMs,
            hintUsed: showHint,
            metadata: { questId: quest.id, mode: 'pvp' },
        });

        const enemyAttack: BodyZone = ['HEAD', 'TORSO', 'ARMS', 'LEGS'][Math.floor(Math.random() * 4)] as BodyZone;
        const enemyBlock: BodyZone = ['HEAD', 'TORSO', 'ARMS', 'LEGS'][Math.floor(Math.random() * 4)] as BodyZone;
        setEnemyAttackZone(enemyAttack);
        setEnemyBlockZone(enemyBlock);

        if (isCorrect) {
            setCorrectCount(c => c + 1);
            const isBlocked = playerAttackZone === enemyBlock;
            if (isBlocked) {
                setFeedback('BLOCKED');
                spawnFloatingText('BLOCKED!', 70, 40, 'text-blue-400', 'lg');
                addLog(`Enemy blocked your ${playerAttackZone} attack!`, 'info');
            } else {
                setFeedback('HIT');
                playSfx?.('ATTACK');
                const dmg = calculateDamage(user, undefined, 25, Math.random() < 0.1, streak + 1, playerHp / 100);
                setEnemyHp(h => {
                    const next = Math.max(0, h - dmg);
                    enemyHpRef.current = next;
                    return next;
                });
                spawnFloatingText(`-${dmg}`, 70, 40, 'text-red-500', 'xl');
                addLog(`You hit ${playerAttackZone} for ${dmg} damage!`, 'player-hit');
                setStreak(s => { const ns = s + 1; if (ns > maxStreak) setMaxStreak(ns); return ns; });
                setPlayerAnim('animate-attack-right');
                setEnemyAnim('animate-shake bg-red-500/30');
                setFlashType('correct');
                flashTimeoutRef.current = setTimeout(() => setFlashType(null), 500);
            }
        } else {
            setFeedback('MISS');
            setStreak(0);
        }

        setTimeout(() => {
            const playerBlocked = enemyAttack === playerBlockZone;
            if (!playerBlocked) {
                playSfx?.('DAMAGE');
                const dmg = 15;
                setPlayerHp(h => {
                    const next = Math.max(0, h - dmg);
                    playerHpRef.current = next;
                    return next;
                });
                spawnFloatingText(`-${dmg}`, 30, 40, 'text-red-500', 'lg');
                addLog(`Enemy hit your ${enemyAttack} for ${dmg} damage!`, 'enemy-hit');
                setPlayerAnim('animate-shake bg-red-500/30');
                setEnemyAnim('animate-attack-left');
                setShaking(true);
                shakeTimeoutRef.current = setTimeout(() => setShaking(false), 400);
                setFlashType('wrong');
                flashTimeoutRef.current = setTimeout(() => setFlashType(null), 500);
            } else {
                spawnFloatingText('BLOCKED!', 30, 40, 'text-blue-400', 'lg');
                addLog(`You blocked enemy's ${enemyAttack} attack!`, 'info');
            }

            setTimeout(() => {
                setPlayerAnim(''); setEnemyAnim('');
                if (enemyHpRef.current <= 0) {
                    setPhase('VICTORY');
                } else if (playerHpRef.current <= 0) {
                    setPhase('DEFEAT');
                } else if (qIndex < battleQuestions.length - 1) {
                    setQIndex(i => i + 1);
                    setSelectedOption(null);
                    setFeedback(null);
                    setPlayerAttackZone(null);
                    setPlayerBlockZone(null);
                    setShowZoneSelect(true);
                    setShowHint(false);
                } else {
                    setPhase('VICTORY');
                }
            }, 1500);
        }, 1000);
    };

    const advanceAfterAnswer = (currentHp: number, currentQIndex: number, wasCorrect: boolean) => {
        setPlayerAnim(''); setEnemyAnim('');
        setShowHint(false);
        if (wasCorrect && enemyHpRef.current <= 0) {
            setPhase('VICTORY');
            setCombatPhase(nextCombatPhase(combatPhase, 'ENEMY_DEAD'));
        } else if (wasCorrect && currentQIndex < battleQuestions.length - 1) {
            setQIndex(i => i + 1);
            setSelectedOption(null);
            setFeedback(null);
            setShowExplanation(false);
            setCombatPhase(nextCombatPhase(combatPhase, 'ENEMY_ALIVE'));
        } else if (wasCorrect) {
            setPhase('VICTORY');
            setCombatPhase(nextCombatPhase(combatPhase, 'ENEMY_DEAD'));
        } else if (currentHp <= 0) {
            setPhase('DEFEAT');
            // Two-step FSM advance: RESOLVING → ENEMY_TURN → DEFEAT
            const enemyTurnPhase = nextCombatPhase(combatPhase, 'PLAYER_ALIVE');
            setCombatPhase(nextCombatPhase(enemyTurnPhase, 'PLAYER_DEAD'));
        } else {
            setSelectedOption(null);
            setFeedback(null);
            setShowExplanation(false);
            // Two-step FSM advance: RESOLVING → ENEMY_TURN → PLAYER_TURN
            const enemyTurnPhase = nextCombatPhase(combatPhase, 'PLAYER_ALIVE');
            setCombatPhase(nextCombatPhase(enemyTurnPhase, 'PLAYER_ALIVE'));
            questionStartedAtRef.current = Date.now();
        }
    };

    // Regular PvE Combat
    const handleAnswer = (optionIndex: number) => {
        if (selectedOption !== null) return;
        const question = battleQuestions[qIndex];
        if (!question) return;
        const responseMs = Date.now() - questionStartedAtRef.current;
        setSelectedOption(optionIndex);
        setTotalAnswered(a => a + 1);
        const isCorrect = optionIndex === question.correctIndex;

        void recordQuestionAttempt({
            userId: telemetryUserId,
            questionId: question.id,
            source: 'BATTLE',
            topic: question.topic,
            difficulty: question.difficulty,
            isCorrect,
            responseMs,
            hintUsed: showHint,
            metadata: { questId: quest.id, mode: 'pve' },
        });

        if (isCorrect) {
            setCorrectCount(c => c + 1);
            setFeedback('HIT'); playSfx?.('ATTACK');
            const newStreak = streak + 1;
            const isCrit = Math.random() < 0.1;
            const dmg = calculateDamage(user, undefined, 20, isCrit, newStreak, playerHp / 100) * (limitBreakMode ? 3 : 1);
            setEnemyHp(h => {
                const next = Math.max(0, h - dmg);
                enemyHpRef.current = next;
                return next;
            });
            addFloat(`+${Math.round(dmg)}`, isCrit ? 'crit' : 'correct');
            setStreak(s => { const ns = s + 1; if (ns > maxStreak) setMaxStreak(ns); return ns; });
            setLimitGauge(prev => limitBreakMode ? 0 : Math.min(100, prev + 25));
            setPlayerAnim('animate-attack-right');
            setEnemyAnim('animate-shake bg-red-500/30');

            // Streak combo notification
            if (newStreak >= 3) {
                setComboVisible(true);
                const streakMsg = STREAK_MESSAGES[Math.min(newStreak, STREAK_MESSAGES.length - 1)];
                spawnFloatingText(`${newStreak}x ${streakMsg}`, 50, 25, 'text-gold-400', 'xl');
                addLog(`${newStreak}x Streak! ${streakMsg}`, 'streak');
                setTimeout(() => setComboVisible(false), 1500);
            }
        } else {
            setFeedback('MISS'); playSfx?.('DAMAGE');
            const dmg = quest.enemyAttackDamage || 15;
            setPlayerHp(h => {
                const next = Math.max(0, h - dmg);
                playerHpRef.current = next;
                return next;
            });
            addFloat(`-${Math.round(dmg)}`, 'wrong');
            setStreak(0);
            setPlayerAnim('animate-shake bg-red-500/30');
            setEnemyAnim('animate-attack-left');
            addLog(`Wrong answer! Enemy deals ${dmg} damage!`, 'enemy-hit');
            setShaking(true);
            shakeTimeoutRef.current = setTimeout(() => setShaking(false), 400);
            setFlashType('wrong');
            flashTimeoutRef.current = setTimeout(() => setFlashType(null), 500);
            // Wrong answer: transition FSM to RESOLVING immediately and show explanation
            setCombatPhase(nextCombatPhase(combatPhase, 'ANSWER_WRONG'));
            setShowExplanation(true);
            return;
        }

        setFlashType('correct');
        flashTimeoutRef.current = setTimeout(() => setFlashType(null), 500);

        // Correct answer: transition FSM to RESOLVING after brief animation delay
        setTimeout(() => {
            setCombatPhase(nextCombatPhase(combatPhase, 'ANSWER_CORRECT'));
            setShowExplanation(true);
        }, 1000);
    };

    const handleContinueFromExplanation = () => {
        const isCorrect = selectedOption === battleQuestions[qIndex].correctIndex;
        advanceAfterAnswer(playerHp, qIndex, isCorrect);
    };

    const handleUseHint = () => {
        if (!showHint) {
            setShowHint(true);
            setHintsUsed(h => h + 1);
            addLog('Hint used! One wrong answer eliminated.', 'info');
        }
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // --- RENDERING ---

    if (phase === 'NARRATIVE') {
        return (
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                >
                    <ParchmentPanel className="max-w-2xl w-full text-center space-y-8" title={quest.title}>
                        {/* Boss Preview */}
                        <div className="text-7xl mb-4 animate-float">{quest.enemyImage}</div>
                        <div className="text-sm text-red-400 font-mono uppercase tracking-wider">
                            {quest.enemyName} - HP: {quest.enemyMaxHp || 100}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.p
                                key={narrativeIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-2xl font-fantasy text-gold-500 italic leading-relaxed"
                            >
                                "{quest.narrativeIntro[narrativeIndex]}"
                            </motion.p>
                        </AnimatePresence>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-2">
                            {quest.narrativeIntro.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === narrativeIndex ? 'bg-gold-400 scale-125' : i < narrativeIndex ? 'bg-gold-600' : 'bg-slate-700'}`} />
                            ))}
                        </div>

                        <div className="flex justify-center gap-4 pt-4 border-t border-gold-900/30">
                            <FantasyButton onClick={() => { setPhase('COMBAT'); setCombatPhase(nextCombatPhase({ phase: 'INTRO' }, 'ADVANCE')); addLog("Combat System Initialized.", 'info'); }} variant="ghost">Skip</FantasyButton>
                            <FantasyButton onClick={handleNextNarrative} variant="primary">
                                {narrativeIndex < quest.narrativeIntro.length - 1 ? 'Next' : 'Begin Battle!'} <ChevronRight size={16} />
                            </FantasyButton>
                        </div>
                    </ParchmentPanel>
                </motion.div>
            </div>
        );
    }

    if (phase === 'VICTORY' || phase === 'DEFEAT') {
        const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
        const isPerfect = playerHp === 100 && correctCount === totalAnswered;
        const bonusXp = isPerfect ? Math.floor(quest.rewardXp * 0.25) : 0;
        const streakBonus = maxStreak >= 5 ? Math.floor(quest.rewardXp * 0.1) : 0;
        const totalXp = quest.rewardXp + bonusXp + streakBonus;

        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${phase === 'VICTORY' ? 'bg-gold-900/20' : 'bg-red-900/20'}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                >
                    <ParchmentPanel className="max-w-lg w-full text-center relative overflow-visible" title={phase}>
                        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 p-6 rounded-full border-4 shadow-2xl ${phase === 'VICTORY' ? 'bg-black border-gold-500' : 'bg-black border-red-600'}`}>
                            {phase === 'VICTORY' ? <Trophy size={64} className="text-gold-400 animate-bounce" /> : <Skull size={64} className="text-red-500 animate-pulse" />}
                        </div>
                        <div className="mt-12 space-y-5">
                            <p className="text-lg text-slate-300 font-serif italic">"{quest.narrativeOutro}"</p>

                            {/* Battle Stats */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
                                    <div className="text-slate-500 text-xs uppercase">Accuracy</div>
                                    <div className={`text-2xl font-bold ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{accuracy}%</div>
                                    <div className="text-xs text-slate-600">{correctCount}/{totalAnswered} correct</div>
                                </div>
                                <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
                                    <div className="text-slate-500 text-xs uppercase">Max Streak</div>
                                    <div className="text-2xl font-bold text-gold-400">{maxStreak}x</div>
                                    <div className="text-xs text-slate-600">{STREAK_MESSAGES[Math.min(maxStreak, STREAK_MESSAGES.length - 1)] || '-'}</div>
                                </div>
                                <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
                                    <div className="text-slate-500 text-xs uppercase">Time</div>
                                    <div className="text-2xl font-bold text-cyan-400">{formatTime(timer)}</div>
                                </div>
                                <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
                                    <div className="text-slate-500 text-xs uppercase">HP Remaining</div>
                                    <div className={`text-2xl font-bold ${playerHp > 50 ? 'text-emerald-400' : playerHp > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{playerHp}%</div>
                                </div>
                            </div>

                            {phase === 'VICTORY' && (
                                <div className="space-y-2">
                                    <div className="text-3xl font-fantasy text-gold-400 text-shadow-gold">+{quest.rewardXp} XP</div>
                                    {bonusXp > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-emerald-400 font-bold">
                                            +{bonusXp} XP Perfect Bonus!
                                        </motion.div>
                                    )}
                                    {streakBonus > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm text-cyan-400 font-bold">
                                            +{streakBonus} XP Streak Bonus!
                                        </motion.div>
                                    )}
                                    {isPerfect && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4, type: 'spring' }}
                                            className="inline-block px-4 py-1 bg-gold-500/20 border border-gold-500 rounded-full text-gold-400 text-sm font-bold"
                                        >
                                            <Star size={14} className="inline mr-1" /> PERFECT VICTORY
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <FantasyButton
                                fullWidth
                                onClick={phase === 'VICTORY' ? () => onComplete(totalXp, isPerfect) : onExit}
                                variant={phase === 'VICTORY' ? 'primary' : 'danger'}
                            >
                                {phase === 'VICTORY' ? 'Claim Rewards' : 'Retreat & Study More'}
                            </FantasyButton>
                        </div>
                    </ParchmentPanel>
                </motion.div>
            </div>
        );
    }

    const currentQ = battleQuestions[qIndex];
    const questProgress = battleQuestions.length > 0 ? ((qIndex) / battleQuestions.length) * 100 : 0;
    const enemyHpPct = ((quest.enemyMaxHp || 100) > 0) ? (enemyHp / (quest.enemyMaxHp || 100)) * 100 : 0;
    const explanationTitle = combatPhase.phase === 'RESOLVING' && !combatPhase.wasCorrect
        ? '❌ Wrong Answer'
        : '✓ Correct!';

    return (
        <div className={`fixed inset-0 bg-[#050505] flex flex-col font-sans overflow-hidden ${shaking ? 'animate-shake' : ''} ${flashType === 'correct' ? 'animate-flash-green' : flashType === 'wrong' ? 'animate-flash-red' : ''}`} style={{ boxShadow: 'inset 0 0 0 1px rgba(218,165,32,0.15), inset 0 0 0 3px rgba(10,10,12,0.8), inset 0 0 0 4px rgba(218,165,32,0.08)' }}>
            {/* Battle Arena Viewport */}
            <div className="relative flex-grow bg-slate-900 overflow-hidden group">
                {/* Layer 1: Deep void radial gradient */}
                <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0a0a1a 40%, #050508 100%)' }} />
                {/* Layer 2: Perspective dungeon floor with gold grid */}
                <div className="absolute bottom-0 w-full h-[60%] z-0 opacity-40" style={{ background: 'linear-gradient(rgba(218,165,32,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(218,165,32,0.06) 1px, transparent 1px)', backgroundSize: '60px 60px', transform: 'perspective(400px) rotateX(60deg)', transformOrigin: 'bottom' }} />
                {/* Layer 3: Drifting fog */}
                <div className="absolute bottom-0 w-[200%] h-[30%] z-[1] opacity-20 animate-fog-drift" style={{ background: 'linear-gradient(transparent, rgba(100,80,140,0.3) 40%, rgba(60,40,100,0.15) 100%)' }} />
                {/* Layer 4: Central golden glow (forge/torch) */}
                <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 70%, rgba(218,165,32,0.15) 0%, transparent 50%)' }} />
                {/* Layer 5: Floating ember particles */}
                {[0,1,2,3,4,5].map(i => (
                    <div key={i} className="absolute w-1 h-1 rounded-full bg-gold-400 z-[2] animate-ember-rise" style={{ left: `${15 + i * 14}%`, bottom: '15%', animationDelay: `${i * 0.7}s`, animationDuration: `${3 + i * 0.5}s`, opacity: 0.6 }} />
                ))}
                {/* Layer 6: Ornamental gold corner frame */}
                <div className="absolute inset-3 z-[3] pointer-events-none border border-gold-600/10 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500/40" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/40" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/40" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500/40" />
                </div>

                {/* HUD: Top Bar */}
                <div className="absolute top-0 left-0 w-full p-4 md:p-5 flex justify-between items-start z-40">
                    <div className="w-1/3 max-w-xs space-y-2">
                        <LiquidBar current={playerHp} max={100} color="green" label={user.username} subLabel={`Lvl ${user.level}`} />
                        {!quest.isPvP && <LiquidBar current={limitGauge} max={100} color="cyan" size="sm" label={limitBreakMode ? "LIMIT BREAK!" : "Overdrive"} />}
                    </div>

                    {/* Center: Question Progress & Timer */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="font-fantasy text-3xl text-embossed-gold animate-pulse">VS</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                            <Clock size={10} /> {formatTime(timer)}
                        </div>
                        {/* Streak Display — only show legacy badge when ComboMeter is not active */}
                        {streak === 1 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-2 py-0.5 bg-gold-500/20 border border-gold-500/50 rounded-full"
                            >
                                <Flame size={12} className="text-gold-400" />
                                <span className="text-xs font-bold text-gold-400">{streak}x</span>
                            </motion.div>
                        )}
                    </div>

                    <div className={`w-1/3 max-w-sm flex flex-col items-end space-y-2 ${enemyHpPct < 25 ? 'animate-boss-hp-low rounded-lg' : ''}`}>
                        {/* Gold ornamental line above boss HP */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent mb-1" />
                        <LiquidBar current={enemyHp} max={quest.enemyMaxHp || 100} color="red" label={quest.enemyName} subLabel="BOSS" />
                    </div>
                </div>

                {/* Question Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 z-50">
                    <motion.div
                        animate={{ width: `${questProgress}%` }}
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Combat Stage */}
                <div className="absolute inset-0 flex items-end justify-around pb-12 px-12 z-20 pointer-events-none">
                    {/* Player */}
                    <div className={`relative transition-transform duration-200 ${playerAnim} ${limitBreakMode ? 'filter brightness-150 drop-shadow-[0_0_20px_cyan]' : ''}`}>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/60 blur-md rounded-[100%] scale-150" />
                        <HeroAvatar appearance={user.appearance} race={user.heroRace} size="xl" showWeapon className="scale-150" items={gameData.items} raceOptions={gameData.races} />
                    </div>

                    {/* Enemy */}
                    <div className={`relative transition-transform duration-200 ${enemyAnim}`}>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-lg rounded-[100%]" />
                        {quest.enemySpritePos ? (
                            <div className="w-64 h-64 scale-125" style={{ backgroundImage: `url('${BOSS_SPRITE_URL}')`, backgroundPosition: quest.enemySpritePos, backgroundSize: '300% 300%', backgroundRepeat: 'no-repeat' }} />
                        ) : (
                            <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-float">{quest.enemyImage}</div>
                        )}
                        {/* Enemy HP indicator below */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 text-center">
                            <div className="text-xs text-red-400 font-mono">{enemyHp}/{quest.enemyMaxHp || 100}</div>
                        </div>
                    </div>
                </div>

                {/* Floating Text */}
                {floatingTexts.map(ft => (
                    <motion.div
                        key={ft.id}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -80 }}
                        transition={{ duration: 1.2 }}
                        className={`absolute z-50 font-black italic tracking-tighter ${ft.color} ${ft.size === 'xl' ? 'text-6xl' : ft.size === 'lg' ? 'text-4xl' : 'text-2xl'}`}
                        style={{ left: `${ft.x}%`, top: `${ft.y}%`, textShadow: '0 4px 0 rgba(0,0,0,0.5)' }}
                    >
                        {ft.text}
                    </motion.div>
                ))}

                {/* FloatingText damage numbers */}
                <div style={{ position: 'relative' }}>
                    {floats.map(f => (
                        <FloatingText
                            key={f.id}
                            value={f.value}
                            type={f.type}
                            onDone={() => setFloats(prev => prev.filter(x => x.id !== f.id))}
                        />
                    ))}
                </div>

                {/* Combo Meter */}
                {streak > 1 && (
                    <ComboMeter
                        streak={streak}
                        multiplier={parseFloat((1 + streak * 0.1).toFixed(1))}
                    />
                )}

                {/* Combo overlay */}
                <AnimatePresence>
                    {comboVisible && streak >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                        >
                            <div className="text-7xl font-fantasy text-gold-400 text-shadow-gold animate-pulse">
                                {streak}x COMBO!
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Command Console (Bottom) */}
            <div className="h-[350px] bg-[#08080a] border-t-2 border-gold-600/50 relative z-50 flex" style={{ borderTop: '2px solid rgba(218,165,32,0.4)', boxShadow: '0 -2px 20px rgba(218,165,32,0.1)' }}>
                {quest.isPvP && showZoneSelect ? (
                    // PvP Zone Selection
                    <div className="flex-grow p-6 flex flex-col relative">
                        <h3 className="text-2xl font-fantasy text-gold-400 mb-6 text-center">Select Attack & Defense Zones</h3>
                        <div className="grid grid-cols-2 gap-8 flex-grow">
                            <div>
                                <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                    <Crosshair size={20} /> Attack Zone
                                </h4>
                                <div className="space-y-2">
                                    {(['HEAD', 'TORSO', 'ARMS', 'LEGS'] as BodyZone[]).map(zone => (
                                        <button key={zone} onClick={() => setPlayerAttackZone(zone)}
                                            className={`w-full p-3 border-2 rounded-lg font-bold uppercase transition-all text-sm ${playerAttackZone === zone ? 'border-red-500 bg-red-900/30 text-red-300' : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-red-500/50'}`}
                                        >
                                            <Sword size={14} className="inline mr-2" />{zone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                                    <Shield size={20} /> Defense Zone
                                </h4>
                                <div className="space-y-2">
                                    {(['HEAD', 'TORSO', 'ARMS', 'LEGS'] as BodyZone[]).map(zone => (
                                        <button key={zone} onClick={() => setPlayerBlockZone(zone)}
                                            className={`w-full p-3 border-2 rounded-lg font-bold uppercase transition-all text-sm ${playerBlockZone === zone ? 'border-blue-500 bg-blue-900/30 text-blue-300' : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-blue-500/50'}`}
                                        >
                                            <Shield size={14} className="inline mr-2" />{zone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowZoneSelect(false)} disabled={!playerAttackZone || !playerBlockZone}
                            className={`mt-4 px-8 py-3 rounded-lg font-bold uppercase ${playerAttackZone && playerBlockZone ? 'bg-gold-600 hover:bg-gold-500 text-black' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                            Confirm & Fight!
                        </button>
                    </div>
                ) : (
                    // Question Panel
                    <div className="flex-grow p-5 flex flex-col relative overflow-hidden scroll-bg ornament-corners">
                        <div className="absolute inset-0 bg-hex-pattern opacity-[0.04]" />
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                        {showExplanation ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative z-20 flex flex-col flex-grow"
                            >
                                {/* Explanation Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`p-1.5 rounded ${selectedOption === currentQ?.correctIndex ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                        {selectedOption === currentQ?.correctIndex
                                            ? <Sparkles size={16} className="text-emerald-400" />
                                            : <AlertTriangle size={16} className="text-red-400" />
                                        }
                                    </div>
                                    <span className={`font-bold text-sm ${selectedOption === currentQ?.correctIndex ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {explanationTitle}
                                    </span>
                                    {currentQ?.topic && (
                                        <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 text-xs font-bold uppercase border border-gold-500/50 ml-auto">
                                            {currentQ.topic}
                                        </span>
                                    )}
                                </div>

                                {/* Correct Answer Display */}
                                {selectedOption !== currentQ?.correctIndex && (
                                    <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                                        <Star size={14} className="text-emerald-400 shrink-0" />
                                        <span className="text-sm text-emerald-300">
                                            Correct answer: <strong>{currentQ?.options[currentQ.correctIndex]}</strong>
                                        </span>
                                    </div>
                                )}

                                {/* Explanation */}
                                <div className="bg-black/70 border border-gold-600/40 rounded-lg p-4 mb-4 flex-grow overflow-y-auto">
                                    <div className="flex items-start gap-2">
                                        <BookOpen size={16} className="text-gold-500 mt-0.5 shrink-0" />
                                        <p className="text-slate-200 text-sm leading-relaxed">{currentQ?.explanation}</p>
                                    </div>
                                </div>

                                <FantasyButton onClick={handleContinueFromExplanation} variant="primary" className="self-center">
                                    Continue <ChevronRight size={16} />
                                </FantasyButton>
                            </motion.div>
                        ) : (
                            <>
                                {/* Question Header */}
                                <div className="relative z-10 flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-gold-400 font-fantasy text-xs uppercase tracking-widest flex-wrap">
                                        <Scroll size={12} />
                                        <span>Trial {qIndex + 1} of {battleQuestions.length}</span>
                                        {currentQ?.topic && (
                                            <span className="px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/40">
                                                {currentQ.topic}
                                            </span>
                                        )}
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                            currentQ?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                            currentQ?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {currentQ?.difficulty}
                                        </span>
                                    </div>

                                    {/* Hint Button */}
                                    {!showHint && selectedOption === null && (
                                        <button
                                            onClick={handleUseHint}
                                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-gold-400 hover:border-gold-500/50 transition-all text-xs"
                                        >
                                            <HelpCircle size={12} /> Hint
                                        </button>
                                    )}
                                </div>

                                {/* Question Text */}
                                <div className="relative z-10 mb-4">
                                    <h3 className="text-lg md:text-xl font-fantasy text-slate-100 font-bold leading-relaxed">
                                        {currentQ?.text}
                                    </h3>
                                    <div className="mt-2 h-px bg-gradient-to-r from-gold-500/30 via-gold-500/10 to-transparent" />
                                </div>

                                {/* Hint Display */}
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="relative z-10 mb-3 px-3 py-2 bg-gold-900/20 border border-gold-600/30 rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <HelpCircle size={14} className="text-gold-400" />
                                                <span className="text-sm text-gold-300">{getHintText()}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* PvP zone info */}
                                {quest.isPvP && (
                                    <div className="relative z-10 mb-3 flex gap-4 text-sm font-mono">
                                        <span className="text-red-400">Attack: {playerAttackZone}</span>
                                        <span className="text-blue-400">Defense: {playerBlockZone}</span>
                                    </div>
                                )}

                                {/* Options Grid */}
                                <div className="grid grid-cols-2 gap-3 relative z-10 flex-grow">
                                    {currentQ?.options.map((opt, i) => {
                                        const isSelected = selectedOption === i;
                                        const isCorrect = i === currentQ.correctIndex;
                                        const isAnswered = selectedOption !== null;
                                        const romanNumerals = ['I', 'II', 'III', 'IV'];

                                        return (
                                            <motion.button
                                                key={i}
                                                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                                onClick={() => quest.isPvP ? handlePvPAnswer(i) : handleAnswer(i)}
                                                disabled={isAnswered}
                                                className={`
                                                    group relative p-3 border-2 rounded-lg text-left text-sm transition-all
                                                    ${isAnswered && isCorrect ? 'border-emerald-500 bg-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}
                                                    ${isAnswered && isSelected && !isCorrect ? 'border-red-500 bg-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
                                                    ${!isAnswered ? 'border-gold-600/20 bg-obsidian-800/80 hover:border-gold-500/60 hover:bg-obsidian-700/80 hover:shadow-[inset_0_0_20px_rgba(218,165,32,0.08)] animate-rune-pulse' : ''}
                                                    ${isAnswered && !isSelected && !isCorrect ? 'opacity-40' : ''}
                                                `}
                                            >
                                                <span className="font-fantasy text-gold-500/60 mr-2 group-hover:text-gold-400 transition-colors">{romanNumerals[i]}</span>
                                                <span className={`font-bold ${
                                                    isAnswered && isCorrect ? 'text-emerald-400' :
                                                    isAnswered && isSelected ? 'text-red-400' :
                                                    'text-slate-300 group-hover:text-white'
                                                }`}>{opt}</span>
                                                {isAnswered && isCorrect && <Sparkles size={14} className="inline ml-2 text-emerald-400" />}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Side Panel (Battle Chronicle) */}
                <div className="w-72 border-l border-gold-600/20 bg-black/50 p-3 text-xs overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
                    <div className="text-gold-500/70 uppercase tracking-widest border-b border-gold-600/20 pb-2 mb-2 flex justify-between items-center font-fantasy">
                        <span>Battle Chronicle</span>
                        <Activity size={10} className="text-gold-500/50" />
                    </div>
                    <div className="space-y-1 flex-grow overflow-y-auto">
                        {logs.map(log => (
                            <div key={log.id} className="opacity-80 leading-tight">
                                <span className="text-gold-600/40 mr-1 font-mono text-[10px]">[{log.timestamp}]</span>
                                <span className={
                                    log.type === 'crit' ? 'text-yellow-400' :
                                    log.type === 'player-hit' ? 'text-gold-400' :
                                    log.type === 'enemy-hit' ? 'text-red-400' :
                                    log.type === 'streak' ? 'text-gold-300 font-bold' :
                                    log.type === 'heal' ? 'text-green-400' :
                                    'text-slate-500'
                                }>
                                    {log.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Mini Stats Footer */}
                    <div className="border-t border-gold-600/20 pt-2 mt-2 space-y-1">
                        <div className="flex justify-between text-slate-600">
                            <span>Streak</span>
                            <span className="text-gold-400">{streak}x</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Accuracy</span>
                            <span className={correctCount > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                                {totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Hints</span>
                            <span className="text-slate-500">{hintsUsed}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
