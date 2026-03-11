import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

export interface Review {
  id: number;
  locationType: 'curated' | 'uni' | 'community';
  locationId: number;
  userId: number | null;
  userName: string;
  quietness: number;
  wifiQuality: number;
  comfort: number;
  lighting: number;
  laptopFriendly: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewsContextType {
  /** Get reviews for a specific location — returns tRPC query result */
  useLocationReviews: (locationType: 'curated' | 'uni' | 'community', locationId: number) => {
    reviews: Review[];
    isLoading: boolean;
    refetch: () => void;
  };
  /** Add a review (requires login) */
  addReview: (data: {
    locationType: 'curated' | 'uni' | 'community';
    locationId: number;
    quietness: number;
    wifiQuality: number;
    comfort: number;
    lighting: number;
    laptopFriendly: number;
    comment?: string;
  }) => Promise<void>;
  /** Delete a review */
  deleteReview: (id: number) => Promise<void>;
  /** Get average rating for reviews */
  getAverageFromReviews: (reviews: Review[]) => number | null;
}

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: (_data, variables) => {
      // Invalidate the specific location's reviews
      utils.reviews.getForLocation.invalidate({
        locationType: variables.locationType,
        locationId: variables.locationId,
      });
      utils.reviews.getCount.invalidate({
        locationType: variables.locationType,
        locationId: variables.locationId,
      });
      utils.reviews.getTotalCount.invalidate();
    },
  });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      // Invalidate all review queries
      utils.reviews.getForLocation.invalidate();
      utils.reviews.getCount.invalidate();
      utils.reviews.getTotalCount.invalidate();
    },
  });

  const addReview = useCallback(async (data: {
    locationType: 'curated' | 'uni' | 'community';
    locationId: number;
    quietness: number;
    wifiQuality: number;
    comfort: number;
    lighting: number;
    laptopFriendly: number;
    comment?: string;
  }) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);

  const deleteReviewFn = useCallback(async (id: number) => {
    await deleteMutation.mutateAsync({ id });
  }, [deleteMutation]);

  const getAverageFromReviews = useCallback((reviews: Review[]) => {
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) =>
      sum + (r.quietness + r.wifiQuality + r.comfort + r.lighting + r.laptopFriendly) / 5, 0
    ) / reviews.length;
    return Math.round(avg * 10) / 10;
  }, []);

  // Hook factory for location-specific reviews
  const useLocationReviews = useCallback((
    locationType: 'curated' | 'uni' | 'community',
    locationId: number
  ) => {
    // This will be called as a hook from components
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = trpc.reviews.getForLocation.useQuery(
      { locationType, locationId },
      { enabled: locationId > 0 }
    );
    return {
      reviews: (query.data ?? []) as Review[],
      isLoading: query.isLoading,
      refetch: query.refetch,
    };
  }, []);

  return (
    <ReviewsContext.Provider value={{
      useLocationReviews,
      addReview,
      deleteReview: deleteReviewFn,
      getAverageFromReviews,
    }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
