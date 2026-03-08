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

  // Moderation
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunitySubmission = typeof communitySubmissions.$inferSelect;
export type InsertCommunitySubmission = typeof communitySubmissions.$inferInsert;
