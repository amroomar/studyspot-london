/**
 * FilterPanel — London Fog design
 * Slide-up drawer on mobile, side panel on desktop
 */
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Filters {
  category: string;
  noiseMax: number;
  wifi: boolean;
  plugs: boolean;
  laptopFriendly: boolean;
  openNow: boolean;
  priceLevel: string;
  minScore: number;
  searchQuery: string;
  neighborhood: string;
}

export const DEFAULT_FILTERS: Filters = {
  category: 'All',
  noiseMax: 5,
  wifi: false,
  plugs: false,
  laptopFriendly: false,
  openNow: false,
  priceLevel: 'All',
  minScore: 0,
  searchQuery: '',
  neighborhood: 'All',
};

const DEFAULT_CATEGORIES = [
  'All', 'Quiet Study Cafe', 'Aesthetic Cafe', 'Library', 'Creative Workspace',
  'Coworking Space', 'Hotel Lounge', 'Bookstore', 'Museum/Gallery Cafe',
  'Nature/Greenery', 'Bakery/Patisserie', 'Hidden Gem', 'Rooftop', 'Late-Night Cafe', 'Luxury Cafe',
];

const PRICE_LEVELS = ['All', '£', '££', '£££'];

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  neighborhoods: string[];
  resultCount: number;
  categories?: string[];
}

export default function FilterPanel({ filters, onChange, neighborhoods, resultCount, categories }: FilterPanelProps) {
  const CATEGORIES = categories || DEFAULT_CATEGORIES;
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.category !== 'All',
    filters.noiseMax < 5,
    filters.wifi,
    filters.plugs,
    filters.laptopFriendly,
    filters.openNow,
    filters.priceLevel !== 'All',
    filters.minScore > 0,
    filters.neighborhood !== 'All',
  ].filter(Boolean).length;

  return (
    <>
      {/* Filter trigger button */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative gap-2 bg-card border-border hover:bg-secondary"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Filter panel overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar lg:left-auto lg:w-[420px] lg:top-0 lg:bottom-0 lg:rounded-t-none lg:rounded-l-3xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Filter Spots</h2>
                  <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{resultCount} spots match your filters</p>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => onChange({ ...filters, category: cat })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          filters.category === cat
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-secondary text-secondary-foreground hover:bg-muted'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Neighborhood</label>
                  <select
                    value={filters.neighborhood}
                    onChange={(e) => onChange({ ...filters, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="All">All Neighborhoods</option>
                    {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                {/* Noise Level */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Max Noise Level: <span className="text-fog-sage font-semibold">{filters.noiseMax}/5</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">1 = Silent, 5 = Lively</p>
                  <Slider
                    value={[filters.noiseMax]}
                    onValueChange={([v]) => onChange({ ...filters, noiseMax: v! })}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                {/* Min Score */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Min Study Score: <span className="score-badge text-fog-gold">{filters.minScore.toFixed(1)}</span>
                  </label>
                  <Slider
                    value={[filters.minScore]}
                    onValueChange={([v]) => onChange({ ...filters, minScore: v! })}
                    min={0}
                    max={9}
                    step={0.5}
                  />
                </div>

                {/* Price Level */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Price Level</label>
                  <div className="flex gap-2">
                    {PRICE_LEVELS.map(p => (
                      <button
                        key={p}
                        onClick={() => onChange({ ...filters, priceLevel: p })}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          filters.priceLevel === p
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-secondary text-secondary-foreground hover:bg-muted'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle filters */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground block">Requirements</label>
                  {[
                    { key: 'openNow' as const, label: 'Open Now', icon: '🕓' },
                    { key: 'wifi' as const, label: 'Wi-Fi Available', icon: '📶' },
                    { key: 'plugs' as const, label: 'Plug Sockets', icon: '🔌' },
                    { key: 'laptopFriendly' as const, label: 'Laptop Friendly', icon: '💻' },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => onChange({ ...filters, [key]: !filters[key] })}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        filters[key]
                          ? 'bg-primary/10 border border-primary/30 text-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{icon}</span>
                      <span className="text-sm font-medium">{label}</span>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        filters[key] ? 'border-primary bg-primary' : 'border-border'
                      }`}>
                        {filters[key] && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onChange(DEFAULT_FILTERS)}
                >
                  Clear All
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setOpen(false)}
                >
                  Show {resultCount} spots
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
