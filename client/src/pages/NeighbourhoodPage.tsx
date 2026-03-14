/**
 * NeighbourhoodPage — SEO-optimized landing page for each neighbourhood
 * Dynamic route: /london/area/:slug or /bristol/area/:slug
 * Shows all study spots in that neighbourhood with rich meta, internal links, and structured data
 */
import { useMemo, useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { locations as londonLocations, type Location } from '@/lib/locations';
import { bristolLocations } from '@/lib/bristolLocations';
import LocationCard from '@/components/LocationCard';
import { OpenBadgeCompact } from '@/components/OpenStatusBadge';
import { MapPin, ArrowLeft, Star, Wifi, Plug, Volume2, ChevronRight, Coffee, BookOpen, Briefcase, Gem, Building2 } from 'lucide-react';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function unslugify(slug: string): string {
  return slug.replace(/-/g, ' ');
}

const CATEGORY_ICONS: Record<string, typeof Coffee> = {
  'Quiet Study Cafe': Coffee,
  'Library': BookOpen,
  'Coworking Space': Briefcase,
  'Creative Workspace': Briefcase,
  'Hidden Gem': Gem,
  'Hotel Lounge': Building2,
};

interface NeighbourhoodStats {
  totalSpots: number;
  avgScore: number;
  topScore: number;
  hasWifi: number;
  hasPlugs: number;
  categories: Record<string, number>;
  avgNoise: number;
}

function computeStats(locations: Location[]): NeighbourhoodStats {
  const totalSpots = locations.length;
  const avgScore = totalSpots > 0 ? locations.reduce((s, l) => s + l.studyScore, 0) / totalSpots : 0;
  const topScore = totalSpots > 0 ? Math.max(...locations.map(l => l.studyScore)) : 0;
  const hasWifi = locations.filter(l => l.wifi === 'yes').length;
  const hasPlugs = locations.filter(l => l.plugSockets === 'yes').length;
  const avgNoise = totalSpots > 0 ? locations.reduce((s, l) => s + l.noiseLevel, 0) / totalSpots : 0;
  const categories: Record<string, number> = {};
  locations.forEach(l => { categories[l.category] = (categories[l.category] || 0) + 1; });
  return { totalSpots, avgScore, topScore, hasWifi, hasPlugs, categories, avgNoise };
}

function NeighbourhoodContent({ city, slug }: { city: 'london' | 'bristol'; slug: string }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'noise'>('score');

  const allLocations = city === 'london' ? londonLocations : bristolLocations;

  // Find the neighbourhood by matching slug
  const { neighbourhood, locations } = useMemo(() => {
    const allNeighbourhoods = Array.from(new Set(allLocations.map(l => l.neighborhood))).sort();
    const match = allNeighbourhoods.find(n => slugify(n) === slug);
    if (!match) return { neighbourhood: null, locations: [] };
    return {
      neighbourhood: match,
      locations: allLocations.filter(l => l.neighborhood === match),
    };
  }, [slug, allLocations]);

  const stats = useMemo(() => computeStats(locations), [locations]);

  const sortedLocations = useMemo(() => {
    const sorted = [...locations];
    if (sortBy === 'score') sorted.sort((a, b) => b.studyScore - a.studyScore);
    else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'noise') sorted.sort((a, b) => a.noiseLevel - b.noiseLevel);
    return sorted;
  }, [locations, sortBy]);

  // All neighbourhoods for internal linking
  const allNeighbourhoods = useMemo(() =>
    Array.from(new Set(allLocations.map(l => l.neighborhood))).sort(),
  [allLocations]);

  // Nearby neighbourhoods (adjacent in alphabetical list)
  const nearbyNeighbourhoods = useMemo(() => {
    if (!neighbourhood) return [];
    const idx = allNeighbourhoods.indexOf(neighbourhood);
    const nearby: string[] = [];
    for (let i = Math.max(0, idx - 3); i <= Math.min(allNeighbourhoods.length - 1, idx + 3); i++) {
      if (allNeighbourhoods[i] !== neighbourhood) nearby.push(allNeighbourhoods[i]);
    }
    return nearby;
  }, [neighbourhood, allNeighbourhoods]);

  // Set document title for SEO
  useEffect(() => {
    if (neighbourhood) {
      const cityName = city === 'london' ? 'London' : 'Bristol';
      document.title = `Best Study Spots in ${neighbourhood}, ${cityName} | StudySpot`;
      // Update meta description
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content',
          `Discover ${stats.totalSpots} study spots in ${neighbourhood}, ${cityName}. Average rating ${stats.avgScore.toFixed(1)}/10. ${stats.hasWifi} with Wi-Fi, ${stats.hasPlugs} with plug sockets. Find cafes, libraries, and coworking spaces.`
        );
      }
    }
  }, [neighbourhood, city, stats]);

  if (!neighbourhood) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Neighbourhood not found</h1>
          <p className="text-muted-foreground mb-4">We couldn't find study spots in this area.</p>
          <Link href={`/${city}`}>
            <span className="text-primary hover:underline">Back to {city === 'london' ? 'London' : 'Bristol'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const cityName = city === 'london' ? 'London' : 'Bristol';
  const cityColor = city === 'london' ? 'fog-sage' : 'cyan-500';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-card via-card to-background border-b border-border">
        <div className="container py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/">
              <span className="hover:text-foreground transition-colors">StudySpot</span>
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${city}`}>
              <span className="hover:text-foreground transition-colors">{cityName}</span>
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{neighbourhood}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h1 className="text-3xl lg:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    Study Spots in {neighbourhood}
                  </h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Discover {stats.totalSpots} curated study spots in {neighbourhood}, {cityName}. 
                  From quiet cafes to coworking spaces — find your perfect place to focus.
                </p>
              </div>
              <Link href={`/${city}`}>
                <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  All {cityName} Spots
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-8"
          >
            <div className="bg-background/60 backdrop-blur rounded-xl p-3 border border-border/50 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.totalSpots}</div>
              <div className="text-xs text-muted-foreground">Study Spots</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-xl p-3 border border-border/50 text-center">
              <div className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-500" />
                {stats.avgScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Rating</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-xl p-3 border border-border/50 text-center">
              <div className="text-2xl font-bold text-emerald-500 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-emerald-500" />
                {stats.topScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Top Score</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-xl p-3 border border-border/50 text-center">
              <div className="text-2xl font-bold text-blue-500 flex items-center justify-center gap-1">
                <Wifi className="w-4 h-4" />
                {stats.hasWifi}
              </div>
              <div className="text-xs text-muted-foreground">With Wi-Fi</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-xl p-3 border border-border/50 text-center">
              <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                <Plug className="w-4 h-4" />
                {stats.hasPlugs}
              </div>
              <div className="text-xs text-muted-foreground">With Plugs</div>
            </div>
            <div className="bg-background/60 backdrop-blur rounded-xl p-3 border border-border/50 text-center">
              <div className="text-2xl font-bold text-purple-500 flex items-center justify-center gap-1">
                <Volume2 className="w-4 h-4" />
                {stats.avgNoise.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Noise</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {/* Category Breakdown */}
        {Object.keys(stats.categories).length > 1 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              What you'll find in {neighbourhood}
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                const Icon = CATEGORY_ICONS[cat] || Coffee;
                return (
                  <div key={cat} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border/50 text-sm">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-medium">{cat}</span>
                    <span className="text-muted-foreground">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            All {stats.totalSpots} Study Spots
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'noise')}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="score">Top Rated</option>
            <option value="name">A-Z</option>
            <option value="noise">Quietest First</option>
          </select>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {sortedLocations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.4 }}
            >
              <LocationCard location={loc} onClick={() => setSelectedLocation(loc)} index={i} />
            </motion.div>
          ))}
        </div>

        {/* SEO Content Block */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 lg:p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            About Studying in {neighbourhood}
          </h2>
          <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>
              {neighbourhood} is home to {stats.totalSpots} study spots in {cityName}, 
              with an average study score of {stats.avgScore.toFixed(1)} out of 10. 
              {stats.hasWifi > 0 && ` ${stats.hasWifi} locations offer free Wi-Fi`}
              {stats.hasPlugs > 0 && ` and ${stats.hasPlugs} have plug sockets available`}.
            </p>
            <p>
              {stats.avgNoise <= 2 ? `${neighbourhood} is known for its quiet study environments, making it ideal for deep focus work and exam revision.` :
               stats.avgNoise <= 3 ? `${neighbourhood} offers a good balance of ambient noise and quiet spaces, suitable for both solo study and group work.` :
               `${neighbourhood} has a lively atmosphere with plenty of buzzing cafes — great for creative work and casual study sessions.`}
            </p>
            {stats.topScore >= 9 && (
              <p>
                The highest-rated spot in {neighbourhood} scores an impressive {stats.topScore.toFixed(1)}/10, 
                placing it among the best study locations in all of {cityName}.
              </p>
            )}
          </div>
        </div>

        {/* Nearby Neighbourhoods — Internal Linking */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Explore Nearby Areas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {nearbyNeighbourhoods.map(n => {
              const count = allLocations.filter(l => l.neighborhood === n).length;
              return (
                <Link key={n} href={`/${city}/area/${slugify(n)}`}>
                  <span className="block p-3 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-center group">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">{n}</div>
                    <div className="text-xs text-muted-foreground mt-1">{count} spots</div>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All Neighbourhoods Directory */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 lg:p-8">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            All {cityName} Neighbourhoods
          </h2>
          <div className="flex flex-wrap gap-2">
            {allNeighbourhoods.map(n => {
              const isActive = n === neighbourhood;
              return (
                <Link key={n} href={`/${city}/area/${slugify(n)}`}>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}>
                    {n}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// London neighbourhood page
export function LondonNeighbourhoodPage() {
  const [, params] = useRoute('/london/area/:slug');
  if (!params?.slug) return null;
  return <NeighbourhoodContent city="london" slug={params.slug} />;
}

// Bristol neighbourhood page
export function BristolNeighbourhoodPage() {
  const [, params] = useRoute('/bristol/area/:slug');
  if (!params?.slug) return null;
  return <NeighbourhoodContent city="bristol" slug={params.slug} />;
}

// Neighbourhood directory page
export function NeighbourhoodDirectory({ city }: { city: 'london' | 'bristol' }) {
  const allLocations = city === 'london' ? londonLocations : bristolLocations;
  const cityName = city === 'london' ? 'London' : 'Bristol';

  const neighbourhoods = useMemo(() => {
    const map = new Map<string, { count: number; avgScore: number; topCategory: string }>();
    allLocations.forEach(l => {
      const existing = map.get(l.neighborhood);
      if (existing) {
        existing.count++;
        existing.avgScore = (existing.avgScore * (existing.count - 1) + l.studyScore) / existing.count;
      } else {
        map.set(l.neighborhood, { count: 1, avgScore: l.studyScore, topCategory: l.category });
      }
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [allLocations]);

  useEffect(() => {
    document.title = `All ${cityName} Neighbourhoods — Study Spots | StudySpot`;
  }, [cityName]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/"><span className="hover:text-foreground transition-colors">StudySpot</span></Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${city}`}><span className="hover:text-foreground transition-colors">{cityName}</span></Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">All Neighbourhoods</span>
        </nav>

        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {cityName} Study Spot Neighbourhoods
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Browse study spots by area across {cityName}. {neighbourhoods.length} neighbourhoods with {allLocations.length}+ study spots.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {neighbourhoods.map((n, i) => (
            <motion.div
              key={n.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.6), duration: 0.3 }}
            >
              <Link href={`/${city}/area/${slugify(n.name)}`}>
                <span className="block p-5 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">{n.name}</h2>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{n.count} spots</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {n.avgScore.toFixed(1)}
                    </span>
                    <span className="text-xs bg-muted/50 px-2 py-0.5 rounded-full">{n.topCategory}</span>
                  </div>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NeighbourhoodContent;
