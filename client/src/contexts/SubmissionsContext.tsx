/**
 * SubmissionsContext — Community-submitted study spots
 * Persists to localStorage, provides add/list/approve functionality
 * Submitted spots get a "Community Submitted" badge
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type Location } from '@/lib/locations';

export interface SubmittedSpot extends Location {
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved';
  images: string[]; // base64 data URLs
  isCommunitySubmitted: true;
}

interface SubmissionsContextType {
  submissions: SubmittedSpot[];
  addSubmission: (spot: Omit<SubmittedSpot, 'id' | 'submittedAt' | 'status' | 'isCommunitySubmitted'>) => void;
  approvedSubmissions: SubmittedSpot[];
  pendingCount: number;
}

const SubmissionsContext = createContext<SubmissionsContextType | null>(null);

const STORAGE_KEY = 'studyspot-submissions';

function loadSubmissions(): SubmittedSpot[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<SubmittedSpot[]>(loadSubmissions);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }, [submissions]);

  const addSubmission = useCallback((spot: Omit<SubmittedSpot, 'id' | 'submittedAt' | 'status' | 'isCommunitySubmitted'>) => {
    const newSpot: SubmittedSpot = {
      ...spot,
      id: Date.now() + Math.floor(Math.random() * 1000),
      submittedAt: new Date().toISOString(),
      status: 'approved', // Auto-approve for demo — in production this would be 'pending'
      isCommunitySubmitted: true,
    };
    setSubmissions(prev => [newSpot, ...prev]);
  }, []);

  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <SubmissionsContext.Provider value={{ submissions, addSubmission, approvedSubmissions, pendingCount }}>
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  const ctx = useContext(SubmissionsContext);
  if (!ctx) throw new Error('useSubmissions must be used within SubmissionsProvider');
  return ctx;
}
