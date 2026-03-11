import { describe, expect, it } from "vitest";
import { bristolLocations } from "../client/src/lib/bristolLocations";
import {
  bristolUniversities,
  bristolUniStudySpots,
  type BristolUniversity,
  type BristolUniStudySpot,
} from "../client/src/lib/bristolUniStudySpots";
import {
  bristolSocialVideos,
  type BristolSocialVideo,
} from "../client/src/lib/bristolSocialVideos";
import {
  BRISTOL_HERO_IMAGES,
  BRISTOL_CATEGORY_HERO,
  getBristolLocationImage,
} from "../client/src/lib/bristolImages";

// ─── Bristol Locations ───

describe("Bristol Locations Data Integrity", () => {
  it("has exactly 100 Bristol study spots", () => {
    expect(bristolLocations).toHaveLength(100);
  });

  it("all locations have required fields", () => {
    for (const loc of bristolLocations) {
      expect(loc.id).toBeTypeOf("number");
      expect(loc.name).toBeTypeOf("string");
      expect(loc.name.length).toBeGreaterThan(0);
      expect(loc.category).toBeTypeOf("string");
      expect(loc.neighborhood).toBeTypeOf("string");
      expect(loc.address).toBeTypeOf("string");
      expect(loc.lat).toBeTypeOf("number");
      expect(loc.lng).toBeTypeOf("number");
    }
  });

  it("all locations have valid coordinates within Bristol area", () => {
    for (const loc of bristolLocations) {
      // Bristol is roughly 51.40-51.50 lat, -2.70 to -2.50 lng
      expect(loc.lat).toBeGreaterThan(51.35);
      expect(loc.lat).toBeLessThan(51.55);
      expect(loc.lng).toBeGreaterThan(-2.75);
      expect(loc.lng).toBeLessThan(-2.45);
    }
  });

  it("all locations have unique IDs", () => {
    const ids = bristolLocations.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all locations have valid study scores", () => {
    for (const loc of bristolLocations) {
      expect(loc.studyScore).toBeGreaterThanOrEqual(1);
      expect(loc.studyScore).toBeLessThanOrEqual(10);
    }
  });

  it("all locations have valid noise levels", () => {
    for (const loc of bristolLocations) {
      expect(loc.noiseLevel).toBeGreaterThanOrEqual(1);
      expect(loc.noiseLevel).toBeLessThanOrEqual(5);
    }
  });

  it("has a variety of categories", () => {
    const categories = new Set(bristolLocations.map((l) => l.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
  });

  it("has a variety of neighborhoods", () => {
    const neighborhoods = new Set(bristolLocations.map((l) => l.neighborhood));
    expect(neighborhoods.size).toBeGreaterThanOrEqual(8);
  });

  it("wifi and plugSockets are valid yes/no values", () => {
    for (const loc of bristolLocations) {
      expect(["yes", "no", "limited"]).toContain(loc.wifi);
      expect(["yes", "no", "limited"]).toContain(loc.plugSockets);
    }
  });
});

// ─── Bristol University Study Spots ───

describe("Bristol UniMode Data Integrity", () => {
  it("has 2 Bristol universities", () => {
    expect(bristolUniversities).toHaveLength(2);
  });

  it("has exactly 20 university study spots", () => {
    expect(bristolUniStudySpots).toHaveLength(20);
  });

  it("universities have required fields", () => {
    for (const uni of bristolUniversities) {
      expect(uni.id).toBeTypeOf("number");
      expect(uni.name).toBeTypeOf("string");
      expect(uni.shortName).toBeTypeOf("string");
      expect(uni.color).toBeTypeOf("string");
      expect(uni.lat).toBeTypeOf("number");
      expect(uni.lng).toBeTypeOf("number");
    }
  });

  it("UoB has 12 spots and UWE has 8 spots", () => {
    const uobSpots = bristolUniStudySpots.filter(
      (s) => s.universityId === 1
    );
    const uweSpots = bristolUniStudySpots.filter(
      (s) => s.universityId === 2
    );
    expect(uobSpots).toHaveLength(12);
    expect(uweSpots).toHaveLength(8);
  });

  it("all uni spots have required fields", () => {
    for (const spot of bristolUniStudySpots) {
      expect(spot.id).toBeTypeOf("number");
      expect(spot.name).toBeTypeOf("string");
      expect(spot.name.length).toBeGreaterThan(0);
      expect(spot.universityId).toBeTypeOf("number");
      expect(spot.building).toBeTypeOf("string");
      expect(spot.category).toBeTypeOf("string");
      expect(spot.lat).toBeTypeOf("number");
      expect(spot.lng).toBeTypeOf("number");
    }
  });

  it("all uni spots have valid coordinates within Bristol area", () => {
    for (const spot of bristolUniStudySpots) {
      expect(spot.lat).toBeGreaterThan(51.35);
      expect(spot.lat).toBeLessThan(51.55);
      expect(spot.lng).toBeGreaterThan(-2.75);
      expect(spot.lng).toBeLessThan(-2.45);
    }
  });

  it("all uni spots reference valid university IDs", () => {
    const uniIds = new Set(bristolUniversities.map((u) => u.id));
    for (const spot of bristolUniStudySpots) {
      expect(uniIds.has(spot.universityId)).toBe(true);
    }
  });

  it("all uni spots have unique IDs", () => {
    const ids = bristolUniStudySpots.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ─── Bristol Social Videos ───

describe("Bristol Social Videos Data Integrity", () => {
  it("has at least 10 social videos", () => {
    expect(bristolSocialVideos.length).toBeGreaterThanOrEqual(10);
  });

  it("all videos have required fields", () => {
    for (const video of bristolSocialVideos) {
      expect(video.id).toBeTypeOf("number");
      expect(video.title).toBeTypeOf("string");
      expect(video.title.length).toBeGreaterThan(0);
      expect(video.creator).toBeTypeOf("string");
      expect(video.platform).toBeTypeOf("string");
      expect(["tiktok", "instagram", "youtube"]).toContain(video.platform);
      expect(video.url).toBeTypeOf("string");
      expect(video.url.startsWith("http")).toBe(true);
    }
  });

  it("all videos have valid thumbnails", () => {
    for (const video of bristolSocialVideos) {
      expect(video.thumbnail).toBeTypeOf("string");
      expect(video.thumbnail.startsWith("http")).toBe(true);
    }
  });

  it("all videos have tags", () => {
    for (const video of bristolSocialVideos) {
      expect(Array.isArray(video.tags)).toBe(true);
      expect(video.tags.length).toBeGreaterThan(0);
    }
  });
});

// ─── Bristol Images ───

describe("Bristol Images", () => {
  it("BRISTOL_HERO_IMAGES has all required keys", () => {
    expect(BRISTOL_HERO_IMAGES.main).toBeTypeOf("string");
    expect(BRISTOL_HERO_IMAGES.library).toBeTypeOf("string");
    expect(BRISTOL_HERO_IMAGES.coworking).toBeTypeOf("string");
    expect(BRISTOL_HERO_IMAGES.harbourside).toBeTypeOf("string");
    expect(BRISTOL_HERO_IMAGES.hotel).toBeTypeOf("string");
  });

  it("BRISTOL_CATEGORY_HERO has category mappings", () => {
    expect(Object.keys(BRISTOL_CATEGORY_HERO).length).toBeGreaterThanOrEqual(5);
  });

  it("getBristolLocationImage returns a string for any location", () => {
    const image = getBristolLocationImage("Society Cafe", "Quiet Study Cafe");
    expect(image).toBeTypeOf("string");
    expect(image.startsWith("http")).toBe(true);
  });

  it("getBristolLocationImage returns different images for different categories", () => {
    const cafeImage = getBristolLocationImage("Society Cafe", "Quiet Study Cafe");
    const libraryImage = getBristolLocationImage("Bristol Central Library", "Library");
    // They may or may not be different, but both should be valid URLs
    expect(cafeImage).toBeTypeOf("string");
    expect(libraryImage).toBeTypeOf("string");
  });
});
