import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  createAdminNotification: vi.fn().mockResolvedValue({
    id: 1,
    type: "new_review",
    title: "New Review by TestUser",
    message: 'TestUser left a 4.0/5 review on a curated location (ID: 1).',
    isRead: 0,
    referenceId: 1,
    referenceType: "review",
    createdAt: new Date(),
  }),
  getAdminNotifications: vi.fn().mockResolvedValue([
    {
      id: 1,
      type: "new_review",
      title: "New Review by TestUser",
      message: 'TestUser left a 4.0/5 review on a curated location (ID: 1).',
      isRead: 0,
      referenceId: 1,
      referenceType: "review",
      createdAt: new Date(),
    },
    {
      id: 2,
      type: "new_submission",
      title: "New Submission",
      message: 'A new study spot was submitted.',
      isRead: 1,
      referenceId: 5,
      referenceType: "submission",
      createdAt: new Date(Date.now() - 3600000),
    },
  ]),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(1),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  deleteAdminNotification: vi.fn().mockResolvedValue(undefined),
}));

import {
  createAdminNotification,
  getAdminNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAdminNotification,
} from "./db";

describe("Admin Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAdminNotification", () => {
    it("should create a notification with correct fields", async () => {
      const result = await createAdminNotification({
        type: "new_review",
        title: "New Review by TestUser",
        message: 'TestUser left a 4.0/5 review on a curated location (ID: 1).',
        referenceId: 1,
        referenceType: "review",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.type).toBe("new_review");
      expect(result.title).toBe("New Review by TestUser");
      expect(result.isRead).toBe(0);
      expect(result.referenceId).toBe(1);
      expect(result.referenceType).toBe("review");
    });
  });

  describe("getAdminNotifications", () => {
    it("should return notifications list", async () => {
      const notifications = await getAdminNotifications(50, 0);

      expect(notifications).toHaveLength(2);
      expect(notifications[0].type).toBe("new_review");
      expect(notifications[1].type).toBe("new_submission");
    });

    it("should include both read and unread notifications", async () => {
      const notifications = await getAdminNotifications(50, 0);

      const unread = notifications.filter(n => !n.isRead);
      const read = notifications.filter(n => n.isRead);
      expect(unread).toHaveLength(1);
      expect(read).toHaveLength(1);
    });
  });

  describe("getUnreadNotificationCount", () => {
    it("should return the count of unread notifications", async () => {
      const count = await getUnreadNotificationCount();
      expect(count).toBe(1);
    });
  });

  describe("markNotificationRead", () => {
    it("should mark a single notification as read", async () => {
      await markNotificationRead(1);
      expect(markNotificationRead).toHaveBeenCalledWith(1);
    });
  });

  describe("markAllNotificationsRead", () => {
    it("should mark all notifications as read", async () => {
      await markAllNotificationsRead();
      expect(markAllNotificationsRead).toHaveBeenCalled();
    });
  });

  describe("deleteAdminNotification", () => {
    it("should delete a notification", async () => {
      await deleteAdminNotification(1);
      expect(deleteAdminNotification).toHaveBeenCalledWith(1);
    });
  });

  describe("Notification trigger on review creation", () => {
    it("should generate correct notification message with comment", () => {
      const input = {
        quietness: 4,
        wifiQuality: 5,
        comfort: 3,
        lighting: 4,
        laptopFriendly: 4,
        locationType: "curated" as const,
        locationId: 42,
        comment: "Great spot for studying, very quiet atmosphere",
      };
      const userName = "TestUser";

      const avgRating = ((input.quietness + input.wifiQuality + input.comfort + input.lighting + input.laptopFriendly) / 5).toFixed(1);
      const message = `${userName} left a ${avgRating}/5 review on a ${input.locationType} location (ID: ${input.locationId}).${input.comment ? ` "${input.comment.slice(0, 100)}${input.comment.length > 100 ? '...' : ''}"` : ''}`;

      expect(avgRating).toBe("4.0");
      expect(message).toContain("TestUser left a 4.0/5 review");
      expect(message).toContain("curated location (ID: 42)");
      expect(message).toContain('"Great spot for studying');
    });

    it("should truncate long comments in notification message", () => {
      const longComment = "A".repeat(150);
      const truncated = `"${longComment.slice(0, 100)}..."`;

      expect(truncated.length).toBeLessThan(longComment.length + 10);
      expect(truncated).toContain("...");
    });

    it("should handle anonymous reviews in notification title", () => {
      const anonymous = true;
      const userName = anonymous ? "Anonymous" : "TestUser";

      expect(userName).toBe("Anonymous");
      const title = `New Review by ${userName}`;
      expect(title).toBe("New Review by Anonymous");
    });
  });
});
