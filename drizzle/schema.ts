import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Community-submitted study spots.
 * Stores all location data + images (S3 URLs) + submission metadata.
 * Tags and images are stored as JSON-encoded text for TiDB compatibility.
 */
export const communitySubmissions = mysqlTable("community_submissions", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to users table — null for anonymous submissions */
  userId: int("userId"),
  /** Display name of the submitter */
  submittedBy: varchar("submittedBy", { length: 255 }).notNull(),

  /** City this submission belongs to: london or bristol */
  city: mysqlEnum("city", ["london", "bristol"]).default("london").notNull(),

  // Core location fields
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  address: text("address").notNull(),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  website: varchar("website", { length: 500 }),
  priceLevel: varchar("priceLevel", { length: 20 }).notNull(),

  // Atmosphere & description
  atmosphere: text("atmosphere"),

  // Study attributes (1-5 scale stored as int)
  noiseLevel: int("noiseLevel").notNull(),
  wifiQuality: int("wifiQuality").notNull(),
  lightingQuality: int("lightingQuality").notNull(),
  seatingComfort: int("seatingComfort").notNull(),
  laptopFriendly: int("laptopFriendly").notNull(),
  crowdLevel: int("crowdLevel").notNull(),

  // Computed study score (0-10)
  studyScore: decimal("studyScore", { precision: 3, scale: 1 }).notNull(),

  // Tags as JSON-encoded text (e.g. '["Quiet","Aesthetic"]')
  tags: text("tags").notNull(),

  // Image URLs as JSON-encoded text (e.g. '["https://...","https://..."]')
  images: text("images").notNull(),

  // Moderation & Verification
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),

  /** Verification status from automatic + community checks */
  verificationStatus: mysqlEnum("verificationStatus", [
    "unverified",
    "verified",
    "community_verified",
    "pending_verification",
    "flagged",
  ]).default("unverified").notNull(),

  /** Google Places place_id if matched */
  googlePlaceId: varchar("googlePlaceId", { length: 255 }),

  /** Number of community confirmations ("I have studied here") */
  confirmationCount: int("confirmationCount").default(0).notNull(),

  /** Number of reports */
  reportCount: int("reportCount").default(0).notNull(),

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunitySubmission = typeof communitySubmissions.$inferSelect;
export type InsertCommunitySubmission = typeof communitySubmissions.$inferInsert;

/**
 * Location confirmations — users confirming "I have studied here"
 */
export const locationConfirmations = mysqlTable("location_confirmations", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to community_submissions */
  submissionId: int("submissionId").notNull(),
  /** FK to users */
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LocationConfirmation = typeof locationConfirmations.$inferSelect;
export type InsertLocationConfirmation = typeof locationConfirmations.$inferInsert;

/**
 * Location reports — users reporting problematic locations
 */
export const locationReports = mysqlTable("location_reports", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to community_submissions */
  submissionId: int("submissionId").notNull(),
  /** FK to users */
  userId: int("userId").notNull(),
  /** Report reason */
  reason: mysqlEnum("reason", [
    "fake_location",
    "unsafe_location",
    "incorrect_information",
    "not_a_study_spot",
  ]).notNull(),
  /** Optional additional details */
  details: text("details"),
  /** Report status */
  status: mysqlEnum("status", ["pending", "reviewed", "dismissed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LocationReport = typeof locationReports.$inferSelect;
export type InsertLocationReport = typeof locationReports.$inferInsert;

/**
 * Location image overrides — admin-managed images for curated and uni locations.
 * locationType: 'curated' for main locations, 'uni' for university study spots
 * locationId: the id from the respective dataset
 */
export const locationImages = mysqlTable("location_images", {
  id: int("id").autoincrement().primaryKey(),
  /** Type of location: curated (main 310 spots) or uni (university spots) */
  locationType: mysqlEnum("locationType", ["curated", "uni"]).notNull(),
  /** ID from the respective dataset */
  locationId: int("locationId").notNull(),
  /** S3 URL for the image */
  imageUrl: text("imageUrl").notNull(),
  /** Optional caption/alt text */
  caption: varchar("caption", { length: 500 }),
  /** Display order (lower = first) */
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocationImage = typeof locationImages.$inferSelect;
export type InsertLocationImage = typeof locationImages.$inferInsert;

/**
 * Reviews — user reviews for study spots (shared across all users).
 * locationType: 'curated' for main 310 spots, 'uni' for university spots, 'community' for community submissions
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  /** Type of location being reviewed */
  locationType: mysqlEnum("locationType", ["curated", "uni", "community"]).notNull(),
  /** ID from the respective dataset */
  locationId: int("locationId").notNull(),
  /** FK to users — null for anonymous reviews */
  userId: int("userId"),
  /** Display name of the reviewer */
  userName: varchar("userName", { length: 255 }).notNull(),
  /** Quietness rating 1-5 */
  quietness: int("quietness").notNull(),
  /** Wi-Fi quality rating 1-5 */
  wifiQuality: int("wifiQuality").notNull(),
  /** Comfort rating 1-5 */
  comfort: int("comfort").notNull(),
  /** Lighting rating 1-5 */
  lighting: int("lighting").notNull(),
  /** Laptop-friendly rating 1-5 */
  laptopFriendly: int("laptopFriendly").notNull(),
  /** Free-text comment */
  comment: text("comment"),
  /** Review images as JSON-encoded text (e.g. '["https://..."]') */
  images: text("images"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Admin notifications — alerts for admin about new reviews, submissions, reports, etc.
 */
export const adminNotifications = mysqlTable("admin_notifications", {
  id: int("id").autoincrement().primaryKey(),
  /** Notification type */
  type: mysqlEnum("type", ["new_review", "new_submission", "new_report"]).notNull(),
  /** Human-readable title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Notification body/message */
  message: text("message").notNull(),
  /** Whether the admin has read this notification */
  isRead: int("isRead").default(0).notNull(),
  /** Optional reference ID (e.g. review ID, submission ID) */
  referenceId: int("referenceId"),
  /** Optional reference type for linking */
  referenceType: varchar("referenceType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = typeof adminNotifications.$inferInsert;
