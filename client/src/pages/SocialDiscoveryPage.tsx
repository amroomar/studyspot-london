/**
 * SocialDiscoveryPage — Social Discovery feed
 * London Fog design: atmospheric, warm, editorial
 * Displays real TikTok, Instagram, and YouTube videos of London study spots
 * Features: search, platform filter, tag filter, location matching, REAL THUMBNAILS
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialVideos, type SocialVideo } from '@/lib/socialVideos';
import { type Location } from '@/lib/locations';
import { Search, Play, ExternalLink, MapPin, X, SlidersHorizontal } from 'lucide-react';

// Platform brand colors and icons
const PLATFORM_CONFIG = {
  TikTok: {
    color: '#000000',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z"/>
      </svg>
    ),
  },
  Instagram: {
    color: '#E4405F',
    bgColor: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    textColor: 'text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  YouTube: {
    color: '#FF0000',
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
};

// Tag display config
const TAG_COLORS: Record<string, string> = {
  aesthetic: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  study: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  cafe: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  library: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  coworking: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  quiet: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'laptop-friendly': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  free: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  vlog: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  food: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'hidden-gem': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

// Platform gradient fallbacks for when thumbnail is missing
const PLATFORM_GRADIENTS: Record<string, string> = {
  TikTok: 'from-gray-900 via-gray-800 to-gray-900',
  Instagram: 'from-purple-900 via-pink-800 to-orange-900',
  YouTube: 'from-red-900 via-red-800 to-gray-900',
};

/**
 * VideoThumbnail — Shows real thumbnail image with graceful fallback
 * Falls back to platform-branded gradient if no thumbnail URL or image fails to load
 */
function VideoThumbnail({ video }: { video: SocialVideo }) {
  const platform = PLATFORM_CONFIG[video.platform];
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = video.thumbnailUrl && !imgError;

  return (
    <div className="relative w-full aspect-[9/12] rounded-xl overflow-hidden group">
      {/* Real thumbnail image */}
      {hasThumbnail ? (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        /* Fallback gradient */
        <div className={`w-full h-full bg-gradient-to-br ${PLATFORM_GRADIENTS[video.platform]}`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          </div>
        </div>
      )}

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/35 group-hover:scale-110 transition-all duration-300 shadow-lg">
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Platform badge */}
      <div className="absolute top-3 left-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${platform.bgColor} ${platform.textColor} text-xs font-medium shadow-lg backdrop-blur-sm`}>
          {platform.icon}
          <span>{video.platform}</span>
        </div>
      </div>

      {/* Creator badge at bottom */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-xs font-semibold truncate drop-shadow-md">{video.creator}</p>
      </div>

      {/* Thumbnail indicator dot — green for real, amber for fallback */}
      <div className="absolute top-3 right-3">
        <div className={`w-2 h-2 rounded-full ${hasThumbnail ? 'bg-green-400' : 'bg-amber-400'} shadow-sm`} title={hasThumbnail ? 'Real thumbnail' : 'Platform placeholder'} />
      </div>
    </div>
  );
}

function VideoCard({ 
  video, 
  onViewLocation,
  index,
}: { 
  video: SocialVideo; 
  onViewLocation?: (id: number) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className="group"
    >
      {/* Clickable thumbnail — opens video on platform */}
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <VideoThumbnail video={video} />
      </a>

      {/* Video info */}
      <div className="mt-3 space-y-1.5">
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            {video.title}
          </h3>
        </a>

        <p className="text-xs text-muted-foreground line-clamp-2">{video.caption}</p>

        {/* Location + neighborhood */}
        {(video.locationName || video.neighborhood) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {video.locationName || video.neighborhood}
              {video.locationName && video.neighborhood && ` · ${video.neighborhood}`}
            </span>
          </div>
        )}

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TAG_COLORS[tag] || 'bg-secondary text-secondary-foreground'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* View Study Spot button — only if matched */}
        {video.matchedLocationId && onViewLocation && (
          <button
            onClick={() => onViewLocation(video.matchedLocationId!)}
            className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors w-full justify-center"
          >
            <MapPin className="w-3.5 h-3.5" />
            View Study Spot
          </button>
        )}

        {/* Open on platform link */}
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Watch on {video.platform}
        </a>
      </div>
    </motion.div>
  );
}

