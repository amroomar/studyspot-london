/**
 * PomodoroPage — Gamified Study Timer
 * Features:
 * - Animated circular progress ring
 * - 25/5 Pomodoro cycles with custom durations
 * - XP system with levels and streaks
 * - Location linking (feeds into busyness graph)
 * - Study session stats
 * - Achievement badges
 * - London Fog aesthetic
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer, Play, Pause, RotateCcw, Coffee, BookOpen, Flame, Trophy,
  Zap, Star, Target, ChevronRight, ArrowLeft, MapPin, Volume2,
  VolumeX, Settings, X, Crown, Sparkles, TrendingUp, Clock,
  CheckCircle2, Award, Users
} from 'lucide-react';
import { useLiveVibe, type VibeStatus } from '@/contexts/LiveVibeContext';
import { locations as londonLocations, type Location } from '@/lib/locations';
import { bristolLocations } from '@/lib/bristolLocations';
import { saveActiveTimer, clearActiveTimer } from '@/components/FloatingTimer';
import { trpc } from '@/lib/trpc';

// ─── Types ───────────────────────────────────────────────────────────
type TimerMode = 'focus' | 'break' | 'long-break';
type TimerState = 'idle' | 'running' | 'paused';

interface StudySession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  locationId: number | null;
  locationName: string | null;
  xpEarned: number;
  mode: TimerMode;
}

interface PomodoroStats {
  totalSessions: number;
  totalMinutes: number;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  sessionsToday: number;
  minutesToday: number;
  achievements: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: PomodoroStats) => boolean;
}

// ─── Constants ───────────────────────────────────────────────────────
const TIMER_PRESETS: Record<TimerMode, number> = {
  focus: 25,
  break: 5,
  'long-break': 15,
};

const XP_PER_FOCUS = 50;
const XP_PER_BREAK = 10;
const STREAK_BONUS_XP = 25;
const SESSIONS_FOR_LONG_BREAK = 4;

function getLevel(xp: number): number {
  // Level formula: each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 2000) return 5;
  if (xp < 3500) return 6;
  if (xp < 5500) return 7;
  if (xp < 8000) return 8;
  if (xp < 11000) return 9;
  return 10 + Math.floor((xp - 11000) / 5000);
}

function getXPForLevel(level: number): number {
  const thresholds = [0, 0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];
  if (level <= 10) return thresholds[level] || 0;
  return 11000 + (level - 10) * 5000;
}

function getLevelTitle(level: number): string {
  const titles = [
    '', 'Freshman', 'Bookworm', 'Scholar', 'Researcher',
    'Academic', 'Professor', 'Dean', 'Chancellor', 'Sage', 'Grandmaster'
  ];
  if (level <= 10) return titles[level] || 'Legend';
  return 'Legend';
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-session', name: 'First Focus', description: 'Complete your first study session', icon: '🎯', requirement: s => s.totalSessions >= 1 },
  { id: 'five-sessions', name: 'Getting Started', description: 'Complete 5 study sessions', icon: '📖', requirement: s => s.totalSessions >= 5 },
  { id: 'marathon', name: 'Study Marathon', description: 'Study for 2+ hours in one day', icon: '🏃', requirement: s => s.minutesToday >= 120 },
  { id: 'streak-3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥', requirement: s => s.currentStreak >= 3 },
  { id: 'streak-7', name: 'Unstoppable', description: 'Maintain a 7-day streak', icon: '⚡', requirement: s => s.currentStreak >= 7 },
  { id: 'level-5', name: 'Academic', description: 'Reach Level 5', icon: '🎓', requirement: s => s.level >= 5 },
  { id: 'level-10', name: 'Grandmaster', description: 'Reach Level 10', icon: '👑', requirement: s => s.level >= 10 },
  { id: 'ten-hours', name: 'Dedicated', description: 'Study for 10 total hours', icon: '⏰', requirement: s => s.totalMinutes >= 600 },
  { id: 'fifty-sessions', name: 'Veteran', description: 'Complete 50 study sessions', icon: '🏆', requirement: s => s.totalSessions >= 50 },
  { id: 'century', name: 'Century', description: 'Earn 100 total XP', icon: '💯', requirement: s => s.totalXP >= 100 },
  { id: 'thousand-xp', name: 'XP Master', description: 'Earn 1000 total XP', icon: '✨', requirement: s => s.totalXP >= 1000 },
  { id: 'five-today', name: 'Power Day', description: 'Complete 5 sessions in one day', icon: '💪', requirement: s => s.sessionsToday >= 5 },
];

// ─── Storage ─────────────────────────────────────────────────────────
const STATS_KEY = 'studyspot-pomodoro-stats';
const SESSIONS_KEY = 'studyspot-pomodoro-sessions';

function loadStats(): PomodoroStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return {
    totalSessions: 0, totalMinutes: 0, totalXP: 0, level: 1,
    currentStreak: 0, longestStreak: 0, lastSessionDate: null,
    sessionsToday: 0, minutesToday: 0, achievements: [],
  };
}

function saveStats(stats: PomodoroStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function loadSessions(): StudySession[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveSessions(sessions: StudySession[]) {
  // Keep last 100 sessions
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 100)));
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function isYesterday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
}

// ─── Sound ───────────────────────────────────────────────────────────
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    // Second tone
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 1);
    }, 300);
  } catch {}
}

// ─── Circular Progress Ring ──────────────────────────────────────────
function TimerRing({
  progress,
  mode,
  timeLeft,
  totalTime,
  state,
}: {
  progress: number;
  mode: TimerMode;
  timeLeft: number;
  totalTime: number;
  state: TimerState;
}) {
  const size = 280;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const ringColor = mode === 'focus'
    ? 'stroke-fog-sage'
    : mode === 'break'
    ? 'stroke-blue-400'
    : 'stroke-purple-400';

  const glowColor = mode === 'focus'
    ? 'rgba(120, 160, 100, 0.3)'
    : mode === 'break'
    ? 'rgba(96, 165, 250, 0.3)'
    : 'rgba(167, 139, 250, 0.3)';

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <div
        className="absolute rounded-full transition-all duration-1000"
        style={{
          width: size + 40,
          height: size + 40,
          background: state === 'running'
            ? `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
            : 'transparent',
          filter: state === 'running' ? 'blur(20px)' : 'none',
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Outer ring decoration */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 6}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-border/20"
        />
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/15"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${ringColor} transition-all duration-1000 ease-linear`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
        {/* Tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
          const isMajor = i % 5 === 0;
          const innerR = radius - (isMajor ? 14 : 8);
          const outerR = radius - 4;
          return (
            <line
              key={i}
              x1={size / 2 + innerR * Math.cos(angle)}
              y1={size / 2 + innerR * Math.sin(angle)}
              x2={size / 2 + outerR * Math.cos(angle)}
              y2={size / 2 + outerR * Math.sin(angle)}
              stroke="currentColor"
              strokeWidth={isMajor ? 2 : 0.8}
              className={isMajor ? 'text-muted-foreground/40' : 'text-muted-foreground/15'}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">
          {mode === 'focus' ? 'Focus' : mode === 'break' ? 'Break' : 'Long Break'}
        </div>
        <div
          className="text-6xl font-light tabular-nums tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {state === 'running' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-2 w-2 h-2 rounded-full bg-fog-sage"
          />
        )}
      </div>
    </div>
  );
}

// ─── XP Bar ──────────────────────────────────────────────────────────
function XPBar({ stats }: { stats: PomodoroStats }) {
  const currentLevelXP = getXPForLevel(stats.level);
  const nextLevelXP = getXPForLevel(stats.level + 1);
  const xpInLevel = stats.totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = xpNeeded > 0 ? Math.min(xpInLevel / xpNeeded, 1) : 1;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-fog-gold/20 flex items-center justify-center">
            <Crown className="w-4 h-4 text-fog-gold" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Level {stats.level}</span>
            <span className="text-xs text-muted-foreground ml-1.5">{getLevelTitle(stats.level)}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
          {stats.totalXP} XP
        </span>
      </div>
      <div className="h-2.5 bg-border/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-fog-sage to-fog-gold"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">{xpInLevel} / {xpNeeded} XP</span>
        <span className="text-[10px] text-muted-foreground">Next: Level {stats.level + 1}</span>
      </div>
    </div>
  );
}

// ─── Location Picker ─────────────────────────────────────────────────
function LocationPicker({
  selectedId,
  onSelect,
  onClose,
}: {
  selectedId: number | null;
  onSelect: (id: number | null, name: string | null) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'curated' | 'community'>('curated');
  const curatedLocations = useMemo(() => [...londonLocations, ...bristolLocations], []);

  // Fetch community-submitted spots via tRPC
  const { data: communitySpots } = trpc.submissions.list.useQuery(undefined, {
    staleTime: 60_000,
  });

  const filteredCurated = useMemo(() => {
    if (!search) return curatedLocations.slice(0, 20);
    const q = search.toLowerCase();
    return curatedLocations
      .filter(l => l.name.toLowerCase().includes(q) || l.neighborhood.toLowerCase().includes(q))
      .slice(0, 20);
  }, [search, curatedLocations]);

  const filteredCommunity = useMemo(() => {
    if (!communitySpots) return [];
    const spots = communitySpots as { id: number; name: string; neighborhood: string; category: string; submittedBy: string }[];
    if (!search) return spots.slice(0, 20);
    const q = search.toLowerCase();
    return spots
      .filter(s => s.name.toLowerCase().includes(q) || s.neighborhood.toLowerCase().includes(q))
      .slice(0, 20);
  }, [search, communitySpots]);

  const communityCount = communitySpots?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={e => e.stopPropagation()}
        className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col border border-border/50"
      >
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Link to Study Spot
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search locations..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mb-3"
            autoFocus
          />
          {/* Section toggle: Curated vs Community */}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
            <button
              onClick={() => setActiveSection('curated')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeSection === 'curated'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapPin className="w-3 h-3" />
              Curated ({curatedLocations.length})
            </button>
            <button
              onClick={() => setActiveSection('community')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeSection === 'community'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-3 h-3" />
              Community ({communityCount})
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {/* No location option */}
          <button
            onClick={() => { onSelect(null, null); onClose(); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
              selectedId === null ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
            }`}
          >
            <span className="font-medium">No location</span>
            <span className="text-xs text-muted-foreground ml-2">— Study anywhere</span>
          </button>

          {activeSection === 'curated' && filteredCurated.map(loc => (
            <button
              key={`curated-${loc.id}`}
              onClick={() => { onSelect(loc.id, loc.name); onClose(); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selectedId === loc.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
            >
              <div className="font-medium">{loc.name}</div>
              <div className="text-xs text-muted-foreground">{loc.neighborhood} · {loc.category}</div>
            </button>
          ))}

          {activeSection === 'community' && (
            <>
              {filteredCommunity.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No community spots yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Submit a spot to see it here!</p>
                </div>
              ) : (
                filteredCommunity.map(spot => (
                  <button
                    key={`community-${spot.id}`}
                    onClick={() => { onSelect(spot.id + 100000, spot.name); onClose(); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedId === spot.id + 100000 ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{spot.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-fog-sage/10 text-fog-sage font-medium">Community</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{spot.neighborhood} · {spot.category}</div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Stats Card ──────────────────────────────────────────────────────
function StatsCard({ stats, sessions }: { stats: PomodoroStats; sessions: StudySession[] }) {
  const todaySessions = sessions.filter(s => isToday(s.startTime));

  return (
    <div className="space-y-4">
      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border/50 p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.sessionsToday}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessions</div>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.minutesToday}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Minutes</div>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-foreground">{stats.currentStreak}</span>
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</div>
        </div>
      </div>

      {/* All-time Stats */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <TrendingUp className="w-4 h-4 text-fog-sage" />
          All Time
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{stats.totalSessions} sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-fog-gold" />
            <span className="text-muted-foreground">{stats.totalXP} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-muted-foreground">Best: {stats.longestStreak} days</span>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {todaySessions.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Today's Sessions
          </h3>
          <div className="space-y-2">
            {todaySessions.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {s.mode === 'focus' ? (
                    <BookOpen className="w-3.5 h-3.5 text-fog-sage" />
                  ) : (
                    <Coffee className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span className="text-muted-foreground">
                    {s.duration}min {s.mode === 'focus' ? 'focus' : 'break'}
                  </span>
                  {s.locationName && (
                    <span className="text-xs text-muted-foreground/60">@ {s.locationName}</span>
                  )}
                </div>
                <span className="text-xs text-fog-gold font-medium">+{s.xpEarned} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Achievements Panel ──────────────────────────────────────────────
function AchievementsPanel({ stats }: { stats: PomodoroStats }) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
        <Award className="w-4 h-4 text-fog-gold" />
        Achievements
        <span className="text-xs text-muted-foreground ml-auto">
          {stats.achievements.length}/{ACHIEVEMENTS.length}
        </span>
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {ACHIEVEMENTS.map(a => {
          const unlocked = stats.achievements.includes(a.id);
          return (
            <div
              key={a.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all ${
                unlocked
                  ? 'bg-fog-gold/10 border border-fog-gold/20'
                  : 'bg-secondary/30 opacity-40'
              }`}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-[10px] font-medium leading-tight">{a.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── XP Popup ────────────────────────────────────────────────────────
function XPPopup({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.8 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-card border border-fog-gold/30 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <Sparkles className="w-6 h-6 text-fog-gold" />
        </motion.div>
        <div>
          <div className="text-lg font-bold text-fog-gold" style={{ fontFamily: 'var(--font-mono)' }}>
            +{xp} XP
          </div>
          <div className="text-xs text-muted-foreground">Session complete!</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Settings Panel ──────────────────────────────────────────────────
function SettingsPanel({
  focusDuration,
  breakDuration,
  longBreakDuration,
  soundEnabled,
  onFocusChange,
  onBreakChange,
  onLongBreakChange,
  onSoundToggle,
  onClose,
}: {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  soundEnabled: boolean;
  onFocusChange: (d: number) => void;
  onBreakChange: (d: number) => void;
  onLongBreakChange: (d: number) => void;
  onSoundToggle: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={e => e.stopPropagation()}
        className="bg-card w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl border border-border/50 p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Timer Settings</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Focus Duration</label>
            <div className="flex items-center gap-3">
              {[15, 25, 30, 45, 60].map(d => (
                <button
                  key={d}
                  onClick={() => onFocusChange(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    focusDuration === d
                      ? 'bg-fog-sage text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Break Duration</label>
            <div className="flex items-center gap-3">
              {[3, 5, 10].map(d => (
                <button
                  key={d}
                  onClick={() => onBreakChange(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    breakDuration === d
                      ? 'bg-blue-500 text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Long Break Duration</label>
            <div className="flex items-center gap-3">
              {[10, 15, 20, 30].map(d => (
                <button
                  key={d}
                  onClick={() => onLongBreakChange(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    longBreakDuration === d
                      ? 'bg-purple-500 text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">Sound Notifications</span>
            <button
              onClick={onSoundToggle}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled ? 'bg-fog-sage/20 text-fog-sage' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Pomodoro Page ──────────────────────────────────────────────
export default function PomodoroPage() {
  const { checkIn } = useLiveVibe();
  const [location] = useLocation();

  // Timer state
  const [mode, setMode] = useState<TimerMode>('focus');
  const [state, setState] = useState<TimerState>('idle');
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Location linking
  const [linkedLocationId, setLinkedLocationId] = useState<number | null>(null);
  const [linkedLocationName, setLinkedLocationName] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // UI state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showXPPopup, setShowXPPopup] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'timer' | 'stats' | 'achievements'>('timer');

  // Stats
  const [stats, setStats] = useState<PomodoroStats>(loadStats);
  const [sessions, setSessions] = useState<StudySession[]>(loadSessions);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<string | null>(null);

  // Calculate total time for current mode
  const totalTime = useMemo(() => {
    if (mode === 'focus') return focusDuration * 60;
    if (mode === 'break') return breakDuration * 60;
    return longBreakDuration * 60;
  }, [mode, focusDuration, breakDuration, longBreakDuration]);

  const progress = totalTime > 0 ? 1 - (timeLeft / totalTime) : 0;

  // Refresh today's stats on mount
  useEffect(() => {
    setStats(prev => {
      const todaySessions = sessions.filter(s => isToday(s.startTime));
      const updated = {
        ...prev,
        sessionsToday: todaySessions.filter(s => s.mode === 'focus').length,
        minutesToday: todaySessions.reduce((sum, s) => sum + s.duration, 0),
        level: getLevel(prev.totalXP),
      };
      // Check streak
      if (prev.lastSessionDate) {
        if (!isToday(prev.lastSessionDate) && !isYesterday(prev.lastSessionDate)) {
          updated.currentStreak = 0;
        }
      }
      return updated;
    });
  }, [sessions]);

  // Timer tick
  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(intervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  // Update document title with timer
  useEffect(() => {
    if (state === 'running' || state === 'paused') {
      const m = Math.floor(timeLeft / 60);
      const s = timeLeft % 60;
      document.title = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} — StudySpot Timer`;
    } else {
      document.title = 'Study Timer — StudySpot';
    }
    return () => { document.title = 'StudySpot'; };
  }, [timeLeft, state]);

  // Persist active timer state for the FloatingTimer widget
  useEffect(() => {
    if (state === 'running' || state === 'paused') {
      saveActiveTimer({
        mode,
        state,
        timeLeft,
        totalTime,
        lastTick: Date.now(),
        linkedLocationName,
      });
    } else {
      clearActiveTimer();
    }
  }, [state, mode, timeLeft, totalTime, linkedLocationName]);

  const handleTimerComplete = useCallback(() => {
    if (soundEnabled) playNotificationSound();
    setState('idle');

    const now = new Date().toISOString();
    const duration = mode === 'focus' ? focusDuration : mode === 'break' ? breakDuration : longBreakDuration;

    // Calculate XP
    let xp = mode === 'focus' ? XP_PER_FOCUS : XP_PER_BREAK;

    // Create session record
    const session: StudySession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      startTime: sessionStartRef.current || now,
      endTime: now,
      duration,
      locationId: linkedLocationId,
      locationName: linkedLocationName,
      xpEarned: xp,
      mode,
    };

    // Feed into busyness graph if location is linked and it was a focus session
    if (mode === 'focus' && linkedLocationId) {
      // Map focus duration to vibe status
      let vibe: VibeStatus = 'good-vibe';
      if (duration >= 45) vibe = 'moderate';
      if (duration >= 60) vibe = 'very-busy';
      checkIn(linkedLocationId, vibe);
    }

    // Update sessions
    const newSessions = [session, ...sessions];
    setSessions(newSessions);
    saveSessions(newSessions);

    // Update stats
    setStats(prev => {
      const isNewDay = !prev.lastSessionDate || !isToday(prev.lastSessionDate);
      const streakContinues = prev.lastSessionDate && (isToday(prev.lastSessionDate) || isYesterday(prev.lastSessionDate));

      let newStreak = prev.currentStreak;
      if (isNewDay && streakContinues) {
        newStreak = prev.currentStreak + 1;
        xp += STREAK_BONUS_XP; // Streak bonus
      } else if (isNewDay && !streakContinues) {
        newStreak = 1;
      }

      const todaySessions = newSessions.filter(s => isToday(s.startTime));

      const updated: PomodoroStats = {
        ...prev,
        totalSessions: prev.totalSessions + (mode === 'focus' ? 1 : 0),
        totalMinutes: prev.totalMinutes + duration,
        totalXP: prev.totalXP + xp,
        level: getLevel(prev.totalXP + xp),
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastSessionDate: now,
        sessionsToday: todaySessions.filter(s => s.mode === 'focus').length,
        minutesToday: todaySessions.reduce((sum, s) => sum + s.duration, 0),
        achievements: [...prev.achievements],
      };

      // Check achievements
      ACHIEVEMENTS.forEach(a => {
        if (!updated.achievements.includes(a.id) && a.requirement(updated)) {
          updated.achievements.push(a.id);
        }
      });

      saveStats(updated);
      return updated;
    });

    // Show XP popup
    setShowXPPopup(xp);

    // Auto-advance to next mode
    if (mode === 'focus') {
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);
      if (newCompleted % SESSIONS_FOR_LONG_BREAK === 0) {
        setMode('long-break');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('break');
        setTimeLeft(breakDuration * 60);
      }
    } else {
      setMode('focus');
      setTimeLeft(focusDuration * 60);
    }
  }, [mode, focusDuration, breakDuration, longBreakDuration, soundEnabled, linkedLocationId, linkedLocationName, sessions, completedPomodoros, checkIn, stats]);

  const handleStart = () => {
    sessionStartRef.current = new Date().toISOString();
    setState('running');
  };

  const handlePause = () => setState('paused');
  const handleResume = () => setState('running');

  const handleReset = () => {
    setState('idle');
    setTimeLeft(
      mode === 'focus' ? focusDuration * 60 :
      mode === 'break' ? breakDuration * 60 :
      longBreakDuration * 60
    );
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    if (state === 'running') return; // Don't switch while running
    setMode(newMode);
    setState('idle');
    setTimeLeft(
      newMode === 'focus' ? focusDuration * 60 :
      newMode === 'break' ? breakDuration * 60 :
      longBreakDuration * 60
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-fog-sage" />
              <h1 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                Study Timer
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Streak indicator */}
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">
                <Flame className="w-3.5 h-3.5" />
                {stats.currentStreak}
              </div>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6 pb-24 lg:pb-8">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1 mb-6 max-w-sm mx-auto">
          {(['timer', 'stats', 'achievements'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'timer' ? 'Timer' : tab === 'stats' ? 'Stats' : 'Awards'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto"
            >
              {/* XP Bar */}
              <div className="mb-6">
                <XPBar stats={stats} />
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-2 justify-center mb-8">
                <button
                  onClick={() => handleModeSwitch('focus')}
                  disabled={state === 'running'}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    mode === 'focus'
                      ? 'bg-fog-sage/20 text-fog-sage border border-fog-sage/30'
                      : 'text-muted-foreground hover:bg-secondary disabled:opacity-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Focus
                </button>
                <button
                  onClick={() => handleModeSwitch('break')}
                  disabled={state === 'running'}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    mode === 'break'
                      ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                      : 'text-muted-foreground hover:bg-secondary disabled:opacity-50'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  Break
                </button>
                <button
                  onClick={() => handleModeSwitch('long-break')}
                  disabled={state === 'running'}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    mode === 'long-break'
                      ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30'
                      : 'text-muted-foreground hover:bg-secondary disabled:opacity-50'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  Long Break
                </button>
              </div>

              {/* Timer Ring */}
              <div className="flex justify-center mb-8">
                <TimerRing
                  progress={progress}
                  mode={mode}
                  timeLeft={timeLeft}
                  totalTime={totalTime}
                  state={state}
                />
              </div>

              {/* Pomodoro Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {Array.from({ length: SESSIONS_FOR_LONG_BREAK }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < (completedPomodoros % SESSIONS_FOR_LONG_BREAK)
                        ? 'bg-fog-sage scale-110'
                        : 'bg-border/40'
                    }`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  {completedPomodoros % SESSIONS_FOR_LONG_BREAK}/{SESSIONS_FOR_LONG_BREAK} until long break
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={handleReset}
                  disabled={state === 'idle' && timeLeft === totalTime}
                  className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground disabled:opacity-30 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {state === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fog-sage to-fog-sage/80 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Play className="w-7 h-7 ml-0.5" />
                  </motion.button>
                )}

                {state === 'running' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePause}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg"
                  >
                    <Pause className="w-7 h-7" />
                  </motion.button>
                )}

                {state === 'paused' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResume}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fog-sage to-fog-sage/80 text-white flex items-center justify-center shadow-lg"
                  >
                    <Play className="w-7 h-7 ml-0.5" />
                  </motion.button>
                )}

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3 rounded-xl transition-all ${
                    soundEnabled
                      ? 'bg-fog-sage/10 text-fog-sage'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {/* Location Link */}
              <button
                onClick={() => setShowLocationPicker(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
              >
                <MapPin className={`w-5 h-5 ${linkedLocationId ? 'text-fog-sage' : 'text-muted-foreground'}`} />
                <div className="flex-1 text-left">
                  {linkedLocationName ? (
                    <>
                      <div className="text-sm font-medium">{linkedLocationName}</div>
                      <div className="text-xs text-muted-foreground">Session feeds into busyness data</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">Link to a study spot</div>
                      <div className="text-xs text-muted-foreground/60">Feed your sessions into the busyness graph</div>
                    </>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto"
            >
              <StatsCard stats={stats} sessions={sessions} />
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto"
            >
              <AchievementsPanel stats={stats} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* XP Popup */}
      <AnimatePresence>
        {showXPPopup !== null && (
          <XPPopup xp={showXPPopup} onDone={() => setShowXPPopup(null)} />
        )}
      </AnimatePresence>

      {/* Location Picker */}
      <AnimatePresence>
        {showLocationPicker && (
          <LocationPicker
            selectedId={linkedLocationId}
            onSelect={(id, name) => {
              setLinkedLocationId(id);
              setLinkedLocationName(name);
            }}
            onClose={() => setShowLocationPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            focusDuration={focusDuration}
            breakDuration={breakDuration}
            longBreakDuration={longBreakDuration}
            soundEnabled={soundEnabled}
            onFocusChange={d => { setFocusDuration(d); if (mode === 'focus' && state === 'idle') setTimeLeft(d * 60); }}
            onBreakChange={d => { setBreakDuration(d); if (mode === 'break' && state === 'idle') setTimeLeft(d * 60); }}
            onLongBreakChange={d => { setLongBreakDuration(d); if (mode === 'long-break' && state === 'idle') setTimeLeft(d * 60); }}
            onSoundToggle={() => setSoundEnabled(!soundEnabled)}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
