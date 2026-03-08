/**
 * SubmitSpotPage — Multi-step form for community study spot submissions
 * London Fog design: warm, editorial, clean
 * Steps: Basic Info → Location → Environment → Images → Tags → Review
 * Images are uploaded to S3, submission is persisted to database via tRPC
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapView } from '@/components/Map';
import { useSubmissions } from '@/contexts/SubmissionsContext';
import {
  ArrowLeft, ArrowRight, MapPin, Camera, Tag, Check, X, Upload,
  Wifi, Plug, Volume2, Sun, Armchair, Laptop, Users, Star, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const LOCATION_TYPES = [
  'Cafe', 'Library', 'Coworking Space', 'Bookstore', 'Rooftop',
  'Hotel Lounge', 'Museum Cafe', 'Garden/Park', 'University Space', 'Other'
];

const NEIGHBORHOODS = [
  'Shoreditch', 'Soho', 'Camden', 'Islington', 'Hackney', 'Brixton',
  'Peckham', 'Dalston', 'Fitzrovia', 'Bloomsbury', 'Covent Garden',
  'South Bank', 'Kensington', 'Chelsea', 'Notting Hill', 'Mayfair',
  'Clerkenwell', 'Bermondsey', 'Whitechapel', 'Stratford', 'Greenwich',
  'Hampstead', 'Marylebone', 'Kings Cross', 'Canary Wharf', 'Other'
];

const AVAILABLE_TAGS = [
  'Quiet', 'Aesthetic', 'Laptop Friendly', 'Hidden Gem', 'Natural Light',
  'Minimalist', 'Cozy', 'Luxury', 'Creative', 'Student Friendly',
  'Late Night', 'Outdoor Seating', 'Good Coffee', 'Power Outlets',
  'Fast WiFi', 'Group Study', 'Solo Study', 'Pet Friendly'
];

const STEPS = [
  { id: 1, title: 'Basic Info', icon: MapPin },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Environment', icon: Star },
  { id: 4, title: 'Photos', icon: Camera },
  { id: 5, title: 'Tags', icon: Tag },
  { id: 6, title: 'Review', icon: Check },
];

interface FormData {
  name: string;
  type: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  noiseLevel: number;
  wifiQuality: number;
  lightingQuality: number;
  seatingComfort: number;
  laptopFriendly: number;
  crowdLevel: number;
  /** Preview data URLs for display in the form */
  imagePreviewUrls: string[];
  /** Raw File objects for upload */
  imageFiles: File[];
  tags: string[];
  submittedBy: string;
  priceLevel: string;
  website: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  type: '',
  neighborhood: '',
  address: '',
  lat: 51.5074,
  lng: -0.1278,
  description: '',
  noiseLevel: 3,
  wifiQuality: 3,
  lightingQuality: 3,
  seatingComfort: 3,
  laptopFriendly: 3,
  crowdLevel: 3,
  imagePreviewUrls: [],
  imageFiles: [],
  tags: [],
  submittedBy: '',
  priceLevel: '£-££',
  website: '',
};

