/**
 * AdminPanel — Moderation dashboard for community submissions
 * Features: submission list, verification management, report review, reviews management, community spot editing
 * London Fog design: warm tones, editorial layout
 */
import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import VerificationBadge, { type VerificationStatus } from '@/components/VerificationBadge';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { getLoginUrl } from '@/const';
import { LogIn } from 'lucide-react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Flag,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  Star,
  Pencil,
  Save,
  X,
  MessageSquare,
} from 'lucide-react';

type Tab = 'submissions' | 'reports' | 'reviews';

const ImageMgmtIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('submissions');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to access the admin panel.</p>
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
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
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
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">Manage submissions, reviews, reports & images</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-3">
            <Link href="/admin/images">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ImageMgmtIcon className="w-3.5 h-3.5" />
                Image Manager
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {(['submissions', 'reports', 'reviews'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {activeTab === 'submissions' && (
          <SubmissionsTab expandedId={expandedId} setExpandedId={setExpandedId} />
        )}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'reviews' && <ReviewsTab />}
      </div>
    </div>
  );
}

// ─── Submissions Tab with inline editing ──────────────────────────────────────

function SubmissionsTab({
  expandedId,
  setExpandedId,
}: {
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
}) {
  const utils = trpc.useUtils();
  const { data: submissions, isLoading } = trpc.submissions.listAll.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);

  const updateStatusMutation = trpc.submissions.updateStatus.useMutation({
    onSuccess: () => {
      utils.submissions.listAll.invalidate();
      utils.submissions.list.invalidate();
      toast.success('Status updated');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateVerificationMutation = trpc.submissions.updateVerification.useMutation({
    onSuccess: () => {
      utils.submissions.listAll.invalidate();
      utils.submissions.list.invalidate();
      toast.success('Verification status updated');
    },
    onError: (err) => toast.error(err.message),
  });

  const editMutation = trpc.submissions.edit.useMutation({
    onSuccess: () => {
      utils.submissions.listAll.invalidate();
      utils.submissions.list.invalidate();
      toast.success('Submission updated');
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.submissions.delete.useMutation({
    onSuccess: () => {
      utils.submissions.listAll.invalidate();
      utils.submissions.list.invalidate();
      toast.success('Submission deleted');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading submissions...</div>;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No community submissions yet.</p>
      </div>
    );
  }

  const sorted = [...submissions].sort((a, b) => {
    const priority: Record<string, number> = { flagged: 0, pending_verification: 1, unverified: 2, community_verified: 3, verified: 4 };
    const statusPriority: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
    const vp = (priority[a.verificationStatus] ?? 5) - (priority[b.verificationStatus] ?? 5);
    if (vp !== 0) return vp;
    const sp = (statusPriority[a.status] ?? 5) - (statusPriority[b.status] ?? 5);
    if (sp !== 0) return sp;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">
        {submissions.length} total submissions
        {' · '}
        {submissions.filter(s => s.status === 'pending').length} pending
        {' · '}
        {submissions.filter(s => s.verificationStatus === 'flagged').length} flagged
      </div>

      {sorted.map((sub) => {
        const isExpanded = expandedId === sub.id;
        const isEditing = editingId === sub.id;
        return (
          <div
            key={sub.id}
            className={`border rounded-xl overflow-hidden transition-colors ${
              sub.verificationStatus === 'flagged'
                ? 'border-red-500/30 bg-red-500/5'
                : sub.status === 'pending'
                ? 'border-yellow-500/30 bg-yellow-500/5'
                : 'border-border bg-card'
            }`}
          >
            {/* Summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : sub.id)}
              className="w-full text-left p-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate text-foreground">{sub.name}</span>
                  <VerificationBadge status={sub.verificationStatus as VerificationStatus} compact />
                  <StatusBadge status={sub.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{sub.neighborhood}</span>
                  <span>·</span>
                  <span>{sub.category}</span>
                  <span>·</span>
                  <span>by {sub.submittedBy}</span>
                  {sub.confirmationCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" /> {sub.confirmationCount}
                      </span>
                    </>
                  )}
                  {sub.reportCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-red-500">
                        <Flag className="w-3 h-3" /> {sub.reportCount}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-border/50 pt-3">
                {isEditing ? (
                  <SubmissionEditForm
                    submission={sub}
                    onSave={(data) => editMutation.mutate({ id: sub.id, ...data })}
                    onCancel={() => setEditingId(null)}
                    isSaving={editMutation.isPending}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Address</div>
                        <div className="text-sm text-foreground">{sub.address}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
                        <div className="text-sm text-foreground">{sub.lat.toFixed(5)}, {sub.lng.toFixed(5)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Study Score</div>
                        <div className="text-sm font-medium text-foreground">{sub.studyScore.toFixed(1)}/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Price Level</div>
                        <div className="text-sm text-foreground">{sub.priceLevel || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Ratings</div>
                        <div className="text-sm text-foreground">
                          Noise: {sub.noiseLevel} · WiFi: {sub.wifiQuality} · Light: {sub.lightingQuality} · Comfort: {sub.seatingComfort} · Laptop: {sub.laptopFriendly}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Google Place ID</div>
                        <div className="text-sm font-mono text-xs text-foreground">{sub.googlePlaceId || '—'}</div>
                      </div>
                      {sub.atmosphere && (
                        <div className="sm:col-span-2">
                          <div className="text-xs text-muted-foreground mb-1">Atmosphere</div>
                          <div className="text-sm text-foreground">{sub.atmosphere}</div>
                        </div>
                      )}
                      {sub.tags && sub.tags.length > 0 && (
                        <div className="sm:col-span-2">
                          <div className="text-xs text-muted-foreground mb-1">Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {sub.tags.map((tag: string, i: number) => (
                              <span key={i} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    {sub.images && sub.images.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-muted-foreground mb-2">Images</div>
                        <div className="flex gap-2 overflow-x-auto">
                          {sub.images.map((img: string, i: number) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${sub.name} ${i + 1}`}
                              className="w-20 h-20 rounded-lg object-cover border border-border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setEditingId(sub.id)}
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      {sub.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() => updateStatusMutation.mutate({ id: sub.id, status: 'approved' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </Button>
                      )}
                      {sub.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => updateStatusMutation.mutate({ id: sub.id, status: 'rejected' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      )}
                      {sub.verificationStatus !== 'verified' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => updateVerificationMutation.mutate({ id: sub.id, verificationStatus: 'verified' })}
                          disabled={updateVerificationMutation.isPending}
                        >
                          <Shield className="w-3.5 h-3.5" /> Mark Verified
                        </Button>
                      )}
                      {sub.verificationStatus === 'flagged' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => updateVerificationMutation.mutate({ id: sub.id, verificationStatus: 'unverified' })}
                          disabled={updateVerificationMutation.isPending}
                        >
                          Unflag
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 ml-auto"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this submission?')) {
                            deleteMutation.mutate({ id: sub.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Submission Edit Form ─────────────────────────────────────────────────────

function SubmissionEditForm({
  submission,
  onSave,
  onCancel,
  isSaving,
}: {
  submission: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name: submission.name || '',
    category: submission.category || '',
    neighborhood: submission.neighborhood || '',
    address: submission.address || '',
    atmosphere: submission.atmosphere || '',
    website: submission.website || '',
    priceLevel: submission.priceLevel || '',
    noiseLevel: submission.noiseLevel || 3,
    wifiQuality: submission.wifiQuality || 3,
    lightingQuality: submission.lightingQuality || 3,
    seatingComfort: submission.seatingComfort || 3,
    laptopFriendly: submission.laptopFriendly || 3,
    crowdLevel: submission.crowdLevel || 3,
    studyScore: submission.studyScore || 7,
    lat: submission.lat || 0,
    lng: submission.lng || 0,
  });

  const handleSave = () => {
    onSave({
      name: form.name,
      category: form.category,
      neighborhood: form.neighborhood,
      address: form.address,
      atmosphere: form.atmosphere || undefined,
      website: form.website || undefined,
      priceLevel: form.priceLevel,
      noiseLevel: form.noiseLevel,
      wifiQuality: form.wifiQuality,
      lightingQuality: form.lightingQuality,
      seatingComfort: form.seatingComfort,
      laptopFriendly: form.laptopFriendly,
      crowdLevel: form.crowdLevel,
      studyScore: form.studyScore,
      lat: form.lat,
      lng: form.lng,
    });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "text-xs text-muted-foreground mb-1 block";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Neighborhood</label>
          <input className={inputClass} value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input className={inputClass} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Website</label>
          <input className={inputClass} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Price Level</label>
          <select className={inputClass} value={form.priceLevel} onChange={e => setForm(f => ({ ...f, priceLevel: e.target.value }))}>
            <option value="Free">Free</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Study Score (0-10)</label>
          <input type="number" min="0" max="10" step="0.1" className={inputClass} value={form.studyScore} onChange={e => setForm(f => ({ ...f, studyScore: parseFloat(e.target.value) || 0 }))} />
        </div>
        <div>
          <label className={labelClass}>Atmosphere</label>
          <input className={inputClass} value={form.atmosphere} onChange={e => setForm(f => ({ ...f, atmosphere: e.target.value }))} />
        </div>
      </div>

      {/* Ratings */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Ratings (1-5)</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'noiseLevel', label: 'Noise' },
            { key: 'wifiQuality', label: 'WiFi' },
            { key: 'lightingQuality', label: 'Lighting' },
            { key: 'seatingComfort', label: 'Comfort' },
            { key: 'laptopFriendly', label: 'Laptop' },
            { key: 'crowdLevel', label: 'Crowd' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type="number"
                min="1"
                max="5"
                className={inputClass}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 1 }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Latitude</label>
          <input type="number" step="0.0000001" className={inputClass} value={form.lat} onChange={e => setForm(f => ({ ...f, lat: parseFloat(e.target.value) || 0 }))} />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input type="number" step="0.0000001" className={inputClass} value={form.lng} onChange={e => setForm(f => ({ ...f, lng: parseFloat(e.target.value) || 0 }))} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="gap-1" onClick={handleSave} disabled={isSaving}>
          <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button size="sm" variant="outline" className="gap-1" onClick={onCancel}>
          <X className="w-3.5 h-3.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab() {
  const utils = trpc.useUtils();
  const { data: reviews, isLoading } = trpc.reviews.getAll.useQuery({ limit: 100, offset: 0 });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      utils.reviews.getAll.invalidate();
      utils.reviews.getForLocation.invalidate();
      utils.reviews.getCount.invalidate();
      utils.reviews.getTotalCount.invalidate();
      toast.success('Review deleted');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  const locationTypeLabel = (t: string) => {
    switch (t) {
      case 'curated': return 'Curated';
      case 'uni': return 'UniMode';
      case 'community': return 'Community';
      default: return t;
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">
        {reviews.length} total reviews
      </div>

      {reviews.map((review) => {
        const avg = ((review.quietness + review.wifiQuality + review.comfort + review.lighting + review.laptopFriendly) / 5).toFixed(1);
        const images: string[] = Array.isArray(review.images) ? review.images : [];
        return (
          <div key={review.id} className="border border-border rounded-xl p-4 bg-card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{review.userName || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">
                    {locationTypeLabel(review.locationType)} #{review.locationId}
                  </span>
                  <span className="text-xs font-medium text-fog-gold">{avg}/5</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  Q:{review.quietness} W:{review.wifiQuality} C:{review.comfort} L:{review.lighting} LP:{review.laptopFriendly}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 shrink-0"
                onClick={() => {
                  if (confirm('Delete this review?')) {
                    deleteMutation.mutate({ id: review.id });
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            {review.comment && (
              <p className="text-sm text-foreground/80 mt-1">{review.comment}</p>
            )}
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {images.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab() {
  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.submissions.allPendingReports.useQuery();

  const updateReportStatusMutation = trpc.submissions.updateReportStatus.useMutation({
    onSuccess: () => {
      utils.submissions.allPendingReports.invalidate();
      toast.success('Report status updated');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading reports...</div>;
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <Flag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No pending reports.</p>
      </div>
    );
  }

  const REASON_LABELS: Record<string, string> = {
    fake_location: 'Fake Location',
    unsafe_location: 'Unsafe Location',
    incorrect_information: 'Incorrect Information',
    not_a_study_spot: 'Not a Study Spot',
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">
        {reports.length} pending reports
      </div>

      {reports.map((report) => (
        <div key={report.id} className="border border-red-500/30 rounded-xl p-4 bg-red-500/5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-red-500">
                  {REASON_LABELS[report.reason] || report.reason}
                </span>
                <span className="text-xs text-muted-foreground">
                  Submission #{report.submissionId}
                </span>
              </div>
              {report.details && (
                <p className="text-sm text-muted-foreground">{report.details}</p>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Reported {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => updateReportStatusMutation.mutate({ id: report.id, status: 'reviewed' })}
              disabled={updateReportStatusMutation.isPending}
            >
              <Eye className="w-3.5 h-3.5" /> Mark Reviewed
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-muted-foreground"
              onClick={() => updateReportStatusMutation.mutate({ id: report.id, status: 'dismissed' })}
              disabled={updateReportStatusMutation.isPending}
            >
              Dismiss
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
    approved: { label: 'Approved', className: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
    rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}
