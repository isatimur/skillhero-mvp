import React, { useEffect, useRef, useState } from 'react';

export type FloatingTextType = 'correct' | 'wrong' | 'crit' | 'limit';

interface Props {
  key?: React.Key;
  value: string;
  type: FloatingTextType;
  onDone?: () => void;
}

const TYPE_CLASSES: Record<FloatingTextType, string> = {
  correct: 'text-yellow-400 text-2xl font-bold',
  wrong:   'text-red-400 text-xl font-bold',
  crit:    'text-cyan-400 text-3xl font-bold',
  limit:   'text-purple-400 text-3xl font-bold tracking-wider',
};

const FloatingText: React.FC<Props> = ({ value, type, onDone }) => {
  const [visible, setVisible] = useState(true);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDoneRef.current?.(); }, 1200);
    return () => clearTimeout(t);
  }, []); // run only on mount

  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none select-none ${TYPE_CLASSES[type]} animate-float-up`}
      style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)' }}
    >
      {value}
    </div>
  );
};

export default FloatingText;