type Platform = 'All' | 'TikTok' | 'Instagram' | 'YouTube';
type TagFilter = string;

interface SocialDiscoveryPageProps {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
}

export default function SocialDiscoveryPage({ locations, onSelectLocation }: SocialDiscoveryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform>('All');
  const [selectedTags, setSelectedTags] = useState<TagFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // All available tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    socialVideos.forEach(v => v.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, []);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    let result = [...socialVideos];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.caption.toLowerCase().includes(q) ||
        v.locationName.toLowerCase().includes(q) ||
        v.neighborhood.toLowerCase().includes(q) ||
        v.creator.toLowerCase().includes(q) ||
        v.tags.some(t => t.includes(q))
      );
    }

    // Platform
    if (platformFilter !== 'All') {
      result = result.filter(v => v.platform === platformFilter);
    }

    // Tags
    if (selectedTags.length > 0) {
      result = result.filter(v => selectedTags.some(t => v.tags.includes(t)));
    }

    return result;
  }, [searchQuery, platformFilter, selectedTags]);

  // Lazy loading with intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredVideos.length) {
          setVisibleCount(prev => Math.min(prev + 12, filteredVideos.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredVideos.length]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, platformFilter, selectedTags]);

  const handleViewLocation = useCallback((locationId: number) => {
    const loc = locations.find(l => l.id === locationId);
    if (loc) onSelectLocation(loc);
  }, [locations, onSelectLocation]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const platforms: Platform[] = ['All', 'TikTok', 'Instagram', 'YouTube'];
  const platformCounts = useMemo(() => ({
    All: socialVideos.length,
    TikTok: socialVideos.filter(v => v.platform === 'TikTok').length,
    Instagram: socialVideos.filter(v => v.platform === 'Instagram').length,
    YouTube: socialVideos.filter(v => v.platform === 'YouTube').length,
  }), []);

  const matchedCount = useMemo(() =>
    filteredVideos.filter(v => v.matchedLocationId).length,
  [filteredVideos]);

  // Count thumbnails
  const thumbCount = useMemo(() =>
    socialVideos.filter(v => v.thumbnailUrl).length,
  []);

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Social Discovery
          </h1>
          <p className="text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Discover London study spots through real videos from TikTok, Instagram, and YouTube.
          </p>
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search videos, locations, creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          style={{ fontFamily: 'var(--font-body)' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Platform filter pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              platformFilter === p
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
            }`}
          >
            {p !== 'All' && PLATFORM_CONFIG[p as keyof typeof PLATFORM_CONFIG].icon}
            {p} ({platformCounts[p]})
          </button>
        ))}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ml-auto ${
            selectedTags.length > 0
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        </button>
      </div>

      {/* Tag filters (collapsible) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex flex-wrap gap-2 p-3 bg-card border border-border rounded-xl">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? TAG_COLORS[tag] || 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          {matchedCount > 0 && ` · ${matchedCount} linked to study spots`}
          {thumbCount > 0 && ` · ${thumbCount} with thumbnails`}
        </p>
      </div>

      {/* Video grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-lg text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            No videos found
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPlatformFilter('All');
              setSelectedTags([]);
            }}
            className="text-primary hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredVideos.slice(0, visibleCount).map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                onViewLocation={handleViewLocation}
                index={i}
              />
            ))}
          </div>

          {/* Load more trigger */}
          {visibleCount < filteredVideos.length && (
            <div ref={loadMoreRef} className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Showing {visibleCount} of {filteredVideos.length} videos · Scroll for more
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
