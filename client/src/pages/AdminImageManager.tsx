/**
 * AdminImageManager — Manage images for all locations (curated + uni)
 * Allows admin to upload, replace, and adjust images for any location
 */
import { useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { getLoginUrl } from '@/const';
import {
  ArrowLeft,
  Shield,
  Upload,
  Image as ImageIcon,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { locations } from '@/lib/locations';
import { uniStudySpots } from '@/lib/uniStudySpots';

type LocationType = 'curated' | 'uni';

interface LocationEntry {
  type: LocationType;
  id: number;
  name: string;
  category: string;
  neighborhood: string;
  currentImage: string;
}

export default function AdminImageManager() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'curated' | 'uni'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get all image overrides
  const { data: imageOverrides } = trpc.locationImages.getAll.useQuery();

  // Build a lookup map of overrides
  const overrideMap = useMemo(() => {
    const map = new Map<string, typeof imageOverrides>();
    if (!imageOverrides) return map;
    for (const img of imageOverrides) {
      const key = `${img.locationType}-${img.locationId}`;
      const existing = map.get(key) || [];
      existing.push(img);
      map.set(key, existing);
    }
    return map;
  }, [imageOverrides]);

  // Build unified location list
  const allLocations = useMemo<LocationEntry[]>(() => {
    const curated: LocationEntry[] = locations.map(loc => ({
      type: 'curated' as const,
      id: loc.id,
      name: loc.name,
      category: loc.category,
      neighborhood: loc.neighborhood,
      currentImage: loc.image,
    }));

    const uni: LocationEntry[] = uniStudySpots.map(spot => ({
      type: 'uni' as const,
      id: spot.id,
      name: spot.name,
      category: spot.university,
      neighborhood: spot.campus,
      currentImage: spot.image || '',
    }));

    return [...curated, ...uni];
  }, []);

  // Filter locations
  const filteredLocations = useMemo(() => {
    let result = allLocations;
    if (filterType !== 'all') {
      result = result.filter(l => l.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.neighborhood.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allLocations, filterType, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to access the image manager.</p>
          <div className="flex gap-3 justify-center">
            <a href={getLoginUrl()}>
              <Button>Log In</Button>
            </a>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to manage images.</p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/admin">
              <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                Image Manager
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage images for all {allLocations.length} locations
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'curated' | 'uni')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">All ({allLocations.length})</option>
              <option value="curated">Curated ({locations.length})</option>
              <option value="uni">University ({uniStudySpots.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location List */}
      <div className="container py-4">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredLocations.length} locations shown
          {imageOverrides && ` · ${overrideMap.size} with custom images`}
        </p>

        <div className="space-y-2">
          {filteredLocations.map((loc) => {
            const key = `${loc.type}-${loc.id}`;
            const isExpanded = expandedId === key;
            const overrides = overrideMap.get(key) || [];
            const hasOverride = overrides.length > 0;

            return (
              <div key={key} className="border border-border rounded-xl overflow-hidden bg-card">
                {/* Summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : key)}
                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                    {(hasOverride ? overrides[0].imageUrl : loc.currentImage) ? (
                      <img
                        src={hasOverride ? overrides[0].imageUrl : loc.currentImage}
                        alt={loc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{loc.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        loc.type === 'curated' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {loc.type === 'curated' ? 'Curated' : 'Uni'}
                      </span>
                      {hasOverride && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">
                          Custom Image
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {loc.category} · {loc.neighborhood}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded: Image management */}
                {isExpanded && (
                  <ImageEditor
                    locationType={loc.type}
                    locationId={loc.id}
                    locationName={loc.name}
                    defaultImage={loc.currentImage}
                    overrides={overrides}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ImageEditor({
  locationType,
  locationId,
  locationName,
  defaultImage,
  overrides,
}: {
  locationType: LocationType;
  locationId: number;
  locationName: string;
  defaultImage: string;
  overrides: any[];
}) {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = trpc.locationImages.upload.useMutation({
    onSuccess: () => {
      utils.locationImages.getAll.invalidate();
      toast.success('Image uploaded successfully');
      setIsUploading(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setIsUploading(false);
    },
  });

  const setUrlMutation = trpc.locationImages.setUrl.useMutation({
    onSuccess: () => {
      utils.locationImages.getAll.invalidate();
      toast.success('Image URL saved');
      setUrlInput('');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.locationImages.delete.useMutation({
    onSuccess: () => {
      utils.locationImages.getAll.invalidate();
      toast.success('Image removed');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB.');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        locationType,
        locationId,
        base64,
        mimeType: file.type,
        displayOrder: overrides.length,
      });
    };
    reader.readAsDataURL(file);
  }, [locationType, locationId, overrides.length, uploadMutation]);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
    } catch {
      toast.error('Invalid URL');
      return;
    }
    setUrlMutation.mutate({
      locationType,
      locationId,
      imageUrl: urlInput.trim(),
      displayOrder: overrides.length,
    });
  }, [urlInput, locationType, locationId, overrides.length, setUrlMutation]);

  return (
    <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-4">
      {/* Current default image */}
      <div>
        <div className="text-xs text-muted-foreground mb-2 font-medium">Default Image</div>
        <div className="flex items-start gap-3">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary shrink-0">
            {defaultImage ? (
              <img src={defaultImage} alt={locationName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            <p>This is the built-in image from the dataset.</p>
            <p className="mt-1">Add custom images below to override it.</p>
          </div>
        </div>
      </div>

      {/* Custom image overrides */}
      {overrides.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-medium">
            Custom Images ({overrides.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {overrides.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.imageUrl}
                  alt={`Custom ${img.displayOrder}`}
                  className="w-full aspect-square rounded-lg object-cover border border-border"
                />
                <button
                  onClick={() => {
                    if (confirm('Remove this image?')) {
                      deleteMutation.mutate({ id: img.id });
                    }
                  }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 rounded-b-lg truncate">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new image */}
      <div>
        <div className="text-xs text-muted-foreground mb-2 font-medium">Add Image</div>
        <div className="flex gap-2">
          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || uploadMutation.isPending}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            Upload
          </Button>

          {/* URL input */}
          <div className="flex-1 flex gap-1">
            <input
              type="url"
              placeholder="Paste image URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || setUrlMutation.isPending}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
