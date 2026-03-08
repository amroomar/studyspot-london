import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import {
  createSubmission,
  getApprovedSubmissions,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
} from "./db";

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

  submissions: router({
    /** Get all approved community submissions (public) */
    list: publicProcedure.query(async () => {
      const rows = await getApprovedSubmissions();
      return rows.map(row => ({
        ...row,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        studyScore: parseFloat(row.studyScore),
        tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []),
        images: typeof row.images === "string" ? JSON.parse(row.images) : (row.images || []),
      }));
    }),

    /** Get all submissions including pending/rejected (admin only) */
    listAll: adminProcedure.query(async () => {
      const rows = await getAllSubmissions();
      return rows.map(row => ({
        ...row,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        studyScore: parseFloat(row.studyScore),
        tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []),
        images: typeof row.images === "string" ? JSON.parse(row.images) : (row.images || []),
      }));
    }),

    /** Get a single submission by ID (public) */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const row = await getSubmissionById(input.id);
        if (!row) return null;
        return {
          ...row,
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          studyScore: parseFloat(row.studyScore),
          tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []),
          images: typeof row.images === "string" ? JSON.parse(row.images) : (row.images || []),
        };
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

    /** Create a new community submission */
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
          status: "approved", // Auto-approve for now
        });

        return {
          ...row,
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          studyScore: parseFloat(row.studyScore),
          tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
          images: typeof row.images === "string" ? JSON.parse(row.images) : row.images,
        };
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

    /** Delete a submission (admin only) */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSubmission(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
