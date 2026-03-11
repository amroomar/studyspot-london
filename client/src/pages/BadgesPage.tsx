/**
 * BadgesPage — Gamification achievements
 * London Fog design: warm, motivating, not childish
 */
import { useGamification } from '@/contexts/GamificationContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function BadgesPage() {
  const { badges, savedCount, reviewCount, checkBadges } = useGamification();
  const { favorites } = useFavorites();
  const { data: totalReviewCount = 0 } = trpc.reviews.getTotalCount.useQuery();

  useEffect(() => {
    checkBadges(favorites, totalReviewCount);
  }, [favorites, totalReviewCount, checkBadges]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Your Achievements</h1>
        <p className="text-sm text-muted-foreground">{unlockedCount} of {badges.length} badges unlocked</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-card rounded-xl p-4 text-center border border-border/50">
          <div className="text-2xl font-bold text-fog-gold score-badge">{savedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Spots Saved</div>
        </div>
        <div className="bg-card rounded-xl p-4 text-center border border-border/50">
          <div className="text-2xl font-bold text-fog-sage score-badge">{reviewCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Reviews</div>
        </div>
        <div className="bg-card rounded-xl p-4 text-center border border-border/50">
          <div className="text-2xl font-bold text-primary score-badge">{unlockedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Badges</div>
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 gap-4">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className={`relative bg-card rounded-2xl p-5 border transition-all ${
              badge.unlocked
                ? 'border-fog-gold/30 shadow-md'
                : 'border-border/50 opacity-60'
            }`}
          >
            <div className={`text-3xl mb-3 ${badge.unlocked ? '' : 'grayscale'}`}>{badge.icon}</div>
            <h3 className="text-sm font-semibold text-foreground mb-0.5">{badge.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  badge.unlocked ? 'bg-fog-gold' : 'bg-fog-sage/50'
                }`}
                style={{ width: `${(badge.progress / badge.target) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 score-badge">
              {badge.progress}/{badge.target}
            </div>

            {badge.unlocked && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-fog-gold/20 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
