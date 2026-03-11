import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { makeRequest, type PlacesSearchResult } from "./_core/map";
import {
  createSubmission,
  getApprovedSubmissions,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
  updateVerificationStatus,
  updateSubmission,
  addConfirmation,
  hasUserConfirmed,
  addReport,
  hasUserReported,
  getReportsForSubmission,
  getAllPendingReports,
  updateReportStatus,
  getAllLocationImages,
  getLocationImages,
  setLocationImage,
  updateLocationImage,
  deleteLocationImage,
  deleteAllLocationImages,
} from "./db";

// ─── Helper: parse submission row for API response ──────────────────────────
function parseSubmissionRow(row: any) {
  return {
    ...row,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    studyScore: parseFloat(row.studyScore),
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []),
    images: typeof row.images === "string" ? JSON.parse(row.images) : (row.images || []),
  };
}

// ─── Helper: verify location against Google Places ──────────────────────────
async function verifyLocationWithGoogle(
  name: string,
  lat: number,
  lng: number
): Promise<{ verified: boolean; placeId?: string }> {
  try {
    // Search for the place near the submitted coordinates
    const result = await makeRequest<PlacesSearchResult>(
      "/maps/api/place/nearbysearch/json",
      {
        location: `${lat},${lng}`,
        radius: 200, // 200m radius
        keyword: name,
      }
    );

    if (result.status === "OK" && result.results.length > 0) {
      // Check if any result is a reasonable match
      const match = result.results.find(place => {
        const nameLower = name.toLowerCase();
        const placeLower = place.name.toLowerCase();
        // Check if names share significant words
        const nameWords = nameLower.split(/\s+/).filter(w => w.length > 2);
        const placeWords = placeLower.split(/\s+/).filter(w => w.length > 2);
        const commonWords = nameWords.filter(w => placeWords.some(pw => pw.includes(w) || w.includes(pw)));
        return commonWords.length > 0 || placeLower.includes(nameLower) || nameLower.includes(placeLower);
      });

      if (match) {
        return { verified: true, placeId: match.place_id };
      }

      // Even if name doesn't match exactly, if there's a place very close, consider it plausible
      const closest = result.results[0];
      const distance = getDistanceMeters(lat, lng, closest.geometry.location.lat, closest.geometry.location.lng);
      if (distance < 50) {
        return { verified: true, placeId: closest.place_id };
      }
    }

    return { verified: false };
  } catch (error) {
    console.error("[Verification] Google Places check failed:", error);
    // Don't block submission if verification service is down
    return { verified: false };
  }
}

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ─── Location Image Management (Admin) ──────────────────────────────────
  locationImages: router({
    /** Get all image overrides (public - used to overlay on default images) */
    getAll: publicProcedure.query(async () => {
      return getAllLocationImages();
    }),

    /** Get images for a specific location (public) */
    getForLocation: publicProcedure
      .input(z.object({
        locationType: z.enum(["curated", "uni"]),
        locationId: z.number(),
      }))
      .query(async ({ input }) => {
        return getLocationImages(input.locationType, input.locationId);
      }),

    /** Upload and set an image for a location (admin only) */
    upload: adminProcedure
      .input(z.object({
        locationType: z.enum(["curated", "uni"]),
        locationId: z.number(),
        base64: z.string(),
        mimeType: z.string(),
        caption: z.string().max(500).optional(),
        displayOrder: z.number().int().min(0).optional(),
      }))
      .mutation(async ({ input }) => {
        const ext = input.mimeType.split("/")[1] || "jpg";
        const fileKey = `location-images/${input.locationType}/${input.locationId}/${nanoid(12)}.${ext}`;
        const buffer = Buffer.from(input.base64, "base64");

        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return setLocationImage({
          locationType: input.locationType,
          locationId: input.locationId,
          imageUrl: url,
          caption: input.caption,
          displayOrder: input.displayOrder,
        });
      }),

    /** Set image URL directly (admin only) - for pasting URLs */
    setUrl: adminProcedure
      .input(z.object({
        locationType: z.enum(["curated", "uni"]),
        locationId: z.number(),
        imageUrl: z.string().url(),
        caption: z.string().max(500).optional(),
        displayOrder: z.number().int().min(0).optional(),
      }))
      .mutation(async ({ input }) => {
        return setLocationImage({
          locationType: input.locationType,
          locationId: input.locationId,
          imageUrl: input.imageUrl,
          caption: input.caption,
          displayOrder: input.displayOrder,
        });
      }),

    /** Update an existing image record (admin only) */
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        imageUrl: z.string().url().optional(),
        caption: z.string().max(500).optional(),
        displayOrder: z.number().int().min(0).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateLocationImage(id, data);
        return { success: true };
      }),

    /** Delete a specific image (admin only) */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteLocationImage(input.id);
        return { success: true };
      }),

    /** Delete all images for a location (admin only) */
    deleteAll: adminProcedure
      .input(z.object({
        locationType: z.enum(["curated", "uni"]),
        locationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await deleteAllLocationImages(input.locationType, input.locationId);
        return { success: true };
      }),
  }),

  submissions: router({
    /** Get all approved community submissions (public) */
    list: publicProcedure.query(async () => {
      const rows = await getApprovedSubmissions();
      return rows.map(parseSubmissionRow);
    }),

    /** Get all submissions including pending/rejected (admin only) */
    listAll: adminProcedure.query(async () => {
      const rows = await getAllSubmissions();
      return rows.map(parseSubmissionRow);
    }),

    /** Get a single submission by ID (public) */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const row = await getSubmissionById(input.id);
        if (!row) return null;
        return parseSubmissionRow(row);
      }),

    /** Upload an image to S3 and return the URL */
    uploadImage: publicProcedure
      .input(z.object({
        /** Base64-encoded image data (without data:... prefix) */
        base64: z.string(),
        /** MIME type e.g. image/jpeg */
        mimeType: z.string(),
        /** Original filename */
        fileName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ext = input.mimeType.split("/")[1] || "jpg";
        const fileKey = `community-submissions/${nanoid(12)}.${ext}`;
        const buffer = Buffer.from(input.base64, "base64");

        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url };
      }),

    /** Create a new community submission with automatic verification */
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        category: z.string().min(1).max(100),
        neighborhood: z.string().min(1).max(100),
        address: z.string().min(1),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        website: z.string().max(500).optional(),
        priceLevel: z.string().max(20),
        atmosphere: z.string().optional(),
        noiseLevel: z.number().int().min(1).max(5),
        wifiQuality: z.number().int().min(1).max(5),
        lightingQuality: z.number().int().min(1).max(5),
        seatingComfort: z.number().int().min(1).max(5),
        laptopFriendly: z.number().int().min(1).max(5),
        crowdLevel: z.number().int().min(1).max(5),
        studyScore: z.number().min(0).max(10),
        tags: z.array(z.string()),
        images: z.array(z.string()), // S3 URLs
        submittedBy: z.string().max(255).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Step 1: Verify location with Google Places
        const verification = await verifyLocationWithGoogle(input.name, input.lat, input.lng);

        const verificationStatus = verification.verified ? "verified" : "pending_verification";
        const status = verification.verified ? "approved" : "pending";

        // Step 2: Create the submission
        const row = await createSubmission({
          userId: ctx.user?.id ?? null,
          submittedBy: input.submittedBy || ctx.user?.name || "Anonymous",
          name: input.name,
          category: input.category,
          neighborhood: input.neighborhood,
          address: input.address,
          lat: input.lat.toFixed(7),
          lng: input.lng.toFixed(7),
          website: input.website || null,
          priceLevel: input.priceLevel,
          atmosphere: input.atmosphere || null,
          noiseLevel: input.noiseLevel,
          wifiQuality: input.wifiQuality,
          lightingQuality: input.lightingQuality,
          seatingComfort: input.seatingComfort,
          laptopFriendly: input.laptopFriendly,
          crowdLevel: input.crowdLevel,
          studyScore: input.studyScore.toFixed(1),
          tags: JSON.stringify(input.tags),
          images: JSON.stringify(input.images),
          status,
          verificationStatus,
          googlePlaceId: verification.placeId || null,
        });

        return parseSubmissionRow(row);
      }),

    /** Update submission status (admin only) */
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await updateSubmissionStatus(input.id, input.status);
        return { success: true };
      }),

    /** Update verification status (admin only) */
    updateVerification: adminProcedure
      .input(z.object({
        id: z.number(),
        verificationStatus: z.enum(["unverified", "verified", "community_verified", "pending_verification", "flagged"]),
      }))
      .mutation(async ({ input }) => {
        await updateVerificationStatus(input.id, input.verificationStatus);
        return { success: true };
      }),

    /** Edit submission details (admin only) */
    edit: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        category: z.string().min(1).max(100).optional(),
        neighborhood: z.string().min(1).max(100).optional(),
        address: z.string().min(1).optional(),
        atmosphere: z.string().optional(),
        verificationStatus: z.enum(["unverified", "verified", "community_verified", "pending_verification", "flagged"]).optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // Filter out undefined values
        const updateData = Object.fromEntries(
          Object.entries(data).filter(([, v]) => v !== undefined)
        );
        if (Object.keys(updateData).length > 0) {
          await updateSubmission(id, updateData as any);
        }
        return { success: true };
      }),

    /** Delete a submission (admin only) */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSubmission(input.id);
        return { success: true };
      }),

    /** Confirm a location — "I have studied here" (logged-in users only) */
    confirm: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await addConfirmation(input.submissionId, ctx.user.id);
        return { success: true };
      }),

    /** Check if current user has confirmed a location */
    hasConfirmed: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(async ({ input, ctx }) => {
        return hasUserConfirmed(input.submissionId, ctx.user.id);
      }),

    /** Report a location (logged-in users only) */
    report: protectedProcedure
      .input(z.object({
        submissionId: z.number(),
        reason: z.enum(["fake_location", "unsafe_location", "incorrect_information", "not_a_study_spot"]),
        details: z.string().max(1000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await addReport(input.submissionId, ctx.user.id, input.reason, input.details);
        return { success: true };
      }),

    /** Check if current user has reported a location */
    hasReported: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(async ({ input, ctx }) => {
        return hasUserReported(input.submissionId, ctx.user.id);
      }),

    /** Get reports for a submission (admin only) */
    getReports: adminProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(async ({ input }) => {
        return getReportsForSubmission(input.submissionId);
      }),

    /** Get all pending reports (admin only) */
    allPendingReports: adminProcedure.query(async () => {
      return getAllPendingReports();
    }),

    /** Update report status (admin only) */
    updateReportStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "reviewed", "dismissed"]),
      }))
      .mutation(async ({ input }) => {
        await updateReportStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
