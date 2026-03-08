/**
 * MapPage — Interactive map of London study spots
 * Uses pre-built MapView component with Google Maps
 * London Fog design: warm tones, frosted glass preview cards
 */
import { MapView } from '@/components/Map';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { Heart, MapPin, X } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPageProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export default function MapPage({ locations, onSelectLocation }: MapPageProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    // Clear existing markers
    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];

    // Add markers for all locations
    locations.forEach(loc => {
      const markerEl = document.createElement('div');
      markerEl.innerHTML = `
        <div style="
          background: white;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Space Grotesk', monospace;
          color: #1C1C1E;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border: 2px solid ${loc.studyScore >= 8 ? '#C4A265' : loc.studyScore >= 6 ? '#7A8B6F' : '#ddd'};
          cursor: pointer;
          transition: transform 0.2s;
          white-space: nowrap;
        ">${loc.studyScore.toFixed(1)}</div>
      `;

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
  }, [locations]);

  return (
    <div className="relative w-full h-full">
      <MapView
        className="w-full h-full"
        initialCenter={{ lat: 51.515, lng: -0.1 }}
        initialZoom={12}
        onMapReady={handleMapReady}
      />

      {/* Location count badge */}
      <div className="absolute top-4 left-4 glass rounded-full px-4 py-2 shadow-lg z-10">
        <span className="text-sm font-medium text-fog-charcoal">{locations.length} study spots</span>
      </div>

      {/* Selected location preview card */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-6 left-4 right-4 z-10 max-w-md mx-auto"
          >
            <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50">
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div
                className="flex gap-0 cursor-pointer"
                onClick={() => onSelectLocation(selectedLocation)}
              >
                <img
                  src={getLocationImage(selectedLocation.name, selectedLocation.category)}
                  alt={selectedLocation.name}
                  className="w-28 h-28 object-cover shrink-0"
                />
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{selectedLocation.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{selectedLocation.neighborhood}</span>
                      </div>
                    </div>
                    <div className="score-badge text-sm bg-fog-gold/10 text-fog-gold px-2 py-0.5 rounded-lg shrink-0">
                      {selectedLocation.studyScore.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{CATEGORY_ICONS[selectedLocation.category]} {selectedLocation.category}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedLocation.id); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(selectedLocation.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
