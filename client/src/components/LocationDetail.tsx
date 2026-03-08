/**
 * LocationDetail — Full-screen detail view
 * London Fog design: large hero image, editorial layout, frosted glass elements
 * Includes Google Maps buttons and improved UX
 */
import { ArrowLeft, Heart, ExternalLink, MapPin, Clock, Wifi, Plug, Volume2, Sun, Armchair, Laptop, Star, Send, Navigation, Map } from 'lucide-react';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useReviews, type Review } from '@/contexts/ReviewsContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface LocationDetailProps {
  location: Location;
  onBack: () => void;
}

function AttributeRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color || 'bg-fog-sage/10'}`}>
          <Icon className="w-4 h-4 text-fog-sage" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground capitalize">{value}</span>
    </div>
  );
}

function ReviewForm({ locationId, onSubmit }: { locationId: number; onSubmit: () => void }) {
  const { addReview } = useReviews();
  const [ratings, setRatings] = useState({ quietness: 4, wifiQuality: 4, comfort: 4, lighting: 4, laptopFriendly: 4 });
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!comment.trim()) { toast.error('Please add a comment'); return; }
    addReview({ locationId, ...ratings, comment: comment.trim() });
    toast.success('Review submitted!');
    setComment('');
    onSubmit();
  };

  const ratingFields = [
    { key: 'quietness' as const, label: 'Quietness' },
    { key: 'wifiQuality' as const, label: 'Wi-Fi Quality' },
    { key: 'comfort' as const, label: 'Comfort' },
    { key: 'lighting' as const, label: 'Lighting' },
    { key: 'laptopFriendly' as const, label: 'Laptop Friendly' },
  ];

  return (
    <div className="space-y-4">
      {ratingFields.map(({ key, label }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium score-badge">{ratings[key]}/5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRatings(prev => ({ ...prev, [key]: n }))}
                className={`flex-1 h-8 rounded-lg transition-all ${
                  n <= ratings[key] ? 'bg-fog-gold/80 text-white' : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                <Star className={`w-3.5 h-3.5 mx-auto ${n <= ratings[key] ? 'fill-white' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your study experience..."
        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm resize-none h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground gap-2">
        <Send className="w-4 h-4" /> Submit Review
      </Button>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const avg = ((review.quietness + review.wifiQuality + review.comfort + review.lighting + review.laptopFriendly) / 5).toFixed(1);
  return (
    <div className="bg-secondary/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-fog-sage/20 flex items-center justify-center text-sm">👤</div>
          <span className="text-sm font-medium">Anonymous</span>
        </div>
        <div className="score-badge text-sm text-fog-gold">{avg}/5</div>
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>
      <p className="text-xs text-muted-foreground/60 mt-2">{new Date(review.date).toLocaleDateString()}</p>
    </div>
  );
}

/** Build a Google Maps search URL for a location */
function getGoogleMapsUrl(location: Location): string {
  const query = encodeURIComponent(`${location.name}, ${location.neighborhood}, London`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Build a Google Maps directions URL */
function getDirectionsUrl(location: Location): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&destination_place_id=&travelmode=transit`;
}

export default function LocationDetail({ location, onBack }: LocationDetailProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getReviewsForLocation } = useReviews();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const fav = isFavorite(location.id);
  const image = getLocationImage(location.name, location.category);
  const reviews = getReviewsForLocation(location.id);

  const noiseLabels: Record<number, string> = { 1: 'Very Quiet', 2: 'Quiet', 3: 'Moderate', 4: 'Lively', 5: 'Loud' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto custom-scrollbar"
    >
      {/* Hero Image */}
      <div className="relative h-[45vh] min-h-[300px]">
        <img src={image} alt={location.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-fog-charcoal" />
          </button>
          <button
            onClick={() => toggleFavorite(location.id)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-lg"
          >
            <Heart className={`w-5 h-5 ${fav ? 'fill-red-500 text-red-500' : 'text-fog-charcoal'}`} />
          </button>
        </div>

        {/* Bottom info on hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/80 text-sm">{CATEGORY_ICONS[location.category]} {location.category}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {location.name}
          </h1>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location.neighborhood}</span>
            <span className="mx-1">·</span>
            <span>{location.priceLevel}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Score + Quick Stats */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border/50">
          <div className="w-16 h-16 rounded-2xl bg-fog-gold/10 flex flex-col items-center justify-center">
            <span className="score-badge text-2xl text-fog-gold">{location.studyScore.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">Score</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">{noiseLabels[location.noiseLevel] || 'Moderate'}</div>
              <div className="text-xs text-muted-foreground">Noise</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-foreground capitalize">{location.lightingQuality}</div>
              <div className="text-xs text-muted-foreground">Lighting</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-foreground capitalize">{location.seatingComfort}</div>
              <div className="text-xs text-muted-foreground">Comfort</div>
            </div>
          </div>
        </div>

        {/* Google Maps Action Buttons */}
        <div className="flex gap-3">
          <a
            href={getGoogleMapsUrl(location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Map className="w-4 h-4" />
            View on Google Maps
          </a>
          <a
            href={getDirectionsUrl(location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-fog-sage hover:bg-fog-sage/90 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </a>
        </div>

        {/* Atmosphere */}
        {location.atmosphere && (
          <div>
            <h2 className="text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>About this spot</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{location.atmosphere}</p>
          </div>
        )}

        {/* Tags */}
        {location.tags && location.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {location.tags.map((tag, i) => (
              <span key={i} className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Attributes */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
          <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>Study Attributes</h2>
          <AttributeRow icon={Wifi} label="Wi-Fi" value={location.wifi} />
          <AttributeRow icon={Plug} label="Plug Sockets" value={location.plugSockets} />
          <AttributeRow icon={Volume2} label="Noise Level" value={`${location.noiseLevel}/5 — ${noiseLabels[location.noiseLevel] || 'Moderate'}`} />
          <AttributeRow icon={Sun} label="Lighting" value={location.lightingQuality} />
          <AttributeRow icon={Armchair} label="Seating Comfort" value={location.seatingComfort} />
          <AttributeRow icon={Laptop} label="Laptop Friendly" value={location.laptopFriendly} />
        </div>

        {/* Practical Info */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
          <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>Practical Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{location.address || 'Address not available'}</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{location.openingHours || 'Hours not available'}</span>
            </div>
            {location.bestTimeStudy && location.bestTimeStudy !== 'unknown' && (
              <div className="flex items-start gap-3">
                <Star className="w-4 h-4 text-fog-gold mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Best time to study: <strong className="text-foreground">{location.bestTimeStudy}</strong></span>
              </div>
            )}
          </div>
          {location.website && (
            <a
              href={location.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Visit Website
            </a>
          )}
        </div>

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>Reviews ({reviews.length})</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-sm"
            >
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </Button>
          </div>

          {showReviewForm && (
            <div className="mb-4 bg-card rounded-2xl p-4 shadow-sm border border-border/50">
              <ReviewForm locationId={location.id} onSubmit={() => setShowReviewForm(false)} />
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
