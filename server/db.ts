import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  communitySubmissions,
  locationConfirmations,
  locationReports,
  type InsertCommunitySubmission,
  type CommunitySubmission,
  type InsertLocationConfirmation,
  type LocationConfirmation,
  type InsertLocationReport,
  type LocationReport,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Community Submissions ───────────────────────────────────────────────────

/** Create a new community submission */
export async function createSubmission(data: InsertCommunitySubmission): Promise<CommunitySubmission> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(communitySubmissions).values(data);
  const insertId = result[0].insertId;

  const rows = await db.select().from(communitySubmissions).where(eq(communitySubmissions.id, insertId)).limit(1);
  return rows[0];
}

/** Get all approved community submissions, newest first */
export async function getApprovedSubmissions(): Promise<CommunitySubmission[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(communitySubmissions)
    .where(eq(communitySubmissions.status, "approved"))
    .orderBy(desc(communitySubmissions.createdAt));
}

/** Get all submissions (admin) */
export async function getAllSubmissions(): Promise<CommunitySubmission[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(communitySubmissions)
    .orderBy(desc(communitySubmissions.createdAt));
}

/** Get a single submission by ID */
export async function getSubmissionById(id: number): Promise<CommunitySubmission | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db.select().from(communitySubmissions).where(eq(communitySubmissions.id, id)).limit(1);
  return rows[0];
}

/** Update submission status (approve/reject) */
export async function updateSubmissionStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communitySubmissions).set({ status }).where(eq(communitySubmissions.id, id));
}

/** Delete a submission */
export async function deleteSubmission(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(communitySubmissions).where(eq(communitySubmissions.id, id));
}

/** Update verification status */
export async function updateVerificationStatus(
  id: number,
  verificationStatus: "unverified" | "verified" | "community_verified" | "pending_verification" | "flagged",
  googlePlaceId?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = { verificationStatus };
  if (googlePlaceId !== undefined) {
    updateData.googlePlaceId = googlePlaceId;
  }

  await db.update(communitySubmissions).set(updateData).where(eq(communitySubmissions.id, id));
}

/** Update submission fields (admin edit) */
export async function updateSubmission(
  id: number,
  data: Partial<Pick<CommunitySubmission, "name" | "category" | "neighborhood" | "address" | "atmosphere" | "verificationStatus" | "status">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communitySubmissions).set(data).where(eq(communitySubmissions.id, id));
}

// ─── Location Confirmations ─────────────────────────────────────────────────

