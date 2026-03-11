/**
 * MapPage — Interactive map of London study spots
 * Uses pre-built MapView component with Google Maps
 * London Fog design: warm tones, frosted glass preview cards
 * Features: study score pins, heatmap toggle, preview cards, community filter
 */
import { MapView } from '@/components/Map';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { Heart, MapPin, X, Navigation, ExternalLink, Wifi, Plug, Volume2, Flame, Map as MapIcon, Users } from 'lucide-react';
import { VibeBadgeCompact } from '@/components/LiveVibeBadge';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useImageOverrides } from '@/contexts/ImageOverridesContext';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPageProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  showCommunityOnly?: boolean;
  onToggleCommunityOnly?: () => void;
  communityCount?: number;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

/** Build a Google Maps directions URL */
function getDirectionsUrl(location: Location): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=transit`;
}

export default function MapPage({ locations, onSelectLocation, showCommunityOnly, onToggleCommunityOnly, communityCount = 0, defaultCenter, defaultZoom }: MapPageProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { resolveImage } = useImageOverrides();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const heatmapLibLoaded = useRef(false);

  const createMarkers = useCallback((map: google.maps.Map) => {
    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];

    locations.forEach(loc => {
      const isCommunity = loc.id >= 100000;
      const markerEl = document.createElement('div');
      markerEl.innerHTML = `
        <div style="
          background: ${isCommunity ? '#7A8B6F' : 'white'};
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: ${isCommunity ? 'white' : '#1C1C1E'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border: 2px solid ${isCommunity ? '#5a6b4f' : loc.studyScore >= 8 ? '#C4A265' : loc.studyScore >= 6 ? '#7A8B6F' : '#ddd'};
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
          opacity: ${showHeatmap ? '0.4' : '1'};
        ">${isCommunity ? '📍 ' : ''}${loc.studyScore.toFixed(1)}</div>
      `;

      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.15)';
        markerEl.style.zIndex = '100';
      });
      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
        markerEl.style.zIndex = '1';
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: loc.lat, lng: loc.lng },
        content: markerEl,
        title: loc.name,
      });

      marker.addListener('click', () => {
        setSelectedLocation(loc);
        map.panTo({ lat: loc.lat, lng: loc.lng });
      });

      markersRef.current.push(marker);
    });
  }, [locations, showHeatmap]);

  const loadHeatmapLibrary = useCallback(async () => {
    if (heatmapLibLoaded.current) return;
    try {
      await google.maps.importLibrary('visualization');
      heatmapLibLoaded.current = true;
    } catch (e) {
      console.error('Failed to load visualization library:', e);
    }
  }, []);

  const updateHeatmap = useCallback(async (map: google.maps.Map) => {
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
      heatmapRef.current = null;
    }

    if (!showHeatmap) return;

    await loadHeatmapLibrary();

    const heatmapData = locations.map(loc => ({
      location: new google.maps.LatLng(loc.lat, loc.lng),
      weight: loc.studyScore * loc.studyScore,
    }));

    heatmapRef.current = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map,
      radius: 40,
      opacity: 0.7,
      gradient: [
        'rgba(0, 0, 0, 0)',
        'rgba(122, 139, 111, 0.3)',
        'rgba(122, 139, 111, 0.5)',
        'rgba(196, 162, 101, 0.6)',
        'rgba(196, 162, 101, 0.8)',
        'rgba(196, 162, 101, 1)',
        'rgba(212, 120, 55, 1)',
      ],
    });
  }, [showHeatmap, locations, loadHeatmapLibrary]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    createMarkers(map);
    updateHeatmap(map);
  }, [createMarkers, updateHeatmap]);

  useEffect(() => {
    if (mapRef.current) {
      createMarkers(mapRef.current);
      updateHeatmap(mapRef.current);
    }
  }, [locations, showHeatmap, createMarkers, updateHeatmap]);

  const noiseLabel = (level: number) => level <= 2 ? 'Quiet' : level <= 3 ? 'Moderate' : 'Lively';

  return (
    <div className="relative w-full h-full">
      <MapView
        className="w-full h-full"
        initialCenter={defaultCenter || { lat: 51.515, lng: -0.1 }}
        initialZoom={defaultZoom || 12}
        onMapReady={handleMapReady}
      />

      {/* Bottom-left controls — stacked vertically to avoid overlap with Google Maps controls */}
      <div className="absolute bottom-24 sm:bottom-6 left-3 sm:left-4 z-10 flex flex-col gap-2 max-w-[calc(100%-24px)] sm:max-w-none">
        {/* Location count badge */}
        <div className="bg-card/90 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg border border-border/50 w-fit">
          <span className="text-xs sm:text-sm font-medium text-foreground">{locations.length} study spots</span>
        </div>

        {/* Community filter toggle */}
        {communityCount > 0 && onToggleCommunityOnly && (
          <button
            onClick={onToggleCommunityOnly}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium transition-all w-fit ${
              showCommunityOnly
                ? 'bg-fog-sage text-white'
                : 'bg-card/90 backdrop-blur-md text-foreground hover:bg-card border border-border/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Community</span> ({communityCount})
          </button>
        )}
      </div>

      {/* Top-right controls — heatmap toggle, positioned below Google Maps type selector */}
      <div className="absolute top-20 sm:top-16 right-3 sm:right-4 z-10 flex flex-col gap-2 items-end">
        {/* Heatmap toggle */}
        <button
          onClick={() => setShowHeatmap(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium transition-all ${
            showHeatmap
              ? 'bg-fog-gold text-white'
              : 'bg-card/90 backdrop-blur-md text-foreground hover:bg-card border border-border/50'
          }`}
        >
          {showHeatmap ? (
            <>
              <MapIcon className="w-3.5 h-3.5" /> Pins
            </>
          ) : (
            <>
              <Flame className="w-3.5 h-3.5" /> Heatmap
            </>
          )}
        </button>

        {/* Heatmap legend */}
        <AnimatePresence>
          {showHeatmap && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-card/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-border/50"
            >
              <p className="text-[10px] font-semibold text-foreground mb-1.5">Study Density</p>
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-2.5 rounded-full" style={{
                  background: 'linear-gradient(to right, rgba(122,139,111,0.3), rgba(196,162,101,0.8), rgba(212,120,55,1))'
                }} />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-muted-foreground">Low</span>
                <span className="text-[9px] text-muted-foreground">High</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected location preview card */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-24 lg:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-10 max-w-md mx-auto"
          >
            <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50">
              {/* Close button */}
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Community badge */}
              {selectedLocation.id >= 100000 && (
                <div className="absolute top-3 left-3 z-10 bg-fog-sage text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Users className="w-3 h-3" /> Community
                </div>
              )}

              {/* Main card content */}
              <div
                className="flex gap-0 cursor-pointer"
                onClick={() => onSelectLocation(selectedLocation)}
              >
                <img
                  src={resolveImage('curated', selectedLocation.id, selectedLocation.image || getLocationImage(selectedLocation.name, selectedLocation.category))}
                  alt={selectedLocation.name}
                  className="w-24 sm:w-28 h-full min-h-[110px] object-cover shrink-0"
                />
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground leading-tight">{selectedLocation.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{selectedLocation.neighborhood}</span>
                        <span className="mx-0.5">·</span>
                        <span>{selectedLocation.priceLevel}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold bg-fog-gold/10 text-fog-gold px-2 py-0.5 rounded-lg shrink-0">
                      {selectedLocation.studyScore.toFixed(1)}
                    </div>
                  </div>

                  {/* Quick attributes */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                    {selectedLocation.wifi === 'yes' && (
                      <span className="flex items-center gap-0.5"><Wifi className="w-3 h-3 text-fog-sage" /> WiFi</span>
                    )}
                    {selectedLocation.plugSockets === 'yes' && (
                      <span className="flex items-center gap-0.5"><Plug className="w-3 h-3 text-fog-sage" /> Plugs</span>
                    )}
                    <span className="flex items-center gap-0.5"><Volume2 className="w-3 h-3 text-fog-sage" /> {noiseLabel(selectedLocation.noiseLevel)}</span>
                    <VibeBadgeCompact locationId={selectedLocation.id} />
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{CATEGORY_ICONS[selectedLocation.category]} {selectedLocation.category}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-3 pb-3 pt-1">
                <button
                  onClick={() => onSelectLocation(selectedLocation)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Details
                </button>
                <a
                  href={getDirectionsUrl(selectedLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-fog-sage hover:bg-fog-sage/90 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Directions
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedLocation.id); }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isFavorite(selectedLocation.id) ? 'bg-red-500/10 text-red-500' : 'bg-secondary text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(selectedLocation.id) ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
