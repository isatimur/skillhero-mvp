
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, Target, Star, BookOpen, Sword, Brain,
  Clock, Flame, Trophy, Award, ChevronRight, Zap, Crown
} from 'lucide-react';
import { User, SETopic } from '../types';
import { SE_TOPICS, LIBRARY_BOOKS, QUESTS, getTopicsPracticed } from '../constants';
import { LiquidBar } from './ui';
import { getStreak } from '../lib/streak';
import { readBufferedAttempts } from '../lib/learningTelemetry';

interface ProgressAnalyticsProps {
  user: User;
  onBack: () => void;
  telemetryUserId?: string | null;
}

// ============================================================================
// RADAR CHART (CSS-based)
// ============================================================================

const RadarChart: React.FC<{ topics: SETopic[]; masteryByTopic: Record<string, number>; practiced: SETopic[] }> = ({ topics, masteryByTopic, practiced }) => {
  const size = 240;
  const center = size / 2;
  const maxRadius = size / 2 - 30;
  const topicsToShow = topics.slice(0, 8); // Show 8 for clean radar
  const angleStep = (2 * Math.PI) / topicsToShow.length;

  const getPoint = (index: number, radius: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Build polygon points for the filled area
  const dataPoints = topicsToShow.map((topic, i) => {
    const fallback = practiced.includes(topic) ? 0.55 : 0.08;
    const value = masteryByTopic[topic] ?? fallback;
    return getPoint(i, maxRadius * value);
  });

  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map(level => (
          <polygon
            key={level}
            points={topicsToShow.map((_, i) => {
              const p = getPoint(i, maxRadius * level);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {topicsToShow.map((_, i) => {
          const p = getPoint(i, maxRadius);
          return (
            <line key={i} x1={center} y1={center} x2={p.x} y2={p.y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          );
        })}

        {/* Data area */}
        <motion.polygon
          points={polygonPoints}
          fill="rgba(251,191,36,0.15)"
          stroke="rgba(251,191,36,0.6)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x} cy={p.y} r={3}
            fill={practiced.includes(topicsToShow[i]) ? '#fbbf24' : '#334155'}
            stroke={practiced.includes(topicsToShow[i]) ? '#fbbf24' : '#475569'}
            strokeWidth="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 * i }}
          />
        ))}

        {/* Labels */}
        {topicsToShow.map((topic, i) => {
          const p = getPoint(i, maxRadius + 18);
          return (
            <text
              key={topic}
              x={p.x} y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500"
              style={{ fontSize: '8px', fontFamily: 'monospace' }}
            >
              {topic.split(' ')[0].slice(0, 8)}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// ============================================================================
// STAT CARD
// ============================================================================

const StatCard: React.FC<{
  label: string; value: string | number; icon: React.ReactNode;
  color: string; subtitle?: string; delay?: number
}> = ({ label, value, icon, color, subtitle, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-4 rounded-xl bg-gradient-to-b from-obsidian-800 to-[#0c0c14] border border-gold-600/15 hover:border-gold-500/30 transition-all group ornament-corners"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-black/30 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-mono">{value}</div>
        <div className="text-[10px] text-gold-500/60 uppercase font-bold tracking-wider">{label}</div>
        {subtitle && <div className="text-[10px] text-slate-600 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  </motion.div>
);

// ============================================================================
// TOPIC MASTERY BAR
// ============================================================================

const TopicBar: React.FC<{ topic: SETopic; mastery: number; index: number }> = ({ topic, mastery, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.03 * index }}
    className="flex items-center gap-3"
  >
    <div className="w-24 sm:w-32 text-[10px] font-bold text-slate-500 truncate text-right">{topic}</div>
    <div className="flex-1 h-3 bg-obsidian-900/60 rounded-full overflow-hidden border border-gold-600/10">
      <motion.div
        className={`h-full rounded-full ${mastery >= 0.4
          ? 'bg-gradient-to-r from-gold-500 to-amber-400'
          : 'bg-slate-800'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(5, Math.round(mastery * 100))}%` }}
        transition={{ duration: 0.8, delay: 0.05 * index }}
      />
    </div>
    <div className={`w-12 text-[10px] font-mono ${mastery >= 0.4 ? 'text-gold-400' : 'text-slate-700'}`}>
      {Math.round(mastery * 100)}%
    </div>
  </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ user, onBack, telemetryUserId }) => {
  const topicsPracticed = useMemo(() => getTopicsPracticed(user.completedQuests, user.completedBooks), [user]);
  const streak = getStreak();
  const [topicAttemptStats, setTopicAttemptStats] = useState<Record<string, { attempts: number; correct: number; avgResponseMs: number }>>({});

  useEffect(() => {
    const loadTelemetry = () => {
      const buffered = readBufferedAttempts(2000);
      const agg: Record<string, { attempts: number; correct: number; responseSum: number; responseCount: number }> = {};
      for (const row of buffered) {
        if (!row.topic) continue;
        if (!agg[row.topic]) {
          agg[row.topic] = { attempts: 0, correct: 0, responseSum: 0, responseCount: 0 };
        }
        agg[row.topic].attempts += 1;
        if (row.isCorrect) agg[row.topic].correct += 1;
        if (typeof row.responseMs === 'number' && row.responseMs > 0) {
          agg[row.topic].responseSum += row.responseMs;
          agg[row.topic].responseCount += 1;
        }
      }

      const normalized: Record<string, { attempts: number; correct: number; avgResponseMs: number }> = {};
      for (const [topic, value] of Object.entries(agg)) {
        normalized[topic] = {
          attempts: value.attempts,
          correct: value.correct,
          avgResponseMs: value.responseCount > 0 ? Math.round(value.responseSum / value.responseCount) : 0,
        };
      }
      setTopicAttemptStats(normalized);
    };

    loadTelemetry();
  }, [telemetryUserId]);

  // Computed stats
  const totalTopics = SE_TOPICS.length;
  const completionPercent = Math.round((topicsPracticed.length / totalTopics) * 100);
  const totalQuestsAvailable = QUESTS.length;
  const totalBooksAvailable = LIBRARY_BOOKS.length;
  const questCompletionPercent = totalQuestsAvailable > 0 ? Math.round((user.completedQuests.length / totalQuestsAvailable) * 100) : 0;
  const bookCompletionPercent = totalBooksAvailable > 0 ? Math.round((user.completedBooks.length / totalBooksAvailable) * 100) : 0;

  // XP estimation
  const totalXpEarned = useMemo(() => {
    let xp = user.xp;
    let level = user.level;
    let maxXp = user.maxXp;
    // Reverse engineer total XP from level
    for (let l = level - 1; l >= 1; l--) {
      maxXp = Math.round(maxXp / 1.5);
      xp += maxXp;
    }
    return xp;
  }, [user]);

  // Rank based on level
  const rank = user.level >= 10 ? 'Legend' : user.level >= 7 ? 'Expert' : user.level >= 4 ? 'Adept' : 'Initiate';
  const rankColor = user.level >= 10 ? 'text-gold-400' : user.level >= 7 ? 'text-purple-400' : user.level >= 4 ? 'text-blue-400' : 'text-slate-400';

  const masteryByTopic = useMemo(() => {
    const mastery: Record<string, number> = {};
    for (const topic of SE_TOPICS) {
      const stat = topicAttemptStats[topic];
      if (!stat) {
        mastery[topic] = topicsPracticed.includes(topic) ? 0.55 : 0.08;
        continue;
      }
      const accuracy = stat.attempts > 0 ? stat.correct / stat.attempts : 0;
      const speed = stat.avgResponseMs > 0 ? Math.max(0, Math.min(1, 1 - stat.avgResponseMs / 30000)) : 0.5;
      const attemptsWeight = Math.min(1, stat.attempts / 20);
      const value = 0.15 + (accuracy * 0.6 + speed * 0.2) * attemptsWeight;
      mastery[topic] = Math.max(0.05, Math.min(1, value));
    }
    return mastery;
  }, [topicAttemptStats, topicsPracticed]);

  const strongestTopic = useMemo(() => {
    let best: SETopic | 'None yet' = 'None yet';
    let bestValue = -1;
    for (const topic of SE_TOPICS) {
      const value = masteryByTopic[topic] ?? 0;
      if (value > bestValue) {
        best = topic;
        bestValue = value;
      }
    }
    return best;
  }, [masteryByTopic]);

  return (
    <div className="min-h-screen bg-transparent text-slate-200 relative">
      <div className="fixed inset-0 bg-gradient-to-b from-obsidian-900/20 via-obsidian-950/20 to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-stardust opacity-5 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-4 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onBack}
            className="p-2 rounded-xl bg-obsidian-800/60 border border-gold-600/15 text-slate-400 hover:text-gold-400 transition-all">
            <ArrowLeft size={18} />
          </motion.button>
          <h1 className="text-lg font-fantasy text-gold-400 flex items-center gap-2">
            <TrendingUp size={16} /> Progress Analytics
          </h1>
          <div className="w-10" />
        </div>

        {/* Hero Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-obsidian-800/90 to-obsidian-900/90 border border-gold-500/20 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center">
              <Crown size={24} className="text-gold-400" />
            </div>
            <div>
              <h2 className="text-xl font-fantasy text-white">{user.username}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">Level {user.level}</span>
                <span className="text-xs font-mono text-slate-700">&middot;</span>
                <span className={`text-xs font-bold ${rankColor}`}>{rank}</span>
              </div>
            </div>
          </div>

          <LiquidBar current={user.xp} max={user.maxXp} color="gold" label="XP to Next Level" size="md" />

          {/* Mini stats row */}
          <div className="flex justify-between mt-4 pt-4 border-t border-gold-600/15">
            <div className="text-center">
              <div className="text-lg font-bold text-white font-mono">{totalXpEarned.toLocaleString()}</div>
              <div className="text-[9px] text-slate-600 uppercase font-bold">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white font-mono">{streak}</div>
              <div className="text-[9px] text-slate-600 uppercase font-bold">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white font-mono">{completionPercent}%</div>
              <div className="text-[9px] text-slate-600 uppercase font-bold">Mastery</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white font-mono">{user.completedQuests.length + user.completedBooks.length}</div>
              <div className="text-[9px] text-slate-600 uppercase font-bold">Activities</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Quests Done" value={user.completedQuests.length} icon={<Sword size={18} />} color="text-red-400" subtitle={`${questCompletionPercent}% of ${totalQuestsAvailable}`} delay={0.1} />
          <StatCard label="Books Read" value={user.completedBooks.length} icon={<BookOpen size={18} />} color="text-blue-400" subtitle={`${bookCompletionPercent}% of ${totalBooksAvailable}`} delay={0.15} />
          <StatCard label="Topics Covered" value={`${topicsPracticed.length}/${totalTopics}`} icon={<Brain size={18} />} color="text-emerald-400" subtitle={`${completionPercent}% coverage`} delay={0.2} />
          <StatCard label="Strongest Topic" value={typeof strongestTopic === 'string' ? strongestTopic.split(' ')[0] : ''} icon={<Star size={18} />} color="text-gold-400" delay={0.25} />
        </div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-obsidian-800/40 border border-gold-600/15 mb-6"
        >
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Target size={14} className="text-gold-400" />
            Skill Radar
          </h3>
          <RadarChart topics={SE_TOPICS} practiced={topicsPracticed} masteryByTopic={masteryByTopic} />
        </motion.div>

        {/* Topic Mastery Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-obsidian-800/40 border border-gold-600/15 mb-6"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Brain size={14} className="text-emerald-400" />
            Topic Mastery
          </h3>
          <div className="space-y-2">
            {SE_TOPICS.map((topic, i) => (
              <TopicBar key={topic} topic={topic} mastery={masteryByTopic[topic] ?? 0.08} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Completion Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-2xl bg-obsidian-800/40 border border-gold-600/15"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={14} className="text-gold-400" />
            Completion Milestones
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Study 5 Topics', current: topicsPracticed.length, target: 5, icon: <Brain size={14} /> },
              { label: 'Complete 3 Quests', current: user.completedQuests.length, target: 3, icon: <Sword size={14} /> },
              { label: 'Read All Books', current: user.completedBooks.length, target: totalBooksAvailable, icon: <BookOpen size={14} /> },
              { label: 'Reach Level 10', current: user.level, target: 10, icon: <Star size={14} /> },
              { label: 'Master All Topics', current: topicsPracticed.length, target: totalTopics, icon: <Award size={14} /> },
            ].map((milestone, i) => {
              const percent = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
              const done = percent >= 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-obsidian-900/40 text-slate-600'}`}>
                    {done ? <Trophy size={14} /> : milestone.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${done ? 'text-emerald-400' : 'text-slate-400'}`}>{milestone.label}</span>
                      <span className="text-[10px] font-mono text-slate-600">{milestone.current}/{milestone.target}</span>
                    </div>
                    <div className="h-1.5 bg-obsidian-900/60 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-gold-500/60'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
