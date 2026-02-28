
import React from 'react';
import { Sword, Shield, Crosshair, Scroll } from 'lucide-react';
import { Question, BodyZone, Quest } from '../../types';

interface BattleControlsProps {
    quest: Quest;
    battleQuestions: Question[];
    qIndex: number;
    selectedOption: number | null;
    showZoneSelect: boolean;
    playerAttackZone: BodyZone | null;
    playerBlockZone: BodyZone | null;
    onSetAttackZone: (zone: BodyZone) => void;
    onSetBlockZone: (zone: BodyZone) => void;
    onConfirmZones: () => void;
    onAnswer: (index: number) => void;
}

export const BattleControls: React.FC<BattleControlsProps> = ({
    quest,
    battleQuestions,
    qIndex,
    selectedOption,
    showZoneSelect,
    playerAttackZone,
    playerBlockZone,
    onSetAttackZone,
    onSetBlockZone,
    onConfirmZones,
    onAnswer
}) => {
    // PvP Zone Selection
    if (quest.isPvP && showZoneSelect) {
        return (
            <div className="flex-grow p-6 flex flex-col relative">
                <h3 className="text-2xl font-fantasy text-gold-400 mb-6 text-center">Select Attack & Defense Zones</h3>
                <div className="grid grid-cols-2 gap-8 flex-grow">
                    {/* Attack Zone */}
                    <div>
                        <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                            <Crosshair size={20} /> Attack Zone
                        </h4>
                        <div className="space-y-2">
                            {(['HEAD', 'TORSO', 'ARMS', 'LEGS'] as BodyZone[]).map(zone => (
                                <button
                                    key={zone}
                                    onClick={() => onSetAttackZone(zone)}
                                    className={`w-full p-4 border-2 rounded-lg font-bold uppercase transition-all ${playerAttackZone === zone
                                        ? 'border-red-500 bg-red-900/30 text-red-300'
                                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-red-500/50'
                                        }`}
                                >
                                    <Sword size={16} className="inline mr-2" />
                                    {zone}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Defense Zone */}
                    <div>
                        <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                            <Shield size={20} /> Defense Zone
                        </h4>
                        <div className="space-y-2">
                            {(['HEAD', 'TORSO', 'ARMS', 'LEGS'] as BodyZone[]).map(zone => (
                                <button
                                    key={zone}
                                    onClick={() => onSetBlockZone(zone)}
                                    className={`w-full p-4 border-2 rounded-lg font-bold uppercase transition-all ${playerBlockZone === zone
                                        ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-blue-500/50'
                                        }`}
                                >
                                    <Shield size={16} className="inline mr-2" />
                                    {zone}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onConfirmZones}
                    disabled={!playerAttackZone || !playerBlockZone}
                    className={`mt-6 px-8 py-3 rounded-lg font-bold uppercase ${playerAttackZone && playerBlockZone
                        ? 'bg-gold-600 hover:bg-gold-500 text-black'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    Confirm Zones & Fight!
                </button>
            </div>
        );
    }

    // Question Screen
    // Standardize Question Retrieval
    const currentQuestion = battleQuestions[qIndex];
    if (!currentQuestion) return <div className="p-6 text-white">Loading Question...</div>;

    const isPvP = quest.isPvP;

    return (
        <div className="flex-grow p-6 flex flex-col relative overflow-hidden scroll-bg ornament-corners">
            <div className="absolute inset-0 bg-hex-pattern opacity-[0.04]"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>

            <div className="relative z-10 flex-grow flex flex-col justify-center mb-4">
                <div className="flex items-center gap-2 text-gold-400 font-fantasy text-xs uppercase tracking-widest mb-2">
                    <Scroll size={14} /> Trial — Difficulty: {currentQuestion.difficulty}
                </div>
                <h3 className="text-xl md:text-2xl font-fantasy text-slate-100 font-bold leading-relaxed">
                    {currentQuestion.text}
                </h3>
                <div className="mt-2 h-px bg-gradient-to-r from-gold-500/30 via-gold-500/10 to-transparent" />
                {isPvP && (
                    <div className="mt-4 flex gap-4 text-sm font-mono">
                        <span className="text-red-400">⚔️ Attack: {playerAttackZone}</span>
                        <span className="text-blue-400">🛡️ Defense: {playerBlockZone}</span>
                    </div>
                )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
                {currentQuestion.options.map((opt, i) => {
                    const romanNumerals = ['I', 'II', 'III', 'IV'];
                    const isSelected = selectedOption === i;
                    const isCorrect = i === currentQuestion.correctIndex;
                    const isAnswered = selectedOption !== null;
                    return (
                        <button
                            key={i}
                            onClick={() => onAnswer(i)}
                            disabled={isAnswered}
                            className={`
                            group relative p-4 border-2 rounded-lg text-left text-sm transition-all
                            ${isAnswered && isCorrect ? 'border-emerald-500 bg-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}
                            ${isAnswered && isSelected && !isCorrect ? 'border-red-500 bg-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
                            ${!isAnswered ? 'border-gold-600/20 bg-obsidian-800/80 hover:border-gold-500/60 hover:bg-obsidian-700/80 hover:shadow-[inset_0_0_20px_rgba(218,165,32,0.08)] animate-rune-pulse' : ''}
                            ${isAnswered && !isSelected && !isCorrect ? 'opacity-40' : ''}
                        `}
                        >
                            <span className="font-fantasy text-gold-500/60 mr-3 group-hover:text-gold-400">{romanNumerals[i]}</span>
                            <span className={`font-bold ${isAnswered && isCorrect ? 'text-emerald-400' : isAnswered && isSelected ? 'text-red-400' : 'text-slate-300 group-hover:text-white'}`}>{opt}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
