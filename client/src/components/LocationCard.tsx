/**
 * LocationCard — London Fog design
 * Large image, frosted glass info overlay, warm shadows
 * Fixed: removed redundant tag display (Wi-Fi/Laptop shown as icons, not also as tags)
 */
import { Heart, Wifi, Plug, Volume2, MapPin, Sparkles } from 'lucide-react';
import VerificationBadge, { type VerificationStatus } from '@/components/VerificationBadge';
import { VibeBadgeCompact } from '@/components/LiveVibeBadge';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { useFavorites } from '@/contexts/FavoritesContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LocationCardProps {
  location: Location;
  onClick: () => void;
  index?: number;
}

export default function LocationCard({ location, onClick, index = 0 }: LocationCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [imgLoaded, setImgLoaded] = useState(false);
  const fav = isFavorite(location.id);
  const isCommunity = 'isCommunitySubmitted' in location && (location as any).isCommunitySubmitted;
  const image = isCommunity && (location as any).images?.[0]
    ? (location as any).images[0]
    : location.image && !location.image.includes('source.unsplash')
      ? location.image
      : getLocationImage(location.name, location.category);

  const noiseLabel = location.noiseLevel <= 2 ? 'Quiet' : location.noiseLevel <= 3 ? 'Moderate' : 'Lively';

  // Only show actual descriptive tags, not attribute duplicates
  const EXCLUDED_TAGS = new Set(['wi-fi', 'wifi', 'laptop-friendly', 'laptop friendly', 'quiet', 'moderate', 'lively', 'loud', 'very quiet', 'plugs', 'plug sockets', 'free wifi', 'good wifi']);
  const displayTags = (location.tags || [])
    .filter(tag => !EXCLUDED_TAGS.has(tag.toLowerCase()))
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm hover:shadow-xl transition-shadow duration-500">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className={`absolute inset-0 bg-fog-warm transition-opacity duration-500 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`} />
          <img
            src={image}
            alt={location.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          {/* Score badge */}
          <div className="absolute top-3 left-3 score-badge bg-white/90 backdrop-blur-sm text-fog-charcoal px-2.5 py-1 rounded-lg text-sm shadow-sm">
            {location.studyScore.toFixed(1)}
          </div>
          {/* Favorite button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(location.id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart className={`w-4.5 h-4.5 transition-colors ${fav ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
          {/* Category badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <div className="glass rounded-full px-3 py-1.5 text-xs font-medium text-fog-charcoal flex items-center gap-1.5">
              <span>{CATEGORY_ICONS[location.category] || '📍'}</span>
              <span>{location.category}</span>
            </div>
            {isCommunity && (
              <div className="bg-fog-sage/90 backdrop-blur-sm text-white rounded-full px-2.5 py-1.5 text-[10px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Community
              </div>
            )}
            {isCommunity && (location as any).verificationStatus && (location as any).verificationStatus !== 'unverified' && (
              <VerificationBadge status={(location as any).verificationStatus as VerificationStatus} compact />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-base leading-tight mb-1 text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            {location.name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location.neighborhood}</span>
            <span className="mx-1 opacity-40">·</span>
            <span>{location.priceLevel}</span>
          </div>

          {/* Quick attributes — icons only, no redundant tags */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {location.wifi === 'yes' && (
              <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-fog-sage" /> Wi-Fi</span>
            )}
            {location.plugSockets === 'yes' && (
              <span className="flex items-center gap-1"><Plug className="w-3.5 h-3.5 text-fog-sage" /> Plugs</span>
            )}
            <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-fog-sage" /> {noiseLabel}</span>
            <VibeBadgeCompact locationId={location.id} />
          </div>

          {/* Descriptive tags only */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {displayTags.map((tag, i) => (
                <span key={i} className="bg-secondary text-secondary-foreground text-[11px] px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
