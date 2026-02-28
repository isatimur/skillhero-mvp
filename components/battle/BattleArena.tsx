
import React from 'react';
import { HeroAvatar } from '../HeroAvatar'; // Check path
import { BOSS_SPRITE_URL } from '../../constants';
import { User, Quest, RaceData, CosmeticItem } from '../../types';

interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
    size: 'sm' | 'md' | 'lg' | 'xl';
}

interface BattleArenaProps {
    user: User;
    quest: Quest;
    playerAnim: string;
    enemyAnim: string;
    limitBreakMode: boolean;
    floatingTexts: FloatingText[];
    gameData: { races: RaceData[], items: CosmeticItem[] };
}

export const BattleArena: React.FC<BattleArenaProps> = ({
    user, quest, playerAnim, enemyAnim, limitBreakMode, floatingTexts, gameData
}) => {
    return (
        <div className="relative flex-grow bg-slate-900 overflow-hidden group perspective-1000">
            {/* Layer 1: Deep void radial gradient */}
            <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0a0a1a 40%, #050508 100%)' }}></div>
            {/* Layer 2: Perspective dungeon floor with gold grid */}
            <div className="absolute bottom-0 w-full h-[60%] z-0 opacity-40" style={{ background: 'linear-gradient(rgba(218,165,32,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(218,165,32,0.06) 1px, transparent 1px)', backgroundSize: '60px 60px', transform: 'perspective(400px) rotateX(60deg)', transformOrigin: 'bottom' }}></div>
            {/* Layer 3: Drifting fog */}
            <div className="absolute bottom-0 w-[200%] h-[30%] z-[1] opacity-20 animate-fog-drift" style={{ background: 'linear-gradient(transparent, rgba(100,80,140,0.3) 40%, rgba(60,40,100,0.15) 100%)' }}></div>
            {/* Layer 4: Central golden glow */}
            <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 70%, rgba(218,165,32,0.15) 0%, transparent 50%)' }}></div>
            {/* Layer 5: Floating ember particles */}
            {[0,1,2,3,4,5].map(i => (
                <div key={i} className="absolute w-1 h-1 rounded-full bg-gold-400 z-[2] animate-ember-rise" style={{ left: `${15 + i * 14}%`, bottom: '15%', animationDelay: `${i * 0.7}s`, animationDuration: `${3 + i * 0.5}s`, opacity: 0.6 }}></div>
            ))}
            {/* Layer 6: Ornamental gold corner frame */}
            <div className="absolute inset-3 z-[3] pointer-events-none border border-gold-600/10 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500/40"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/40"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/40"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500/40"></div>
            </div>

            {/* Combat Stage */}
            <div className="absolute inset-0 flex items-end justify-around pb-12 px-12 z-20 pointer-events-none">
                {/* Player */}
                <div className={`relative transition-transform duration-200 ${playerAnim} ${limitBreakMode ? 'filter brightness-150 drop-shadow-[0_0_20px_cyan]' : ''}`}>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/60 blur-md rounded-[100%] scale-150"></div>
                    <HeroAvatar
                        appearance={user.appearance}
                        race={user.heroRace}
                        size="xl"
                        showWeapon
                        className="scale-150"
                        items={gameData.items}
                        raceOptions={gameData.races}
                    />
                </div>

                {/* Enemy */}
                <div className={`relative transition-transform duration-200 ${enemyAnim}`}>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-lg rounded-[100%]"></div>
                    {quest.enemySpritePos ? (
                        <div
                            className="w-64 h-64 scale-125"
                            style={{
                                backgroundImage: `url('${BOSS_SPRITE_URL}')`,
                                backgroundPosition: quest.enemySpritePos,
                                backgroundSize: '300% 300%',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    ) : (
                        <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-float">
                            {quest.enemyImage}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Text */}
            {floatingTexts.map(ft => (
                <div
                    key={ft.id}
                    className={`absolute z-50 font-black italic tracking-tighter animate-float ${ft.color} ${ft.size === 'xl' ? 'text-7xl' : 'text-4xl'}`}
                    style={{ left: `${ft.x}%`, top: `${ft.y}%`, textShadow: '0 4px 0 rgba(0,0,0,0.5)' }}
                >
                    {ft.text}
                </div>
            ))}
        </div>
    );
};
