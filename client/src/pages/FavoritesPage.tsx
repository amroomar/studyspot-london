/**
 * FavoritesPage — Saved locations and custom lists
 * London Fog design, dark mode compatible
 * Features: create lists, add/remove locations to lists, view list contents
 */
import { useFavorites } from '@/contexts/FavoritesContext';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { Heart, MapPin, Plus, Bookmark, ChevronLeft, ListPlus, X, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface FavoritesPageProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export default function FavoritesPage({ locations, onSelectLocation }: FavoritesPageProps) {
  const { favorites, lists, toggleFavorite, createList, addToList, removeFromList } = useFavorites();
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [showAddToList, setShowAddToList] = useState<number | null>(null); // locationId to add

  const savedLocations = locations.filter(l => favorites.has(l.id));
  const activeList = lists.find(l => l.id === activeListId);
  const activeListLocations = activeList
    ? locations.filter(l => activeList.locationIds.includes(l.id))
    : [];

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createList(newListName.trim());
    setNewListName('');
    setShowNewList(false);
    toast.success('List created!');
  };

  const handleAddToList = (listId: string, locationId: number) => {
    addToList(listId, locationId);
    setShowAddToList(null);
    const list = lists.find(l => l.id === listId);
    toast.success(`Added to "${list?.name}"`);
  };

  // Add to List modal
  const AddToListModal = ({ locationId }: { locationId: number }) => {
    const loc = locations.find(l => l.id === locationId);
    if (!loc) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={() => setShowAddToList(null)}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md border border-border/50 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Add to List
            </h3>
            <button onClick={() => setShowAddToList(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Add <span className="font-medium text-foreground">{loc.name}</span> to a list:
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lists.map(list => {
              const isInList = list.locationIds.includes(locationId);
              return (
                <button
                  key={list.id}
                  onClick={() => {
                    if (isInList) {
                      removeFromList(list.id, locationId);
                      toast.success(`Removed from "${list.name}"`);
                    } else {
                      handleAddToList(list.id, locationId);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    isInList
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className={`w-4 h-4 ${isInList ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium text-foreground">{list.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{list.locationIds.length} spots</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // List detail view
  if (activeList) {
    return (
      <div className="pb-24 lg:pb-8">
        <button
          onClick={() => setActiveListId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Saved
        </button>

        <div className="mb-6">
          <h1 className="text-2xl text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>{activeList.name}</h1>
          <p className="text-sm text-muted-foreground">{activeListLocations.length} locations</p>
        </div>

        {activeListLocations.length > 0 ? (
          <div className="space-y-3">
            {activeListLocations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 bg-card rounded-xl p-3 border border-border/50 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onSelectLocation(loc)}
              >
                <img
                  src={loc.image || getLocationImage(loc.name, loc.category)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromList(activeList.id, loc.id);
                    toast.success('Removed from list');
                  }}
                  className="self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>This list is empty</h3>
            <p className="text-sm text-muted-foreground">Add spots from your saved locations using the list icon.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>Saved Spots</h1>
        <p className="text-sm text-muted-foreground">{savedLocations.length} locations saved</p>
      </div>

      {/* Lists */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-foreground" style={{ fontFamily: 'var(--font-display)' }}>My Lists</h2>
          <Button variant="outline" size="sm" onClick={() => setShowNewList(!showNewList)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> New List
          </Button>
        </div>

        <AnimatePresence>
          {showNewList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mb-4">
                <input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name..."
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                  autoFocus
                />
                <Button onClick={handleCreateList} size="sm">Create</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {lists.map(list => (
            <motion.div
              key={list.id}
              whileHover={{ y: -2 }}
              onClick={() => setActiveListId(list.id)}
              className="bg-card rounded-xl p-4 border border-border/50 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
            >
              <Bookmark className="w-5 h-5 text-fog-gold mb-2" />
              <h3 className="text-sm font-medium text-foreground">{list.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{list.locationIds.length} spots</p>
            </motion.div>
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
              transition={{ delay: i * 0.04 }}
              className="flex gap-3 bg-card rounded-xl p-3 border border-border/50 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSelectLocation(loc)}
            >
              <img
                src={loc.image || getLocationImage(loc.name, loc.category)}
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
              <div className="flex flex-col items-center gap-2 self-center shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAddToList(loc.id); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Add to list"
                >
                  <ListPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(loc.id); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                >
                  <Heart className="w-4.5 h-4.5 fill-red-500 text-red-500" />
                </button>
              </div>
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

      {/* Add to List Modal */}
      <AnimatePresence>
        {showAddToList !== null && <AddToListModal locationId={showAddToList} />}
      </AnimatePresence>
    </div>
  );
}
