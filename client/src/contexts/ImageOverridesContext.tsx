/**
 * ImageOverridesContext — Fetches admin-set image overrides from the database
 * and provides a lookup function to resolve the correct image for any location.
 * 
 * Usage:
 *   const { resolveImage } = useImageOverrides();
 *   const imageUrl = resolveImage('curated', location.id, location.image);
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

interface ImageOverridesContextValue {
  /** Resolve the best image for a location, checking admin overrides first */
  resolveImage: (locationType: 'curated' | 'uni', locationId: number, fallbackImage?: string) => string | undefined;
  /** Get all override images for a location (for galleries) */
  getOverrideImages: (locationType: 'curated' | 'uni', locationId: number) => string[];
  /** Whether the overrides have been loaded */
  isLoaded: boolean;
}

const ImageOverridesContext = createContext<ImageOverridesContextValue>({
  resolveImage: (_type, _id, fallback) => fallback,
  getOverrideImages: () => [],
  isLoaded: false,
});

export function ImageOverridesProvider({ children }: { children: ReactNode }) {
  const { data: imageOverrides, isSuccess } = trpc.locationImages.getAll.useQuery(undefined, {
    staleTime: 60_000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });

  const overrideMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!imageOverrides) return map;

    // Sort by displayOrder so the first image is the primary one
    const sorted = [...imageOverrides].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );

    for (const img of sorted) {
      const key = `${img.locationType}-${img.locationId}`;
      const existing = map.get(key) || [];
      existing.push(img.imageUrl);
      map.set(key, existing);
    }
    return map;
  }, [imageOverrides]);

  const resolveImage = useMemo(() => {
    return (locationType: 'curated' | 'uni', locationId: number, fallbackImage?: string): string | undefined => {
      const key = `${locationType}-${locationId}`;
      const overrides = overrideMap.get(key);
      if (overrides && overrides.length > 0) {
        return overrides[0]; // Return the first (primary) override image
      }
      return fallbackImage;
    };
  }, [overrideMap]);

  const getOverrideImages = useMemo(() => {
    return (locationType: 'curated' | 'uni', locationId: number): string[] => {
      const key = `${locationType}-${locationId}`;
      return overrideMap.get(key) || [];
    };
  }, [overrideMap]);

  return (
    <ImageOverridesContext.Provider value={{ resolveImage, getOverrideImages, isLoaded: isSuccess }}>
      {children}
    </ImageOverridesContext.Provider>
  );
}

export function useImageOverrides() {
  return useContext(ImageOverridesContext);
}
