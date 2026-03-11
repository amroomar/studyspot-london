/**
 * BristolUniModePage — University Study Spots for Bristol
 * Harbour Blue design: cool, coastal, creative
 * Features: university selector, spot cards, campus map, filters, detail views
 * Uses Bristol university data (UoB + UWE)
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  bristolUniversities,
  bristolUniStudySpots,
  type BristolUniversity,
  type BristolUniStudySpot,
} from '@/lib/bristolUniStudySpots';
import { MapView } from '@/components/Map';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Coffee,
  ExternalLink,
  Filter,
  GraduationCap,
  Grid3X3,
  Laptop,
  Library,
  Lock,
  Map,
  MapPin,
  Navigation,
  Plug,
  Search,
  Sparkles,
  Star,
  Volume2,
  Wifi,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Helpers ───────────────────────────────────────────────────────────────

function quietnessLabel(level: number): string {
  if (level <= 1) return 'Silent';
  if (level <= 2) return 'Quiet';
  if (level <= 3) return 'Moderate';
  if (level <= 4) return 'Lively';
  return 'Loud';
}

function quietnessColor(level: number): string {
  if (level <= 1) return 'text-emerald-600 bg-emerald-50';
  if (level <= 2) return 'text-green-600 bg-green-50';
  if (level <= 3) return 'text-amber-600 bg-amber-50';
  if (level <= 4) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

function scoreColor(score: number): string {
  if (score >= 8.5) return 'bg-emerald-500 text-white';
  if (score >= 7) return 'bg-cyan-600 text-white';
  if (score >= 5) return 'bg-amber-500 text-white';
  return 'bg-muted text-muted-foreground';
}

const CATEGORY_ICONS: Record<string, string> = {
  'Library': '📚',
  'Study Room': '📖',
  'Lounge': '🛋️',
  'Student Union': '🎓',
  'Cafe': '☕',
};

// ─── Filters ───────────────────────────────────────────────────────────────

interface BristolUniFilters {
  category: string;
  quietnessMax: number;
  wifi: boolean;
  plugs: boolean;
  searchQuery: string;
  tags: string[];
}

const DEFAULT_FILTERS: BristolUniFilters = {
  category: 'All',
  quietnessMax: 5,
  wifi: false,
  plugs: false,
  searchQuery: '',
  tags: [],
};

function applyFilters(spots: BristolUniStudySpot[], filters: BristolUniFilters, sortBy: string): BristolUniStudySpot[] {
  let result = spots;

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.building.toLowerCase().includes(q) ||
      s.atmosphere.toLowerCase().includes(q)
    );
  }
  if (filters.category !== 'All') result = result.filter(s => s.category === filters.category);
  if (filters.quietnessMax < 5) result = result.filter(s => s.noiseLevel <= filters.quietnessMax);
  if (filters.wifi) result = result.filter(s => s.wifi);
  if (filters.plugs) result = result.filter(s => s.plugSockets);
  if (filters.tags.length > 0) {
    result = result.filter(s => filters.tags.some(t => s.tags.includes(t)));
  }

  if (sortBy === 'score') result = [...result].sort((a, b) => b.studyScore - a.studyScore);
  else if (sortBy === 'quiet') result = [...result].sort((a, b) => a.noiseLevel - b.noiseLevel);
  else result = [...result].sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

// ─── SpotCard ───────────────────────────────────────────────────────────

function BristolUniSpotCard({ spot, uni, onClick, index = 0 }: { spot: BristolUniStudySpot; uni?: BristolUniversity; onClick: () => void; index?: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.2), ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="relative rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          {!imgLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
          <img
            src={spot.image}
            alt={spot.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Score badge */}
          <div className={`absolute top-3 right-3 ${scoreColor(spot.studyScore)} px-2.5 py-1 rounded-lg text-xs font-bold`}>
            {spot.studyScore.toFixed(1)}
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3 glass rounded-lg px-2 py-1 text-xs font-medium text-foreground">
            {CATEGORY_ICONS[spot.category] || '📍'} {spot.category}
          </div>

          {/* Capacity badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-600/90 text-white">
              {spot.capacity} seats
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-1" style={{ fontFamily: 'var(--font-display)' }}>
            {spot.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{spot.building} · {spot.floor}</span>
          </p>

          {/* Attributes row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            {spot.wifi && (
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-cyan-600" /> WiFi</span>
            )}
            {spot.plugSockets && (
              <span className="flex items-center gap-1"><Plug className="w-3 h-3 text-cyan-600" /> Plugs</span>
            )}
            <span className="flex items-center gap-1"><Volume2 className="w-3 h-3 text-cyan-600" /> {quietnessLabel(spot.noiseLevel)}</span>
          </div>

          {/* Tags */}
          {spot.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {spot.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-secondary rounded-full text-[10px] font-medium text-secondary-foreground">
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

// ─── SpotDetail ─────────────────────────────────────────────────────────

function BristolUniSpotDetail({ spot, uni, onBack }: { spot: BristolUniStudySpot; uni?: BristolUniversity; onBack: () => void }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=transit`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto custom-scrollbar"
    >
      {/* Hero image */}
      <div className="relative h-[40vh] min-h-[280px]">
        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-card transition-colors text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${scoreColor(spot.studyScore)}`}>
              {spot.studyScore.toFixed(1)}
            </span>
            <span className="glass rounded-lg px-2 py-1 text-xs font-medium text-white/90">
              {CATEGORY_ICONS[spot.category] || '📍'} {spot.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-600/90 text-white">
              {spot.capacity} seats
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {spot.name}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {uni?.name || 'Bristol University'} &middot; {spot.building}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Address & Directions */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-card rounded-xl border border-border/50">
          <MapPin className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm">{spot.building}, Floor: {spot.floor}</p>
            {spot.openingHours && (
              <p className="text-xs text-muted-foreground mt-1">{spot.openingHours}</p>
            )}
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg text-xs font-medium hover:bg-cyan-600/90 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" /> Directions
          </a>
        </div>

        {/* Atmosphere */}
        {spot.atmosphere && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Atmosphere</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{spot.atmosphere}</p>
          </div>
        )}

        {/* Study Attributes */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>Study Attributes</h3>
          <div className="grid grid-cols-2 gap-3">
            <AttributeCard icon={Volume2} label="Quietness" value={quietnessLabel(spot.noiseLevel)} />
            <AttributeCard icon={Wifi} label="WiFi" value={spot.wifi ? 'Available' : 'No'} />
            <AttributeCard icon={Plug} label="Power Outlets" value={spot.plugSockets ? 'Available' : 'No'} />
            <AttributeCard icon={Star} label="Seating" value={spot.seatingComfort} />
            <AttributeCard icon={Sparkles} label="Lighting" value={spot.lightingQuality} />
            <AttributeCard icon={GraduationCap} label="Capacity" value={`${spot.capacity} seats`} />
          </div>
        </div>

        {/* Tags */}
        {spot.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>Environment Tags</h3>
            <div className="flex flex-wrap gap-2">
              {spot.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-secondary rounded-full text-xs font-medium text-secondary-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AttributeCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
      <div className="w-8 h-8 rounded-lg bg-cyan-600/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-cyan-600" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────

function BristolUniFilterPanel({
  filters,
  onChange,
  resultCount,
}: {
  filters: BristolUniFilters;
  onChange: (f: BristolUniFilters) => void;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const hasActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    bristolUniStudySpots.forEach(s => s.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(bristolUniStudySpots.map(s => s.category));
    return Array.from(cats).sort();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          hasActive ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-secondary'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActive && <span className="w-2 h-2 rounded-full bg-white/80" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-2xl overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Filters</h2>
                  <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onChange({ ...filters, category: 'All' })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filters.category === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => onChange({ ...filters, category: cat })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          filters.category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {CATEGORY_ICONS[cat] || '📍'} {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Noise Level */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Max Noise Level: {quietnessLabel(filters.quietnessMax)}</h3>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={filters.quietnessMax}
                    onChange={(e) => onChange({ ...filters, quietnessMax: Number(e.target.value) })}
                    className="w-full accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Silent</span>
                    <span>Loud</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onChange({ ...filters, wifi: !filters.wifi })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        filters.wifi ? 'bg-cyan-600/10 text-cyan-600 border border-cyan-600/30' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <Wifi className="w-3.5 h-3.5" /> WiFi
                    </button>
                    <button
                      onClick={() => onChange({ ...filters, plugs: !filters.plugs })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        filters.plugs ? 'bg-cyan-600/10 text-cyan-600 border border-cyan-600/30' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <Plug className="w-3.5 h-3.5" /> Power
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const tags = filters.tags.includes(tag) ? filters.tags.filter(t => t !== tag) : [...filters.tags, tag];
                          onChange({ ...filters, tags });
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          filters.tags.includes(tag) ? 'bg-cyan-600/10 text-cyan-600 border border-cyan-600/30' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onChange(DEFAULT_FILTERS)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Show {resultCount} spots
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Active Filter Chips ───────────────────────────────────────────────────

function BristolUniActiveFilterChips({ filters, onChange }: { filters: BristolUniFilters; onChange: (f: BristolUniFilters) => void }) {
  const chips: { label: string; clear: () => void }[] = [];

  if (filters.category !== 'All') chips.push({ label: filters.category, clear: () => onChange({ ...filters, category: 'All' }) });
  if (filters.wifi) chips.push({ label: 'WiFi', clear: () => onChange({ ...filters, wifi: false }) });
  if (filters.plugs) chips.push({ label: 'Plugs', clear: () => onChange({ ...filters, plugs: false }) });
  if (filters.quietnessMax < 5) chips.push({ label: `Noise ≤ ${quietnessLabel(filters.quietnessMax)}`, clear: () => onChange({ ...filters, quietnessMax: 5 }) });
  filters.tags.forEach(tag => chips.push({ label: tag, clear: () => onChange({ ...filters, tags: filters.tags.filter(t => t !== tag) }) }));

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={chip.clear}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// ─── Campus Map View ───────────────────────────────────────────────────────

function BristolCampusMapView({
  spots,
  university,
  onSelectSpot,
}: {
  spots: BristolUniStudySpot[];
  university: BristolUniversity;
  onSelectSpot: (spot: BristolUniStudySpot) => void;
}) {
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [previewSpot, setPreviewSpot] = useState<BristolUniStudySpot | null>(null);

  const createMarkers = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];

    spots.forEach(spot => {
      const markerEl = document.createElement('div');
      const bgColor = university.color;

      markerEl.innerHTML = `
        <div style="
          background: ${bgColor};
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Space Grotesk', monospace;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          white-space: nowrap;
          border: 2px solid white;
        ">${spot.studyScore.toFixed(1)}</div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: spot.lat, lng: spot.lng },
        content: markerEl,
        title: spot.name,
      });

      marker.addListener('click', () => {
        setPreviewSpot(spot);
      });

      markersRef.current.push(marker);
    });
  }, [spots, university.color]);

  return (
    <div className="relative h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)]">
      <MapView
        className="w-full h-full"
        initialCenter={{ lat: university.lat, lng: university.lng }}
        initialZoom={14}
        onMapReady={createMarkers}
      />

      {/* Map legend */}
      <div className="absolute top-4 left-4 glass rounded-xl p-3 text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: university.color }} />
          <span>{university.shortName} spots</span>
        </div>
      </div>

      {/* Preview card */}
      <AnimatePresence>
        {previewSpot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 max-w-md mx-auto"
          >
            <div className="glass rounded-2xl p-4 border border-border/50 shadow-xl">
              <button
                onClick={() => setPreviewSpot(null)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex gap-3">
                <img
                  src={previewSpot.image}
                  alt={previewSpot.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${scoreColor(previewSpot.studyScore)} px-1.5 py-0.5 rounded text-[10px] font-bold`}>
                      {previewSpot.studyScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{previewSpot.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {previewSpot.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{previewSpot.building}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectSpot(previewSpot)}
                      className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-medium hover:bg-cyan-600/90 transition-colors"
                    >
                      View Details
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${previewSpot.lat},${previewSpot.lng}&travelmode=transit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Go
                    </a>
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

// ─── University Selector ───────────────────────────────────────────────────

function BristolUniversitySelector({ onSelect }: { onSelect: (uni: BristolUniversity) => void }) {
  const uniSpotCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    bristolUniStudySpots.forEach(s => { counts[s.universityId] = (counts[s.universityId] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="pb-24 lg:pb-8">
      {/* Hero */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-8 overflow-hidden">
        <div className="relative h-[40vh] min-h-[300px] max-h-[420px] bg-gradient-to-br from-slate-900 via-cyan-900/80 to-blue-900/60">
          <div className="absolute inset-0 grain" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white/80 font-medium">Bristol UniMode</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Bristol University<br />Study Spots
                </h1>
                <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
                  {bristolUniStudySpots.length} curated study spaces across {bristolUniversities.length} Bristol universities. Libraries, study rooms, lounges, and more.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* University Grid */}
      <div className="mb-8">
        <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>Select Your University</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bristolUniversities.map((uni, i) => (
            <motion.button
              key={uni.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => onSelect(uni)}
              className="group relative p-5 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                  style={{ backgroundColor: uni.color }}
                >
                  {uni.shortName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {uni.shortName}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{uni.name}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {uniSpotCounts[uni.id] || 0} spots</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Library} label="Libraries" value={String(bristolUniStudySpots.filter(s => s.category === 'Library').length)} />
        <StatCard icon={BookOpen} label="Study Rooms" value={String(bristolUniStudySpots.filter(s => s.category === 'Study Room').length)} />
        <StatCard icon={Coffee} label="Lounges" value={String(bristolUniStudySpots.filter(s => s.category === 'Lounge').length)} />
        <StatCard icon={GraduationCap} label="Total Spots" value={String(bristolUniStudySpots.length)} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-4 bg-card rounded-xl border border-border/50 text-center">
      <Icon className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
      <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── University Dashboard ──────────────────────────────────────────────────

type UniTab = 'spots' | 'map';

function BristolUniversityDashboard({
  university,
  onBack,
  onSelectSpot,
}: {
  university: BristolUniversity;
  onBack: () => void;
  onSelectSpot: (spot: BristolUniStudySpot) => void;
}) {
  const [activeTab, setActiveTab] = useState<UniTab>('spots');
  const [filters, setFilters] = useState<BristolUniFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<string>('score');

  const uniSpots = useMemo(() =>
    bristolUniStudySpots.filter(s => s.universityId === university.id),
    [university.id]
  );

  const filteredSpots = useMemo(() =>
    applyFilters(uniSpots, filters, sortBy),
    [uniSpots, filters, sortBy]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    uniSpots.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
    return counts;
  }, [uniSpots]);

  return (
    <div className="pb-24 lg:pb-8">
      {/* University Header */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-6 overflow-hidden">
        <div className="relative h-[28vh] min-h-[200px] max-h-[300px]" style={{ background: `linear-gradient(135deg, ${university.color}dd, ${university.color}88)` }}>
          <div className="absolute inset-0 grain" />
          <div className="absolute inset-0 flex items-end">
            <div className="p-6 sm:p-8 w-full">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> All Universities
              </button>
              <h1 className="text-2xl sm:text-3xl text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {university.name}
              </h1>
              <p className="text-white/70 text-sm mt-1">{university.shortName} &middot; {uniSpots.length} study spots</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab('spots')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'spots' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          <Grid3X3 className="w-4 h-4" /> Spots
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          <Map className="w-4 h-4" /> Campus Map
        </button>

        <div className="flex-1" />

        {activeTab === 'spots' && (
          <>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
            >
              <option value="score">Top Rated</option>
              <option value="quiet">Quietest</option>
              <option value="name">A-Z</option>
            </select>
            <BristolUniFilterPanel filters={filters} onChange={setFilters} resultCount={filteredSpots.length} />
          </>
        )}
      </div>

      {/* Search bar */}
      {activeTab === 'spots' && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search spots..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === 'spots' && (
        <>
          {/* Quick category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setFilters({ ...filters, category: 'All' })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.category === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              All ({uniSpots.length})
            </button>
            {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filters.category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {CATEGORY_ICONS[cat] || '📍'} {cat} ({count})
              </button>
            ))}
          </div>

          {/* Active filter chips */}
          <BristolUniActiveFilterChips filters={filters} onChange={setFilters} />

          <p className="text-sm text-muted-foreground mb-4">{filteredSpots.length} spots found</p>

          {filteredSpots.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-2">No spots match your filters</p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-primary hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSpots.map((spot, i) => (
                <BristolUniSpotCard key={spot.id} spot={spot} uni={university} onClick={() => onSelectSpot(spot)} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'map' && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <BristolCampusMapView spots={filteredSpots} university={university} onSelectSpot={onSelectSpot} />
        </div>
      )}
    </div>
  );
}

// ─── Main Bristol UniMode Page ─────────────────────────────────────────────

export default function BristolUniModePage() {
  const [selectedUni, setSelectedUni] = useState<BristolUniversity | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<BristolUniStudySpot | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-xl hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: 'var(--font-display)' }}>StudySpot</span>
            </Link>
            <Link href="/bristol">
              <span className="text-xs bg-cyan-600/10 text-cyan-500 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity">Bristol</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-600/10 text-cyan-500 text-xs font-semibold border border-cyan-600/20">
              <GraduationCap className="w-3.5 h-3.5" /> UniMode
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedUni && (
              <button
                onClick={() => { setSelectedUni(null); setSelectedSpot(null); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> All Universities
              </button>
            )}
            <Link href="/bristol">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Bristol
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedUni ? (
              <button onClick={() => { setSelectedUni(null); setSelectedSpot(null); }} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/bristol">
                <div className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </Link>
            )}
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {selectedUni ? selectedUni.shortName : 'Bristol UniMode'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-600/10 text-cyan-500 text-[10px] font-semibold border border-cyan-600/20">
            <GraduationCap className="w-3 h-3" /> Uni
          </span>
        </div>
      </nav>

      {/* Main content */}
      <main className="container pt-16 lg:pt-20">
        {!selectedUni ? (
          <BristolUniversitySelector onSelect={setSelectedUni} />
        ) : (
          <BristolUniversityDashboard
            university={selectedUni}
            onBack={() => { setSelectedUni(null); setSelectedSpot(null); }}
            onSelectSpot={setSelectedSpot}
          />
        )}
      </main>

      {/* Spot detail overlay */}
      <AnimatePresence>
        {selectedSpot && (
          <BristolUniSpotDetail
            spot={selectedSpot}
            uni={selectedUni || undefined}
            onBack={() => setSelectedSpot(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
