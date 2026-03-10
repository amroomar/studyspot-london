/**
 * Home — Main app shell
 * London Fog design: atmospheric, warm, editorial
 * Combines discovery feed, map, search, favorites, badges, social, submit
 * Features: community submissions, live vibe, heatmap, community discoveries
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { locations as allLocations, type Location } from '@/lib/locations';
import { HERO_IMAGES } from '@/lib/images';
import Navbar from '@/components/Navbar';
import LocationCard from '@/components/LocationCard';
import LocationDetail from '@/components/LocationDetail';
import FilterPanel, { type Filters, DEFAULT_FILTERS } from '@/components/FilterPanel';
import MapPage from '@/pages/MapPage';
import SearchPage from '@/pages/SearchPage';
import FavoritesPage from '@/pages/FavoritesPage';
import BadgesPage from '@/pages/BadgesPage';
import SocialDiscoveryPage from '@/pages/SocialDiscoveryPage';
import SubmitSpotPage from '@/pages/SubmitSpotPage';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { ReviewsProvider } from '@/contexts/ReviewsContext';
import { SubmissionsProvider, useSubmissions } from '@/contexts/SubmissionsContext';
import { LiveVibeProvider } from '@/contexts/LiveVibeContext';
import { ChevronRight, X, Sparkles, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

type Tab = 'home' | 'map' | 'search' | 'social' | 'favorites' | 'badges';

// Category hero images mapping
const CATEGORY_HERO: Record<string, string> = {
  'Quiet Study Cafe': HERO_IMAGES.main,
  'Library': HERO_IMAGES.library,
  'Creative Workspace': HERO_IMAGES.coworking,
  'Coworking Space': HERO_IMAGES.coworking,
  'Nature/Greenery': HERO_IMAGES.garden,
  'Hotel Lounge': HERO_IMAGES.hotel,
};

function applyFilters(locations: Location[], filters: Filters, sortBy: 'score' | 'name'): Location[] {
  let result = locations;

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(l => l.name.toLowerCase().includes(q) || l.neighborhood.toLowerCase().includes(q));
  }
  if (filters.category !== 'All') result = result.filter(l => l.category === filters.category);
  if (filters.neighborhood !== 'All') result = result.filter(l => l.neighborhood === filters.neighborhood);
  if (filters.noiseMax < 5) result = result.filter(l => l.noiseLevel <= filters.noiseMax);
  if (filters.wifi) result = result.filter(l => l.wifi === 'yes');
  if (filters.plugs) result = result.filter(l => l.plugSockets === 'yes');
  if (filters.laptopFriendly) result = result.filter(l => l.laptopFriendly === 'yes');
  if (filters.priceLevel !== 'All') result = result.filter(l => l.priceLevel === 'All' ? true : l.priceLevel === filters.priceLevel);
  if (filters.minScore > 0) result = result.filter(l => l.studyScore >= filters.minScore);

  if (sortBy === 'score') result = [...result].sort((a, b) => b.studyScore - a.studyScore);
  else result = [...result].sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

/** Active filter indicator chips */
function ActiveFilterChips({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const chips: { label: string; clear: () => void }[] = [];

  if (filters.category !== 'All') chips.push({ label: filters.category, clear: () => onChange({ ...filters, category: 'All' }) });
  if (filters.neighborhood !== 'All') chips.push({ label: filters.neighborhood, clear: () => onChange({ ...filters, neighborhood: 'All' }) });
  if (filters.wifi) chips.push({ label: 'Wi-Fi', clear: () => onChange({ ...filters, wifi: false }) });
  if (filters.plugs) chips.push({ label: 'Plugs', clear: () => onChange({ ...filters, plugs: false }) });
  if (filters.laptopFriendly) chips.push({ label: 'Laptop Friendly', clear: () => onChange({ ...filters, laptopFriendly: false }) });
  if (filters.noiseMax < 5) chips.push({ label: `Noise ≤${filters.noiseMax}`, clear: () => onChange({ ...filters, noiseMax: 5 }) });
  if (filters.priceLevel !== 'All') chips.push({ label: filters.priceLevel, clear: () => onChange({ ...filters, priceLevel: 'All' }) });
  if (filters.minScore > 0) chips.push({ label: `Score ≥${filters.minScore}`, clear: () => onChange({ ...filters, minScore: 0 }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <motion.button
          key={chip.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={chip.clear}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </motion.button>
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

/** Community Discoveries Section — shows user-submitted spots */
function CommunityDiscoveries({ onSelectLocation }: { onSelectLocation: (loc: Location) => void }) {
  const { submissions } = useSubmissions();

  if (submissions.length === 0) return null;

  // Convert submissions to Location-like objects for display
  const communityLocations: (Location & { isCommunitySubmitted: boolean; submittedBy: string; images: string[] })[] = submissions.map(sub => ({
    id: sub.id + 100000,
    name: sub.name,
    type: sub.category,
    category: sub.category,
    neighborhood: sub.neighborhood,
    address: sub.address,
    lat: sub.lat || 51.515,
    lng: sub.lng || -0.1,
    wifi: sub.wifiQuality >= 3 ? 'yes' : 'limited',
    plugSockets: sub.laptopFriendly >= 3 ? 'yes' : 'limited',
    noiseLevel: sub.noiseLevel,
    lightingQuality: sub.lightingQuality >= 4 ? 'excellent' : sub.lightingQuality >= 3 ? 'good' : 'average',
    seatingComfort: sub.seatingComfort >= 4 ? 'excellent' : sub.seatingComfort >= 3 ? 'good' : 'average',
    laptopFriendly: sub.laptopFriendly >= 3 ? 'yes' : 'limited',
    crowdLevel: sub.crowdLevel <= 2 ? 'low' : sub.crowdLevel <= 3 ? 'moderate' : 'high',
    tableSize: 'standard',
    priceLevel: sub.priceLevel,
    studyScore: sub.studyScore || 7.0,
    atmosphere: sub.atmosphere || '',
    tags: sub.tags,
    openingHours: 'Check venue',
    bestTimeStudy: '',
    coffeeQuality: sub.category === 'Cafe' ? 'good' : 'N/A',
    peakBusyTimes: 'Varies',
    website: sub.website || '',
    image: sub.images?.[0] || '',
    // Extra community fields
    isCommunitySubmitted: true,
    submittedBy: sub.submittedBy,
    images: sub.images || [],
  }));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-fog-sage/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-fog-sage" />
          </div>
          <div>
            <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Community Discoveries</h2>
            <p className="text-xs text-muted-foreground">{submissions.length} spots submitted by users</p>
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {communityLocations.map((loc, i) => (
          <div key={loc.id} className="shrink-0 w-64">
            <LocationCard location={loc} onClick={() => onSelectLocation(loc)} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscoveryFeed({
  onSelectLocation,
  filters,
  setFilters,
  filteredLocations,
  sortBy,
  setSortBy,
  neighborhoods,
}: {
  onSelectLocation: (loc: Location) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  filteredLocations: Location[];
  sortBy: 'score' | 'name';
  setSortBy: (s: 'score' | 'name') => void;
  neighborhoods: string[];
}) {
  const topRated = useMemo(() =>
    [...allLocations].sort((a, b) => b.studyScore - a.studyScore).slice(0, 8),
  []);
  const hiddenGems = useMemo(() =>
    allLocations.filter(l => l.category === 'Hidden Gem').sort((a, b) => b.studyScore - a.studyScore).slice(0, 6),
  []);

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="pb-24 lg:pb-8">
      {/* Hero Section */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-8 overflow-hidden">
        <div className="relative h-[50vh] min-h-[360px] max-h-[500px]">
          <img
            src={HERO_IMAGES.main}
            alt="London study spot"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="absolute inset-0 grain" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl text-white mb-2 sm:mb-3 leading-tight truncate-2" style={{ fontFamily: 'var(--font-display)' }}>
                Find your perfect study spot
              </h1>
              <p className="text-white/70 text-xs sm:text-base lg:text-lg max-w-lg line-clamp-2" style={{ fontFamily: 'var(--font-body)' }}>
                Discover {allLocations.length}+ curated cafes, libraries, and hidden gems across London.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Categories — Horizontal scroll */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>Explore by Type</h2>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {Object.entries(CATEGORY_HERO).map(([cat, img]) => (
            <button
              key={cat}
              onClick={() => setFilters({ ...DEFAULT_FILTERS, category: cat })}
              className={`relative shrink-0 w-32 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden group transition-transform duration-200 hover:scale-105 ${
                filters.category === cat ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              <img src={img} alt={cat} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 text-white text-xs font-medium leading-tight truncate">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* UniMode CTA Banner */}
      {!hasActiveFilters && (
        <Link href="/uni">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 relative overflow-hidden rounded-2xl cursor-pointer group"
          >
            <div className="relative p-4 sm:p-8 bg-gradient-to-r from-fog-charcoal via-fog-charcoal/95 to-fog-sage/30">
              <div className="absolute inset-0 grain" />
              <div className="relative flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-fog-gold/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 sm:w-6 h-5 sm:h-6 text-fog-gold" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg text-white font-semibold truncate" style={{ fontFamily: 'var(--font-display)' }}>UniMode</h3>
                    <p className="text-white/60 text-xs sm:text-sm truncate">175 spots across 10 universities</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:scale-105" style={{ backgroundColor: '#2e2927', color: '#ffffff' }}>
                  Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#2e2927' }}>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      )}

      {/* Community Discoveries */}
      {!hasActiveFilters && <CommunityDiscoveries onSelectLocation={onSelectLocation} />}

      {/* Show Top Rated & Hidden Gems only when no active filters */}
      {!hasActiveFilters && (
        <>
          {/* Top Rated Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Top Rated</h2>
              <button
                onClick={() => { setFilters({ ...DEFAULT_FILTERS, minScore: 8 }); }}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              {topRated.map((loc, i) => (
                <div key={loc.id} className="shrink-0 w-64">
                  <LocationCard location={loc} onClick={() => onSelectLocation(loc)} index={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Gems Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Hidden Gems</h2>
              <button
                onClick={() => setFilters({ ...DEFAULT_FILTERS, category: 'Hidden Gem' })}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              {hiddenGems.map((loc, i) => (
                <div key={loc.id} className="shrink-0 w-64">
                  <LocationCard location={loc} onClick={() => onSelectLocation(loc)} index={i} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* All Locations with Filters */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
            {filters.category !== 'All' ? filters.category : 'All Study Spots'}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
              className="text-sm bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
            >
              <option value="score">Top Rated</option>
              <option value="name">A-Z</option>
            </select>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              neighborhoods={neighborhoods}
              resultCount={filteredLocations.length}
            />
          </div>
        </div>

        {/* Active filter chips */}
        <ActiveFilterChips filters={filters} onChange={setFilters} />

        <p className="text-sm text-muted-foreground mb-4">{filteredLocations.length} spots found</p>

        {filteredLocations.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLocations.slice(0, 60).map((loc, i) => (
                <LocationCard key={loc.id} location={loc} onClick={() => onSelectLocation(loc)} index={i} />
              ))}
            </div>

            {filteredLocations.length > 60 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Showing 60 of {filteredLocations.length} results. Use filters to narrow down.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    document.title = 'StudySpot London \u2014 Best Cafes, Libraries & Study Spaces';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Discover 310+ curated study spots across London. Find quiet cafes, libraries, coworking spaces, and university study rooms with reviews and maps.');
    }
  }, []);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSelectLocation = useCallback((loc: Location) => {
    setSelectedLocation(loc);
  }, []);

  const neighborhoods = useMemo(() => {
    const hoods = new Set(allLocations.map(l => l.neighborhood));
    return Array.from(hoods).sort();
  }, []);

  // Shared filtered locations — used by both discovery feed and map
  const filteredLocations = useMemo(() =>
    applyFilters(allLocations, filters, sortBy),
  [filters, sortBy]);

  return (
    <FavoritesProvider>
      <ReviewsProvider>
        <GamificationProvider>
          <SubmissionsProvider>
            <LiveVibeProvider>
              <div className="min-h-screen bg-background">
                <Navbar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onAddSpot={() => setShowSubmitModal(true)}
                />

                {/* Main content area */}
                <main className={`${activeTab === 'map' ? '' : 'container pt-4 lg:pt-20'}`}>
                  {activeTab === 'home' && (
                    <DiscoveryFeed
                      onSelectLocation={handleSelectLocation}
                      filters={filters}
                      setFilters={setFilters}
                      filteredLocations={filteredLocations}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      neighborhoods={neighborhoods}
                    />
                  )}
                  {activeTab === 'map' && (
                    <div className="fixed inset-0 lg:top-14">
                      <MapPage locations={filteredLocations} onSelectLocation={handleSelectLocation} />
                    </div>
                  )}
                  {activeTab === 'search' && <SearchPage locations={allLocations} onSelectLocation={handleSelectLocation} />}
                  {activeTab === 'social' && <SocialDiscoveryPage locations={allLocations} onSelectLocation={handleSelectLocation} />}
                  {activeTab === 'favorites' && <FavoritesPage locations={allLocations} onSelectLocation={handleSelectLocation} />}
                  {activeTab === 'badges' && <BadgesPage />}
                </main>

                {/* Location detail overlay */}
                <AnimatePresence>
                  {selectedLocation && (
                    <LocationDetail
                      location={selectedLocation}
                      onBack={() => setSelectedLocation(null)}
                    />
                  )}
                </AnimatePresence>

                {/* Submit Spot Modal */}
                <AnimatePresence>
                  {showSubmitModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-background overflow-y-auto custom-scrollbar"
                    >
                      <SubmitSpotPage onClose={() => setShowSubmitModal(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </LiveVibeProvider>
          </SubmissionsProvider>
        </GamificationProvider>
      </ReviewsProvider>
    </FavoritesProvider>
  );
}
