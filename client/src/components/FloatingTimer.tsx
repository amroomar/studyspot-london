/**
 * FloatingTimer — Sticky floating Pomodoro timer icon
 * Appears in the top-right corner on all pages (except the timer page itself)
 * Shows timer state: idle (pulse), running (countdown), paused (blink)
 * Clicking navigates to /timer
 * Persists timer state via localStorage so it survives navigation
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, Coffee, BookOpen } from 'lucide-react';

// ─── Shared localStorage keys (same as PomodoroPage) ────────────────
const TIMER_STATE_KEY = 'studyspot-pomodoro-active-timer';

export interface ActiveTimerState {
  mode: 'focus' | 'break' | 'long-break';
  state: 'idle' | 'running' | 'paused';
  timeLeft: number; // seconds remaining
  totalTime: number; // total seconds for this mode
  lastTick: number; // Date.now() of last tick — used to compute elapsed while away
  linkedLocationName: string | null;
  linkedLocationId?: number | null;
  sessionStart?: string | null; // ISO string of when the session started
  completedPomodoros?: number;
}

export function saveActiveTimer(t: ActiveTimerState) {
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(t));
}

export function loadActiveTimer(): ActiveTimerState | null {
  try {
    const raw = localStorage.getItem(TIMER_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearActiveTimer() {
  localStorage.removeItem(TIMER_STATE_KEY);
}

// ─── Component ──────────────────────────────────────────────────────
export default function FloatingTimer() {
  const [location, navigate] = useLocation();
  const [timerState, setTimerState] = useState<ActiveTimerState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Don't show on the timer page itself, admin pages, or city selector
  const isTimerPage = location === '/timer' || location === '/london/timer' || location === '/bristol/timer';
  const isAdminPage = location.startsWith('/admin');
  const shouldHide = isTimerPage || isAdminPage;

  // Poll localStorage for timer state changes (from PomodoroPage)
  useEffect(() => {
    const sync = () => {
      const saved = loadActiveTimer();
      if (!saved) {
        setTimerState(null);
        return;
      }

      // If running, compute elapsed time since last tick
      if (saved.state === 'running') {
        const elapsed = Math.floor((Date.now() - saved.lastTick) / 1000);
        const newTimeLeft = Math.max(0, saved.timeLeft - elapsed);
        setTimerState({ ...saved, timeLeft: newTimeLeft });
      } else {
        setTimerState(saved);
      }
    };

    sync();
    const poll = setInterval(sync, 1000);
    return () => clearInterval(poll);
  }, []);

  // Local countdown when timer is running (for smooth display)
  useEffect(() => {
    if (timerState?.state === 'running' && timerState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (!prev || prev.state !== 'running') return prev;
          const newTime = Math.max(0, prev.timeLeft - 1);
          return { ...prev, timeLeft: newTime };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState?.state, timerState?.timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progress = timerState
    ? timerState.totalTime > 0
      ? 1 - timerState.timeLeft / timerState.totalTime
      : 0
    : 0;

  const isRunning = timerState?.state === 'running';
  const isPaused = timerState?.state === 'paused';
  const isActive = isRunning || isPaused;
  const isFocus = timerState?.mode === 'focus';

  // Ring SVG params
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const ringColor = !timerState || timerState.mode === 'focus'
    ? '#78a064' // fog-sage
    : timerState.mode === 'break'
    ? '#60a5fa' // blue-400
    : '#a78bfa'; // purple-400

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.5, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: -20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/timer')}
        className="fixed top-16 lg:top-16 right-3 lg:right-5 z-40 group"
        title={isActive ? `Timer: ${formatTime(timerState!.timeLeft)}` : 'Open Study Timer'}
      >
        {/* Glow effect when running */}
        {isRunning && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${ringColor}40 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Main button container */}
        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive
            ? 'bg-card/95 backdrop-blur-md border-2 shadow-lg'
            : 'bg-card/80 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg hover:bg-card/95'
        }`}
          style={{
            borderColor: isActive ? ringColor : undefined,
          }}
        >
          {/* Progress ring (only when active) */}
          {isActive && (
            <svg
              width={size}
              height={size}
              className="absolute inset-0 -rotate-90"
            >
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-border/30"
              />
              {/* Progress */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 1s linear',
                }}
              />
            </svg>
          )}

          {/* Icon / Time display */}
          {isActive ? (
            <div className="flex flex-col items-center justify-center z-10">
              <span
                className="text-[10px] font-bold leading-none"
                style={{ color: ringColor, fontFamily: 'var(--font-mono)' }}
              >
                {formatTime(timerState!.timeLeft)}
              </span>
              <span className="text-[7px] text-muted-foreground leading-none mt-0.5">
                {isFocus ? 'FOCUS' : 'BREAK'}
              </span>
            </div>
          ) : (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Timer className="w-5 h-5 text-muted-foreground group-hover:text-fog-sage transition-colors" />
            </motion.div>
          )}

          {/* Paused indicator — blinking dot */}
          {isPaused && (
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border border-card"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Running indicator — solid dot */}
          {isRunning && (
            <div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card"
              style={{ backgroundColor: ringColor }}
            />
          )}
        </div>

        {/* Expanded tooltip on hover (desktop only) */}
        {isActive && timerState?.linkedLocationName && (
          <div className="hidden lg:block absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-card border border-border/50 rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap">
              <div className="text-xs font-medium text-foreground">{timerState.linkedLocationName}</div>
              <div className="text-[10px] text-muted-foreground">
                {isFocus ? 'Studying' : 'On break'} · {formatTime(timerState.timeLeft)}
              </div>
            </div>
          </div>
        )}
      </motion.button>
    </AnimatePresence>
  );
}
