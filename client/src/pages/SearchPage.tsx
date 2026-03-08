/**
 * SearchPage — Search and nearby discovery
 * London Fog design
 */
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Heart } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SearchPageProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SearchPage({ locations, onSelectLocation }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const requestLocation = useCallback(() => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      () => {
        // Default to central London
        setUserLocation({ lat: 51.515, lng: -0.1 });
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim() && !userLocation) return [];

    let results = locations;

    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.neighborhood.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        (l.tags && l.tags.some(t => t.toLowerCase().includes(q))) ||
        l.atmosphere.toLowerCase().includes(q)
      );
    }

    if (userLocation) {
      results = results.map(l => ({
        ...l,
        _distance: getDistanceKm(userLocation.lat, userLocation.lng, l.lat, l.lng),
      })).sort((a, b) => (a as any)._distance - (b as any)._distance);
    }

    return results.slice(0, 50);
  }, [query, locations, userLocation]);

  const quickSearches = [
    { label: 'Quiet cafes', query: 'quiet' },
    { label: 'Libraries', query: 'library' },
    { label: 'Late night', query: 'late-night' },
    { label: 'Hidden gems', query: 'hidden gem' },
    { label: 'Laptop friendly', query: 'laptop' },
    { label: 'Coworking', query: 'coworking' },
  ];

  return (
    <div className="pb-24 lg:pb-8">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, area, or type..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* Nearby button */}
      <button
        onClick={requestLocation}
        disabled={loadingLocation}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-foreground mb-4 hover:bg-primary/10 transition-colors"
      >
        {loadingLocation ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <Navigation className="w-5 h-5 text-primary" />
        )}
        <div className="text-left">
          <div className="text-sm font-medium">
            {userLocation ? 'Showing nearby spots' : 'Find spots near me'}
          </div>
          <div className="text-xs text-muted-foreground">
            {userLocation ? 'Sorted by distance from your location' : 'Allow location access to see nearby study spots'}
          </div>
        </div>
      </button>

      {/* Quick searches */}
      {!query && !userLocation && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Searches</h2>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map(qs => (
              <button
                key={qs.query}
                onClick={() => setQuery(qs.query)}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-muted transition-colors"
              >
                {qs.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">{searchResults.length} results</p>
          <div className="space-y-3">
            {searchResults.map((loc, i) => {
              const dist = userLocation ? getDistanceKm(userLocation.lat, userLocation.lng, loc.lat, loc.lng) : null;
              return (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="flex gap-3 bg-card rounded-xl p-3 border border-border/50 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectLocation(loc)}
                >
                  <img
                    src={getLocationImage(loc.name, loc.category)}
                    alt={loc.name}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{loc.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{loc.neighborhood}</span>
                      {dist !== null && (
                        <>
                          <span className="mx-1 opacity-40">·</span>
                          <span>{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="score-badge text-xs bg-fog-gold/10 text-fog-gold px-2 py-0.5 rounded-lg">{loc.studyScore.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">{CATEGORY_ICONS[loc.category]} {loc.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(loc.id); }}
                    className="self-center shrink-0"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${isFavorite(loc.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground/40 hover:text-red-400'}`} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {query && searchResults.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>No results found</h3>
          <p className="text-sm text-muted-foreground">Try a different search term or browse the discovery feed.</p>
        </div>
      )}
    </div>
  );
}