function RatingSlider({ label, icon: Icon, value, onChange, lowLabel, highLabel }: {
  label: string;
  icon: typeof Wifi;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  const labels = [lowLabel, '', 'Average', '', highLabel];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="w-4 h-4 text-fog-sage" />
          {label}
        </div>
        <span className="text-xs text-muted-foreground">{labels[value - 1] || ''}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
              n <= value
                ? 'bg-fog-sage text-white shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SubmitSpotPage({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [mapPickerActive, setMapPickerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addSubmission, uploadImage } = useSubmissions();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const updateForm = useCallback((updates: Partial<FormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 5 - form.imagePreviewUrls.length;
    const toProcess = Array.from(files).slice(0, maxImages);

    toProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm(prev => ({
          ...prev,
          imagePreviewUrls: [...prev.imagePreviewUrls, result].slice(0, 5),
          imageFiles: [...prev.imageFiles, file].slice(0, 5),
        }));
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [form.imagePreviewUrls.length]);

  const removeImage = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      imagePreviewUrls: prev.imagePreviewUrls.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!(form.name && form.type && form.neighborhood && form.address);
      case 2: return !!(form.lat && form.lng);
      case 3: return true;
      case 4: return form.imagePreviewUrls.length >= 1;
      case 5: return form.tags.length >= 1;
      case 6: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Upload all images to S3
      const imageUrls: string[] = [];
      for (const file of form.imageFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            // Strip the data:image/...;base64, prefix
            const base64Data = dataUrl.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(file);
        });

        const url = await uploadImage(base64, file.type, file.name);
        imageUrls.push(url);
      }

      // 2. Calculate study score from attributes
      const wifiScore = form.wifiQuality >= 4 ? 2 : form.wifiQuality >= 3 ? 1 : 0;
      const noiseScore = form.noiseLevel <= 2 ? 2 : form.noiseLevel <= 3 ? 1 : 0;
      const lightScore = form.lightingQuality >= 4 ? 1.5 : form.lightingQuality >= 3 ? 0.75 : 0;
      const seatScore = form.seatingComfort >= 4 ? 1.5 : form.seatingComfort >= 3 ? 0.75 : 0;
      const laptopScore = form.laptopFriendly >= 4 ? 1.5 : form.laptopFriendly >= 3 ? 0.75 : 0;
      const crowdScore = form.crowdLevel <= 2 ? 1.5 : form.crowdLevel <= 3 ? 0.75 : 0;
      const studyScore = Math.min(10, Math.round((wifiScore + noiseScore + lightScore + seatScore + laptopScore + crowdScore + 1) * 10) / 10);

      // 3. Submit to database via tRPC
      await addSubmission({
        name: form.name,
        category: form.type,
        neighborhood: form.neighborhood,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        website: form.website || undefined,
        priceLevel: form.priceLevel,
        atmosphere: form.description || undefined,
        noiseLevel: form.noiseLevel,
        wifiQuality: form.wifiQuality,
        lightingQuality: form.lightingQuality,
        seatingComfort: form.seatingComfort,
        laptopFriendly: form.laptopFriendly,
        crowdLevel: form.crowdLevel,
        studyScore,
        tags: form.tags,
        images: imageUrls,
        submittedBy: form.submittedBy || undefined,
      });

      toast.success('Study spot submitted!', {
        description: 'Your spot has been added and is now visible to everyone.',
      });
      onClose();
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Submission failed', {
        description: 'Please try again. If the problem persists, check your connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: form.lat, lng: form.lng },
      gmpDraggable: true,
      title: 'Drag to set location',
    });
    markerRef.current = marker;

    marker.addListener('dragend', () => {
      const pos = marker.position;
      if (pos) {
        const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
        const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
        updateForm({ lat, lng });
      }
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.position = { lat, lng };
        updateForm({ lat, lng });
      }
    });

    setMapPickerActive(true);
  }, [form.lat, form.lng, updateForm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
          <h1 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Add a Study Spot
          </h1>
          <div className="w-16" />
        </div>

        {/* Step indicator */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                  step > s.id ? 'bg-fog-sage text-white' :
                  step === s.id ? 'bg-primary text-primary-foreground' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${step > s.id ? 'bg-fog-sage' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Tell us about this spot</h2>
                <p className="text-sm text-muted-foreground">Share a study spot you love with the community.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Location Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => updateForm({ name: e.target.value })}
                    placeholder="e.g. The Espresso Room"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Location Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LOCATION_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateForm({ type })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          form.type === type
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-card text-foreground hover:border-primary/30'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Neighborhood *</label>
                  <select
                    value={form.neighborhood}
                    onChange={e => updateForm({ neighborhood: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    <option value="">Select neighborhood...</option>
                    {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Address *</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => updateForm({ address: e.target.value })}
                    placeholder="e.g. 31 Great Ormond St, London WC1N 3HZ"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Price Level</label>
                    <select
                      value={form.priceLevel}
                      onChange={e => updateForm({ priceLevel: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value="Free">Free</option>
                      <option value="£">£</option>
                      <option value="£-££">£-££</option>
                      <option value="££">££</option>
                      <option value="££-£££">££-£££</option>
                      <option value="£££">£££</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Website (optional)</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={e => updateForm({ website: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Your Name (optional)</label>
                  <input
                    type="text"
                    value={form.submittedBy}
                    onChange={e => updateForm({ submittedBy: e.target.value })}
                    placeholder="Anonymous"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location on Map */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Pin the location</h2>
                <p className="text-sm text-muted-foreground">Drag the pin or click the map to set the exact location.</p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-border" style={{ height: '400px' }}>
                <MapView
                  initialCenter={{ lat: form.lat, lng: form.lng }}
                  initialZoom={15}
                  onMapReady={handleMapReady}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lat}
                    onChange={e => updateForm({ lat: parseFloat(e.target.value) || 51.5074 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lng}
                    onChange={e => updateForm({ lng: parseFloat(e.target.value) || -0.1278 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Environment Ratings */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Rate the environment</h2>
                <p className="text-sm text-muted-foreground">Help others know what to expect when studying here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Describe the atmosphere</label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm({ description: e.target.value })}
                  placeholder="What makes this spot special for studying? Describe the vibe, ambiance, and what you love about it..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="space-y-5">
                <RatingSlider label="Noise Level" icon={Volume2} value={form.noiseLevel} onChange={v => updateForm({ noiseLevel: v })} lowLabel="Silent" highLabel="Noisy" />
                <RatingSlider label="Wi-Fi Quality" icon={Wifi} value={form.wifiQuality} onChange={v => updateForm({ wifiQuality: v })} lowLabel="None" highLabel="Excellent" />
                <RatingSlider label="Lighting Quality" icon={Sun} value={form.lightingQuality} onChange={v => updateForm({ lightingQuality: v })} lowLabel="Dim" highLabel="Bright" />
                <RatingSlider label="Seating Comfort" icon={Armchair} value={form.seatingComfort} onChange={v => updateForm({ seatingComfort: v })} lowLabel="Basic" highLabel="Very Comfy" />
                <RatingSlider label="Laptop Friendliness" icon={Laptop} value={form.laptopFriendly} onChange={v => updateForm({ laptopFriendly: v })} lowLabel="Not Ideal" highLabel="Perfect" />
                <RatingSlider label="Crowd Level" icon={Users} value={form.crowdLevel} onChange={v => updateForm({ crowdLevel: v })} lowLabel="Empty" highLabel="Packed" />
              </div>
            </motion.div>
          )}

          {/* Step 4: Image Upload */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Add photos</h2>
                <p className="text-sm text-muted-foreground">Upload 1-5 photos of the study spot. The first image will be the cover. Images will be stored permanently.</p>
              </div>

              <div
                onClick={() => form.imagePreviewUrls.length < 5 && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  form.imagePreviewUrls.length >= 5
                    ? 'border-border/50 opacity-50 cursor-not-allowed'
                    : 'border-primary/30 hover:border-primary/60 cursor-pointer hover:bg-primary/5'
                }`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {form.imagePreviewUrls.length >= 5 ? 'Maximum 5 images reached' : 'Click to upload photos'}
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {form.imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.imagePreviewUrls.map((img, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                      <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                {form.imagePreviewUrls.length}/5 images uploaded {form.imagePreviewUrls.length < 1 && '(minimum 1 required)'}
              </p>
            </motion.div>
          )}

          {/* Step 5: Tags */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Add tags</h2>
                <p className="text-sm text-muted-foreground">Select tags that best describe this study spot (at least 1).</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.tags.includes(tag)
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border bg-card text-foreground hover:border-primary/30'
                    }`}
                  >
                    {form.tags.includes(tag) && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                    {tag}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">{form.tags.length} tags selected</p>
            </motion.div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Review your submission</h2>
                <p className="text-sm text-muted-foreground">Check everything looks good before submitting.</p>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {form.imagePreviewUrls[0] && (
                  <div className="relative aspect-[16/9]">
                    <img src={form.imagePreviewUrls[0]} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-fog-sage text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Community Submitted
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{form.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {form.neighborhood} · {form.type} · {form.priceLevel}
                    </p>
                  </div>

                  {form.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed">{form.description}</p>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Noise', value: form.noiseLevel, icon: Volume2 },
                      { label: 'Wi-Fi', value: form.wifiQuality, icon: Wifi },
                      { label: 'Lighting', value: form.lightingQuality, icon: Sun },
                      { label: 'Seating', value: form.seatingComfort, icon: Armchair },
                      { label: 'Laptop', value: form.laptopFriendly, icon: Laptop },
                      { label: 'Crowd', value: form.crowdLevel, icon: Users },
                    ].map(attr => (
                      <div key={attr.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                        <attr.icon className="w-4 h-4 mx-auto mb-1 text-fog-sage" />
                        <div className="text-lg font-semibold text-foreground">{attr.value}/5</div>
                        <div className="text-[10px] text-muted-foreground">{attr.label}</div>
                      </div>
                    ))}
                  </div>

                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map(tag => (
                        <span key={tag} className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {form.imagePreviewUrls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {form.imagePreviewUrls.slice(1).map((img, i) => (
                        <img key={i} src={img} alt={`Photo ${i + 2}`} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Submitted by {form.submittedBy || 'Anonymous'} · {form.address}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              onClick={() => canProceed() && setStep(s => s + 1)}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                canProceed()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
              }`}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-fog-sage text-white hover:bg-fog-sage/90 shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Submit Study Spot
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
