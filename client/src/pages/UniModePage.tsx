/**
 * UniMode — University Study Spots
 * London Fog design: atmospheric, warm, editorial
 * Features: university selector, spot cards, campus map, filters, detail views
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  universities,
  uniStudySpots,
  LOCATION_TYPES,
  ACCESS_TYPES,
  ENVIRONMENT_TAGS,
  TYPE_ICONS,
  ACCESS_ICONS,
  type UniStudySpot,
  type University,
} from '@/lib/uniStudySpots';
import { getUniSpotImage } from '@/lib/uniImages';
import { useImageOverrides } from '@/contexts/ImageOverridesContext';
import { MapView } from '@/components/Map';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Coffee,
  ExternalLink,
  Filter,
  GraduationCap,
  Grid3X3,
  Heart,
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
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  if (score >= 7) return 'bg-fog-sage text-white';
  if (score >= 5) return 'bg-fog-gold text-fog-charcoal';
  return 'bg-muted text-muted-foreground';
}

// ─── Filters ───────────────────────────────────────────────────────────────

interface UniFilters {
  locationType: string;
  accessType: string;
  quietnessMax: number;
  wifi: boolean;
  plugs: boolean;
  groupStudy: boolean;
  creativeFriendly: boolean;
  tags: string[];
  searchQuery: string;
}

const DEFAULT_UNI_FILTERS: UniFilters = {
  locationType: 'All',
  accessType: 'All',
  quietnessMax: 5,
  wifi: false,
  plugs: false,
  groupStudy: false,
  creativeFriendly: false,
  tags: [],
  searchQuery: '',
};

function applyUniFilters(spots: UniStudySpot[], filters: UniFilters, sortBy: string): UniStudySpot[] {
  let result = spots;

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.campus.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.atmosphere.toLowerCase().includes(q)
    );
  }
  if (filters.locationType !== 'All') result = result.filter(s => s.locationType === filters.locationType);
  if (filters.accessType !== 'All') result = result.filter(s => s.accessType === filters.accessType);
  if (filters.quietnessMax < 5) result = result.filter(s => s.quietnessLevel <= filters.quietnessMax);
  if (filters.wifi) result = result.filter(s => s.wifi === 'yes');
  if (filters.plugs) result = result.filter(s => s.plugSockets === 'yes' || s.plugSockets === 'limited');
  if (filters.groupStudy) result = result.filter(s => s.groupStudy === 'yes');
  if (filters.creativeFriendly) result = result.filter(s => s.creativeFriendly === 'yes');
  if (filters.tags.length > 0) {
    result = result.filter(s => filters.tags.some(t => s.tags.includes(t)));
  }

  if (sortBy === 'score') result = [...result].sort((a, b) => b.studyScore - a.studyScore);
  else if (sortBy === 'quiet') result = [...result].sort((a, b) => a.quietnessLevel - b.quietnessLevel);
  else result = [...result].sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

// ─── UniSpotCard ───────────────────────────────────────────────────────────

function UniSpotCard({ spot, onClick, index = 0 }: { spot: UniStudySpot; onClick: () => void; index?: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { resolveImage } = useImageOverrides();
  const defaultImage = getUniSpotImage(spot.name, spot.locationType, spot.image);
  const image = resolveImage('uni', spot.id, defaultImage) || defaultImage;

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
            src={image}
            alt={spot.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Score badge */}
          <div className={`absolute top-3 right-3 ${scoreColor(spot.studyScore)} px-2.5 py-1 rounded-lg text-xs font-bold score-badge`}>
            {spot.studyScore.toFixed(1)}
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3 glass rounded-lg px-2 py-1 text-xs font-medium text-foreground">
            {TYPE_ICONS[spot.locationType] || '📍'} {spot.locationType}
          </div>

          {/* Access badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              spot.accessType === 'Public' ? 'bg-emerald-500/90 text-white' :
              spot.accessType === 'University Students Only' ? 'bg-blue-500/90 text-white' :
              spot.accessType === 'Keycard Required' ? 'bg-amber-500/90 text-white' :
              'bg-purple-500/90 text-white'
            }`}>
              {ACCESS_ICONS[spot.accessType]} {spot.accessType === 'University Students Only' ? 'Students Only' : spot.accessType}
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
            <span className="line-clamp-1">{spot.campus}</span>
          </p>

          {/* Attributes row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            {spot.wifi === 'yes' && (
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-fog-sage" /> WiFi</span>
            )}
            {(spot.plugSockets === 'yes' || spot.plugSockets === 'limited') && (
              <span className="flex items-center gap-1"><Plug className="w-3 h-3 text-fog-sage" /> Plugs</span>
            )}
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${quietnessColor(spot.quietnessLevel)}`}>
              <Volume2 className="w-3 h-3" /> {quietnessLabel(spot.quietnessLevel)}
            </span>
          </div>

          {/* Tags */}
          {spot.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {spot.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-secondary rounded-full text-[10px] text-secondary-foreground">
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

// ─── UniSpotDetail ─────────────────────────────────────────────────────────

function UniSpotDetail({ spot, onBack }: { spot: UniStudySpot; onBack: () => void }) {
  const { resolveImage } = useImageOverrides();
  const defaultImage = getUniSpotImage(spot.name, spot.locationType, spot.image);
  const image = resolveImage('uni', spot.id, defaultImage) || defaultImage;
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
        <img src={image} alt={spot.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${scoreColor(spot.studyScore)} score-badge`}>
              {spot.studyScore.toFixed(1)}
            </span>
            <span className="glass rounded-lg px-2 py-1 text-xs font-medium text-white/90">
              {TYPE_ICONS[spot.locationType]} {spot.locationType}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              spot.accessType === 'Public' ? 'bg-emerald-500/90 text-white' :
              spot.accessType === 'University Students Only' ? 'bg-blue-500/90 text-white' :
              spot.accessType === 'Keycard Required' ? 'bg-amber-500/90 text-white' :
              'bg-purple-500/90 text-white'
            }`}>
              {ACCESS_ICONS[spot.accessType]} {spot.accessType}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {spot.name}
          </h1>
          <p className="text-white/70 text-sm mt-1">{spot.university} &middot; {spot.campus}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Address & Directions */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-card rounded-xl border border-border/50">
          <MapPin className="w-5 h-5 text-fog-sage shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm">{spot.address}</p>
            {spot.openingHours && (
              <p className="text-xs text-muted-foreground mt-1">{spot.openingHours}</p>
            )}
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-fog-sage text-white rounded-lg text-xs font-medium hover:bg-fog-sage/90 transition-colors"
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
            <AttributeCard icon={Volume2} label="Quietness" value={quietnessLabel(spot.quietnessLevel)} />
            <AttributeCard icon={Wifi} label="WiFi" value={spot.wifi === 'yes' ? 'Available' : spot.wifi === 'limited' ? 'Limited' : 'No'} />
            <AttributeCard icon={Plug} label="Power Outlets" value={spot.plugSockets === 'yes' ? 'Available' : spot.plugSockets === 'limited' ? 'Limited' : 'No'} />
            <AttributeCard icon={Laptop} label="Laptop Friendly" value={spot.laptopFriendly === 'yes' ? 'Yes' : 'Limited'} />
            <AttributeCard icon={GraduationCap} label="Group Study" value={spot.groupStudy === 'yes' ? 'Yes' : 'No'} />
            <AttributeCard icon={Sparkles} label="Creative Friendly" value={spot.creativeFriendly === 'yes' ? 'Yes' : 'No'} />
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
      <div className="w-8 h-8 rounded-lg bg-fog-sage/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-fog-sage" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────

function UniFilterPanel({
  filters,
  onChange,
  resultCount,
}: {
  filters: UniFilters;
  onChange: (f: UniFilters) => void;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const hasActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_UNI_FILTERS);

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

                {/* Location Type */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Location Type</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip label="All" active={filters.locationType === 'All'} onClick={() => onChange({ ...filters, locationType: 'All' })} />
                    {LOCATION_TYPES.map(t => (
                      <FilterChip key={t} label={`${TYPE_ICONS[t] || ''} ${t}`} active={filters.locationType === t} onClick={() => onChange({ ...filters, locationType: t })} />
                    ))}
                  </div>
                </div>

                {/* Access Type */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Access</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip label="All" active={filters.accessType === 'All'} onClick={() => onChange({ ...filters, accessType: 'All' })} />
                    {ACCESS_TYPES.map(t => (
                      <FilterChip key={t} label={`${ACCESS_ICONS[t] || ''} ${t}`} active={filters.accessType === t} onClick={() => onChange({ ...filters, accessType: t })} />
                    ))}
                  </div>
                </div>

                {/* Quietness */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Max Noise Level: {quietnessLabel(filters.quietnessMax)}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={filters.quietnessMax}
                    onChange={(e) => onChange({ ...filters, quietnessMax: parseInt(e.target.value) })}
                    className="w-full accent-fog-sage"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Silent</span><span>Quiet</span><span>Moderate</span><span>Lively</span><span>Loud</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Requirements</label>
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleChip label="WiFi" icon={Wifi} active={filters.wifi} onClick={() => onChange({ ...filters, wifi: !filters.wifi })} />
                    <ToggleChip label="Power Outlets" icon={Plug} active={filters.plugs} onClick={() => onChange({ ...filters, plugs: !filters.plugs })} />
                    <ToggleChip label="Group Study" icon={GraduationCap} active={filters.groupStudy} onClick={() => onChange({ ...filters, groupStudy: !filters.groupStudy })} />
                    <ToggleChip label="Creative" icon={Sparkles} active={filters.creativeFriendly} onClick={() => onChange({ ...filters, creativeFriendly: !filters.creativeFriendly })} />
                  </div>
                </div>

                {/* Environment Tags */}
                <div className="mb-6">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Environment</label>
                  <div className="flex flex-wrap gap-2">
                    {ENVIRONMENT_TAGS.map(tag => (
                      <FilterChip
                        key={tag}
                        label={tag}
                        active={filters.tags.includes(tag)}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter(t => t !== tag)
                            : [...filters.tags, tag];
                          onChange({ ...filters, tags: newTags });
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onChange(DEFAULT_UNI_FILTERS)}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1 bg-fog-sage hover:bg-fog-sage/90 text-white"
                    onClick={() => setOpen(false)}
                  >
                    Show {resultCount} spots
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
    </button>
  );
}

function ToggleChip({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
        active
          ? 'bg-fog-sage/10 text-fog-sage border border-fog-sage/30'
          : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ─── Active Filter Chips ───────────────────────────────────────────────────

function UniActiveFilterChips({ filters, onChange }: { filters: UniFilters; onChange: (f: UniFilters) => void }) {
  const chips: { label: string; clear: () => void }[] = [];

  if (filters.locationType !== 'All') chips.push({ label: filters.locationType, clear: () => onChange({ ...filters, locationType: 'All' }) });
  if (filters.accessType !== 'All') chips.push({ label: filters.accessType, clear: () => onChange({ ...filters, accessType: 'All' }) });
  if (filters.wifi) chips.push({ label: 'WiFi', clear: () => onChange({ ...filters, wifi: false }) });
  if (filters.plugs) chips.push({ label: 'Plugs', clear: () => onChange({ ...filters, plugs: false }) });
  if (filters.groupStudy) chips.push({ label: 'Group Study', clear: () => onChange({ ...filters, groupStudy: false }) });
  if (filters.creativeFriendly) chips.push({ label: 'Creative', clear: () => onChange({ ...filters, creativeFriendly: false }) });
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
          onClick={() => onChange(DEFAULT_UNI_FILTERS)}
          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// ─── Campus Map View ───────────────────────────────────────────────────────

function CampusMapView({
  spots,
  university,
  onSelectSpot,
}: {
  spots: UniStudySpot[];
  university: University;
  onSelectSpot: (spot: UniStudySpot) => void;
}) {
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [previewSpot, setPreviewSpot] = useState<UniStudySpot | null>(null);
  const { resolveImage } = useImageOverrides();

  const createMarkers = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];

    spots.forEach(spot => {
      const markerEl = document.createElement('div');
      const isPublic = spot.accessType === 'Public';
      const bgColor = isPublic ? '#22c55e' : university.color;

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
        initialZoom={university.zoom}
        onMapReady={createMarkers}
      />

      {/* Map legend */}
      <div className="absolute top-4 left-4 glass rounded-xl p-3 text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: university.color }} />
          <span>Campus spots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Public access</span>
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
                  src={resolveImage('uni', previewSpot.id, getUniSpotImage(previewSpot.name, previewSpot.locationType, previewSpot.image))}
                  alt={previewSpot.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${scoreColor(previewSpot.studyScore)} px-1.5 py-0.5 rounded text-[10px] font-bold score-badge`}>
                      {previewSpot.studyScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{previewSpot.locationType}</span>
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {previewSpot.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{previewSpot.campus}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectSpot(previewSpot)}
                      className="px-3 py-1.5 bg-fog-sage text-white rounded-lg text-xs font-medium hover:bg-fog-sage/90 transition-colors"
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

function UniversitySelector({ onSelect }: { onSelect: (uni: University) => void }) {
  return (
    <div className="pb-24 lg:pb-8">
      {/* Hero */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-8 overflow-hidden">
        <div className="relative h-[40vh] min-h-[300px] max-h-[420px] bg-gradient-to-br from-fog-charcoal via-fog-charcoal/95 to-fog-sage/30">
          <div className="absolute inset-0 grain" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4">
                  <GraduationCap className="w-4 h-4 text-fog-gold" />
                  <span className="text-sm text-white/80 font-medium">UniMode</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  University Study Spots
                </h1>
                <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
                  175 curated study spaces across 10 London universities. Libraries, labs, lounges, and nearby cafes.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* University Grid */}
      <div className="mb-8">
        <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>Select Your University</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {universities.map((uni, i) => (
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
                  {uni.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {uni.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{uni.fullName}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {uni.campus}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {uni.spotCount} spots</span>
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
        <StatCard icon={Library} label="Libraries" value="39" />
        <StatCard icon={Coffee} label="Cafes" value="72" />
        <StatCard icon={Lock} label="Keycard Spaces" value="7" />
        <StatCard icon={Sparkles} label="Creative Spaces" value="4" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-4 bg-card rounded-xl border border-border/50 text-center">
      <Icon className="w-5 h-5 text-fog-sage mx-auto mb-2" />
      <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── University Dashboard ──────────────────────────────────────────────────

type UniTab = 'spots' | 'map';

function UniversityDashboard({
  university,
  onBack,
  onSelectSpot,
}: {
  university: University;
  onBack: () => void;
  onSelectSpot: (spot: UniStudySpot) => void;
}) {
  const [activeTab, setActiveTab] = useState<UniTab>('spots');
  const [filters, setFilters] = useState<UniFilters>(DEFAULT_UNI_FILTERS);
  const [sortBy, setSortBy] = useState<string>('score');

  const uniSpots = useMemo(() =>
    uniStudySpots.filter(s => s.universityId === university.id),
    [university.id]
  );

  const filteredSpots = useMemo(() =>
    applyUniFilters(uniSpots, filters, sortBy),
    [uniSpots, filters, sortBy]
  );

  // Quick category counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    uniSpots.forEach(s => { counts[s.locationType] = (counts[s.locationType] || 0) + 1; });
    return counts;
  }, [uniSpots]);

  const accessCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    uniSpots.forEach(s => { counts[s.accessType] = (counts[s.accessType] || 0) + 1; });
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
              <p className="text-white/70 text-sm mt-1">{university.fullName} &middot; {university.campus} &middot; {uniSpots.length} study spots</p>
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
            <UniFilterPanel filters={filters} onChange={setFilters} resultCount={filteredSpots.length} />
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
          {/* Quick type pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setFilters({ ...filters, locationType: 'All' })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.locationType === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              All ({uniSpots.length})
            </button>
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <button
                key={type}
                onClick={() => setFilters({ ...filters, locationType: type })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filters.locationType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {TYPE_ICONS[type] || '📍'} {type} ({count})
              </button>
            ))}
          </div>

          {/* Active filter chips */}
          <UniActiveFilterChips filters={filters} onChange={setFilters} />

          <p className="text-sm text-muted-foreground mb-4">{filteredSpots.length} spots found</p>

          {filteredSpots.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-2">No spots match your filters</p>
              <button
                onClick={() => setFilters(DEFAULT_UNI_FILTERS)}
                className="text-primary hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSpots.map((spot, i) => (
                <UniSpotCard key={spot.id} spot={spot} onClick={() => onSelectSpot(spot)} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'map' && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <CampusMapView spots={filteredSpots} university={university} onSelectSpot={onSelectSpot} />
        </div>
      )}
    </div>
  );
}

// ─── Main UniMode Page ─────────────────────────────────────────────────────

export default function UniModePage() {
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<UniStudySpot | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-xl hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: 'var(--font-display)' }}>StudySpot</span>
            </Link>
            <span className="text-xs bg-fog-sage/10 text-fog-sage px-2 py-0.5 rounded-full font-medium">London</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fog-gold/10 text-fog-gold text-xs font-semibold border border-fog-gold/20">
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
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Main
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
              <Link href="/">
                <div className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </Link>
            )}
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {selectedUni ? selectedUni.name : 'UniMode'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-fog-gold/10 text-fog-gold text-[10px] font-semibold border border-fog-gold/20">
            <GraduationCap className="w-3 h-3" /> Uni
          </span>
        </div>
      </nav>

      {/* Main content */}
      <main className="container pt-16 lg:pt-20">
        {!selectedUni ? (
          <UniversitySelector onSelect={setSelectedUni} />
        ) : (
          <UniversityDashboard
            university={selectedUni}
            onBack={() => { setSelectedUni(null); setSelectedSpot(null); }}
            onSelectSpot={setSelectedSpot}
          />
        )}
      </main>

      {/* Spot detail overlay */}
      <AnimatePresence>
        {selectedSpot && (
          <UniSpotDetail
            spot={selectedSpot}
            onBack={() => setSelectedSpot(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
