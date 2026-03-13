/**
 * LiveVibeBadge — Shows live study vibe status on cards and detail pages
 * London Fog design: subtle, informative, warm
 * Includes busyness history graph showing check-in patterns by hour
 */
import { useState, useMemo } from 'react';
import { useLiveVibe, type VibeStatus, type HourlyBusyness } from '@/contexts/LiveVibeContext';
import { Activity, Clock, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function getBarColor(busyness: number, vibe: VibeStatus | null): string {
  if (!vibe) return 'bg-muted';
  switch (vibe) {
    case 'very-quiet': return 'bg-emerald-400';
    case 'good-vibe': return 'bg-blue-400';
    case 'moderate': return 'bg-amber-400';
    case 'very-busy': return 'bg-red-400';
    default: return 'bg-muted';
  }
}

function getBarLabel(vibe: VibeStatus | null): string {
  if (!vibe) return 'No data';
  switch (vibe) {
    case 'very-quiet': return 'Quiet';
    case 'good-vibe': return 'Good vibe';
    case 'moderate': return 'Busy';
    case 'very-busy': return 'Very busy';
    default: return '';
  }
}

/** Compact badge for location cards */
export function VibeBadgeCompact({ locationId }: { locationId: number }) {
  const { getVibe } = useLiveVibe();
  const vibe = getVibe(locationId);

  if (!vibe) return null;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${vibe.bgColor} ${vibe.color}`}>
      <Activity className="w-3 h-3" />
      {vibe.label}
    </div>
  );
}

/** Busyness History Graph — bar chart showing check-in patterns by hour */
function BusynessGraph({ locationId }: { locationId: number }) {
  const { getHourlyBusyness } = useLiveVibe();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const hourlyData = useMemo(() => getHourlyBusyness(locationId), [getHourlyBusyness, locationId]);

  const totalCheckIns = hourlyData.reduce((sum, h) => sum + h.checkInCount, 0);
  const maxBusyness = Math.max(...hourlyData.map(h => h.avgBusyness), 0.01);
  const currentHour = new Date().getHours();

  if (totalCheckIns === 0) {
    return (
      <div className="p-4 rounded-xl bg-secondary/30 text-center">
        <BarChart3 className="w-5 h-5 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Not enough data yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Check in to help build the busyness graph!</p>
      </div>
    );
  }

  const hoveredData = hoveredHour !== null ? hourlyData.find(h => h.hour === hoveredHour) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <BarChart3 className="w-4 h-4 text-fog-sage" />
          Typical Busyness
        </h4>
        <span className="text-xs text-muted-foreground">{totalCheckIns} check-ins this week</span>
      </div>

      {/* Tooltip */}
      <div className="h-5 flex items-center justify-center">
        {hoveredData ? (
          <p className="text-xs font-medium text-foreground animate-in fade-in duration-150">
            <span className="text-muted-foreground">{hoveredData.label}:</span>{' '}
            <span className={
              hoveredData.dominantVibe === 'very-busy' ? 'text-red-600' :
              hoveredData.dominantVibe === 'moderate' ? 'text-amber-600' :
              hoveredData.dominantVibe === 'good-vibe' ? 'text-blue-600' :
              'text-emerald-600'
            }>
              {getBarLabel(hoveredData.dominantVibe)}
            </span>
            {' '}
            <span className="text-muted-foreground">({hoveredData.checkInCount} check-in{hoveredData.checkInCount !== 1 ? 's' : ''})</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50">Hover or tap bars to see details</p>
        )}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-[3px] h-24 px-1">
        {hourlyData.map((h) => {
          const heightPct = h.avgBusyness > 0 ? Math.max((h.avgBusyness / maxBusyness) * 100, 8) : 4;
          const isCurrentHour = h.hour === currentHour;
          const isHovered = hoveredHour === h.hour;

          return (
            <div
              key={h.hour}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
              onMouseEnter={() => setHoveredHour(h.hour)}
              onMouseLeave={() => setHoveredHour(null)}
              onClick={() => setHoveredHour(hoveredHour === h.hour ? null : h.hour)}
            >
              <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                <div
                  className={`w-full rounded-t-sm transition-all duration-200 ${
                    h.checkInCount > 0
                      ? `${getBarColor(h.avgBusyness, h.dominantVibe)} ${isHovered ? 'opacity-100 scale-x-110' : 'opacity-75 hover:opacity-90'}`
                      : 'bg-muted/30'
                  } ${isCurrentHour ? 'ring-2 ring-fog-gold/50 ring-offset-1 ring-offset-background rounded-t-md' : ''}`}
                  style={{ height: `${heightPct}%`, minHeight: '3px' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour labels */}
      <div className="flex gap-[3px] px-1">
        {hourlyData.map((h) => {
          const isCurrentHour = h.hour === currentHour;
          // Show every other label on mobile, all on desktop
          const showLabel = h.hour % 2 === 0;
          return (
            <div key={h.hour} className="flex-1 text-center">
              <span className={`text-[9px] leading-none ${
                isCurrentHour ? 'text-fog-gold font-bold' : showLabel ? 'text-muted-foreground/60' : 'text-transparent sm:text-muted-foreground/60'
              }`}>
                {h.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-muted-foreground">Quiet</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[10px] text-muted-foreground">Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] text-muted-foreground">Busy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-[10px] text-muted-foreground">Crowded</span>
        </div>
      </div>
    </div>
  );
}

/** Full vibe display for detail pages with check-in button and busyness graph */
export function VibeDetailPanel({ locationId }: { locationId: number }) {
  const { getVibe, checkIn, hasCheckedIn, getRecentCheckIns } = useLiveVibe();
  const vibe = getVibe(locationId);
  const alreadyCheckedIn = hasCheckedIn(locationId);
  const recentCount = getRecentCheckIns(locationId).length;
  const [showGraph, setShowGraph] = useState(true);

  const vibeOptions: { status: VibeStatus; label: string; emoji: string }[] = [
    { status: 'very-quiet', label: 'Very Quiet', emoji: '\u{1F92B}' },
    { status: 'good-vibe', label: 'Good Study Vibe', emoji: '\u{1F4DA}' },
    { status: 'moderate', label: 'Getting Busy', emoji: '\u{1F465}' },
    { status: 'very-busy', label: 'Very Crowded', emoji: '\u{1F525}' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Activity className="w-4.5 h-4.5 text-fog-sage" />
          Live Study Vibe
        </h3>
        {vibe && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Updated {timeAgo(vibe.lastUpdated)}
          </div>
        )}
      </div>

      {/* Current status */}
      {vibe ? (
        <div className={`flex items-center justify-between p-4 rounded-xl ${vibe.bgColor}`}>
          <div>
            <p className={`text-lg font-semibold ${vibe.color}`}>{vibe.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{recentCount} check-in{recentCount !== 1 ? 's' : ''} in the last 2 hours</p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-2.5 h-8 rounded-full transition-all ${
                  i <= (['very-quiet', 'good-vibe', 'moderate', 'very-busy'].indexOf(vibe.status) + 1)
                    ? vibe.status === 'very-busy' ? 'bg-red-500' :
                      vibe.status === 'moderate' ? 'bg-amber-500' :
                      vibe.status === 'good-vibe' ? 'bg-blue-500' : 'bg-emerald-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-secondary/50 text-center">
          <p className="text-sm text-muted-foreground">No recent check-ins. Be the first!</p>
        </div>
      )}

      {/* Busyness History Graph */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="w-full flex items-center justify-between text-sm font-medium text-foreground mb-2"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-fog-sage" />
            Busyness Over Time
          </span>
          {showGraph ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {showGraph && <BusynessGraph locationId={locationId} />}
      </div>

      {/* Check-in buttons */}
      <div>
        <p className="text-sm font-medium mb-2.5">
          {alreadyCheckedIn ? "You've checked in recently \u2713" : "I'm here now \u2014 how's the vibe?"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {vibeOptions.map(opt => (
            <button
              key={opt.status}
              onClick={() => !alreadyCheckedIn && checkIn(locationId, opt.status)}
              disabled={alreadyCheckedIn}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                alreadyCheckedIn
                  ? 'border-border bg-secondary/30 text-muted-foreground cursor-not-allowed opacity-60'
                  : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]'
              }`}
            >
              <span className="text-base">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {alreadyCheckedIn && (
          <p className="text-xs text-muted-foreground mt-2">You can check in again in 30 minutes.</p>
        )}
      </div>
    </div>
  );
}
