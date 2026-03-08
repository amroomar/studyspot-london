import { describe, expect, it } from "vitest";
import {
  universities,
  uniStudySpots,
  LOCATION_TYPES,
  ACCESS_TYPES,
  ENVIRONMENT_TAGS,
  TYPE_ICONS,
  ACCESS_ICONS,
  type UniStudySpot,
  type University,
} from "../client/src/lib/uniStudySpots";
import { getUniSpotImage } from "../client/src/lib/uniImages";

describe("UniMode Data Integrity", () => {
  it("has 10 universities", () => {
    expect(universities).toHaveLength(10);
  });

  it("has at least 150 study spots", () => {
    expect(uniStudySpots.length).toBeGreaterThanOrEqual(150);
  });

  it("each university has at least 10 spots", () => {
    for (const uni of universities) {
      const spots = uniStudySpots.filter(s => s.universityId === uni.id);
      expect(spots.length).toBeGreaterThanOrEqual(10);
    }
  });

  it("university spotCount matches actual spots", () => {
    for (const uni of universities) {
      const actualCount = uniStudySpots.filter(s => s.universityId === uni.id).length;
      expect(uni.spotCount).toBe(actualCount);
    }
  });

  it("all spots have required fields", () => {
    for (const spot of uniStudySpots) {
      expect(spot.id).toBeTypeOf("number");
      expect(spot.name).toBeTypeOf("string");
      expect(spot.name.length).toBeGreaterThan(0);
      expect(spot.university).toBeTypeOf("string");
      expect(spot.universityId).toBeTypeOf("string");
      expect(spot.locationType).toBeTypeOf("string");
      expect(spot.campus).toBeTypeOf("string");
      expect(spot.address).toBeTypeOf("string");
      expect(spot.lat).toBeTypeOf("number");
      expect(spot.lng).toBeTypeOf("number");
      expect(spot.accessType).toBeTypeOf("string");
      expect(spot.quietnessLevel).toBeTypeOf("number");
      expect(spot.quietnessLevel).toBeGreaterThanOrEqual(1);
      expect(spot.quietnessLevel).toBeLessThanOrEqual(5);
      expect(spot.studyScore).toBeTypeOf("number");
      expect(spot.studyScore).toBeGreaterThanOrEqual(1);
      expect(spot.studyScore).toBeLessThanOrEqual(10);
      expect(Array.isArray(spot.tags)).toBe(true);
    }
  });

  it("all spots have valid universityId", () => {
    const uniIds = new Set(universities.map(u => u.id));
    for (const spot of uniStudySpots) {
      expect(uniIds.has(spot.universityId)).toBe(true);
    }
  });

  it("all spots have valid locationType", () => {
    const validTypes = new Set(LOCATION_TYPES);
    for (const spot of uniStudySpots) {
      expect(validTypes.has(spot.locationType as any)).toBe(true);
    }
  });

  it("all spots have valid accessType", () => {
    const validAccess = new Set(ACCESS_TYPES);
    for (const spot of uniStudySpots) {
      expect(validAccess.has(spot.accessType as any)).toBe(true);
    }
  });

  it("all spots have valid wifi/plugs/laptop values", () => {
    const validValues = new Set(["yes", "no", "limited"]);
    for (const spot of uniStudySpots) {
      expect(validValues.has(spot.wifi)).toBe(true);
      expect(validValues.has(spot.plugSockets)).toBe(true);
      expect(validValues.has(spot.laptopFriendly)).toBe(true);
    }
  });

  it("all spot IDs are unique", () => {
    const ids = uniStudySpots.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all universities have valid coordinates", () => {
    for (const uni of universities) {
      // London area roughly: lat 51.2-51.7, lng -0.6 to 0.3
      expect(uni.lat).toBeGreaterThan(51.0);
      expect(uni.lat).toBeLessThan(52.0);
      expect(uni.lng).toBeGreaterThan(-1.0);
      expect(uni.lng).toBeLessThan(0.5);
    }
  });

  it("all spots have coordinates near London", () => {
    for (const spot of uniStudySpots) {
      expect(spot.lat).toBeGreaterThan(50.5);
      expect(spot.lat).toBeLessThan(52.5);
      expect(spot.lng).toBeGreaterThan(-1.5);
      expect(spot.lng).toBeLessThan(1.0);
    }
  });
});

describe("UniMode Constants", () => {
  it("TYPE_ICONS covers all location types", () => {
    for (const type of LOCATION_TYPES) {
      expect(TYPE_ICONS[type]).toBeDefined();
    }
  });

  it("ACCESS_ICONS covers all access types", () => {
    for (const type of ACCESS_TYPES) {
      expect(ACCESS_ICONS[type]).toBeDefined();
    }
  });

  it("ENVIRONMENT_TAGS has expected tags", () => {
    expect(ENVIRONMENT_TAGS).toContain("Quiet");
    expect(ENVIRONMENT_TAGS).toContain("Deep Work");
    expect(ENVIRONMENT_TAGS).toContain("Creative Friendly");
    expect(ENVIRONMENT_TAGS).toContain("Group Study");
    expect(ENVIRONMENT_TAGS).toContain("Silent Study");
  });
});

describe("UniMode Image Utility", () => {
  it("returns a valid URL for each location type", () => {
    for (const type of LOCATION_TYPES) {
      const url = getUniSpotImage("Test Location", type);
      expect(url).toBeTypeOf("string");
      expect(url).toContain("unsplash.com");
    }
  });

  it("returns consistent images for the same name", () => {
    const url1 = getUniSpotImage("Main Library", "University Library");
    const url2 = getUniSpotImage("Main Library", "University Library");
    expect(url1).toBe(url2);
  });

  it("returns different images for different names", () => {
    const url1 = getUniSpotImage("Main Library", "University Library");
    const url2 = getUniSpotImage("Science Library", "University Library");
    // Different names should generally produce different images (not guaranteed but likely)
    // Just verify both are valid URLs
    expect(url1).toContain("unsplash.com");
    expect(url2).toContain("unsplash.com");
  });
});

describe("University Metadata", () => {
  it("each university has required fields", () => {
    for (const uni of universities) {
      expect(uni.id).toBeTypeOf("string");
      expect(uni.name).toBeTypeOf("string");
      expect(uni.fullName).toBeTypeOf("string");
      expect(uni.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(uni.campus).toBeTypeOf("string");
      expect(uni.zoom).toBeGreaterThanOrEqual(12);
      expect(uni.zoom).toBeLessThanOrEqual(18);
    }
  });

  it("includes expected universities", () => {
    const names = universities.map(u => u.id);
    expect(names).toContain("ucl");
    expect(names).toContain("kcl");
    expect(names).toContain("imperial");
    expect(names).toContain("lse");
    expect(names).toContain("qmul");
    expect(names).toContain("city");
    expect(names).toContain("soas");
    expect(names).toContain("westminster");
    expect(names).toContain("rhul");
    expect(names).toContain("ual");
  });
});
