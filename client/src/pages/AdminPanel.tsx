/**
 * AdminPanel — Moderation dashboard for community submissions
 * Features: submission list, verification management, report review, status controls
 * London Fog design: warm tones, editorial layout
 */
import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import VerificationBadge, { type VerificationStatus } from '@/components/VerificationBadge';
import { toast } from 'sonner';
import { Link } from 'wouter';
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
} from 'lucide-react';

type Tab = 'submissions' | 'reports';

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

  if (!user || user.role !== 'admin') {
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
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                Moderation Panel
              </h1>
              <p className="text-sm text-muted-foreground">Manage community submissions and reports</p>
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
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'submissions'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {activeTab === 'submissions' && (
          <SubmissionsTab expandedId={expandedId} setExpandedId={setExpandedId} />
        )}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
}

function SubmissionsTab({
  expandedId,
  setExpandedId,
}: {
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
}) {
  const utils = trpc.useUtils();
  const { data: submissions, isLoading } = trpc.submissions.listAll.useQuery();

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

  // Sort: flagged first, then pending, then by date
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
        return (
          <div
            key={sub.id}
            className={`border rounded-xl overflow-hidden transition-colors ${
              sub.verificationStatus === 'flagged'
                ? 'border-red-200 bg-red-50/30'
                : sub.status === 'pending'
                ? 'border-yellow-200 bg-yellow-50/30'
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
                  <span className="font-medium text-sm truncate">{sub.name}</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Address</div>
                    <div className="text-sm">{sub.address}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
                    <div className="text-sm">{sub.lat.toFixed(5)}, {sub.lng.toFixed(5)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Study Score</div>
                    <div className="text-sm font-medium">{sub.studyScore.toFixed(1)}/10</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Google Place ID</div>
                    <div className="text-sm font-mono text-xs">{sub.googlePlaceId || '—'}</div>
                  </div>
                  {sub.atmosphere && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Atmosphere</div>
                      <div className="text-sm">{sub.atmosphere}</div>
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
                  {/* Status actions */}
                  {sub.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
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
                      className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => updateStatusMutation.mutate({ id: sub.id, status: 'rejected' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  )}

                  {/* Verification actions */}
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

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
        <div key={report.id} className="border border-red-200 rounded-xl p-4 bg-red-50/30">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-red-700">
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}
