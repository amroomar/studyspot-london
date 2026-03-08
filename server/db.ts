import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, communitySubmissions, type InsertCommunitySubmission, type CommunitySubmission } from "../drizzle/schema";
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
