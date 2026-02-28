
import React, { useState, useEffect, useRef } from 'react';
import { Play, Bug, Activity, Keyboard, RotateCcw, AlertCircle, Code } from 'lucide-react';
import { FantasyButton } from './ui';

// --- SYNTAX SYNC (RHYTHM) ---
export const SyntaxSyncGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [active, setActive] = useState(false);
    const [cursorPos, setCursorPos] = useState(0); 
    const [direction, setDirection] = useState(1); 
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [speed, setSpeed] = useState(1);
    const targetZone = { start: 40, end: 60 };
    const requestRef = useRef<number>(0);

    const animate = () => {
        setCursorPos(prev => {
            let next = prev + (direction * speed);
            if (next >= 100 || next <= 0) {
                setDirection(d => d * -1);
                next = Math.max(0, Math.min(100, next));
            }
            return next;
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (active) requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [active, direction, speed]);

    useEffect(() => {
        if (strikes >= 3) {
            setActive(false);
            onComplete(score);
        }
    }, [strikes]);

    const handleAction = () => {
        if (!active) {
            setActive(true);
            return;
        }
        if (cursorPos >= targetZone.start && cursorPos <= targetZone.end) {
            setScore(s => s + 1);
            setSpeed(s => s + 0.2); 
        } else {
            setStrikes(s => s + 1);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto relative select-none">
            <h3 className="text-gold-500 font-fantasy text-2xl mb-4">Syntax Sync</h3>
            <div className="w-full bg-gray-800 h-8 rounded-full relative overflow-hidden mb-8 border-2 border-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                <div className="absolute top-0 bottom-0 bg-green-500/30 border-x-2 border-green-500 box-content" style={{ left: `${targetZone.start}%`, width: `${targetZone.end - targetZone.start}%` }}></div>
                <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_white] z-10" style={{ left: `${cursorPos}%` }}></div>
            </div>
            
            <div className="flex gap-8 mb-8 text-xl font-bold font-mono">
                <span className="text-green-400">Score: {score}</span>
                <span className="text-red-400">Strikes: {strikes}/3</span>
            </div>

            <FantasyButton onClick={handleAction} size="lg" className="w-48 h-48 rounded-full !p-0 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 border-4 border-gold-600 bg-black">
                {active ? <div className="text-4xl text-gold-500 font-fantasy">CAST</div> : <Play size={64} className="ml-2 text-gold-500" />}
            </FantasyButton>
            <p className="mt-6 text-gray-500 text-xs uppercase tracking-widest font-bold">Cast when aligned</p>
        </div>
    );
};

// --- ALGO TYPER (FALLING WORDS) ---
export const AlgoTyperGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [words, setWords] = useState<{id: number, text: string, y: number, x: number}[]>([]);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [active, setActive] = useState(false);
    const frameRef = useRef<number>(0);
    
    const DICTIONARY = ['const', 'let', 'var', 'async', 'await', 'return', 'import', 'export', 'class', 'super', 'this', 'void', 'null', 'true', 'false', 'static', 'public', 'yield', 'typeof', 'throw'];

    useEffect(() => {
        if (!active) return;
        
        let lastSpawn = 0;
        const loop = (time: number) => {
            if (time - lastSpawn > 2000 - (score * 50)) {
                const word = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
                setWords(prev => [...prev, { id: Math.random(), text: word, y: -10, x: Math.random() * 80 }]);
                lastSpawn = time;
            }

            setWords(prev => {
                const nextWords = prev.map(w => ({ ...w, y: w.y + 0.3 + (score * 0.02) }));
                const missed = nextWords.filter(w => w.y > 90);
                if (missed.length > 0) {
                    setStrikes(s => s + missed.length);
                    return nextWords.filter(w => w.y <= 90);
                }
                return nextWords;
            });

            frameRef.current = requestAnimationFrame(loop);
        };
        frameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameRef.current!);
    }, [active, score]);

    useEffect(() => {
        if (strikes >= 3) {
            setActive(false);
            onComplete(score);
        }
    }, [strikes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);
        const match = words.find(w => w.text === val);
        if (match) {
            setScore(s => s + 1);
            setWords(prev => prev.filter(w => w.id !== match.id));
            setInput('');
        }
    };

    return (
        <div className="relative h-full w-full overflow-hidden flex flex-col p-4">
            <div className="absolute top-2 right-2 text-red-500 font-bold font-mono z-10">Misses: {strikes}/3</div>
            <div className="absolute top-2 left-2 text-green-500 font-bold font-mono z-10">Score: {score}</div>
            
            <div className="flex-grow relative bg-slate-900/50 border-2 border-slate-700 rounded mb-4 overflow-hidden shadow-inner backdrop-blur-sm">
                {!active && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                        <FantasyButton onClick={() => { setActive(true); setScore(0); setStrikes(0); setWords([]); }}>Start Typing Defense</FantasyButton>
                    </div>
                )}
                {words.map(w => (
                    <div key={w.id} className="absolute text-green-400 font-mono font-bold text-lg drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" style={{ top: `${w.y}%`, left: `${w.x}%` }}>
                        {w.text}
                    </div>
                ))}
                <div className="absolute bottom-[10%] w-full h-0.5 bg-red-500/50 animate-pulse"></div>
            </div>

            <input 
                type="text" 
                autoFocus
                value={input}
                onChange={handleChange}
                disabled={!active}
                className="w-full bg-black/80 border-2 border-gold-500 p-3 rounded font-mono text-xl text-white text-center focus:outline-none focus:ring-4 focus:ring-gold-500/20"
                placeholder={active ? "Type the falling words..." : "Press Start"}
            />
        </div>
    );
};

