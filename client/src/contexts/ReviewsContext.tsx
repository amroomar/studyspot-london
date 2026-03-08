import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface Review {
  id: string;
  locationId: number;
  quietness: number;
  wifiQuality: number;
  comfort: number;
  lighting: number;
  laptopFriendly: number;
  comment: string;
  date: string;
}

interface ReviewsContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  getReviewsForLocation: (locationId: number) => Review[];
  getAverageRating: (locationId: number) => number | null;
  totalReviewCount: number;
}

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('studyspot-reviews');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('studyspot-reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addReview = useCallback((review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setReviews(prev => [newReview, ...prev]);
  }, []);

  const getReviewsForLocation = useCallback((locationId: number) => {
    return reviews.filter(r => r.locationId === locationId);
  }, [reviews]);

  const getAverageRating = useCallback((locationId: number) => {
    const locReviews = reviews.filter(r => r.locationId === locationId);
    if (locReviews.length === 0) return null;
    const avg = locReviews.reduce((sum, r) =>
      sum + (r.quietness + r.wifiQuality + r.comfort + r.lighting + r.laptopFriendly) / 5, 0
    ) / locReviews.length;
    return Math.round(avg * 10) / 10;
  }, [reviews]);

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, getReviewsForLocation, getAverageRating, totalReviewCount: reviews.length }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
