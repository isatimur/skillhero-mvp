
import { useState, useEffect } from 'react';
import { User, Quest, Question, BodyZone } from '../../types'; // Adjusted path for lib/hooks
import { calculateDamage } from '../gameLogic';

type BattlePhase = 'NARRATIVE' | 'COMBAT' | 'VICTORY' | 'DEFEAT';
type FeedbackType = 'HIT' | 'MISS' | 'BLOCKED' | null;

interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
    size: 'sm' | 'md' | 'lg' | 'xl';
}

interface BattleLogEntry {
    id: string;
    timestamp: string;
    text: string;
    type: 'info' | 'player-hit' | 'enemy-hit' | 'crit' | 'heal';
}

interface UseBattleEngineProps {
    quest: Quest;
    user: User;
    playSfx?: (key: string) => void;
    onComplete: (xp: number, isPerfect: boolean) => void;
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export const useBattleEngine = ({ quest, user, playSfx, onComplete }: UseBattleEngineProps) => {
    // --- STATE ---
    const [phase, setPhase] = useState<BattlePhase>('NARRATIVE');
    const [narrativeIndex, setNarrativeIndex] = useState(0);
    const [qIndex, setQIndex] = useState(0);
    const [battleQuestions, setBattleQuestions] = useState<Question[]>([]);

    // Stats
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(quest.enemyMaxHp || 100);
    const [limitGauge, setLimitGauge] = useState(0);
    const [streak, setStreak] = useState(0);
    const [limitBreakMode, setLimitBreakMode] = useState(false);

    // UI Feedback
    const [logs, setLogs] = useState<BattleLogEntry[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [playerAnim, setPlayerAnim] = useState('');
    const [enemyAnim, setEnemyAnim] = useState('');
    const [feedback, setFeedback] = useState<FeedbackType>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // PvP Specific
    const [playerAttackZone, setPlayerAttackZone] = useState<BodyZone | null>(null);
    const [playerBlockZone, setPlayerBlockZone] = useState<BodyZone | null>(null);
    const [enemyAttackZone, setEnemyAttackZone] = useState<BodyZone | null>(null);
    const [enemyBlockZone, setEnemyBlockZone] = useState<BodyZone | null>(null);
    const [showZoneSelect, setShowZoneSelect] = useState(true);

    // --- EFFECT: Initialize Questions ---
    useEffect(() => {
        if (!quest.isPvP && quest.questions) {
            const shuffledQs = shuffleArray<Question>(quest.questions);
            const processedQs = shuffledQs.map((q: Question) => {
                const optionsWithIndices = q.options.map((opt, idx) => ({ txt: opt, originalIdx: idx }));
                const shuffledOptions = shuffleArray(optionsWithIndices);
                const newCorrectIndex = shuffledOptions.findIndex(item => item.originalIdx === q.correctIndex);
                return { ...q, options: shuffledOptions.map(item => item.txt), correctIndex: newCorrectIndex };
            });
            setBattleQuestions(processedQs);
        } else if (quest.questions) {
            setBattleQuestions(quest.questions);
        }
    }, [quest.id, quest.isPvP, quest.questions]);

    // --- EFFECT: Audio for Victory/Defeat ---
    useEffect(() => {
        if (phase === 'VICTORY') playSfx?.('VICTORY');
        if (phase === 'DEFEAT') playSfx?.('DEFEAT');
    }, [phase, playSfx]);

    // --- HELPERS ---
    const addLog = (text: string, type: BattleLogEntry['type'] = 'info') => {
        const now = new Date();
        setLogs(prev => [...prev, { id: Math.random().toString(), timestamp: now.toLocaleTimeString(), text, type }]);
    };

    const spawnFloatingText = (text: string, x: number, y: number, color: string, size: any = 'md') => {
        const id = Date.now() + Math.random();
        setFloatingTexts(prev => [...prev, { id, text, x, y, color, size }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1200);
    };

    // --- ACTIONS ---
    const handleNextNarrative = () => {
        if (narrativeIndex < quest.narrativeIntro.length - 1) {
            setNarrativeIndex(prev => prev + 1);
        } else {
            setPhase('COMBAT');
            addLog("Combat System Initialized.", 'info');
        }
    };

    const skipIntro = () => setPhase('COMBAT');

    // PvP Logic
    const handlePvPAnswer = (optionIndex: number) => {
        if (selectedOption !== null || !playerAttackZone || !playerBlockZone) return;
        setSelectedOption(optionIndex);
        const isCorrect = optionIndex === battleQuestions[qIndex].correctIndex;

        // Enemy AI
        const zones: BodyZone[] = ['HEAD', 'TORSO', 'ARMS', 'LEGS'];
        const enemyAttack = zones[Math.floor(Math.random() * 4)];
        const enemyBlock = zones[Math.floor(Math.random() * 4)];
        setEnemyAttackZone(enemyAttack);
        setEnemyBlockZone(enemyBlock);

        if (isCorrect) {
            // Player attacks
            const isBlocked = playerAttackZone === enemyBlock;
            if (isBlocked) {
                setFeedback('BLOCKED');
                spawnFloatingText('BLOCKED!', 70, 40, 'text-blue-400', 'lg');
                addLog(`Enemy blocked your ${playerAttackZone} attack!`, 'info');
            } else {
                setFeedback('HIT');
                playSfx?.('ATTACK');
                const dmg = calculateDamage(user, undefined, 25, Math.random() < 0.1, streak + 1, playerHp / 100);
                setEnemyHp(h => Math.max(0, h - dmg));
                spawnFloatingText(`-${dmg}`, 70, 40, 'text-red-500', 'xl');
                addLog(`You hit ${playerAttackZone} for ${dmg} damage!`, 'player-hit');
                setStreak(s => s + 1);
                setPlayerAnim('animate-attack-right');
                setEnemyAnim('animate-shake bg-red-500/30');
            }
        } else {
            setFeedback('MISS');
            setStreak(0);
        }

        // Enemy Counter-Attack Delay
        setTimeout(() => {
            const playerBlocked = enemyAttack === playerBlockZone;
            if (!playerBlocked) {
                playSfx?.('DAMAGE');
                const dmg = 15;
                setPlayerHp(h => Math.max(0, h - dmg));
                spawnFloatingText(`-${dmg}`, 30, 40, 'text-red-500', 'lg');
                addLog(`Enemy hit your ${enemyAttack} for ${dmg} damage!`, 'enemy-hit');
                setPlayerAnim('animate-shake bg-red-500/30');
                setEnemyAnim('animate-attack-left');
            } else {
                spawnFloatingText('BLOCKED!', 30, 40, 'text-blue-400', 'lg');
                addLog(`You blocked enemy's ${enemyAttack} attack!`, 'info');
            }

            // Turn Resolution
            setTimeout(() => {
                setPlayerAnim(''); setEnemyAnim('');
                if (enemyHp <= 0) {
                    setPhase('VICTORY');
                } else if (playerHp <= 0) {
                    setPhase('DEFEAT');
                } else if (qIndex < battleQuestions.length - 1) {
                    setQIndex(i => i + 1);
                    setSelectedOption(null);
                    setFeedback(null);
                    setPlayerAttackZone(null);
                    setPlayerBlockZone(null);
                    setShowZoneSelect(true);
                } else {
                    setPhase('VICTORY');
                }
            }, 1500);
        }, 1000);
    };

    // PvE Logic
    const handlePvEAnswer = (optionIndex: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(optionIndex);
        const isCorrect = optionIndex === battleQuestions[qIndex].correctIndex;

        if (isCorrect) {
            setFeedback('HIT'); playSfx?.('ATTACK');
            const dmg = calculateDamage(user, undefined, 20, Math.random() < 0.1, streak + 1, playerHp / 100) * (limitBreakMode ? 3 : 1);
            setEnemyHp(h => Math.max(0, h - dmg));
            spawnFloatingText(`-${dmg}`, 70, 40, limitBreakMode ? 'text-cyan-400' : 'text-white', 'lg');
            setStreak(s => s + 1);
            setLimitGauge(prev => limitBreakMode ? 0 : Math.min(100, prev + 25));
            setPlayerAnim('animate-attack-right');
            setEnemyAnim('animate-shake bg-red-500/30');
        } else {
            setFeedback('MISS'); playSfx?.('DAMAGE');
            const dmg = 15;
            setPlayerHp(h => Math.max(0, h - dmg));
            spawnFloatingText(`-${dmg}`, 30, 40, 'text-red-500', 'lg');
            setStreak(0);
            setPlayerAnim('animate-shake bg-red-500/30');
            setEnemyAnim('animate-attack-left');
        }

        setTimeout(() => {
            setPlayerAnim(''); setEnemyAnim('');
            if (isCorrect && qIndex < battleQuestions.length - 1) {
                setQIndex(i => i + 1); setSelectedOption(null); setFeedback(null);
            } else if (isCorrect) {
                setPhase('VICTORY');
            } else if (playerHp <= 0) {
                setPhase('DEFEAT');
            } else {
                // Wrong answer, just enable input again? 
                // In original code: "else { setSelectedOption(null); setFeedback(null); }"
                setSelectedOption(null); setFeedback(null);
            }
        }, 1500);
    };

    return {
        // State
        phase,
        narrativeIndex,
        qIndex,
        battleQuestions,
        playerHp,
        enemyHp,
        limitGauge,
        limitBreakMode: { value: limitBreakMode, set: setLimitBreakMode }, // Expose setter if needed
        streak,
        logs,
        floatingTexts,
        playerAnim,
        enemyAnim,
        feedback,
        selectedOption,

        // PvP State
        playerAttackZone,
        playerBlockZone,
        enemyAttackZone,
        enemyBlockZone,
        showZoneSelect,
        setPlayerAttackZone,
        setPlayerBlockZone,
        setShowZoneSelect,

        // Actions
        handleNextNarrative,
        skipIntro,
        handleAnswer: quest.isPvP ? handlePvPAnswer : handlePvEAnswer
    };
};
