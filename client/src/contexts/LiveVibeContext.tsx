/**
 * LiveVibeContext — Live Study Vibe / Crowd Intelligence
 * Tracks check-ins per location, calculates live status
 * Persists to localStorage, generates simulated "recent" data for demo
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type VibeStatus = 'very-quiet' | 'good-vibe' | 'moderate' | 'very-busy';

export interface CheckIn {
  locationId: number;
  vibe: VibeStatus;
  timestamp: string;
  userId: string;
}

export interface LocationVibe {
  status: VibeStatus;
  label: string;
  color: string;
  bgColor: string;
  lastUpdated: string;
  checkInCount: number;
}

const VIBE_CONFIG: Record<VibeStatus, { label: string; color: string; bgColor: string }> = {
  'very-quiet': { label: 'Very Quiet', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  'good-vibe': { label: 'Good Study Vibe', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'moderate': { label: 'Moderately Busy', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  'very-busy': { label: 'Very Busy', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export interface HourlyBusyness {
  hour: number; // 0-23
  label: string; // "6am", "2pm" etc.
  checkInCount: number;
  avgBusyness: number; // 0-1 normalized
  dominantVibe: VibeStatus | null;
}

interface LiveVibeContextType {
  checkIn: (locationId: number, vibe: VibeStatus) => void;
  getVibe: (locationId: number) => LocationVibe | null;
  getRecentCheckIns: (locationId: number) => CheckIn[];
  getHourlyBusyness: (locationId: number) => HourlyBusyness[];
  allCheckIns: CheckIn[];
  hasCheckedIn: (locationId: number) => boolean;
}

const LiveVibeContext = createContext<LiveVibeContextType | null>(null);

const STORAGE_KEY = 'studyspot-checkins';

function loadCheckIns(): CheckIn[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Generate simulated check-ins for demo purposes — includes historical data across hours
function generateSimulatedCheckIns(): CheckIn[] {
  const vibes: VibeStatus[] = ['very-quiet', 'good-vibe', 'moderate', 'very-busy'];
  const simulated: CheckIn[] = [];
  const popularIds = [2, 5, 8, 12, 15, 22, 28, 35, 42, 50, 55, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300];
  // Add Bristol popular IDs too
  const bristolIds = [10001, 10005, 10010, 10015, 10020, 10030, 10040, 10050, 10060, 10070, 10080, 10090];
  const allIds = [...popularIds, ...bristolIds];

  // Recent check-ins (last 2 hours)
  allIds.forEach(id => {
    const count = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < count; i++) {
      const minutesAgo = Math.floor(Math.random() * 120) + 5;
      const ts = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
      const vibeIndex = Math.random() < 0.6 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4);
      simulated.push({
        locationId: id,
        vibe: vibes[vibeIndex],
        timestamp: ts,
        userId: `sim-user-${Math.random().toString(36).slice(2, 8)}`,
      });
    }
  });

  // Historical check-ins across the past 7 days at various hours
  // This creates the data for the busyness graph
  allIds.forEach(id => {
    for (let day = 0; day < 7; day++) {
      // Typical study hours: 7am-10pm with peak at 10am-2pm and 4pm-7pm
      const hourWeights: Record<number, number> = {
        7: 0.2, 8: 0.4, 9: 0.6, 10: 0.8, 11: 0.9, 12: 0.7, 13: 0.6,
        14: 0.7, 15: 0.8, 16: 0.9, 17: 0.85, 18: 0.7, 19: 0.5, 20: 0.3, 21: 0.15,
      };
      Object.entries(hourWeights).forEach(([hourStr, weight]) => {
        const hour = parseInt(hourStr);
        // Random chance based on weight — more check-ins at busy hours
        const numCheckIns = Math.random() < weight ? Math.floor(Math.random() * 3) + 1 : 0;
        for (let c = 0; c < numCheckIns; c++) {
          const d = new Date();
          d.setDate(d.getDate() - day);
          d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          // Vibe correlates with busyness — busier hours tend to be more crowded
          let vibeIdx: number;
          if (weight > 0.7) vibeIdx = Math.random() < 0.5 ? 2 : 3; // moderate/busy
          else if (weight > 0.4) vibeIdx = Math.random() < 0.6 ? 1 : 2; // good-vibe/moderate
          else vibeIdx = Math.random() < 0.7 ? 0 : 1; // very-quiet/good-vibe
          simulated.push({
            locationId: id,
            vibe: vibes[vibeIdx],
            timestamp: d.toISOString(),
            userId: `sim-hist-${Math.random().toString(36).slice(2, 8)}`,
          });
        }
      });
    }
  });

  return simulated;
}

export function LiveVibeProvider({ children }: { children: ReactNode }) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    const stored = loadCheckIns();
    if (stored.length === 0) {
      return generateSimulatedCheckIns();
    }
    return stored;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
  }, [checkIns]);

  const checkIn = useCallback((locationId: number, vibe: VibeStatus) => {
    const newCheckIn: CheckIn = {
      locationId,
      vibe,
      timestamp: new Date().toISOString(),
      userId: 'current-user',
    };
    setCheckIns(prev => [newCheckIn, ...prev]);
  }, []);

  const getRecentCheckIns = useCallback((locationId: number): CheckIn[] => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    return checkIns
      .filter(c => c.locationId === locationId && new Date(c.timestamp).getTime() > twoHoursAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [checkIns]);

  const getVibe = useCallback((locationId: number): LocationVibe | null => {
    const recent = getRecentCheckIns(locationId);
    if (recent.length === 0) return null;

    const counts: Record<VibeStatus, number> = { 'very-quiet': 0, 'good-vibe': 0, 'moderate': 0, 'very-busy': 0 };
    recent.forEach(c => counts[c.vibe]++);
    const dominantVibe = (Object.entries(counts) as [VibeStatus, number][])
      .sort((a, b) => b[1] - a[1])[0][0];

    const config = VIBE_CONFIG[dominantVibe];
    return {
      status: dominantVibe,
      label: config.label,
      color: config.color,
      bgColor: config.bgColor,
      lastUpdated: recent[0].timestamp,
      checkInCount: recent.length,
    };
  }, [getRecentCheckIns]);

  const getHourlyBusyness = useCallback((locationId: number): HourlyBusyness[] => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const locationCheckIns = checkIns.filter(
      c => c.locationId === locationId && new Date(c.timestamp).getTime() > sevenDaysAgo
    );

    const vibeScore: Record<VibeStatus, number> = { 'very-quiet': 0.15, 'good-vibe': 0.4, 'moderate': 0.7, 'very-busy': 1.0 };
    const hourBuckets: Record<number, { count: number; totalScore: number; vibes: Record<VibeStatus, number> }> = {};

    for (let h = 6; h <= 22; h++) {
      hourBuckets[h] = { count: 0, totalScore: 0, vibes: { 'very-quiet': 0, 'good-vibe': 0, 'moderate': 0, 'very-busy': 0 } };
    }

    locationCheckIns.forEach(c => {
      const hour = new Date(c.timestamp).getHours();
      if (hour >= 6 && hour <= 22 && hourBuckets[hour]) {
        hourBuckets[hour].count++;
        hourBuckets[hour].totalScore += vibeScore[c.vibe];
        hourBuckets[hour].vibes[c.vibe]++;
      }
    });

    const maxCount = Math.max(...Object.values(hourBuckets).map(b => b.count), 1);

    return Object.entries(hourBuckets).map(([hourStr, bucket]) => {
      const hour = parseInt(hourStr);
      const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'pm' : 'am';
      const dominantVibe = bucket.count > 0
        ? (Object.entries(bucket.vibes) as [VibeStatus, number][]).sort((a, b) => b[1] - a[1])[0][0]
        : null;
      return {
        hour,
        label: `${h12}${ampm}`,
        checkInCount: bucket.count,
        avgBusyness: bucket.count > 0 ? bucket.totalScore / bucket.count : 0,
        dominantVibe,
      };
    });
  }, [checkIns]);

  const hasCheckedIn = useCallback((locationId: number): boolean => {
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    return checkIns.some(c =>
      c.locationId === locationId &&
      c.userId === 'current-user' &&
      new Date(c.timestamp).getTime() > thirtyMinAgo
    );
  }, [checkIns]);

  return (
    <LiveVibeContext.Provider value={{ checkIn, getVibe, getRecentCheckIns, getHourlyBusyness, allCheckIns: checkIns, hasCheckedIn }}>
      {children}
    </LiveVibeContext.Provider>
  );
}

// Safe fallback — returns no-op functions when used outside provider
const FALLBACK: LiveVibeContextType = {
  checkIn: () => {},
  getVibe: () => null,
  getRecentCheckIns: () => [],
  getHourlyBusyness: () => [],
  allCheckIns: [],
  hasCheckedIn: () => false,
};

export function useLiveVibe(): LiveVibeContextType {
  const ctx = useContext(LiveVibeContext);
  // Return safe fallback instead of throwing — prevents crashes if component
  // renders before provider mounts or is used outside the provider tree
  return ctx ?? FALLBACK;
}
