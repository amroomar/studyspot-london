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

interface LiveVibeContextType {
  checkIn: (locationId: number, vibe: VibeStatus) => void;
  getVibe: (locationId: number) => LocationVibe | null;
  getRecentCheckIns: (locationId: number) => CheckIn[];
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

// Generate simulated check-ins for demo purposes
function generateSimulatedCheckIns(): CheckIn[] {
  const vibes: VibeStatus[] = ['very-quiet', 'good-vibe', 'moderate', 'very-busy'];
  const simulated: CheckIn[] = [];
  const popularIds = [2, 5, 8, 12, 15, 22, 28, 35, 42, 50, 55, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300];

  popularIds.forEach(id => {
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

  const hasCheckedIn = useCallback((locationId: number): boolean => {
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    return checkIns.some(c =>
      c.locationId === locationId &&
      c.userId === 'current-user' &&
      new Date(c.timestamp).getTime() > thirtyMinAgo
    );
  }, [checkIns]);

  return (
    <LiveVibeContext.Provider value={{ checkIn, getVibe, getRecentCheckIns, allCheckIns: checkIns, hasCheckedIn }}>
      {children}
    </LiveVibeContext.Provider>
  );
}

// Safe fallback — returns no-op functions when used outside provider
const FALLBACK: LiveVibeContextType = {
  checkIn: () => {},
  getVibe: () => null,
  getRecentCheckIns: () => [],
  allCheckIns: [],
  hasCheckedIn: () => false,
};

export function useLiveVibe(): LiveVibeContextType {
  const ctx = useContext(LiveVibeContext);
  // Return safe fallback instead of throwing — prevents crashes if component
  // renders before provider mounts or is used outside the provider tree
  return ctx ?? FALLBACK;
}
