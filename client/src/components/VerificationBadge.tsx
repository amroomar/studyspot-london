/**
 * VerificationBadge — Displays verification status for community-submitted locations
 * 
 * Statuses:
 * ✔ verified — Exists on Google Maps
 * ⭐ community_verified — Confirmed by 5+ users
 * 🟡 pending_verification — Awaiting review
 * ⚠ flagged — Reported by users
 * (no badge) unverified — Default state
 */
import { CheckCircle2, Star, Clock, AlertTriangle, Shield } from 'lucide-react';

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
  mapDot: string;
}> = {
  verified: {
    label: 'Verified Location',
    shortLabel: 'Verified',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    mapDot: 'bg-emerald-500',
  },
  community_verified: {
    label: 'Community Verified',
    shortLabel: 'Community',
    icon: Star,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    mapDot: 'bg-amber-500',
  },
  pending_verification: {
    label: 'Pending Verification',
    shortLabel: 'Pending',
    icon: Clock,
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    mapDot: 'bg-yellow-500',
  },
  flagged: {
    label: 'Flagged Location',
    shortLabel: 'Flagged',
    icon: AlertTriangle,
    className: 'bg-red-50 text-red-700 border-red-200',
    mapDot: 'bg-red-500',
  },
  unverified: {
    label: 'Unverified',
    shortLabel: 'Unverified',
    icon: Shield,
    className: 'bg-gray-50 text-gray-500 border-gray-200',
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
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.className} ${className}`}
        title={config.label}
      >
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{config.shortLabel}</span>
      </div>
    );
  }

  // Full mode — for detail pages
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${config.className} ${className}`}
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
