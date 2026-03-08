/**
 * FavoritesPage — Saved locations and custom lists
 * London Fog design
 */
import { useFavorites } from '@/contexts/FavoritesContext';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { Heart, MapPin, Plus, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface FavoritesPageProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export default function FavoritesPage({ locations, onSelectLocation }: FavoritesPageProps) {
  const { favorites, lists, toggleFavorite, createList } = useFavorites();
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);

  const savedLocations = locations.filter(l => favorites.has(l.id));

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createList(newListName.trim());
    setNewListName('');
    setShowNewList(false);
    toast.success('List created!');
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Saved Spots</h1>
        <p className="text-sm text-muted-foreground">{savedLocations.length} locations saved</p>
      </div>

      {/* Lists */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>My Lists</h2>
          <Button variant="outline" size="sm" onClick={() => setShowNewList(!showNewList)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> New List
          </Button>
        </div>

        {showNewList && (
          <div className="flex gap-2 mb-4">
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name..."
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            />
            <Button onClick={handleCreateList} size="sm">Create</Button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {lists.map(list => (
            <div key={list.id} className="bg-card rounded-xl p-4 border border-border/50 hover:shadow-md transition-shadow cursor-pointer">
              <Bookmark className="w-5 h-5 text-fog-gold mb-2" />
              <h3 className="text-sm font-medium text-foreground">{list.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{list.locationIds.length} spots</p>
            </div>
          ))}
        </div>
      </div>

      {/* Saved locations grid */}
      {savedLocations.length > 0 ? (
        <div className="space-y-3">
          {savedLocations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
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
                  <span className="mx-1 opacity-40">·</span>
                  <span>{CATEGORY_ICONS[loc.category]} {loc.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="score-badge text-xs bg-fog-gold/10 text-fog-gold px-2 py-0.5 rounded-lg">{loc.studyScore.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">{loc.priceLevel}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(loc.id); }}
                className="self-center shrink-0"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>No saved spots yet</h3>
          <p className="text-sm text-muted-foreground">Tap the heart icon on any study spot to save it here.</p>
        </div>
      )}
    </div>
  );
}
