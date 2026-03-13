/**
 * LocationDetail — Full-screen detail view
 * London Fog design: large hero image, editorial layout, frosted glass elements
 * Includes Google Maps buttons and improved UX
 */
import { ArrowLeft, Heart, ExternalLink, MapPin, Clock, Wifi, Plug, Volume2, Sun, Armchair, Laptop, Star, Send, Navigation, Map, Play, Sparkles, Camera, X, User, UserX, ArrowUpDown, Share2, Copy, Check } from 'lucide-react';
import VerificationBadge, { type VerificationStatus } from '@/components/VerificationBadge';
import ConfirmReportButtons from '@/components/ConfirmReportButtons';
import { VibeDetailPanel } from '@/components/LiveVibeBadge';
import { socialVideos } from '@/lib/socialVideos';
import { type Location } from '@/lib/locations';
import { getLocationImage, CATEGORY_ICONS } from '@/lib/images';
import { getBristolLocationImage } from '@/lib/bristolImages';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useImageOverrides } from '@/contexts/ImageOverridesContext';
import { useReviews, type Review } from '@/contexts/ReviewsContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
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

function ReviewForm({ locationType, locationId, onSubmit }: { locationType: 'curated' | 'uni' | 'community'; locationId: number; onSubmit: () => void }) {
  const { addReview, uploadImage } = useReviews();
  const [ratings, setRatings] = useState({ quietness: 4, wifiQuality: 4, comfort: 4, lighting: 4, laptopFriendly: 4 });
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (imageUrls.length + files.length > 5) {
      toast.error('Maximum 5 images per review');
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
        const url = await uploadImage(base64, file.type);
        setImageUrls(prev => [...prev, url]);
      }
    } catch (err: any) {
      toast.error('Failed to upload image. Please log in first.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!comment.trim()) { toast.error('Please add a comment'); return; }
    setSubmitting(true);
    try {
      await addReview({
        locationType, locationId, ...ratings,
        comment: comment.trim(),
        anonymous,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast.success('Review submitted!');
      setComment('');
      setImageUrls([]);
      setAnonymous(false);
      onSubmit();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit review. Please log in first.');
    } finally {
      setSubmitting(false);
    }
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

      {/* Image upload */}
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        <div className="flex items-center gap-2 flex-wrap">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {imageUrls.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              {uploading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Add up to 5 photos (max 5MB each)</p>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAnonymous(!anonymous)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border ${
            anonymous
              ? 'bg-muted border-border text-foreground'
              : 'border-border/50 text-muted-foreground hover:border-border'
          }`}
        >
          {anonymous ? <UserX className="w-4 h-4" /> : <User className="w-4 h-4" />}
          {anonymous ? 'Posting anonymously' : 'Posting with your name'}
        </button>
      </div>

      <Button onClick={handleSubmit} disabled={submitting || uploading} className="w-full bg-primary text-primary-foreground gap-2">
        <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const avg = ((review.quietness + review.wifiQuality + review.comfort + review.lighting + review.laptopFriendly) / 5).toFixed(1);
  const images: string[] = Array.isArray(review.images) ? review.images : [];
  return (
    <div className="bg-secondary/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-fog-sage/20 flex items-center justify-center text-sm">
            {review.userName === 'Anonymous' ? <UserX className="w-4 h-4 text-muted-foreground" /> : <User className="w-4 h-4 text-muted-foreground" />}
          </div>
          <div>
            <span className="text-sm font-medium">{review.userName || 'Anonymous'}</span>
            <p className="text-xs text-muted-foreground/60">{new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="score-badge text-sm text-fog-gold">{avg}/5</div>
      </div>
      {review.comment && <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>}
      {images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((url, i) => (
            <button key={i} onClick={() => setLightboxImg(url)} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" className="max-w-full max-h-[80vh] rounded-xl" />
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center" onClick={() => setLightboxImg(null)}>
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Share button with Web Share API and clipboard fallback */
function ShareButton({ location }: { location: Location }) {
  const [copied, setCopied] = useState(false);
  const isBristol = location.id >= 10001;
  const cityPath = isBristol ? 'bristol' : 'london';
  const shareUrl = `${window.location.origin}/${cityPath}`;
  const shareTitle = `${location.name} — StudySpot`;
  const shareText = `Check out ${location.name} in ${location.neighborhood} on StudySpot! Study Score: ${location.studyScore.toFixed(1)}/10`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (e) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-lg transition-transform active:scale-90"
      title="Share this spot"
    >
      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5 text-foreground" />}
    </button>
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
  const { resolveImage } = useImageOverrides();
  const { useLocationReviews } = useReviews();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const fav = isFavorite(location.id);
  const isBristolLocation = location.id >= 10001;
  const categoryFallback = isBristolLocation
    ? getBristolLocationImage(location.name, location.category)
    : getLocationImage(location.name, location.category);
  const resolvedImage = resolveImage('curated', location.id, location.image || categoryFallback);
  const image = resolvedImage || categoryFallback;
  const [heroImgError, setHeroImgError] = useState(false);
  const showHeroGradient = !image || heroImgError;
  const locationType: 'curated' | 'community' = (location as any).isCommunitySubmitted ? 'community' : 'curated';
  const { reviews, isLoading: reviewsLoading } = useLocationReviews(locationType, location.id);
  const [reviewSort, setReviewSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const sortedReviews = [...reviews].sort((a, b) => {
    const avgA = (a.quietness + a.wifiQuality + a.comfort + a.lighting + a.laptopFriendly) / 5;
    const avgB = (b.quietness + b.wifiQuality + b.comfort + b.lighting + b.laptopFriendly) / 5;
    switch (reviewSort) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest': return avgB - avgA;
      case 'lowest': return avgA - avgB;
      default: return 0;
    }
  });

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
        {showHeroGradient ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-500 flex items-center justify-center">
            <div className="text-center opacity-60">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-slate-500 dark:text-slate-300" />
              <span className="text-sm text-slate-500 dark:text-slate-300 font-medium">{location.category}</span>
            </div>
          </div>
        ) : (
          <img src={image} alt={location.name} className="w-full h-full object-cover" onError={() => setHeroImgError(true)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <ShareButton location={location} />
            <button
              onClick={() => toggleFavorite(location.id)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-lg"
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
            </button>
          </div>
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

        {/* Live Study Vibe */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
          <VibeDetailPanel locationId={location.id} />
        </div>

        {/* Community Submitted Badge + Verification */}
        {'isCommunitySubmitted' in location && (location as any).isCommunitySubmitted && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap px-4 py-3 bg-fog-sage/10 rounded-xl border border-fog-sage/20">
              <Sparkles className="w-4 h-4 text-fog-sage" />
              <span className="text-sm font-medium text-fog-sage">Community Submitted</span>
              <span className="text-xs text-muted-foreground">by {(location as any).submittedBy || 'Anonymous'}</span>
              {(location as any).verificationStatus && (
                <VerificationBadge status={(location as any).verificationStatus as VerificationStatus} />
              )}
            </div>
            {/* Confirm & Report buttons */}
            <div className="px-4 py-3 bg-card rounded-xl border border-border/50">
              <ConfirmReportButtons
                submissionId={(location as any).id}
                confirmationCount={(location as any).confirmationCount || 0}
              />
            </div>
          </div>
        )}

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

        {/* Social Videos — show if any matched videos exist */}
        {(() => {
          const matchedVideos = socialVideos.filter(v => v.matchedLocationId === location.id);
          if (matchedVideos.length === 0) return null;
          return (
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
              <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>Social Videos ({matchedVideos.length})</h2>
              <div className="space-y-3">
                {matchedVideos.map(video => (
                  <a
                    key={video.id}
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                  >
                    {/* Thumbnail or platform icon */}
                    {video.thumbnailUrl ? (
                      <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 relative">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded flex items-center justify-center ${
                          video.platform === 'TikTok' ? 'bg-black' :
                          video.platform === 'Instagram' ? 'bg-gradient-to-br from-purple-600 to-orange-400' :
                          'bg-red-600'
                        }`}>
                          <Play className="w-2 h-2 text-white fill-white" />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        video.platform === 'TikTok' ? 'bg-black text-white' :
                        video.platform === 'Instagram' ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{video.creator} · {video.platform}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>Reviews ({reviews.length})</h2>
            <div className="flex items-center gap-2">
              {reviews.length > 1 && (
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
                  className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sm"
              >
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </Button>
            </div>
          </div>

          {showReviewForm && (
            <div className="mb-4 bg-card rounded-2xl p-4 shadow-sm border border-border/50">
              <ReviewForm locationType={locationType} locationId={location.id} onSubmit={() => setShowReviewForm(false)} />
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {sortedReviews.map(review => <ReviewCard key={review.id} review={review} />)}
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
