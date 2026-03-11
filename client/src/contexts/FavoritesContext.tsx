import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useCity } from '@/contexts/CityContext';

interface FavoriteList {
  id: string;
  name: string;
  locationIds: number[];
}

interface FavoritesContextType {
  favorites: Set<number>;
  lists: FavoriteList[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  createList: (name: string) => void;
  addToList: (listId: string, locationId: number) => void;
  removeFromList: (listId: string, locationId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const DEFAULT_LISTS: FavoriteList[] = [
  { id: 'my-spots', name: 'My Study Spots', locationIds: [] },
  { id: 'hidden-gems', name: 'Hidden Gems', locationIds: [] },
  { id: 'exam-spots', name: 'Exam Study Locations', locationIds: [] },
];

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { city } = useCity();

  // Namespace localStorage keys by city so London and Bristol favorites are separate
  const favKey = `studyspot-favorites-${city}`;
  const listKey = `studyspot-lists-${city}`;

  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(favKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [lists, setLists] = useState<FavoriteList[]>(() => {
    try {
      const saved = localStorage.getItem(listKey);
      return saved ? JSON.parse(saved) : DEFAULT_LISTS;
    } catch {
      return DEFAULT_LISTS;
    }
  });

  // Re-load when city changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(favKey);
      setFavorites(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch { setFavorites(new Set()); }
    try {
      const saved = localStorage.getItem(listKey);
      setLists(saved ? JSON.parse(saved) : DEFAULT_LISTS);
    } catch { setLists(DEFAULT_LISTS); }
  }, [city, favKey, listKey]);

  useEffect(() => {
    localStorage.setItem(favKey, JSON.stringify(Array.from(favorites)));
  }, [favorites, favKey]);

  useEffect(() => {
    localStorage.setItem(listKey, JSON.stringify(lists));
  }, [lists, listKey]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.has(id), [favorites]);

  const createList = useCallback((name: string) => {
    setLists(prev => [...prev, { id: `list-${Date.now()}`, name, locationIds: [] }]);
  }, []);

  const addToList = useCallback((listId: string, locationId: number) => {
    setLists(prev => prev.map(l =>
      l.id === listId && !l.locationIds.includes(locationId)
        ? { ...l, locationIds: [...l.locationIds, locationId] }
        : l
    ));
  }, []);

  const removeFromList = useCallback((listId: string, locationId: number) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, locationIds: l.locationIds.filter(id => id !== locationId) }
        : l
    ));
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, lists, toggleFavorite, isFavorite, createList, addToList, removeFromList }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
