import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('studyspot-favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [lists, setLists] = useState<FavoriteList[]>(() => {
    try {
      const saved = localStorage.getItem('studyspot-lists');
      return saved ? JSON.parse(saved) : [
        { id: 'my-spots', name: 'My Study Spots', locationIds: [] },
        { id: 'hidden-gems', name: 'Hidden Gems', locationIds: [] },
        { id: 'exam-spots', name: 'Exam Study Locations', locationIds: [] },
      ];
    } catch {
      return [
        { id: 'my-spots', name: 'My Study Spots', locationIds: [] },
        { id: 'hidden-gems', name: 'Hidden Gems', locationIds: [] },
        { id: 'exam-spots', name: 'Exam Study Locations', locationIds: [] },
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem('studyspot-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('studyspot-lists', JSON.stringify(lists));
  }, [lists]);

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
