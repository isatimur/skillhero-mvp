
import React, { useState } from 'react';
import { User, LibraryBook, Spell } from '../types';
import { LIBRARY_BOOKS } from '../constants';
import { FantasyButton, ParchmentPanel } from './ui';
import { BookOpen, Database, Cloud, Zap, Code, Activity, Globe, GitBranch, ArrowLeft, Lock } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
    'Database': <Database size={48} />,
    'Cloud': <Cloud size={48} />,
    'Zap': <Zap size={48} />,
    'Code': <Code size={48} />,
    'Activity': <Activity size={48} />,
    'Globe': <Globe size={48} />,
    'GitBranch': <GitBranch size={48} />,
    'Coffee': <div className="text-4xl">☕</div> 
};

export const SpellbookScreen: React.FC<{ user: User; onBack: () => void; spells: Spell[] }> = ({ user, onBack, spells }) => {
    const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

    // Filter books user has completed AND that have an associated spell
    // Note: We still use LIBRARY_BOOKS constant here for relationship mapping fallback if fetched books not fully integrated
    // But ideally, 'spells' prop contains the source of truth for spell data.
    
    // Create a map for quick lookup
    const spellMap = new Map<string, Spell>(spells.map(s => [s.id, s]));

    const knownSpells: Spell[] = LIBRARY_BOOKS
        .filter(b => user.completedBooks.includes(b.id) && b.spellId && spellMap.has(b.spellId))
        .map(b => spellMap.get(b.spellId!))
        .filter((s): s is Spell => !!s);

    // Get a list of "Unknown" spells for the UI (locked state)
    const unknownSpells: Spell[] = LIBRARY_BOOKS
        .filter(b => !user.completedBooks.includes(b.id) && b.spellId && spellMap.has(b.spellId))
        .map(b => spellMap.get(b.spellId!))
        .filter((s): s is Spell => !!s);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-hidden flex flex-col animate-fade-in">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 p-6 flex justify-between items-center border-b border-purple-900/50 bg-black/50 backdrop-blur-md">
                <FantasyButton onClick={onBack} variant="secondary" size="sm"><ArrowLeft size={16}/> Close Grimoire</FantasyButton>
                <h2 className="text-4xl font-fantasy text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Arcane Grimoire</h2>
                <div className="w-32"></div>
            </div>

            {/* Content Area */}
            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar relative z-10">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Mastery Header */}
                    <div className="text-center mb-12">
                        <p className="text-gray-400 font-serif italic text-lg">
                            "Knowledge is not merely possessed; it is wielded."
                        </p>
                        <div className="mt-4 flex justify-center gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-fantasy text-white">{knownSpells.length}</div>
                                <div className="text-xs uppercase tracking-widest text-purple-500 font-bold">Spells Mastered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-fantasy text-gray-600">{spells.length}</div>
                                <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total Arts</div>
                            </div>
                        </div>
                    </div>

                    {/* Spells Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
                        {knownSpells.map(spell => (
                            <div key={spell.id} onClick={() => setSelectedSpell(spell)} className="group relative h-80 perspective-container cursor-pointer">
                                <div className="relative w-full h-full duration-500 transform transition-transform group-hover:-translate-y-2">
                                    {/* Card Face */}
                                    <div className={`absolute inset-0 bg-gray-900 border-2 rounded-xl flex flex-col items-center justify-between p-6 shadow-2xl overflow-hidden ${spell.color.replace('text-', 'border-')}`}>
                                        
                                        {/* Bg Glow */}
                                        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent`}></div>
                                        
                                        <div className="w-full flex justify-between items-start">
                                            <span className={`text-xs font-bold uppercase tracking-widest ${spell.color}`}>{spell.school}</span>
                                            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse"></div>
                                        </div>

                                        <div className={`transform scale-125 group-hover:scale-150 transition-transform duration-500 ${spell.color} drop-shadow-[0_0_15px_currentColor]`}>
                                            {ICON_MAP[spell.iconId] || <BookOpen size={48} />}
                                        </div>

                                        <div className="text-center relative z-10">
                                            <h3 className="text-xl font-fantasy text-white mb-2">{spell.name}</h3>
                                            <div className="h-0.5 w-12 bg-white/20 mx-auto"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Hover Glow */}
                                    <div className={`absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10 ${spell.color.replace('text-', 'bg-')}`}></div>
                                </div>
                            </div>
                        ))}

                        {/* Locked Spells (Grayed out) */}
                        {unknownSpells.map(spell => (
                            <div key={spell.id} className="relative h-80 opacity-50 grayscale select-none">
                                <div className="absolute inset-0 bg-black border-2 border-gray-800 rounded-xl flex flex-col items-center justify-center p-6">
                                    <Lock size={48} className="text-gray-600 mb-4" />
                                    <h3 className="text-lg font-fantasy text-gray-500">Unknown Spell</h3>
                                    <p className="text-xs text-gray-600 text-center mt-2">Master the corresponding Tome in the Library to unlock.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Spell Detail Modal */}
            {selectedSpell && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={() => setSelectedSpell(null)}>
                    <div className="max-w-lg w-full bg-gray-900 border-4 border-double border-purple-500 rounded-lg p-1 relative shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-pop-in" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        <div className="p-8 relative z-10 flex flex-col items-center text-center">
                            <div className={`mb-6 p-6 rounded-full border-4 bg-black ${selectedSpell.color.replace('text-', 'border-')} ${selectedSpell.color}`}>
                                {ICON_MAP[selectedSpell.iconId]}
                            </div>
                            <h2 className="text-4xl font-fantasy text-white mb-2">{selectedSpell.name}</h2>
                            <div className={`text-sm font-bold uppercase tracking-[0.3em] mb-6 ${selectedSpell.color}`}>{selectedSpell.school} Art</div>
                            
                            <p className="text-lg text-gray-300 font-serif leading-relaxed mb-8">
                                {selectedSpell.description}
                            </p>

                            <FantasyButton onClick={() => setSelectedSpell(null)} className="w-full">Close</FantasyButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
