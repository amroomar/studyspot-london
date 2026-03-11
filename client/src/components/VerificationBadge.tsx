/**
 * VerificationBadge — Displays verification status for community-submitted locations
 * 
 * Statuses:
 * ✔ verified — Admin-verified location (prominent green badge with checkmark)
 * ⭐ community_verified — Confirmed by 5+ users
 * 🟡 pending_verification — Awaiting review
 * ⚠ flagged — Reported by users
 * (no badge) unverified — Default state
 */
import { CheckCircle2, Star, Clock, AlertTriangle, Shield, BadgeCheck } from 'lucide-react';

export type VerificationStatus =
  | 'unverified'
  | 'verified'
  | 'community_verified'
  | 'pending_verification'
  | 'flagged';

interface VerificationBadgeProps {
  status: VerificationStatus;
  /** Compact mode for cards (smaller, icon-only on mobile) */
  compact?: boolean;
  /** Show on map pins (minimal) */
  mapPin?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<VerificationStatus, {
  label: string;
  shortLabel: string;
  icon: typeof CheckCircle2;
  className: string;
  darkClassName: string;
  mapDot: string;
}> = {
  verified: {
    label: 'Verified by StudySpot',
    shortLabel: 'Verified',
    icon: BadgeCheck,
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    darkClassName: 'dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
    mapDot: 'bg-emerald-500',
  },
  community_verified: {
    label: 'Community Verified',
    shortLabel: 'Community',
    icon: Star,
    className: 'bg-amber-100 text-amber-800 border-amber-300',
    darkClassName: 'dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700',
    mapDot: 'bg-amber-500',
  },
  pending_verification: {
    label: 'Pending Verification',
    shortLabel: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    darkClassName: 'dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
    mapDot: 'bg-yellow-500',
  },
  flagged: {
    label: 'Flagged Location',
    shortLabel: 'Flagged',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 border-red-300',
    darkClassName: 'dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
    mapDot: 'bg-red-500',
  },
  unverified: {
    label: 'Unverified',
    shortLabel: 'Unverified',
    icon: Shield,
    className: 'bg-gray-100 text-gray-600 border-gray-300',
    darkClassName: 'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    mapDot: 'bg-gray-400',
  },
};

export default function VerificationBadge({ status, compact, mapPin, className = '' }: VerificationBadgeProps) {
  // Don't show badge for unverified locations in compact/map modes
  if (status === 'unverified' && (compact || mapPin)) return null;

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Map pin mode — just a colored dot
  if (mapPin) {
    return (
      <div
        className={`w-3 h-3 rounded-full ${config.mapDot} ring-2 ring-white shadow-sm ${className}`}
        title={config.label}
      />
    );
  }

  // Compact mode — small badge for cards
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.className} ${config.darkClassName} ${className}`}
        title={config.label}
      >
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{config.shortLabel}</span>
      </div>
    );
  }

  // Full mode — for detail pages (more prominent for verified status)
  if (status === 'verified') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 ${config.className} ${config.darkClassName} shadow-sm ${className}`}
      >
        <Icon className="w-4.5 h-4.5" />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${config.className} ${config.darkClassName} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}

/** Utility to get verification dot color for map markers */
export function getVerificationColor(status: VerificationStatus): string {
  switch (status) {
    case 'verified': return '#10b981';
    case 'community_verified': return '#f59e0b';
    case 'pending_verification': return '#eab308';
    case 'flagged': return '#ef4444';
    default: return '#9ca3af';
  }
}