// --- BUG HUNTER (DEBUGGING) ---
const BUG_SNIPPETS = [
    { code: "if (x = 5) { ... }", error: "Assignment inside condition", fix: "if (x === 5)" },
    { code: "const list = [1,2];\nlist[3] = 5;", error: "Sparse array / use push", fix: "list.push(5)" },
    { code: "return\n{ id: 1 };", error: "ASI breaks return", fix: "return {\n  id: 1\n};" },
    { code: "1 + '1'", error: "Type coercion results in '11'", fix: "1 + Number('1')" },
    { code: "useEffect(() => { fetchData(); })", error: "Missing dependency array", fix: "useEffect(() => { fetchData(); }, [])" },
    { code: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}", error: "var in loop logs 3,3,3", fix: "for (let i = 0; ...)" },
    { code: "const obj = { a: 1 };\nObject.freeze(obj);\nobj.a = 2;", error: "Cannot assign to frozen object", fix: "Don't freeze or copy first" },
    { code: "JSON.parse('undefined')", error: "undefined is not valid JSON", fix: "JSON.parse('null') or handle" },
    { code: "array.map(async (x) => fetch(x))", error: "Returns Promise[], not values", fix: "Promise.all(array.map(...))" },
    { code: '"SELECT * FROM users WHERE id = " + id', error: "SQL injection risk", fix: "Parameterized query" },
];

