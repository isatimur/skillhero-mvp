
import React from 'react';
import { LiquidBar } from '../ui';
import { User, Quest } from '../../types';

interface BattleHUDProps {
    user: User;
    quest: Quest;
    playerHp: number;
    enemyHp: number;
    limitGauge: number;
    limitBreakMode: boolean;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
    user, quest, playerHp, enemyHp, limitGauge, limitBreakMode
}) => {
    return (
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-40">
            <div className="w-1/3 max-w-xs space-y-2">
                <LiquidBar current={playerHp} max={100} color="green" label={user.username} subLabel={`Lvl ${user.level}`} />
                {!quest.isPvP && (
                    <LiquidBar
                        current={limitGauge}
                        max={100}
                        color="cyan"
                        size="sm"
                        label={limitBreakMode ? "LIMIT BREAK" : "OVERDRIVE"}
                    />
                )}
            </div>
            <div className="font-fantasy text-4xl text-gold-500 drop-shadow-lg pt-2 animate-pulse">VS</div>
            <div className="w-1/3 max-w-xs flex flex-col items-end space-y-2">
                <LiquidBar
                    current={enemyHp}
                    max={quest.enemyMaxHp || 100}
                    color="red"
                    label={quest.enemyName}
                    subLabel="BOSS"
                />
            </div>
        </div>
    );
};
