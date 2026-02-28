
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User, GameScreen, Quest, Position, LibraryBook, RaceData, ClassData, CosmeticItem, Npc, Spell, SkillNode } from './types';
import { supabase, fetchGameData, findPvPOpponent } from './lib/supabase';
import { recordActivity, isDailyBonusClaimed, claimDailyBonus, DAILY_CHALLENGE_XP_MULTIPLIER } from './lib/streak';
import { LoginScreen, HubScreen, QuestSelectScreen, ProfileScreen, CustomizeScreen, TrainingScreen, SettingsModal, PvPLobbyScreen } from './components/MenuScreens';
import { BattleScreen } from './components/BattleScreen';
import { WorldScreen } from './components/WorldScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { SpellbookScreen } from './components/SpellbookScreen';
import { AdminScreen } from './components/AdminScreen';
import StudyHub from './components/StudyHub';
import CSReference from './components/CSReference';
import AlgoVisualizer from './components/AlgoVisualizer';
import InterviewPrep from './components/InterviewPrep';
import ProgressAnalytics from './components/ProgressAnalytics';
import SystemDesign from './components/SystemDesign';
import { AudioManager } from './components/AudioManager';
import { FantasyButton, ParchmentPanel } from './components/ui';
import { Loader, AlertTriangle, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ScreenTransition } from './components/premium/ScreenTransition';
import { ParticleSystem } from './components/premium/ParticleSystem';
import { rewardBus, loadRewardState, saveRewardState, createInitialRewardState, getStudyRank, DAILY_TARGET, WEEKLY_TARGET, migrateStudyGameLoop, type RewardState } from './lib/rewardBus';
import Confetti from 'react-confetti';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [screen, setScreen] = useState<GameScreen>('LOGIN');
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [notification, setNotification] = useState<{ msg: string, type: 'info' | 'success' | 'level' | 'daily' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [gameData, setGameData] = useState<{ races: RaceData[], classes: ClassData[], items: CosmeticItem[], npcs: Npc[], spells: Spell[], skillNodes: SkillNode[] }>({ races: [], classes: [], items: [], npcs: [], spells: [], skillNodes: [] });
  const [sfxTrigger, setSfxTrigger] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const levelUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ music: 50, sfx: 50 });
  const [worldPos, setWorldPos] = useState<Position>({ x: 7, y: 7 });
  const [exploredTiles, setExploredTiles] = useState<string[]>([]);
  const [rewardTick, setRewardTick] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardStateRef = useRef<RewardState>(
    user ? (loadRewardState(user.username) ?? createInitialRewardState()) : createInitialRewardState()
  );

  useEffect(() => {
    const saved = localStorage.getItem('skillHero_settings');
    if (saved) try { setSettings(JSON.parse(saved)); } catch (e) { }
  }, []);

  useEffect(() => {
    return () => {
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, []);

  useEffect(() => { localStorage.setItem('skillHero_settings', JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    if (user?.username) {
      migrateStudyGameLoop(user.username);
    }
    rewardStateRef.current = user
      ? (loadRewardState(user.username) ?? createInitialRewardState())
      : createInitialRewardState();
  }, [user?.username]);

  const initializeApp = async () => {
    setLoading(true); setInitError(null);
    try {
      // Safe fetch of game data (uses fallback if network fails)
      const data = await fetchGameData();
      setGameData(data);

      // Check Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      setSession(session);
      if (session) await fetchProfile(session.user.id); else setLoading(false);

    } catch (err: any) {
      console.error("App Initialization Error:", err);
      // Ensure error is a string
      const message = err?.message || "Unknown error occurred during initialization.";
      setInitError(message === 'Failed to fetch' ? "Connection Lost to Game Server." : message);
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeApp();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { setSession(null); setUser(null); setScreen('LOGIN'); setLoading(false); }
      else if (session) { setSession(session); if (!user) fetchProfile(session.user.id); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    // Only show loading if we don't have user data yet (prevent UI flicker on re-focus)
    if (!user) setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        // PGRST116: JSON object requested, multiple (or no) rows returned.
        // This happens for new users who authenticated but haven't created a profile row yet.
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }

      if (data) {
        setUser({
          username: data.username, level: data.level, xp: data.xp, maxXp: data.max_xp, completedQuests: data.completed_quests || [],
          completedBooks: data.completed_books || [], unlockedItems: data.unlocked_items || [], title: data.title, heroClass: data.hero_class,
          heroRace: data.hero_race, gender: data.gender, appearance: data.appearance, stats: data.stats, role: data.role
        });
        setScreen('HUB');
      } else {
        // No profile found, go to creation screen
        setScreen('LOGIN');
      }
    } catch (err: any) {
      console.error("Profile Fetch Error:", err);
      const message = err?.message || "Failed to load hero profile.";
      if (!user) setInitError(message === 'Failed to fetch' ? "Network Error: Could not reach database." : message);
    } finally {
      setLoading(false);
    }
  };

  const updateXP = async (amount: number, fromVictory = false) => {
    if (!user || !session) return;
    let xp = amount;
    if (fromVictory) {
      recordActivity();
      if (!isDailyBonusClaimed()) {
        xp = Math.floor(amount * DAILY_CHALLENGE_XP_MULTIPLIER);
        claimDailyBonus();
        showNotification('Daily Challenge complete! +50% XP bonus', 'daily');
      }
    }
    let newXp = user.xp + xp; let newLevel = user.level; let newMaxXp = user.maxXp;
    let leveledUp = false;
    while (newXp >= newMaxXp) { newXp -= newMaxXp; newLevel += 1; newMaxXp = Math.floor(newMaxXp * 1.5); leveledUp = true; }
    if (leveledUp) {
      showNotification(`Level Up! You are now level ${newLevel}`, 'level');
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
      setShowLevelUp(true);
      levelUpTimerRef.current = setTimeout(() => setShowLevelUp(false), 3000);
    }
    setUser(prev => prev ? ({ ...prev, xp: newXp, level: newLevel, maxXp: newMaxXp }) : null);

    supabase.from('profiles').update({ xp: newXp, level: newLevel, max_xp: newMaxXp }).eq('id', session.user.id).then(({ error }) => {
      if (error) console.error("Failed to sync XP:", error);
    });
  };

  const showNotification = (msg: string, type: 'info' | 'success' | 'level' | 'daily' = 'info') => {
    setNotification({ msg, type }); setTimeout(() => setNotification(null), 3500);
  };

  const awardGameplay = useCallback(async (
    baseXp: number,
    options: { fromVictory?: boolean; applyGameLoop?: boolean } = {}
  ) => {
    const { fromVictory = false, applyGameLoop = true } = options;
    if (!user) return;
    if (baseXp <= 0) return;

    if (!applyGameLoop) {
      await updateXP(baseXp, fromVictory);
      return;
    }

    const { nextState, reward } = rewardBus(rewardStateRef.current, { baseXp });
    rewardStateRef.current = nextState;
    setRewardTick(t => t + 1);
    saveRewardState(nextState, user.username);

    if (reward.dailyCompletedNow || reward.weeklyCompletedNow) {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      setShowConfetti(true);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 5000);
    }

    await updateXP(reward.xpAward, fromVictory);

    const rewardBits = [
      `+${reward.xpAward} XP`,
      `+${reward.goldGain} Gold`,
      reward.shardGain > 0 ? `+${reward.shardGain} Shard` : '',
      reward.crit ? '✦ CRIT' : '',
      reward.dailyCompletedNow ? 'Daily Raid Cleared!' : '',
      reward.weeklyCompletedNow ? 'Weekly Raid Cleared!' : '',
    ].filter(Boolean).join(' • ');
    showNotification(rewardBits, 'info');
  }, [user, updateXP]);

  const hubMeta = useMemo(() => {
    const rs = rewardStateRef.current;
    return {
      rank: getStudyRank(rs.totalStudyXp),
      gold: rs.gold,
      shards: rs.shards,
      combo: rs.combo,
      dailyActions: rs.dailyActions,
      dailyTarget: DAILY_TARGET,
      weeklyActions: rs.weeklyActions,
      weeklyTarget: WEEKLY_TARGET,
    };
  }, [user, rewardTick]);

  const triggerSfx = (key: string) => { setSfxTrigger(key); setTimeout(() => setSfxTrigger(null), 100); };

  // --- RENDER ---
  const renderScreen = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-screen bg-transparent text-gold-500 gap-6 animate-pulse">
        <div className="w-24 h-24 border-t-4 border-gold-500 rounded-full animate-spin"></div>
        <h2 className="font-fantasy text-3xl tracking-widest uppercase">Summoning Hero...</h2>
      </div>
    );

    if (initError) return (
      <div className="flex flex-col items-center justify-center h-screen bg-transparent text-red-500 gap-6">
        <AlertTriangle size={80} />
        <div className="text-center space-y-2"><h2 className="font-fantasy text-3xl">Realm Unreachable</h2><p className="font-mono text-sm opacity-70">{initError}</p></div>
        <FantasyButton onClick={() => window.location.reload()} variant="primary" icon={<RefreshCw size={16} />}>Reconnect</FantasyButton>
      </div>
    );

    switch (screen) {
      case 'LOGIN': return <LoginScreen session={session} onProfileCreated={(u) => { setUser(u); setScreen('HUB'); }} gameData={gameData} />;
      case 'HUB': return user ? <HubScreen user={user} progressionMeta={hubMeta} rewardState={rewardStateRef.current} onNavigate={setScreen} onLogout={async () => { await supabase.auth.signOut(); setUser(null); setSession(null); setScreen('LOGIN'); }} onOpenSettings={() => setShowSettings(true)} gameData={gameData} /> : null;
      case 'QUEST_SELECT': return user ? <QuestSelectScreen user={user} onSelectQuest={(q) => { setActiveQuest(q); setScreen('BATTLE'); }} onBack={() => setScreen('HUB')} /> : null;
      case 'BATTLE': return activeQuest && user ? <BattleScreen quest={activeQuest} user={user} telemetryUserId={session?.user?.id || null} gameData={gameData} playSfx={triggerSfx} onComplete={async (xp) => { await awardGameplay(xp, { fromVictory: true, applyGameLoop: true }); setScreen('HUB'); }} onExit={() => setScreen('HUB')} /> : null;
      case 'PROFILE': return user ? <ProfileScreen user={user} gameData={gameData} onBack={() => setScreen('HUB')} /> : null;
      case 'ADMIN': if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) return <AdminScreen onBack={() => setScreen('HUB')} />; else { setScreen('HUB'); return null; }
      case 'WORLD': return user ? (
        <WorldScreen
          user={user}
          gameData={gameData}
          initialPosition={worldPos}
          onUpdatePosition={setWorldPos}
          onBattle={(q) => { setActiveQuest(q); setScreen('BATTLE'); }}
          onGainXp={(xp) => awardGameplay(xp, { applyGameLoop: true })}
          onBack={() => setScreen('HUB')}
          exploredTiles={exploredTiles}
          setExploredTiles={setExploredTiles}
          npcs={gameData.npcs}
        />
      ) : null;
      case 'LIBRARY': return user ? <LibraryScreen user={user} onBack={() => setScreen('HUB')} onCompleteBook={(book) => { awardGameplay(book.rewardXp, { applyGameLoop: true }); }} skillTree={gameData.skillNodes} /> : null;
      case 'SPELLBOOK': return user ? <SpellbookScreen user={user} onBack={() => setScreen('HUB')} spells={gameData.spells} /> : null;
      case 'TRAINING': return user ? <TrainingScreen user={user} onTrain={(xp: number) => awardGameplay(xp, { applyGameLoop: true })} onBack={() => setScreen('HUB')} /> : null;
      case 'CUSTOMIZE': return user ? <CustomizeScreen user={user} gameData={gameData} setUser={setUser} onBack={() => setScreen('HUB')} onNotify={(msg: string) => showNotification(msg, 'info')} /> : null;
      case 'PVP_LOBBY': return user ? <PvPLobbyScreen user={user} onBack={() => setScreen('HUB')} onFindMatch={() => showNotification("Matchmaking...", "info")} /> : null;
      case 'STUDY_HUB': return user ? <StudyHub
        user={user}
        telemetryUserId={session?.user?.id || null}
        onBack={() => setScreen('HUB')}
        onNavigate={(s) => setScreen(s as any)}
        onStudyReward={(baseXp) => {
          const { nextState, reward } = rewardBus(rewardStateRef.current, { baseXp });
          rewardStateRef.current = nextState;
          setRewardTick(t => t + 1);
          saveRewardState(nextState, user.username);
          if (reward.dailyCompletedNow || reward.weeklyCompletedNow) {
            if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
            setShowConfetti(true);
            confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 5000);
          }
          // Not fromVictory — study actions don't trigger daily bonus multiplier.
          // Fire-and-forget: onStudyReward must return synchronously (RewardResult), so we can't await.
          updateXP(reward.xpAward).catch(console.error);
          return reward;
        }}
      /> : null;
      case 'CS_REFERENCE': return <CSReference onBack={() => setScreen('HUB')} />;
      case 'ALGO_VISUALIZER': return <AlgoVisualizer onBack={() => setScreen('HUB')} />;
      case 'INTERVIEW_PREP': return user ? <InterviewPrep user={user} telemetryUserId={session?.user?.id || null} onBack={() => setScreen('HUB')} onGainXp={(xp) => awardGameplay(xp, { applyGameLoop: true })} /> : null;
      case 'PROGRESS': return user ? <ProgressAnalytics user={user} telemetryUserId={session?.user?.id || null} onBack={() => setScreen('HUB')} /> : null;
      case 'SYSTEM_DESIGN': return user ? <SystemDesign user={user} onBack={() => setScreen('HUB')} onGainXp={(xp) => awardGameplay(xp, { applyGameLoop: true })} /> : null;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center px-4">
            <ParchmentPanel className="max-w-lg w-full text-center">
              <h2 className="text-2xl font-fantasy text-gold-400">This Realm Is Not Ready Yet</h2>
              <p className="mt-3 text-sm text-slate-400">This section is still being forged. Return to the hub to continue your journey.</p>
              <div className="mt-6 flex justify-center">
                <FantasyButton onClick={() => setScreen('HUB')} variant="primary">Return to Hub</FantasyButton>
              </div>
            </ParchmentPanel>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans selection:bg-gold-500 selection:text-black overflow-hidden relative">
      <AudioManager currentScreen={screen} settings={settings} sfxTrigger={sfxTrigger} />
      <ParticleSystem type="levelup" active={showLevelUp} />
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      {/* Fantasy world atmosphere */}
      <div className="fixed inset-0 fantasy-world-bg pointer-events-none z-0"></div>
      <div className="fixed inset-0 fantasy-aurora pointer-events-none z-0"></div>
      <div className="fixed inset-0 fantasy-celestial pointer-events-none z-0"></div>
      <div className="fixed inset-0 fantasy-mist pointer-events-none z-0"></div>
      <div className="fixed inset-0 fantasy-runes pointer-events-none z-0"></div>
      {/* Vignette overlay */}
      <div className="fixed inset-0 vignette pointer-events-none z-[1]"></div>
      <div className="fixed inset-0 pointer-events-none z-[1] bg-gradient-to-b from-obsidian-950/25 via-transparent to-obsidian-950/35"></div>

      {/* Main content with transitions */}
      <AnimatePresence mode="wait">
        <div key={screen}>
          {renderScreen()}
        </div>
      </AnimatePresence>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          settings={settings}
          setSettings={setSettings}
          onLogout={async () => {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setScreen('LOGIN');
            setShowSettings(false);
          }}
        />
      )}

      {notification && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-lg font-bold shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-pop-in z-[200] border-2 backdrop-blur-md flex items-center gap-4 ${
          notification.type === 'level' ? 'bg-gold-500 text-black border-white' 
          : notification.type === 'daily' ? 'bg-cyan-900/90 text-cyan-100 border-cyan-400' 
          : 'bg-slate-900 text-gold-400 border-gold-500'
        }`}>
          <div className="text-xl">{notification.msg}</div>
        </div>
      )}
    </div>
  );
};

export default App;