export const BugHunterGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const SNIPPETS = BUG_SNIPPETS;

    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [active, setActive] = useState(false);

    const handleGuess = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(s => s + 1);
        } else {
            setStrikes(s => s + 1);
        }
        
        if (strikes >= 2 || currentIdx >= SNIPPETS.length - 1) { 
            setActive(false);
            onComplete(score + (isCorrect ? 1 : 0));
        } else {
            setCurrentIdx(prev => prev + 1);
        }
    };

    if (!active) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Bug size={64} className="text-red-500 mb-4 animate-bounce" />
                <h3 className="text-2xl font-fantasy text-gray-200 mb-2">Bug Hunter</h3>
                <p className="text-gray-400 mb-6 text-sm">Identify the correct fix for the broken code.</p>
                <FantasyButton onClick={() => { setActive(true); setScore(0); setStrikes(0); setCurrentIdx(0); }}>Start Debugging</FantasyButton>
            </div>
        );
    }

    const currentSnippet = SNIPPETS[currentIdx];
    const wrongOptions = ["Delete the line", "Add 'use strict'", "Wrap in try/catch", "Use var instead", "Restart the server"];
    const options = [
        { text: currentSnippet.fix, correct: true },
        ...wrongOptions.slice(0, 3).map(t => ({ text: t, correct: false })),
    ].sort(() => Math.random() - 0.5);

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex justify-between mb-4 font-mono font-bold text-sm uppercase tracking-wider">
                <span className="text-green-400">Fixed: {score}</span>
                <span className="text-red-400">Bugs Remaining: {strikes}/3</span>
            </div>
            
            <div className="flex-grow flex flex-col justify-center gap-6">
                <div className="bg-black/80 p-6 rounded border-l-4 border-red-500 font-mono text-sm text-gray-300 shadow-lg relative">
                    <div className="absolute top-2 right-2 text-red-500 animate-pulse"><AlertCircle size={20} /></div>
                    <div className="text-xs text-red-400 uppercase font-bold mb-2">// Bug Detected: {currentSnippet.error}</div>
                    <pre className="whitespace-pre-wrap">{currentSnippet.code}</pre>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {options.map((opt, i) => (
                        <button key={i} onClick={() => handleGuess(opt.correct)} className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-left font-mono text-sm transition-colors text-white group flex items-center gap-3">
                            <span className="text-gray-500 group-hover:text-gold-500 font-bold">&gt;</span>
                            {opt.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- CODE FILL (Complete the code) ---
const FILL_CHALLENGES: { snippet: string; blankLabel: string; options: string[]; correctIndex: number; hint: string }[] = [
    { snippet: "function add(a, b) {\n  ______\n}", blankLabel: "Return value", options: ["return a + b", "return a - b", "return a * b", "console.log(a + b)"], correctIndex: 0, hint: "Add two numbers." },
    { snippet: "const doubled = numbers.map(x => ______)", blankLabel: "Transform", options: ["x * 2", "x", "x + 1", "x.length"], correctIndex: 0, hint: "Double each element." },
    { snippet: "const found = array.______(x => x.id === id)", blankLabel: "Array method", options: ["find", "filter", "map", "forEach"], correctIndex: 0, hint: "Get first match." },
    { snippet: "async function fetchUser() {\n  const res = await ______('/api/user');\n  return res.json();\n}", blankLabel: "HTTP call", options: ["fetch", "axios", "get", "request"], correctIndex: 0, hint: "Browser API for HTTP." },
    { snippet: "React hook for state: const [val, setVal] = ______(0)", blankLabel: "Hook", options: ["useState", "useEffect", "useRef", "useContext"], correctIndex: 0, hint: "State hook." },
    { snippet: "To clone an object: const copy = ______(original)", blankLabel: "Clone", options: ["{ ...original }", "original", "original.clone()", "JSON.parse(JSON.stringify(original))"], correctIndex: 0, hint: "Shallow copy spread." },
    { snippet: "SQL: get all from table: ______ * FROM users", blankLabel: "Keyword", options: ["SELECT", "GET", "FETCH", "FROM"], correctIndex: 0, hint: "SQL query keyword." },
    { snippet: "Git: save changes locally: git ______ -m \"message\"", blankLabel: "Command", options: ["commit", "push", "add", "save"], correctIndex: 0, hint: "Record snapshot." },
];

export const CodeFillGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [active, setActive] = useState(false);

    const handleChoice = (chosenIndex: number) => {
        const correct = chosenIndex === FILL_CHALLENGES[currentIdx].correctIndex;
        if (correct) setScore(s => s + 1);
        else setStrikes(s => s + 1);

        if (strikes >= 2 || currentIdx >= FILL_CHALLENGES.length - 1) {
            setActive(false);
            onComplete(score + (correct ? 1 : 0));
        } else {
            setCurrentIdx(prev => prev + 1);
        }
    };

    if (!active) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Code size={64} className="text-cyan-500 mb-4" />
                <h3 className="text-2xl font-fantasy text-gray-200 mb-2">Code Fill</h3>
                <p className="text-gray-400 mb-6 text-sm">Complete the code by choosing the correct fill-in.</p>
                <FantasyButton onClick={() => { setActive(true); setScore(0); setStrikes(0); setCurrentIdx(0); }}>Start</FantasyButton>
            </div>
        );
    }

    const challenge = FILL_CHALLENGES[currentIdx];
    const shuffledOptions = [...challenge.options].sort(() => Math.random() - 0.5);

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex justify-between mb-4 font-mono text-sm uppercase tracking-wider">
                <span className="text-green-400">Score: {score}</span>
                <span className="text-red-400">Strikes: {strikes}/3</span>
            </div>
            <div className="flex-grow flex flex-col justify-center gap-6">
                <div className="bg-black/80 p-6 rounded border-l-4 border-cyan-500 font-mono text-sm text-gray-300">
                    <div className="text-xs text-cyan-400 uppercase font-bold mb-2">// {challenge.blankLabel}</div>
                    <pre className="whitespace-pre-wrap text-green-400">{challenge.snippet.replace('______', '???')}</pre>
                    <p className="text-slate-500 text-xs mt-2">{challenge.hint}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shuffledOptions.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleChoice(challenge.options.indexOf(opt))}
                            className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-left font-mono text-sm text-white transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
