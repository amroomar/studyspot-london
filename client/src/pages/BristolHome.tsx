/**
 * BristolHome — Main app shell for Bristol
 * Harbour Blue design: cool, coastal, creative
 * Same features as London: discovery feed, map, search, favorites, badges, social, submit
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useCity } from '@/contexts/CityContext';
import { AnimatePresence, motion } from 'framer-motion';
import { bristolLocations } from '@/lib/bristolLocations';
import { type Location } from '@/lib/locations';
import { bristolSocialVideos } from '@/lib/bristolSocialVideos';
import { type SocialVideo } from '@/lib/socialVideos';
import { BRISTOL_HERO_IMAGES, BRISTOL_CATEGORY_HERO } from '@/lib/bristolImages';
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
import { ChevronRight, X, Users, GraduationCap, ArrowRight, MapPin, Coffee, BookOpen, Sparkles, Anchor } from 'lucide-react';
import { Link } from 'wouter';
// Convert Bristol social videos to the SocialVideo format used by SocialDiscoveryPage
const bristolSocialVideosSV: SocialVideo[] = bristolSocialVideos.map(v => ({
  id: String(v.id),
  title: v.title,
  creator: v.creator,
  platform: (v.platform === 'tiktok' ? 'TikTok' : 'Instagram') as 'TikTok' | 'Instagram' | 'YouTube',
  videoUrl: v.url,
  thumbnailUrl: v.thumbnail,
  locationName: '',
  neighborhood: v.neighborhood,
  caption: v.title,
  matchedLocationId: null,
  tags: v.tags,
}));

const allLocations = bristolLocations as unknown as (Location & { type?: string })[];

type Tab = 'home' | 'map' | 'search' | 'social' | 'favorites' | 'badges';

function applyFilters(locations: typeof allLocations, filters: Filters, sortBy: 'score' | 'name') {
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
        <motion.button key={chip.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={chip.clear} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium hover:bg-primary/20 transition-colors">
          {chip.label}
          <X className="w-3 h-3" />
        </motion.button>
      ))}
      {chips.length > 1 && (
        <button onClick={() => onChange(DEFAULT_FILTERS)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline">Clear all</button>
      )}
    </div>
  );
}

function CommunityDiscoveries({ onSelectLocation }: { onSelectLocation: (loc: any) => void }) {
  const { submissions } = useSubmissions();
  if (submissions.length === 0) return null;
  const communityLocations = submissions.map(sub => ({
    id: sub.id + 200000,
    name: sub.name, type: sub.category, category: sub.category, neighborhood: sub.neighborhood, address: sub.address,
    lat: sub.lat || 51.4545, lng: sub.lng || -2.5879,
    wifi: sub.wifiQuality >= 3 ? 'yes' : 'limited', plugSockets: sub.laptopFriendly >= 3 ? 'yes' : 'limited',
    noiseLevel: sub.noiseLevel, lightingQuality: sub.lightingQuality >= 4 ? 'excellent' : 'good',
    seatingComfort: sub.seatingComfort >= 4 ? 'excellent' : 'good', laptopFriendly: sub.laptopFriendly >= 3 ? 'yes' : 'limited',
    crowdLevel: 'moderate', tableSize: 'standard', priceLevel: sub.priceLevel, studyScore: sub.studyScore || 7.0,
    atmosphere: sub.atmosphere || '', tags: sub.tags, openingHours: 'Check venue', bestTimeStudy: '', coffeeQuality: 'good',
    peakBusyTimes: 'Varies', website: sub.website || '', image: sub.images?.[0] || '',
    isCommunitySubmitted: true, submittedBy: sub.submittedBy, images: sub.images || [],
    verificationStatus: sub.verificationStatus || 'unverified', confirmationCount: sub.confirmationCount || 0, reportCount: sub.reportCount || 0,
  }));
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Community Discoveries</h2>
            <p className="text-xs text-muted-foreground">{submissions.length} spots submitted by users</p>
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {communityLocations.map((loc, i) => (
          <div key={loc.id} className="shrink-0 w-64">
            <LocationCard location={loc as any} onClick={() => onSelectLocation(loc)} index={i} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatsBar() {
  const stats = [
    { icon: Coffee, label: 'Cafes', value: '40+' },
    { icon: BookOpen, label: 'Libraries', value: '15+' },
    { icon: Anchor, label: 'Harbourside', value: '12+' },
    { icon: Sparkles, label: 'Hidden Gems', value: '30+' },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function DiscoveryFeed({ onSelectLocation, filters, setFilters, filteredLocations, sortBy, setSortBy, neighborhoods }: {
  onSelectLocation: (loc: any) => void; filters: Filters; setFilters: (f: Filters) => void;
  filteredLocations: typeof allLocations; sortBy: 'score' | 'name'; setSortBy: (s: 'score' | 'name') => void; neighborhoods: string[];
}) {
  const [visibleCount, setVisibleCount] = useState(30);
  const topRated = useMemo(() => [...allLocations].sort((a, b) => b.studyScore - a.studyScore).slice(0, 8), []);
  const hiddenGems = useMemo(() => allLocations.filter(l => l.category === 'Hidden Gem').sort((a, b) => b.studyScore - a.studyScore).slice(0, 6), []);
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  useEffect(() => { setVisibleCount(30); }, [filters, sortBy]);

  return (
    <div className="pb-24 lg:pb-8">
      {/* Hero Section */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-8 overflow-hidden">
        <div className="relative h-[50vh] min-h-[360px] max-h-[500px]">
          <img src={BRISTOL_HERO_IMAGES.main} alt="Bristol study spot" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="absolute inset-0 grain" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <div className="flex items-center gap-2 mb-3">
                <Link href="/" className="text-white/60 hover:text-white/90 text-sm transition-colors">StudySpot</Link>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <span className="text-white/90 text-sm font-medium">Bristol</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Study spots in<br />Bristol
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-lg" style={{ fontFamily: 'var(--font-body)' }}>
                Discover {allLocations.length}+ curated cafes, libraries, and hidden gems across Bristol.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* UniMode CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-10">
        <Link href="/bristol/uni">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 p-6 sm:p-8 cursor-pointer group hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl text-white font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Bristol UniMode</h3>
                  <p className="text-white/70 text-sm">UoB & UWE campus study spots</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Featured Categories */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mb-10">
        <h2 className="text-xl mb-4 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Explore by Type</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {Object.entries(BRISTOL_CATEGORY_HERO).map(([cat, img]) => (
            <button key={cat} onClick={() => setFilters({ ...DEFAULT_FILTERS, category: cat })} className={`relative shrink-0 w-36 h-24 rounded-xl overflow-hidden group ${filters.category === cat ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
              <img src={img} alt={cat} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Community Discoveries */}
      {!hasActiveFilters && <CommunityDiscoveries onSelectLocation={onSelectLocation} />}

      {/* Top Rated & Hidden Gems */}
      {!hasActiveFilters && (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Top Rated</h2>
              <button onClick={() => { setFilters({ ...DEFAULT_FILTERS, minScore: 8 }); }} className="flex items-center gap-1 text-sm text-primary hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              {topRated.map((loc, i) => (
                <div key={loc.id} className="shrink-0 w-64">
                  <LocationCard location={loc as any} onClick={() => onSelectLocation(loc)} index={i} />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Hidden Gems</h2>
              <button onClick={() => setFilters({ ...DEFAULT_FILTERS, category: 'Hidden Gem' })} className="flex items-center gap-1 text-sm text-primary hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              {hiddenGems.map((loc, i) => (
                <div key={loc.id} className="shrink-0 w-64">
                  <LocationCard location={loc as any} onClick={() => onSelectLocation(loc)} index={i} />
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* All Locations */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            {filters.category !== 'All' ? filters.category : 'All Study Spots'}
          </h2>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'score' | 'name')} className="text-sm bg-card border border-border rounded-lg px-2 py-1.5 text-foreground">
              <option value="score">Top Rated</option>
              <option value="name">A-Z</option>
            </select>
            <FilterPanel filters={filters} onChange={setFilters} neighborhoods={neighborhoods} resultCount={filteredLocations.length} />
          </div>
        </div>
        <ActiveFilterChips filters={filters} onChange={setFilters} />
        <p className="text-sm text-muted-foreground mb-4">{filteredLocations.length} spots found</p>
        {filteredLocations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-2">No spots match your filters</p>
            <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-primary hover:underline text-sm">Clear all filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLocations.slice(0, visibleCount).map((loc, i) => (
                <LocationCard key={loc.id} location={loc as any} onClick={() => onSelectLocation(loc)} index={i} />
              ))}
            </div>
            {filteredLocations.length > visibleCount && (
              <div className="text-center py-8">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setVisibleCount(prev => prev + 30)} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                  Load More ({filteredLocations.length - visibleCount} remaining)
                </motion.button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

function BristolHomeInner() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCommunityOnly, setShowCommunityOnly] = useState(false);
  const { submissions } = useSubmissions();

  const handleSelectLocation = useCallback((loc: any) => { setSelectedLocation(loc); }, []);

  const neighborhoods = useMemo(() => {
    const hoods = new Set(allLocations.map(l => l.neighborhood));
    return Array.from(hoods).sort();
  }, []);

  const communityLocations = useMemo(() => {
    return submissions.map(sub => ({
      id: sub.id + 200000, name: sub.name, type: sub.category, category: sub.category,
      neighborhood: sub.neighborhood, address: sub.address, lat: sub.lat || 51.4545, lng: sub.lng || -2.5879,
      wifi: sub.wifiQuality >= 3 ? 'yes' : 'limited', plugSockets: sub.laptopFriendly >= 3 ? 'yes' : 'limited',
      noiseLevel: sub.noiseLevel, lightingQuality: 'good', seatingComfort: 'good', laptopFriendly: sub.laptopFriendly >= 3 ? 'yes' : 'limited',
      crowdLevel: 'moderate', tableSize: 'standard', priceLevel: sub.priceLevel, studyScore: sub.studyScore || 7.0,
      atmosphere: sub.atmosphere || '', tags: sub.tags, openingHours: 'Check venue', bestTimeStudy: '', coffeeQuality: 'good',
      peakBusyTimes: 'Varies', website: sub.website || '', image: sub.images?.[0] || '',
      isCommunitySubmitted: true, submittedBy: sub.submittedBy, images: sub.images || [],
      verificationStatus: sub.verificationStatus || 'unverified', confirmationCount: sub.confirmationCount || 0, reportCount: sub.reportCount || 0,
    }));
  }, [submissions]);

  const filteredLocations = useMemo(() => applyFilters(allLocations, filters, sortBy), [filters, sortBy]);

  const mapLocations = useMemo(() => {
    if (showCommunityOnly) return communityLocations as any[];
    return [...filteredLocations, ...communityLocations] as any[];
  }, [filteredLocations, communityLocations, showCommunityOnly]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} onAddSpot={() => setShowSubmitModal(true)} cityPrefix="/bristol" />
      <main className={`${activeTab === 'map' ? '' : 'container pt-14 lg:pt-20'}`}>
        {activeTab === 'home' && (
          <DiscoveryFeed onSelectLocation={handleSelectLocation} filters={filters} setFilters={setFilters} filteredLocations={filteredLocations} sortBy={sortBy} setSortBy={setSortBy} neighborhoods={neighborhoods} />
        )}
        {activeTab === 'map' && (
          <div className="fixed inset-0 lg:top-14">
            <MapPage locations={mapLocations} onSelectLocation={handleSelectLocation} showCommunityOnly={showCommunityOnly} onToggleCommunityOnly={() => setShowCommunityOnly(prev => !prev)} communityCount={communityLocations.length} defaultCenter={{ lat: 51.4545, lng: -2.5879 }} defaultZoom={13} />
          </div>
        )}
        {activeTab === 'search' && <SearchPage locations={allLocations as any[]} onSelectLocation={handleSelectLocation} />}
        {activeTab === 'social' && <SocialDiscoveryPage locations={allLocations as any[]} onSelectLocation={handleSelectLocation} customVideos={bristolSocialVideosSV} cityName="Bristol" />}
        {activeTab === 'favorites' && <FavoritesPage locations={allLocations as any[]} onSelectLocation={handleSelectLocation} />}
        {activeTab === 'badges' && <BadgesPage />}
      </main>
      <AnimatePresence>
        {selectedLocation && <LocationDetail location={selectedLocation} onBack={() => setSelectedLocation(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background overflow-y-auto custom-scrollbar">
            <SubmitSpotPage onClose={() => setShowSubmitModal(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BristolHome() {
  const { setCity } = useCity();
  useEffect(() => { setCity('bristol'); }, [setCity]);

  return (
    <FavoritesProvider>
      <ReviewsProvider>
        <GamificationProvider>
          <SubmissionsProvider city="bristol">
            <LiveVibeProvider>
              <BristolHomeInner />
            </LiveVibeProvider>
          </SubmissionsProvider>
        </GamificationProvider>
      </ReviewsProvider>
    </FavoritesProvider>
  );
}
