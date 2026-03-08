/**
 * SubmissionsContext — Community-submitted study spots
 * Now backed by tRPC API + database + S3 image storage
 * Includes verification status, confirmation count, and report count
 */
import { createContext, useContext, type ReactNode } from 'react';
import { trpc } from '@/lib/trpc';
import type { VerificationStatus } from '@/components/VerificationBadge';

export interface SubmittedSpot {
  id: number;
  userId: number | null;
  submittedBy: string;
  name: string;
  category: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  website: string | null;
  priceLevel: string;
  atmosphere: string | null;
  noiseLevel: number;
  wifiQuality: number;
  lightingQuality: number;
  seatingComfort: number;
  laptopFriendly: number;
  crowdLevel: number;
  studyScore: number;
  tags: string[];
  images: string[];
  status: "pending" | "approved" | "rejected";
  verificationStatus: VerificationStatus;
  googlePlaceId: string | null;
  confirmationCount: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  isCommunitySubmitted: true;
}

interface SubmissionInput {
  name: string;
  category: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  website?: string;
  priceLevel: string;
  atmosphere?: string;
  noiseLevel: number;
  wifiQuality: number;
  lightingQuality: number;
  seatingComfort: number;
  laptopFriendly: number;
  crowdLevel: number;
  studyScore: number;
  tags: string[];
  images: string[]; // S3 URLs (already uploaded)
  submittedBy?: string;
}

interface SubmissionsContextType {
  submissions: SubmittedSpot[];
  addSubmission: (spot: SubmissionInput) => Promise<void>;
  approvedSubmissions: SubmittedSpot[];
  pendingCount: number;
  isLoading: boolean;
  uploadImage: (base64: string, mimeType: string, fileName?: string) => Promise<string>;
}

const SubmissionsContext = createContext<SubmissionsContextType | null>(null);

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();

  // Fetch all approved submissions from the database
  const { data: rawSubmissions, isLoading } = trpc.submissions.list.useQuery(undefined, {
    staleTime: 30_000, // Cache for 30 seconds
  });

  // Create submission mutation
  const createMutation = trpc.submissions.create.useMutation({
    onSuccess: () => {
      utils.submissions.list.invalidate();
    },
  });

  // Upload image mutation
  const uploadMutation = trpc.submissions.uploadImage.useMutation();

  // Transform raw data to SubmittedSpot format
  const submissions: SubmittedSpot[] = (rawSubmissions || []).map(row => ({
    ...row,
    verificationStatus: (row.verificationStatus || 'unverified') as VerificationStatus,
    googlePlaceId: row.googlePlaceId || null,
    confirmationCount: row.confirmationCount || 0,
    reportCount: row.reportCount || 0,
    isCommunitySubmitted: true as const,
  }));

  const addSubmission = async (spot: SubmissionInput) => {
    await createMutation.mutateAsync({
      name: spot.name,
      category: spot.category,
      neighborhood: spot.neighborhood,
      address: spot.address,
      lat: spot.lat,
      lng: spot.lng,
      website: spot.website,
      priceLevel: spot.priceLevel,
      atmosphere: spot.atmosphere,
      noiseLevel: spot.noiseLevel,
      wifiQuality: spot.wifiQuality,
      lightingQuality: spot.lightingQuality,
      seatingComfort: spot.seatingComfort,
      laptopFriendly: spot.laptopFriendly,
      crowdLevel: spot.crowdLevel,
      studyScore: spot.studyScore,
      tags: spot.tags,
      images: spot.images,
      submittedBy: spot.submittedBy,
    });
  };

  const uploadImage = async (base64: string, mimeType: string, fileName?: string): Promise<string> => {
    const result = await uploadMutation.mutateAsync({ base64, mimeType, fileName });
    return result.url;
  };

  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <SubmissionsContext.Provider value={{ submissions, addSubmission, approvedSubmissions, pendingCount, isLoading, uploadImage }}>
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  const ctx = useContext(SubmissionsContext);
  if (!ctx) throw new Error('useSubmissions must be used within SubmissionsProvider');
  return ctx;
}
