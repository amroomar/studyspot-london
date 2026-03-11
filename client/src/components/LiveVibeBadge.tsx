/**
 * LiveVibeBadge — Shows live study vibe status on cards and detail pages
 * London Fog design: subtle, informative, warm
 */
import { useLiveVibe, type VibeStatus } from '@/contexts/LiveVibeContext';
import { Activity, Clock } from 'lucide-react';

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
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

/** Full vibe display for detail pages with check-in button */
export function VibeDetailPanel({ locationId }: { locationId: number }) {
  const { getVibe, checkIn, hasCheckedIn, getRecentCheckIns } = useLiveVibe();
  const vibe = getVibe(locationId);
  const alreadyCheckedIn = hasCheckedIn(locationId);
  const recentCount = getRecentCheckIns(locationId).length;

  const vibeOptions: { status: VibeStatus; label: string; emoji: string }[] = [
    { status: 'very-quiet', label: 'Very Quiet', emoji: '🤫' },
    { status: 'good-vibe', label: 'Good Study Vibe', emoji: '📚' },
    { status: 'moderate', label: 'Getting Busy', emoji: '👥' },
    { status: 'very-busy', label: 'Very Crowded', emoji: '🔥' },
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

      {/* Check-in buttons */}
      <div>
        <p className="text-sm font-medium mb-2.5">
          {alreadyCheckedIn ? "You've checked in recently ✓" : "I'm here now — how's the vibe?"}
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