/** Add a confirmation ("I have studied here") */
export async function addConfirmation(submissionId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already confirmed
  const existing = await db
    .select()
    .from(locationConfirmations)
    .where(
      and(
        eq(locationConfirmations.submissionId, submissionId),
        eq(locationConfirmations.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("You have already confirmed this location");
  }

  // Insert confirmation
  await db.insert(locationConfirmations).values({ submissionId, userId });

  // Increment count on submission
  await db
    .update(communitySubmissions)
    .set({
      confirmationCount: sql`${communitySubmissions.confirmationCount} + 1`,
    })
    .where(eq(communitySubmissions.id, submissionId));

  // Check if we should auto-upgrade to community_verified (5+ confirmations)
  const submission = await getSubmissionById(submissionId);
  if (submission && submission.confirmationCount >= 5 && submission.verificationStatus !== "flagged") {
    await updateVerificationStatus(submissionId, "community_verified");
  }
}

/** Check if a user has confirmed a location */
export async function hasUserConfirmed(submissionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const rows = await db
    .select()
    .from(locationConfirmations)
    .where(
      and(
        eq(locationConfirmations.submissionId, submissionId),
        eq(locationConfirmations.userId, userId)
      )
    )
    .limit(1);

  return rows.length > 0;
}

/** Get confirmation count for a submission */
export async function getConfirmationCount(submissionId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(locationConfirmations)
    .where(eq(locationConfirmations.submissionId, submissionId));

  return rows[0]?.count ?? 0;
}

// ─── Location Reports ───────────────────────────────────────────────────────

/** Add a report */
export async function addReport(
  submissionId: number,
  userId: number,
  reason: "fake_location" | "unsafe_location" | "incorrect_information" | "not_a_study_spot",
  details?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already reported this location
  const existing = await db
    .select()
    .from(locationReports)
    .where(
      and(
        eq(locationReports.submissionId, submissionId),
        eq(locationReports.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("You have already reported this location");
  }

  // Insert report
  await db.insert(locationReports).values({ submissionId, userId, reason, details });

  // Increment report count on submission
  await db
    .update(communitySubmissions)
    .set({
      reportCount: sql`${communitySubmissions.reportCount} + 1`,
    })
    .where(eq(communitySubmissions.id, submissionId));

  // Check if we should auto-flag (3+ reports)
  const submission = await getSubmissionById(submissionId);
  if (submission && submission.reportCount >= 3) {
    await updateVerificationStatus(submissionId, "flagged");
  }
}

/** Check if a user has reported a location */
export async function hasUserReported(submissionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const rows = await db
    .select()
    .from(locationReports)
    .where(
      and(
        eq(locationReports.submissionId, submissionId),
        eq(locationReports.userId, userId)
      )
    )
    .limit(1);

  return rows.length > 0;
}

/** Get all reports for a submission (admin) */
export async function getReportsForSubmission(submissionId: number): Promise<LocationReport[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(locationReports)
    .where(eq(locationReports.submissionId, submissionId))
    .orderBy(desc(locationReports.createdAt));
}

/** Get all pending reports (admin) */
export async function getAllPendingReports(): Promise<LocationReport[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(locationReports)
    .where(eq(locationReports.status, "pending"))
    .orderBy(desc(locationReports.createdAt));
}

/** Update report status (admin) */
export async function updateReportStatus(id: number, status: "pending" | "reviewed" | "dismissed"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(locationReports).set({ status }).where(eq(locationReports.id, id));
}

// ─── Location Images (Admin) ────────────────────────────────────────────────

import { locationImages, type InsertLocationImage, type LocationImage } from "../drizzle/schema";

/** Get all images for a specific location */
export async function getLocationImages(
  locationType: "curated" | "uni",
  locationId: number
): Promise<LocationImage[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(locationImages)
    .where(
      and(
        eq(locationImages.locationType, locationType),
        eq(locationImages.locationId, locationId)
      )
    )
    .orderBy(locationImages.displayOrder);
}

/** Get all location image overrides (for bulk loading) */
export async function getAllLocationImages(): Promise<LocationImage[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(locationImages).orderBy(locationImages.locationType, locationImages.locationId);
}

/** Set/replace the image for a location (upsert by locationType + locationId + displayOrder) */
export async function setLocationImage(data: {
  locationType: "curated" | "uni";
  locationId: number;
  imageUrl: string;
  caption?: string;
  displayOrder?: number;
}): Promise<LocationImage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(locationImages).values({
    locationType: data.locationType,
    locationId: data.locationId,
    imageUrl: data.imageUrl,
    caption: data.caption || null,
    displayOrder: data.displayOrder ?? 0,
  });

  const insertId = result[0].insertId;
  const rows = await db.select().from(locationImages).where(eq(locationImages.id, insertId)).limit(1);
  return rows[0];
}

/** Update an existing location image */
export async function updateLocationImage(
  id: number,
  data: { imageUrl?: string; caption?: string; displayOrder?: number }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {};
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.caption !== undefined) updateData.caption = data.caption;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

  if (Object.keys(updateData).length > 0) {
    await db.update(locationImages).set(updateData).where(eq(locationImages.id, id));
  }
}

/** Delete a location image */
export async function deleteLocationImage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(locationImages).where(eq(locationImages.id, id));
}

/** Delete all images for a location */
export async function deleteAllLocationImages(
  locationType: "curated" | "uni",
  locationId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(locationImages)
    .where(
      and(
        eq(locationImages.locationType, locationType),
        eq(locationImages.locationId, locationId)
      )
    );
}

// ─── Reviews ────────────────────────────────────────────────────────────────

import { reviews, type InsertReview, type Review } from "../drizzle/schema";

/** Create a new review */
export async function createReview(data: InsertReview): Promise<Review> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(data);
  const insertId = result[0].insertId;

  const rows = await db.select().from(reviews).where(eq(reviews.id, insertId)).limit(1);
  return rows[0];
}

/** Get all reviews for a specific location */
export async function getReviewsForLocation(
  locationType: "curated" | "uni" | "community",
  locationId: number
): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.locationType, locationType),
        eq(reviews.locationId, locationId)
      )
    )
    .orderBy(desc(reviews.createdAt));
}

/** Get review count for a location */
export async function getReviewCount(
  locationType: "curated" | "uni" | "community",
  locationId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews)
    .where(
      and(
        eq(reviews.locationType, locationType),
        eq(reviews.locationId, locationId)
      )
    );

  return rows[0]?.count ?? 0;
}

/** Delete a review (admin or owner) */
export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(reviews).where(eq(reviews.id, id));
}

/** Get total review count across all locations */
export async function getTotalReviewCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews);

  return rows[0]?.count ?? 0;
}

/** Get all reviews with pagination (admin) */
export async function getAllReviews(
  limit: number = 50,
  offset: number = 0
): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Update a community submission (admin editing) */
export async function updateCommunitySubmission(
  id: number,
  data: Partial<InsertCommunitySubmission>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communitySubmissions).set(data).where(eq(communitySubmissions.id, id));
}

// ─── Admin Notifications ───────────────────────────────────────────────────

import { adminNotifications, type InsertAdminNotification, type AdminNotification } from "../drizzle/schema";

/** Create a new admin notification */
export async function createAdminNotification(data: InsertAdminNotification): Promise<AdminNotification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(adminNotifications).values(data);
  const insertId = result[0].insertId;

  const rows = await db.select().from(adminNotifications).where(eq(adminNotifications.id, insertId)).limit(1);
  return rows[0];
}

/** Get all admin notifications, newest first */
export async function getAdminNotifications(limit: number = 50, offset: number = 0): Promise<AdminNotification[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(adminNotifications)
    .orderBy(desc(adminNotifications.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Get unread notification count */
export async function getUnreadNotificationCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(adminNotifications)
    .where(eq(adminNotifications.isRead, 0));

  return rows[0]?.count ?? 0;
}

/** Mark a notification as read */
export async function markNotificationRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(adminNotifications).set({ isRead: 1 }).where(eq(adminNotifications.id, id));
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(adminNotifications).set({ isRead: 1 }).where(eq(adminNotifications.isRead, 0));
}

/** Delete a notification */
export async function deleteAdminNotification(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(adminNotifications).where(eq(adminNotifications.id, id));
}
