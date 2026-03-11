/**
 * NearbyLocations — Geolocation-based nearby spots section
 * Works for both London and Bristol discovery feeds
 * Shows closest study spots with live distance updates
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Locate, ChevronRight, Loader2, X } from 'lucide-react';
import { useGeolocation, getDistanceKm, formatDistance } from '@/hooks/useGeolocation';

interface LocationLike {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  neighborhood: string;
  studyScore: number;
  image?: string;
}

interface NearbyLocationsProps {
  locations: LocationLike[];
  onSelectLocation: (loc: any) => void;
  getImage: (loc: LocationLike) => string;
  accentColor?: string;       // e.g. 'fog-sage' or 'cyan-600'
  maxDistance?: number;        // max distance in km (default 3)
  maxResults?: number;         // max number of results (default 8)
}

export default function NearbyLocations({
  locations,
  onSelectLocation,
  getImage,
  accentColor = 'fog-sage',
  maxDistance = 3,
  maxResults = 8,
}: NearbyLocationsProps) {
  const { lat, lng, loading, error, granted, requestLocation } = useGeolocation();
  const [dismissed, setDismissed] = useState(false);

  const nearbySpots = useMemo(() => {
    if (!lat || !lng) return [];
    return locations
      .map(loc => ({
        ...loc,
        distance: getDistanceKm(lat, lng, loc.lat, loc.lng),
      }))
      .filter(loc => loc.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults);
  }, [lat, lng, locations, maxDistance, maxResults]);

  // Don't show if dismissed
  if (dismissed) return null;

  // Not yet requested — show the enable location prompt
  if (!granted && !loading && !error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-8"
      >
        <button
          onClick={requestLocation}
          className={`w-full relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 sm:p-6 group hover:shadow-lg transition-all duration-300`}
        >
          {/* Decorative background */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${accentColor}/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

          <div className="relative flex items-center gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-xl bg-${accentColor}/10 flex items-center justify-center`}>
              <Locate className={`w-6 h-6 text-${accentColor}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Find Nearby Study Spots
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable location to see the closest spots to you right now
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </motion.div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg bg-${accentColor}/10 flex items-center justify-center`}>
            <Loader2 className={`w-4 h-4 text-${accentColor} animate-spin`} />
          </div>
          <div>
            <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Finding nearby spots...</h2>
            <p className="text-xs text-muted-foreground">Getting your location</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="shrink-0 w-64 h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <div className="rounded-2xl border border-border/50 bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Location unavailable</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={requestLocation}
            className={`text-xs font-medium text-${accentColor} hover:underline shrink-0`}
          >
            Try again
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // No nearby spots found
  if (nearbySpots.length === 0 && granted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <div className="rounded-2xl border border-border/50 bg-card p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-${accentColor}/10 flex items-center justify-center shrink-0`}>
            <MapPin className={`w-5 h-5 text-${accentColor}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">No spots within {maxDistance}km</p>
            <p className="text-xs text-muted-foreground">Try browsing the map or search for a specific area</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Success — show nearby spots
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-${accentColor}/10 flex items-center justify-center`}>
            <Navigation className={`w-4 h-4 text-${accentColor}`} />
          </div>
          <div>
            <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Nearby</h2>
            <p className="text-xs text-muted-foreground">{nearbySpots.length} spots within {maxDistance}km</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${accentColor}/60 opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 bg-${accentColor}`}></span>
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">Live</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence>
          {nearbySpots.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="shrink-0 w-56 cursor-pointer group"
              onClick={() => onSelectLocation(loc)}
            >
              <div className="relative rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={getImage(loc)}
                    alt={loc.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) parent.classList.add('bg-gradient-to-br', 'from-muted', 'to-muted/50');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Distance badge */}
                  <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-${accentColor}/90 text-white text-[10px] font-bold`}>
                    <Navigation className="w-3 h-3" />
                    {formatDistance(loc.distance)}
                  </div>

                  {/* Score */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    {loc.studyScore.toFixed(1)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-xs leading-tight line-clamp-1 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                    {loc.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="line-clamp-1">{loc.neighborhood || loc.category}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
