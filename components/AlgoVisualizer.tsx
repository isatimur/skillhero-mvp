
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, RotateCcw, SkipForward, ChevronRight,
  Zap, Layers, Brain, TrendingUp, Clock, Info
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AlgoVisualizerProps {
  onBack: () => void;
}

type AlgoType = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick';

interface AlgoInfo {
  name: string;
  description: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
}

interface BarState {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'selected';
}

// ============================================================================
// ALGORITHM DATA
// ============================================================================

const ALGO_INFO: Record<AlgoType, AlgoInfo> = {
  bubble: {
    name: 'Bubble Sort',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until sorted.',
    best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)', stable: true
  },
  selection: {
    name: 'Selection Sort',
    description: 'Finds the minimum element from the unsorted part and puts it at the beginning. Moves the boundary of the sorted subarray one element at a time.',
    best: 'O(n\u00B2)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)', stable: false
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Builds the sorted array one item at a time, by taking each element and inserting it into its correct position among the already-sorted elements.',
    best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)', stable: true
  },
  merge: {
    name: 'Merge Sort',
    description: 'Divides array into halves, recursively sorts them, then merges the two sorted halves. Uses divide and conquer strategy.',
    best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true
  },
  quick: {
    name: 'Quick Sort',
    description: 'Picks a pivot element, partitions the array around the pivot (smaller left, larger right), then recursively sorts the sub-arrays.',
    best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n\u00B2)', space: 'O(log n)', stable: false
  },
};

// ============================================================================
// SORTING ALGORITHM GENERATORS
// ============================================================================

type SortStep = { array: number[]; comparing: number[]; swapping: number[]; sorted: number[]; pivot: number[]; selected: number[]; message: string };

function* bubbleSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sorted], pivot: [], selected: [], message: `Comparing ${a[j]} and ${a[j + 1]}` };

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        yield { array: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sorted], pivot: [], selected: [], message: `Swapped ${a[j + 1]} and ${a[j]}` };
      }
    }
    sorted.push(n - 1 - i);
    if (!swapped) break;
  }
  sorted.push(0);
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), pivot: [], selected: [], message: 'Sorted!' };
}

function* selectionSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], pivot: [], selected: [i], message: `Finding minimum from index ${i}` };

    for (let j = i + 1; j < n; j++) {
      yield { array: [...a], comparing: [minIdx, j], swapping: [], sorted: [...sorted], pivot: [], selected: [i], message: `Comparing ${a[minIdx]} and ${a[j]}` };
      if (a[j] < a[minIdx]) minIdx = j;
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      yield { array: [...a], comparing: [], swapping: [i, minIdx], sorted: [...sorted], pivot: [], selected: [], message: `Swapped ${a[minIdx]} to position ${i}` };
    }
    sorted.push(i);
  }
  sorted.push(n - 1);
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), pivot: [], selected: [], message: 'Sorted!' };
}

function* insertionSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;
  const sorted = [0];

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], pivot: [], selected: [i], message: `Inserting ${key} into sorted portion` };

    while (j >= 0 && a[j] > key) {
      yield { array: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sorted], pivot: [], selected: [i], message: `${a[j]} > ${key}, shifting right` };
      a[j + 1] = a[j];
      j--;
      yield { array: [...a], comparing: [], swapping: [j + 1, j + 2], sorted: [...sorted], pivot: [], selected: [], message: `Shifted element right` };
    }
    a[j + 1] = key;
    sorted.push(i);
    yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], pivot: [], selected: [j + 1], message: `Placed ${key} at position ${j + 1}` };
  }
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), pivot: [], selected: [], message: 'Sorted!' };
}

function* mergeSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;

  function* mergeSort(lo: number, hi: number): Generator<SortStep> {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);

    yield { array: [...a], comparing: [], swapping: [], sorted: [], pivot: [mid], selected: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i), message: `Dividing: [${lo}..${mid}] and [${mid + 1}..${hi}]` };

    yield* mergeSort(lo, mid);
    yield* mergeSort(mid + 1, hi);

    // Merge
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;

    while (i < left.length && j < right.length) {
      yield { array: [...a], comparing: [lo + i, mid + 1 + j], swapping: [], sorted: [], pivot: [], selected: [], message: `Merging: comparing ${left[i]} and ${right[j]}` };
      if (left[i] <= right[j]) {
        a[k] = left[i]; i++;
      } else {
        a[k] = right[j]; j++;
      }
      yield { array: [...a], comparing: [], swapping: [k], sorted: [], pivot: [], selected: [], message: `Placed ${a[k]} at position ${k}` };
      k++;
    }
    while (i < left.length) { a[k] = left[i]; i++; k++; }
    while (j < right.length) { a[k] = right[j]; j++; k++; }

    yield { array: [...a], comparing: [], swapping: [], sorted: [], pivot: [], selected: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i), message: `Merged [${lo}..${hi}]` };
  }

  yield* mergeSort(0, n - 1);
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), pivot: [], selected: [], message: 'Sorted!' };
}

function* quickSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;

  function* quickSort(lo: number, hi: number): Generator<SortStep> {
    if (lo >= hi) {
      if (lo === hi) yield { array: [...a], comparing: [], swapping: [], sorted: [lo], pivot: [], selected: [], message: `Single element at ${lo} is sorted` };
      return;
    }

    const pivotVal = a[hi];
    yield { array: [...a], comparing: [], swapping: [], sorted: [], pivot: [hi], selected: [], message: `Pivot: ${pivotVal} (index ${hi})` };

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      yield { array: [...a], comparing: [j, hi], swapping: [], sorted: [], pivot: [hi], selected: [], message: `Comparing ${a[j]} with pivot ${pivotVal}` };
      if (a[j] < pivotVal) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) {
          yield { array: [...a], comparing: [], swapping: [i, j], sorted: [], pivot: [hi], selected: [], message: `Swapped ${a[j]} and ${a[i]}` };
        }
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    const pivotIdx = i + 1;
    yield { array: [...a], comparing: [], swapping: [pivotIdx, hi], sorted: [pivotIdx], pivot: [], selected: [], message: `Pivot ${pivotVal} placed at index ${pivotIdx}` };

    yield* quickSort(lo, pivotIdx - 1);
    yield* quickSort(pivotIdx + 1, hi);
  }

  yield* quickSort(0, n - 1);
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), pivot: [], selected: [], message: 'Sorted!' };
}

const ALGO_GENERATORS: Record<AlgoType, (arr: number[]) => Generator<SortStep>> = {
  bubble: bubbleSortGen,
  selection: selectionSortGen,
  insertion: insertionSortGen,
  merge: mergeSortGen,
  quick: quickSortGen,
};

// ============================================================================
// HELPER
// ============================================================================

