import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  createReview: vi.fn(),
  getReviewsForLocation: vi.fn(),
  getReviewCount: vi.fn(),
  deleteReview: vi.fn(),
  getTotalReviewCount: vi.fn(),
}));

import {
  createReview,
  getReviewsForLocation,
  getReviewCount,
  deleteReview,
  getTotalReviewCount,
} from "./db";

const mockCreateReview = vi.mocked(createReview);
const mockGetReviewsForLocation = vi.mocked(getReviewsForLocation);
const mockGetReviewCount = vi.mocked(getReviewCount);
const mockDeleteReview = vi.mocked(deleteReview);
const mockGetTotalReviewCount = vi.mocked(getTotalReviewCount);

describe("Reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReview", () => {
    it("should create a review with all required fields", async () => {
      const reviewData = {
        locationType: "curated" as const,
        locationId: 42,
        userId: 1,
        userName: "Test User",
        quietness: 4,
        wifiQuality: 5,
        comfort: 3,
        lighting: 4,
        laptopFriendly: 5,
        comment: "Great study spot!",
      };

      const mockResult = {
        id: 1,
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateReview.mockResolvedValue(mockResult);

      const result = await createReview(reviewData);

      expect(mockCreateReview).toHaveBeenCalledWith(reviewData);
      expect(result).toEqual(mockResult);
      expect(result.id).toBe(1);
      expect(result.userName).toBe("Test User");
    });

    it("should create a review with null comment", async () => {
      const reviewData = {
        locationType: "uni" as const,
        locationId: 10,
        userId: 2,
        userName: "Another User",
        quietness: 3,
        wifiQuality: 3,
        comfort: 3,
        lighting: 3,
        laptopFriendly: 3,
        comment: null,
      };

      const mockResult = {
        id: 2,
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateReview.mockResolvedValue(mockResult);

      const result = await createReview(reviewData);

      expect(result.comment).toBeNull();
    });
  });

  describe("getReviewsForLocation", () => {
    it("should return reviews for a curated location", async () => {
      const mockReviews = [
        {
          id: 1,
          locationType: "curated" as const,
          locationId: 42,
          userId: 1,
          userName: "User A",
          quietness: 5,
          wifiQuality: 4,
          comfort: 4,
          lighting: 5,
          laptopFriendly: 5,
          comment: "Excellent!",
          createdAt: new Date("2026-03-10"),
          updatedAt: new Date("2026-03-10"),
        },
        {
          id: 2,
          locationType: "curated" as const,
          locationId: 42,
          userId: 2,
          userName: "User B",
          quietness: 3,
          wifiQuality: 3,
          comfort: 3,
          lighting: 3,
          laptopFriendly: 3,
          comment: "Decent",
          createdAt: new Date("2026-03-09"),
          updatedAt: new Date("2026-03-09"),
        },
      ];

      mockGetReviewsForLocation.mockResolvedValue(mockReviews);

      const result = await getReviewsForLocation("curated", 42);

      expect(mockGetReviewsForLocation).toHaveBeenCalledWith("curated", 42);
      expect(result).toHaveLength(2);
      expect(result[0].userName).toBe("User A");
    });

    it("should return empty array for location with no reviews", async () => {
      mockGetReviewsForLocation.mockResolvedValue([]);

      const result = await getReviewsForLocation("community", 999);

      expect(result).toHaveLength(0);
    });

    it("should return reviews for community locations", async () => {
      mockGetReviewsForLocation.mockResolvedValue([
        {
          id: 3,
          locationType: "community" as const,
          locationId: 5,
          userId: 1,
          userName: "Community User",
          quietness: 4,
          wifiQuality: 4,
          comfort: 4,
          lighting: 4,
          laptopFriendly: 4,
          comment: "Nice community spot",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await getReviewsForLocation("community", 5);

      expect(result).toHaveLength(1);
      expect(result[0].locationType).toBe("community");
    });
  });

  describe("getReviewCount", () => {
    it("should return the count of reviews for a location", async () => {
      mockGetReviewCount.mockResolvedValue(7);

      const count = await getReviewCount("curated", 42);

      expect(mockGetReviewCount).toHaveBeenCalledWith("curated", 42);
      expect(count).toBe(7);
    });

    it("should return 0 for location with no reviews", async () => {
      mockGetReviewCount.mockResolvedValue(0);

      const count = await getReviewCount("uni", 100);

      expect(count).toBe(0);
    });
  });

  describe("deleteReview", () => {
    it("should delete a review by id", async () => {
      mockDeleteReview.mockResolvedValue(undefined);

      await deleteReview(1);

      expect(mockDeleteReview).toHaveBeenCalledWith(1);
    });
  });

  describe("getTotalReviewCount", () => {
    it("should return total review count across all locations", async () => {
      mockGetTotalReviewCount.mockResolvedValue(42);

      const count = await getTotalReviewCount();

      expect(count).toBe(42);
    });
  });

  describe("Review average calculation", () => {
    it("should correctly calculate average from review ratings", () => {
      const review = {
        quietness: 5,
        wifiQuality: 4,
        comfort: 3,
        lighting: 4,
        laptopFriendly: 4,
      };

      const avg = (review.quietness + review.wifiQuality + review.comfort + review.lighting + review.laptopFriendly) / 5;

      expect(avg).toBe(4);
    });

    it("should handle minimum ratings", () => {
      const review = {
        quietness: 1,
        wifiQuality: 1,
        comfort: 1,
        lighting: 1,
        laptopFriendly: 1,
      };

      const avg = (review.quietness + review.wifiQuality + review.comfort + review.lighting + review.laptopFriendly) / 5;

      expect(avg).toBe(1);
    });

    it("should handle maximum ratings", () => {
      const review = {
        quietness: 5,
        wifiQuality: 5,
        comfort: 5,
        lighting: 5,
        laptopFriendly: 5,
      };

      const avg = (review.quietness + review.wifiQuality + review.comfort + review.lighting + review.laptopFriendly) / 5;

      expect(avg).toBe(5);
    });
  });
});
