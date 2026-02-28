
import React from 'react';
import { User, CosmeticItem, HeroRace, RaceData } from '../types';
import { RACE_SPRITE_URL } from '../constants';
import { 
  Sword, Shield, Scroll, User as UserIcon, 
  Brain, Crown, Shirt, Hammer, Zap, Eye, Terminal, 
  Flame, Ghost, Headphones, Glasses, Cpu, Keyboard, Coffee, Search,
  Cloud, Database, Server, ListTodo, Timer, Code, Music, Crosshair
} from 'lucide-react';

// Centralized Icon Map
export const ICON_MAP: Record<string, React.ElementType> = {
  'User': UserIcon,
  'Search': Search,
  'Brain': Brain,
  'Crown': Crown,
  'Shirt': Shirt,
  'Scroll': Scroll,
  'Sword': Sword,
  'Shield': Shield,
  'Hammer': Hammer,
  'Zap': Zap,
  'Eye': Eye,
  'Terminal': Terminal,
  'Flame': Flame,
  'Ghost': Ghost,
  'Headphones': Headphones,
  'Glasses': Glasses,
  'Cpu': Cpu,
  'Keyboard': Keyboard,
  'Coffee': Coffee,
  'Cloud': Cloud,
  'Database': Database,
  'Server': Server,
  'ListTodo': ListTodo,
  'Timer': Timer,
  'Code': Code,
  'Music': Music,
  'Crosshair': Crosshair
};

interface HeroAvatarProps {
  appearance?: User['appearance'];
  race?: HeroRace;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWeapon?: boolean;
  className?: string;
  items?: CosmeticItem[]; // New prop for fetched items
  raceOptions?: RaceData[]; // New prop for fetched race info
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({ 
  appearance, race, size = 'md', showWeapon = false, className = '', items = [], raceOptions = []
}) => {
  const headItem = items.find(i => i.id === appearance?.headId);
  const bodyItem = items.find(i => i.id === appearance?.bodyId);
  const weaponItem = items.find(i => i.id === appearance?.weaponId);
  const raceData = race ? raceOptions.find(r => r.id === race) : null;

  const HeadIcon = headItem ? ICON_MAP[headItem.iconId] || UserIcon : UserIcon;
  const WeaponIcon = weaponItem ? ICON_MAP[weaponItem.iconId] || Scroll : Scroll;

  // Determine Rarity Glow
  let glowClass = "shadow-lg border-gold-600"; // Default
  const equipped = [headItem, bodyItem, weaponItem].filter(Boolean);
  
  if (equipped.some(i => i?.rarity === 'legendary')) {
      glowClass = "shadow-[0_0_25px_rgba(255,215,0,0.8)] border-gold-400 ring-2 ring-gold-200 animate-pulse-glow";
  } else if (equipped.some(i => i?.rarity === 'epic')) {
      glowClass = "shadow-[0_0_20px_rgba(168,85,247,0.7)] border-purple-500 ring-1 ring-purple-300";
  } else if (equipped.some(i => i?.rarity === 'rare')) {
      glowClass = "shadow-[0_0_15px_rgba(59,130,246,0.6)] border-blue-500";
  }

  const sizeClasses = {
    sm: 'w-10 h-10 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-4',
    xl: 'w-64 h-64 border-8' 
  };

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48,
    xl: 96
  };

  const bodyColor = bodyItem?.styleClass || 'bg-blue-900 border-blue-400';
  
  // Common interactive classes
  const interactiveClasses = "transform transition-all duration-500 hover:scale-105 group bg-black";

  // Check for specific image URL first
  if (raceData?.imgUrl) {
    return (
      <div 
        className={`${sizeClasses[size]} ${glowClass} rounded-full flex items-center justify-center relative overflow-hidden ${interactiveClasses} ${className}`}
        role="img"
        aria-label={`${raceData.name} Avatar`}
      >
        <img src={raceData.imgUrl} alt={raceData.name} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
        
        {/* Overlay Weapon if requested, small bubble */}
        {showWeapon && weaponItem && (
          <div className="absolute -bottom-2 -right-2 bg-black/80 border-2 border-gold-500 rounded-full p-1.5 shadow-md z-10 group-hover:scale-110 transition-transform">
             <WeaponIcon size={size === 'xl' ? 32 : 16} className="text-gold-400" />
          </div>
        )}
      </div>
    );
  }

  // Fallback to Sprite rendering
  if (raceData && raceData.spritePos) {
    return (
      <div 
        className={`${sizeClasses[size]} ${glowClass} rounded-full flex items-center justify-center relative overflow-hidden ${interactiveClasses} ${className}`}
        role="img"
        aria-label={`${raceData.name} Avatar`}
      >
        <div 
          className="absolute inset-0 scale-110 group-hover:scale-125 transition-transform duration-700"
          style={{
            backgroundImage: `url('${RACE_SPRITE_URL}')`,
            backgroundPosition: raceData.spritePos,
            backgroundSize: '300% 300%', // 3x3 Grid
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Overlay Weapon */}
        {showWeapon && weaponItem && (
          <div className="absolute -bottom-2 -right-2 bg-black/80 border-2 border-gold-500 rounded-full p-1.5 shadow-md z-10 group-hover:scale-110 transition-transform">
             <WeaponIcon size={size === 'xl' ? 32 : 16} className="text-gold-400" />
          </div>
        )}
      </div>
    );
  }

  // Default Icon fallback
  return (
    <div 
      className={`${sizeClasses[size]} ${bodyColor} ${glowClass} rounded-full flex items-center justify-center relative ${interactiveClasses} ${className}`}
      role="img"
      aria-label="Character Avatar"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      {showWeapon ? (
        <WeaponIcon size={iconSizes[size]} className="text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
      ) : (
        <HeadIcon size={iconSizes[size]} className="text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
      )}
    </div>
  );
};
