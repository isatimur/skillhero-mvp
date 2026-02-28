
import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

interface BattleLogEntry {
    id: string;
    timestamp: string;
    text: string;
    type: 'info' | 'player-hit' | 'enemy-hit' | 'crit' | 'heal';
}

interface BattleLogProps {
    logs: BattleLogEntry[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-80 border-l border-gold-600/20 bg-black/50 p-4 text-xs overflow-y-auto custom-scrollbar flex flex-col h-full relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
            <div className="text-gold-500/70 uppercase tracking-widest border-b border-gold-600/20 pb-2 mb-2 flex justify-between font-fantasy">
                <span>Battle Chronicle</span>
                <Activity size={12} className="text-gold-500/50" />
            </div>
            <div className="space-y-1.5 flex-grow">
                {logs.map(log => (
                    <div key={log.id} className="opacity-80">
                        <span className="text-gold-600/40 mr-2 font-mono text-[10px]">[{log.timestamp}]</span>
                        <span className={
                            log.type === 'crit' ? 'text-yellow-400' :
                                log.type === 'player-hit' ? 'text-gold-400' :
                                    log.type === 'enemy-hit' ? 'text-red-400' :
                                        'text-slate-400'
                        }>
                            {log.text}
                        </span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};
