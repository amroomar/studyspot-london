import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface GamificationContextType {
  badges: Badge[];
  visitedCount: number;
  reviewCount: number;
  savedCount: number;
  checkBadges: (favorites: Set<number>, reviewCount: number) => void;
}

const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'progress'>[] = [
  { id: 'first-save', name: 'Bookmarked', description: 'Save your first study spot', icon: '🔖', target: 1 },
  { id: 'cafe-explorer', name: 'Cafe Explorer', description: 'Save 5 different cafes', icon: '☕', target: 5 },
  { id: 'hidden-gem', name: 'Hidden Gem Finder', description: 'Save 3 hidden gem locations', icon: '💎', target: 3 },
  { id: 'library-lover', name: 'Library Lover', description: 'Save 3 libraries', icon: '📚', target: 3 },
  { id: 'study-marathon', name: 'Study Marathon', description: 'Save 10 study spots', icon: '🏃', target: 10 },
  { id: 'reviewer', name: 'Reviewer', description: 'Leave your first review', icon: '✍️', target: 1 },
  { id: 'top-reviewer', name: 'Top Reviewer', description: 'Leave 5 reviews', icon: '⭐', target: 5 },
  { id: 'collector', name: 'Collector', description: 'Save 20 study spots', icon: '🏆', target: 20 },
];

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('studyspot-badges');
      return saved ? JSON.parse(saved) : BADGE_DEFINITIONS.map(b => ({ ...b, unlocked: false, progress: 0 }));
    } catch {
      return BADGE_DEFINITIONS.map(b => ({ ...b, unlocked: false, progress: 0 }));
    }
  });

  const [visitedCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('studyspot-badges', JSON.stringify(badges));
  }, [badges]);

  const checkBadges = useCallback((favorites: Set<number>, reviews: number) => {
    const favCount = favorites.size;
    setSavedCount(favCount);
    setReviewCount(reviews);

    setBadges(prev => prev.map(badge => {
      let progress = 0;
      switch (badge.id) {
        case 'first-save': progress = Math.min(favCount, 1); break;
        case 'cafe-explorer': progress = Math.min(favCount, 5); break;
        case 'hidden-gem': progress = Math.min(favCount, 3); break;
        case 'library-lover': progress = Math.min(favCount, 3); break;
        case 'study-marathon': progress = Math.min(favCount, 10); break;
        case 'reviewer': progress = Math.min(reviews, 1); break;
        case 'top-reviewer': progress = Math.min(reviews, 5); break;
        case 'collector': progress = Math.min(favCount, 20); break;
      }
      return { ...badge, progress, unlocked: progress >= badge.target };
    }));
  }, []);

  return (
    <GamificationContext.Provider value={{ badges, visitedCount, reviewCount, savedCount, checkBadges }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