function generateRandomArray(size: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }
  return arr;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AlgoVisualizer: React.FC<AlgoVisualizerProps> = ({ onBack }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoType>('bubble');
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(50); // ms per step
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState<SortStep | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [originalArray, setOriginalArray] = useState<number[]>(() => generateRandomArray(20));
  const [showInfo, setShowInfo] = useState(false);

  const generatorRef = useRef<Generator<SortStep> | null>(null);
  const runningRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const info = ALGO_INFO[selectedAlgo];

  const reset = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setStepCount(0);
    const arr = generateRandomArray(arraySize);
    setOriginalArray(arr);
    setCurrentStep({ array: arr, comparing: [], swapping: [], sorted: [], pivot: [], selected: [], message: 'Press Play to start' });
    generatorRef.current = null;
  }, [arraySize]);

  useEffect(() => { reset(); }, [selectedAlgo, arraySize, reset]);

  const runVisualization = useCallback(async () => {
    if (!generatorRef.current) {
      generatorRef.current = ALGO_GENERATORS[selectedAlgo]([...originalArray]);
    }

    runningRef.current = true;
    setIsRunning(true);
    setIsPaused(false);

    while (runningRef.current) {
      const result = generatorRef.current.next();
      if (result.done) {
        runningRef.current = false;
        setIsRunning(false);
        break;
      }
      setCurrentStep(result.value);
      setStepCount(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, Math.max(5, 200 - speedRef.current * 1.8)));
    }
  }, [selectedAlgo, originalArray]);

  const pause = () => {
    runningRef.current = false;
    setIsRunning(false);
    setIsPaused(true);
  };

  const stepForward = () => {
    if (!generatorRef.current) {
      generatorRef.current = ALGO_GENERATORS[selectedAlgo]([...originalArray]);
    }
    const result = generatorRef.current.next();
    if (!result.done) {
      setCurrentStep(result.value);
      setStepCount(prev => prev + 1);
      setIsPaused(true);
    }
  };

  const bars: BarState[] = currentStep
    ? currentStep.array.map((value, i) => ({
        value,
        state: currentStep.sorted.includes(i) ? 'sorted'
          : currentStep.swapping.includes(i) ? 'swapping'
          : currentStep.comparing.includes(i) ? 'comparing'
          : currentStep.pivot.includes(i) ? 'pivot'
          : currentStep.selected.includes(i) ? 'selected'
          : 'default'
      }))
    : originalArray.map(v => ({ value: v, state: 'default' as const }));

  const maxVal = Math.max(...(currentStep?.array || originalArray));

  const barColor = (state: BarState['state']) => {
    switch (state) {
      case 'comparing': return 'bg-gold-400 shadow-[0_0_8px_rgba(218,165,32,0.5)]';
      case 'swapping': return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]';
      case 'sorted': return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]';
      case 'pivot': return 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]';
      case 'selected': return 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.3)]';
      default: return 'bg-gold-400/60';
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 relative">
      <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 transition-all"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <h1 className="text-lg font-fantasy text-gold-400 flex items-center gap-2">
            <Brain size={16} /> Algorithm Visualizer
          </h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 transition-all"
          >
            <Info size={18} />
          </motion.button>
        </div>

        {/* Algorithm Selector */}
        <div className="flex gap-1.5 p-1.5 bg-obsidian-900/80 rounded-2xl border border-gold-600/20 overflow-x-auto no-scrollbar mb-4">
          {(Object.keys(ALGO_INFO) as AlgoType[]).map(algo => (
            <motion.button
              key={algo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { if (!isRunning) setSelectedAlgo(algo); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedAlgo === algo
                  ? 'text-gold-400 bg-gold-500/10 border border-gold-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              {ALGO_INFO[algo].name}
            </motion.button>
          ))}
        </div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-obsidian-800/60 border border-gold-600/15 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'Best', value: info.best, icon: <TrendingUp size={12} /> },
                    { label: 'Average', value: info.average, icon: <Clock size={12} /> },
                    { label: 'Worst', value: info.worst, icon: <Zap size={12} /> },
                    { label: 'Space', value: info.space, icon: <Layers size={12} /> },
                    { label: 'Stable', value: info.stable ? 'Yes' : 'No', icon: <Brain size={12} /> },
                  ].map(stat => (
                    <div key={stat.label} className="p-2 rounded-lg bg-black/30 text-center">
                      <div className="text-[10px] text-slate-600 uppercase font-bold flex items-center justify-center gap-1">{stat.icon} {stat.label}</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visualization Area */}
        <div className="relative rounded-2xl bg-obsidian-900/80 border border-gold-500/10 p-4 mb-4 overflow-hidden">
          {/* Bar Chart */}
          <div className="flex items-end justify-center gap-[2px] h-48 sm:h-64">
            {bars.map((bar, i) => (
              <motion.div
                key={i}
                className={`rounded-t-sm transition-all duration-75 ${barColor(bar.state)}`}
                style={{
                  height: `${(bar.value / maxVal) * 100}%`,
                  width: `${Math.max(2, 100 / bars.length - 1)}%`,
                }}
                layout
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>

          {/* Step message */}
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-400 font-mono">{currentStep?.message || 'Press Play to start'}</p>
            <p className="text-[10px] text-slate-600 mt-1">Steps: {stepCount}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={reset}
            disabled={isRunning}
            className="p-3 rounded-full bg-obsidian-800/60 border border-gold-600/20 text-slate-400 hover:text-white hover:border-gold-500/40 transition-all disabled:opacity-30"
          >
            <RotateCcw size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={isRunning ? pause : runVisualization}
            className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
              isRunning
                ? 'bg-red-500/10 border-red-500/50 text-red-400'
                : 'bg-gold-500/10 border-gold-500/50 text-gold-400 hover:bg-gold-500/20'
            }`}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={stepForward}
            disabled={isRunning}
            className="p-3 rounded-full bg-obsidian-800/60 border border-gold-600/20 text-slate-400 hover:text-white hover:border-gold-500/40 transition-all disabled:opacity-30"
          >
            <SkipForward size={18} />
          </motion.button>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-obsidian-800/40 border border-gold-600/15">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
              Array Size: {arraySize}
            </label>
            <input
              type="range" min="5" max="60" value={arraySize}
              onChange={e => { if (!isRunning) setArraySize(Number(e.target.value)); }}
              className="w-full accent-gold-500"
              disabled={isRunning}
            />
          </div>
          <div className="p-3 rounded-xl bg-obsidian-800/40 border border-gold-600/15">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
              Speed: {speed < 30 ? 'Slow' : speed < 70 ? 'Medium' : 'Fast'}
            </label>
            <input
              type="range" min="5" max="100" value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-full accent-gold-500"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 text-[10px] text-slate-500">
          {[
            { color: 'bg-gold-400/60', label: 'Unsorted' },
            { color: 'bg-gold-400', label: 'Comparing' },
            { color: 'bg-red-400', label: 'Swapping' },
            { color: 'bg-yellow-400', label: 'Pivot' },
            { color: 'bg-purple-400', label: 'Selected' },
            { color: 'bg-emerald-400', label: 'Sorted' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="range"] { height: 4px; }
      `}</style>
    </div>
  );
};

export default AlgoVisualizer;
