/**
 * ConfirmReportButtons — Community confirmation and report system
 * 
 * "I have studied here" button — increases verification score
 * "Report Location" button — with reason selection
 */
import { useState } from 'react';
import { CheckCircle2, Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { toast } from 'sonner';

interface ConfirmReportButtonsProps {
  submissionId: number;
  confirmationCount: number;
}

const REPORT_REASONS = [
  { value: 'fake_location' as const, label: 'Fake location', description: 'This place does not exist' },
  { value: 'unsafe_location' as const, label: 'Unsafe location', description: 'This place is not safe to visit' },
  { value: 'incorrect_information' as const, label: 'Incorrect information', description: 'Details are wrong or misleading' },
  { value: 'not_a_study_spot' as const, label: 'Not a real study spot', description: 'Not suitable for studying' },
];

export default function ConfirmReportButtons({ submissionId, confirmationCount }: ConfirmReportButtonsProps) {
  const { user, isAuthenticated } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<typeof REPORT_REASONS[number]['value'] | null>(null);
  const [reportDetails, setReportDetails] = useState('');

  const utils = trpc.useUtils();

  // Check if user has already confirmed/reported
  const { data: hasConfirmed } = trpc.submissions.hasConfirmed.useQuery(
    { submissionId },
    { enabled: isAuthenticated }
  );
  const { data: hasReported } = trpc.submissions.hasReported.useQuery(
    { submissionId },
    { enabled: isAuthenticated }
  );

  const confirmMutation = trpc.submissions.confirm.useMutation({
    onSuccess: () => {
      toast.success('Thanks for confirming this location!');
      utils.submissions.hasConfirmed.invalidate({ submissionId });
      utils.submissions.list.invalidate();
      utils.submissions.getById.invalidate({ id: submissionId });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to confirm');
    },
  });

  const reportMutation = trpc.submissions.report.useMutation({
    onSuccess: () => {
      toast.success('Report submitted. Thank you for helping keep our community safe.');
      setShowReportModal(false);
      setReportReason(null);
      setReportDetails('');
      utils.submissions.hasReported.invalidate({ submissionId });
      utils.submissions.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit report');
    },
  });

  const handleConfirm = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    confirmMutation.mutate({ submissionId });
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setShowReportModal(true);
  };

  const submitReport = () => {
    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }
    reportMutation.mutate({
      submissionId,
      reason: reportReason,
      details: reportDetails || undefined,
    });
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Confirm button */}
        <Button
          variant={hasConfirmed ? "default" : "outline"}
          size="sm"
          onClick={handleConfirm}
          disabled={hasConfirmed === true || confirmMutation.isPending}
          className={`gap-1.5 ${hasConfirmed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {hasConfirmed ? 'Confirmed' : 'I have studied here'}
          {confirmationCount > 0 && (
            <span className="ml-1 text-xs opacity-75">({confirmationCount})</span>
          )}
        </Button>

        {/* Report button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReport}
          disabled={hasReported === true}
          className={`gap-1.5 text-muted-foreground hover:text-red-600 ${hasReported ? 'text-red-400' : ''}`}
        >
          <Flag className="w-4 h-4" />
          {hasReported ? 'Reported' : 'Report'}
        </Button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Report Location
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Help us keep the community safe by reporting issues with this location.
            </p>

            {/* Reason selection */}
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setReportReason(reason.value)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    reportReason === reason.value
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : 'border-border hover:border-red-200 hover:bg-red-50/50'
                  }`}
                >
                  <div className="font-medium text-sm">{reason.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{reason.description}</div>
                </button>
              ))}
            </div>

            {/* Additional details */}
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional details (optional)"
              className="w-full p-3 rounded-xl border border-border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-200"
              maxLength={1000}
            />

            {/* Submit */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={submitReport}
                disabled={!reportReason || reportMutation.isPending}
              >
                {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
