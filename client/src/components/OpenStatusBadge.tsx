/**
 * OpenStatusBadge — Shows Open/Closed/Closing Soon status on location cards and detail pages
 */
import { getOpenStatus, type OpenStatus } from '@/lib/openingHours';
import { Clock } from 'lucide-react';

/** Compact badge for location cards — just shows Open/Closed/Closing Soon */
export function OpenBadgeCompact({ openingHours }: { openingHours: string }) {
  const status = getOpenStatus(openingHours);

  if (status.status === 'unknown') return null;

  const dotColor = status.status === 'open'
    ? 'bg-emerald-500'
    : status.status === 'closing-soon'
    ? 'bg-amber-500'
    : 'bg-red-500';

  const shortLabel = status.status === 'open'
    ? 'Open'
    : status.status === 'closing-soon'
    ? 'Closing Soon'
    : 'Closed';

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${status.bgColor} ${status.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      {shortLabel}
    </div>
  );
}

/** Detailed status for location detail pages */
export function OpenStatusDetail({ openingHours }: { openingHours: string }) {
  const status = getOpenStatus(openingHours);

  if (status.status === 'unknown') return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${status.bgColor}`}>
      <Clock className={`w-4 h-4 ${status.color}`} />
      <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
    </div>
  );
}
