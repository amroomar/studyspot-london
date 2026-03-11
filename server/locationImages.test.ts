import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getAllLocationImages: vi.fn().mockResolvedValue([]),
    getLocationImages: vi.fn().mockResolvedValue([]),
    setLocationImage: vi.fn().mockResolvedValue({
      id: 1,
      locationType: "curated",
      locationId: 42,
      imageUrl: "https://example.com/test.jpg",
      caption: null,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    updateLocationImage: vi.fn().mockResolvedValue(undefined),
    deleteLocationImage: vi.fn().mockResolvedValue(undefined),
    deleteAllLocationImages: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/uploaded.jpg", key: "test-key" }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("locationImages router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll (public)", () => {
    it("returns all location images without auth", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.locationImages.getAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getForLocation (public)", () => {
    it("returns images for a specific curated location", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.locationImages.getForLocation({
        locationType: "curated",
        locationId: 1,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns images for a specific uni location", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.locationImages.getForLocation({
        locationType: "uni",
        locationId: 42,
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("setUrl (admin only)", () => {
    it("allows admin to set an image URL", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.locationImages.setUrl({
        locationType: "curated",
        locationId: 42,
        imageUrl: "https://example.com/new-image.jpg",
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(
        caller.locationImages.setUrl({
          locationType: "curated",
          locationId: 42,
          imageUrl: "https://example.com/new-image.jpg",
        })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated users", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.locationImages.setUrl({
          locationType: "curated",
          locationId: 42,
          imageUrl: "https://example.com/new-image.jpg",
        })
      ).rejects.toThrow();
    });
  });

  describe("delete (admin only)", () => {
    it("allows admin to delete an image", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.locationImages.delete({ id: 1 });
      expect(result).toEqual({ success: true });
    });

    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(
        caller.locationImages.delete({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("deleteAll (admin only)", () => {
    it("allows admin to delete all images for a location", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.locationImages.deleteAll({
        locationType: "uni",
        locationId: 42,
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("update (admin only)", () => {
    it("allows admin to update an image record", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.locationImages.update({
        id: 1,
        caption: "Updated caption",
        displayOrder: 2,
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("upload (admin only)", () => {
    it("allows admin to upload an image", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      // Small 1x1 transparent PNG in base64
      const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const result = await caller.locationImages.upload({
        locationType: "curated",
        locationId: 1,
        base64,
        mimeType: "image/png",
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });
});
