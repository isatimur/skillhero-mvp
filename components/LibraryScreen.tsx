
import React, { useState, useEffect } from 'react';
import { User, LibraryBook, SkillNode } from '../types';
import { fetchLibraryBooks } from '../lib/supabase';
import { FantasyButton, ParchmentPanel } from './ui';
import { BookOpen, CheckCircle, Scroll, Award, ChevronRight, ChevronLeft, X, Star, Lock, Zap, Book, Sparkles, Brain, Grid, Share2, Compass } from 'lucide-react';

interface LibraryScreenProps {
  user: User;
  onBack: () => void;
  onCompleteBook: (book: LibraryBook) => void;
  skillTree: SkillNode[]; // Receive skill tree from props
}

const NodeTooltip: React.FC<{ book: LibraryBook | undefined, isUnlocked: boolean, isMastered: boolean }> = ({ book, isUnlocked, isMastered }) => {
    if (!book) return null;
    return (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-black/90 text-white p-3 rounded border border-gray-600 shadow-xl z-50 pointer-events-none">
            <div className="text-center font-fantasy text-gold-500 text-sm mb-1 uppercase tracking-wider">{book.title}</div>
            <div className="text-[10px] text-gray-400 mb-2 leading-tight text-center">{book.description.substring(0, 50)}...</div>
            <div className="flex justify-between text-[10px] font-mono border-t border-gray-700 pt-2">
                <span className={isMastered ? "text-green-400" : isUnlocked ? "text-blue-400" : "text-red-500"}>
                    {isMastered ? "MASTERED" : isUnlocked ? "AVAILABLE" : "LOCKED"}
                </span>
                <span className="text-gold-500">{book.rewardXp} XP</span>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90"></div>
        </div>
    );
};

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ user, onBack, onCompleteBook, skillTree }) => {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [mode, setMode] = useState<'TREE' | 'GRID' | 'READING' | 'QUIZ'>('TREE');
  const [pageIndex, setPageIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [turning, setTurning] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
      fetchLibraryBooks().then(data => {
          setBooks(data);
          setLoading(false);
      });
  }, []);

  const handleSelectNode = (node: SkillNode, unlocked: boolean) => {
    if (!unlocked) return;
    const book = books.find(b => b.id === node.bookId);
    if (book) handleSelectBook(book);
  };

  const handleSelectBook = (book: LibraryBook) => {
    setSelectedBook(book);
    setMode('READING');
    setPageIndex(0);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const handleNextPage = () => {
    if (!selectedBook) return;
    if (pageIndex < selectedBook.content.length - 1) {
      setTurning(true);
      setTimeout(() => {
          setPageIndex(prev => prev + 1);
          setTurning(false);
      }, 300);
    } else {
      setMode('QUIZ');
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
        setTurning(true);
        setTimeout(() => {
            setPageIndex(prev => prev - 1);
            setTurning(false);
        }, 300);
    }
  };

  const handleAnswer = (idx: number) => {
    if (!selectedBook || selectedAnswer !== null) return;
    
    setSelectedAnswer(idx);
    const isCorrect = idx === selectedBook.questions[quizIndex].correctIndex;
    setFeedback(isCorrect);
    
    if (isCorrect) setQuizScore(prev => prev + 1);

    setTimeout(() => {
      if (quizIndex < selectedBook.questions.length - 1) {
        setQuizIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setFeedback(null);
      } else {
        setQuizComplete(true);
      }
    }, 1500);
  };

  const finishBook = () => {
    if (!selectedBook) return;
    const passed = quizScore >= Math.ceil(selectedBook.questions.length * 0.7); // 70% to pass
    
    if (passed && !user.completedBooks.includes(selectedBook.id)) {
      onCompleteBook(selectedBook);
    }
    
    setSelectedBook(null);
    setMode('TREE');
  };

  const formatText = (text: string, isFirstPage: boolean) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        // Basic Markdown Bold Parser
        const renderContent = (str: string) => {
            const parts = str.split(/(\*\*.*?\*\*)/g);
            return parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="font-bold text-[#3e2e1e]">{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };

        if (trimmed.startsWith('-')) {
            return (
                <li key={i} className="ml-6 mb-3 list-disc pl-2 marker:text-[#8b0000] text-lg leading-relaxed text-[#2a1e12] font-serif">
                    {renderContent(trimmed.substring(1).trim())}
                </li>
            );
        }

        // Apply Drop Cap only on the very first paragraph of the first page
        const isDropCap = isFirstPage && i === 0;
        const content = isDropCap ? trimmed.substring(1) : trimmed;

        return (
            <p key={i} className="mb-6 text-justify text-xl leading-relaxed text-[#2a1e12] font-serif">
                {isDropCap && (
                    <span className="float-left text-7xl font-fantasy mr-3 mt-[-6px] text-[#8b0000] leading-none drop-shadow-sm select-none">
                        {trimmed.charAt(0)}
                    </span>
                )}
                {renderContent(content)}
            </p>
        );
    });
  };

  // --- RENDER MAIN VIEW (TREE or GRID) ---
  if (mode === 'TREE' || mode === 'GRID') {
    return (
      <div className="fixed inset-0 bg-[#0f172a] overflow-hidden flex flex-col z-50">
        
        {/* Background Space Map */}
        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-50"></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-indigo-950 via-slate-900 to-black opacity-90"></div>

        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-indigo-500/30 shadow-lg">
            <div className="pointer-events-auto flex gap-4 items-center">
                <FantasyButton onClick={onBack} variant="secondary" size="sm">← Return</FantasyButton>
                <div className="flex bg-black/50 rounded-full p-1 border border-indigo-500/30">
                    <button onClick={() => setMode('TREE')} className={`px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${mode === 'TREE' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-gray-400 hover:text-white'}`}>
                        <Share2 size={14} /> Constellation
                    </button>
                    <button onClick={() => setMode('GRID')} className={`px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${mode === 'GRID' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-gray-400 hover:text-white'}`}>
                        <Grid size={14} /> Archives
                    </button>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-3xl font-fantasy text-gold-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">Celestial Archive</h2>
                <div className="flex justify-end items-center gap-2 text-indigo-300 text-xs font-bold tracking-widest uppercase">
                    <Compass size={14} /> Mastery: {user.completedBooks.length} / {books.length}
                </div>
            </div>
        </div>

        {/* Content Container */}
        <div className="flex-grow relative w-full h-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar p-8">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gold-500 font-fantasy gap-4">
                    <Sparkles className="animate-spin" size={48} />
                    <div className="animate-pulse tracking-widest uppercase">Consulting the Star Charts...</div>
                </div>
            ) : mode === 'GRID' ? (
                // GRID VIEW (Bookshelf Style)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {books.map(book => {
                        const isCompleted = user.completedBooks.includes(book.id);
                        return (
                            <div key={book.id} onClick={() => handleSelectBook(book)} className={`cursor-pointer group relative bg-[#1e293b] border-2 rounded-lg p-1 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] ${isCompleted ? 'border-gold-500/50' : 'border-slate-700 hover:border-indigo-400'}`}>
                                <div className="h-full bg-slate-900 border border-white/5 rounded p-5 flex flex-col relative overflow-hidden">
                                    {/* Book Spine Decal */}
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-900/50 border-r border-white/5"></div>
                                    
                                    <div className="pl-4">
                                        <div className="flex justify-between items-start mb-2">
                                            {isCompleted ? <CheckCircle size={20} className="text-gold-500" /> : <Book size={20} className="text-slate-500" />}
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Level {user.level}</div>
                                        </div>
                                        <h3 className={`font-fantasy text-xl mb-1 group-hover:text-indigo-300 transition-colors ${isCompleted ? 'text-gold-100' : 'text-slate-300'}`}>{book.title}</h3>
                                        <p className="text-xs text-slate-400 font-serif italic mb-4">by {book.author}</p>
                                        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4">{book.description}</p>
                                        
                                        <div className="mt-auto flex justify-between items-center border-t border-white/10 pt-3">
                                            <div className="text-xs font-bold text-indigo-400">{book.rewardXp} XP</div>
                                            <div className="text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Read Tome →</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // TREE VIEW (Constellation)
                <div className="relative w-full h-[800px] bg-slate-900/50 rounded-xl border border-indigo-900/30 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 animate-pulse"></div>
                    
                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {skillTree.map(node => {
                            return node.parents.map(parentId => {
                                const parent = skillTree.find(n => n.id === parentId);
                                if (!parent) return null;
                                return (
                                    <line 
                                        key={`${parentId}-${node.id}`} 
                                        x1={`${parent.x}%`} y1={`${parent.y}%`} 
                                        x2={`${node.x}%`} y2={`${node.y}%`} 
                                        stroke="#4f46e5" 
                                        strokeWidth="2" 
                                        strokeOpacity="0.3"
                                    />
                                );
                            });
                        })}
                    </svg>

                    {/* Nodes */}
                    {skillTree.map(node => {
                        const book = books.find(b => b.id === node.bookId);
                        const isCompleted = book && user.completedBooks.includes(book.id);
                        
                        // Check if unlocked (all parents completed)
                        const isUnlocked = node.parents.length === 0 || node.parents.every(pid => {
                            const pNode = skillTree.find(n => n.id === pid);
                            if (!pNode) return false;
                            const pBook = books.find(b => b.id === pNode.bookId);
                            return pBook && user.completedBooks.includes(pBook.id);
                        });

                        return (
                            <div 
                                key={node.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group"
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                            >
                                <button
                                    onClick={() => handleSelectNode(node, !!isUnlocked)}
                                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                                        isCompleted 
                                            ? 'bg-gold-500 border-gold-300 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110' 
                                            : isUnlocked 
                                                ? 'bg-indigo-900 border-indigo-400 text-indigo-200 hover:scale-110 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] cursor-pointer' 
                                                : 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed grayscale'
                                    }`}
                                >
                                    {isCompleted ? <Star size={20} fill="currentColor" /> : isUnlocked ? <Zap size={20} /> : <Lock size={18} />}
                                    
                                    {/* Pulse Ring for unlocked & incomplete */}
                                    {isUnlocked && !isCompleted && (
                                        <div className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-50"></div>
                                    )}
                                </button>

                                {/* Label */}
                                <div className={`absolute top-14 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-2 py-1 rounded bg-black/80 border border-white/10 transition-opacity ${isUnlocked ? 'text-white' : 'text-gray-500 opacity-50'}`}>
                                    {node.label}
                                </div>

                                {hoveredNode === node.id && (
                                    <NodeTooltip book={book} isUnlocked={!!isUnlocked} isMastered={!!isCompleted} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- READING MODE ---
  if (mode === 'READING' && selectedBook) {
    return (
      <div className="fixed inset-0 bg-[#1a120b] z-[60] flex items-center justify-center p-4 md:p-8 animate-fade-in">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMode('TREE')}></div>
        
        <div className="relative w-full max-w-4xl aspect-[1.4] bg-[#e3d5b8] rounded-r-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex overflow-hidden border-4 border-[#3e2e1e]">
            {/* Book Spine (Left visual anchor) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-[#2a1e12] to-[#5c452d] border-r border-[#3e2e1e] z-20 shadow-xl flex flex-col items-center py-4">
                <div className="w-1 h-full border-l border-dashed border-[#3e2e1e]/30"></div>
            </div>

            {/* Page Content */}
            <div className="flex-1 ml-8 md:ml-12 p-8 md:p-12 relative flex flex-col overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-[#8b0000]/20 pb-4 mb-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-fantasy text-[#3e2e1e] leading-none">{selectedBook.title}</h2>
                        <p className="text-sm font-serif italic text-[#8b0000] mt-1">Authored by {selectedBook.author}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold uppercase tracking-widest text-[#5c452d]">Page</div>
                        <div className="text-2xl font-fantasy text-[#3e2e1e]">{pageIndex + 1} <span className="text-sm text-[#8b0000]/50">/ {selectedBook.content.length}</span></div>
                    </div>
                </div>

                {/* Text Body */}
                <div className={`flex-grow overflow-y-auto custom-scrollbar pr-4 transition-opacity duration-300 ${turning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                    {formatText(selectedBook.content[pageIndex], pageIndex === 0)}
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-4 border-t border-[#8b0000]/10 flex justify-between items-center relative z-10">
                    <button 
                        onClick={handlePrevPage} 
                        disabled={pageIndex === 0}
                        className="flex items-center gap-2 text-[#5c452d] font-bold uppercase tracking-widest hover:text-[#8b0000] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    <button 
                        onClick={handleNextPage}
                        className="flex items-center gap-2 bg-[#8b0000] text-[#e3d5b8] px-6 py-3 rounded shadow-md hover:bg-[#5c0000] hover:scale-105 transition-all font-fantasy text-lg tracking-wide group"
                    >
                        {pageIndex < selectedBook.content.length - 1 ? 'Next Page' : 'Take Quiz'} 
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#d4c49c] to-transparent pointer-events-none"></div>
            </div>
        </div>
        
        {/* Close Button */}
        <button onClick={() => setMode('TREE')} className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors bg-black/50 rounded-full p-2">
            <X size={32} />
        </button>
      </div>
    );
  }

  // --- QUIZ MODE ---
  if (mode === 'QUIZ' && selectedBook) {
    const question = selectedBook.questions[quizIndex];
    const progress = ((quizIndex + (quizComplete ? 1 : 0)) / selectedBook.questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-[#0f172a] z-[70] flex items-center justify-center p-4">
            <ParchmentPanel className="max-w-2xl w-full relative overflow-hidden" title="Mastery Trial">
                
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-300">
                    <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>

                {!quizComplete ? (
                    <div className="mt-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Question {quizIndex + 1} of {selectedBook.questions.length}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-gold-600 font-bold">{quizScore}</span>
                                <span className="text-gray-400 text-xs">Correct</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-[#3e2e1e] mb-8 font-serif leading-snug">
                            {question.text}
                        </h3>

                        <div className="space-y-3">
                            {question.options.map((opt, i) => {
                                let btnClass = "w-full text-left p-4 rounded border-2 transition-all font-bold text-[#3e2e1e] relative overflow-hidden ";
                                if (selectedAnswer === null) {
                                    btnClass += "bg-white border-[#d4c49c] hover:border-gold-500 hover:shadow-md";
                                } else {
                                    if (i === question.correctIndex) {
                                        btnClass += "bg-green-100 border-green-600 text-green-900";
                                    } else if (i === selectedAnswer) {
                                        btnClass += "bg-red-100 border-red-600 text-red-900";
                                    } else {
                                        btnClass += "bg-gray-100 border-gray-300 text-gray-400 opacity-60";
                                    }
                                }

                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => handleAnswer(i)} 
                                        disabled={selectedAnswer !== null}
                                        className={btnClass}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span>{opt}</span>
                                            {selectedAnswer !== null && i === question.correctIndex && <CheckCircle size={20} className="text-green-600" />}
                                            {selectedAnswer === i && i !== question.correctIndex && <X size={20} className="text-red-600" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {feedback !== null && (
                            <div className={`mt-6 p-4 rounded text-sm font-bold animate-pop-in ${feedback ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                                <p>{feedback ? "Correct!" : "Incorrect."}</p>
                                <p className="font-normal mt-1">{question.explanation}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 animate-pop-in">
                        <div className="mb-6 inline-block p-4 rounded-full bg-gold-100 border-4 border-gold-500">
                            <Award size={64} className="text-gold-600" />
                        </div>
                        <h2 className="text-3xl font-fantasy text-[#3e2e1e] mb-2">Trial Complete</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            You scored <span className="font-bold text-[#3e2e1e]">{Math.round((quizScore / selectedBook.questions.length) * 100)}%</span>
                        </p>
                        
                        {quizScore >= Math.ceil(selectedBook.questions.length * 0.7) ? (
                            <div className="bg-green-50 border border-green-200 p-4 rounded mb-8">
                                <p className="text-green-800 font-bold mb-1">Knowledge Mastered!</p>
                                <p className="text-sm text-green-700">You have earned {selectedBook.rewardXp} XP.</p>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 p-4 rounded mb-8">
                                <p className="text-red-800 font-bold mb-1">Review Required</p>
                                <p className="text-sm text-red-700">You need 70% to master this tome. Try reading it again.</p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <FantasyButton onClick={() => handleSelectBook(selectedBook)} variant="secondary">Retry</FantasyButton>
                            <FantasyButton onClick={finishBook}>Return to Archive</FantasyButton>
                        </div>
                    </div>
                )}
            </ParchmentPanel>
        </div>
    );
  }

  return null;
};
