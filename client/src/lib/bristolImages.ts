/**
 * Bristol-specific image system
 * Real venue photos from Bristol uploaded to CDN
 * Separate from London images — no overlap
 */

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8';

// ── Hero images for Bristol sections ──
export const BRISTOL_HERO_IMAGES = {
  main: `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
  library: `${CDN}/bristol-central-library_1f782e36.jpg`,
  coworking: `${CDN}/desklodge_fc8e6e68.jpg`,
  harbourside: `${CDN}/watershed_deb8dac1.jpg`,
  hotel: `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
  colourful: `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
};

// ── Venue-specific images (name → CDN URL) ──
// Maps directly to Bristol location names in bristolLocations.ts
// Each venue gets its own real photo — no London images
export const BRISTOL_VENUE_IMAGES: Record<string, string> = {
  // ─── Quiet Study Cafes ───
  'Boston Tea Party Stokes Croft': `${CDN}/boston-tea-party_d76a7570.jpg`,
  'Boston Tea Party': `${CDN}/boston-tea-party_d76a7570.jpg`,
  'Society Cafe Farr\'s Lane': `${CDN}/society-cafe_5b75364d.jpg`,
  'Society Cafe': `${CDN}/society-cafe_5b75364d.jpg`,
  'Full Court Press': `${CDN}/full-court-press_89c0263d.jpg`,
  'Watershed Cafe & Bar': `${CDN}/watershed_00de9b68.jpg`,
  'Watershed Cafe': `${CDN}/watershed_00de9b68.jpg`,
  'Watershed': `${CDN}/watershed_00de9b68.jpg`,
  'Hotplate': `${CDN}/hotplate_53bdc94e.jpg`,
  'Love Bristol Cafe': `${CDN}/bristol-cafe-generic_2600eec9.jpg`,
  'Coffee #1 Clifton': `${CDN}/coffee1_5b34360d.jpg`,
  'Coffee #1 Welsh Back': `${CDN}/coffee1_5b34360d.jpg`,
  'Coffee #1': `${CDN}/coffee1_5b34360d.jpg`,
  'Hatter House Cafe': `${CDN}/hatter-house_abcce641.jpg`,
  'Hatter House': `${CDN}/hatter-house_abcce641.jpg`,
  'Spicer & Cole': `${CDN}/spicer-cole_fd96aab2.jpg`,
  'Spicer + Cole': `${CDN}/spicer-cole_fd96aab2.jpg`,
  'Spicer and Cole': `${CDN}/spicer-cole_fd96aab2.jpg`,
  'The Canteen': `${CDN}/watershed-2_d4abdbd2.jpg`,
  'Brew Coffee Co': `${CDN}/full-court-press_89c0263d.jpg`,
  'Mrs. Potts Chocolate House': `${CDN}/mrs-potts_500f48d1.jpg`,
  'Mrs Potts': `${CDN}/mrs-potts_500f48d1.jpg`,
  'Illustrate': `${CDN}/illustrate_89c325b0.jpg`,
  'Folk House Cafe': `${CDN}/folk-house-cafe_e11869ea.jpg`,
  'The Folk House': `${CDN}/folk-house-cafe_e11869ea.jpg`,
  'Cafe Kino': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Café Kino': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Pinkmans': `${CDN}/pinkmans_610f190b.jpg`,
  'Pinkmans Bakery': `${CDN}/pinkmans_610f190b.jpg`,
  'Mokoko Bakery': `${CDN}/mokoko_6eb325b3.jpg`,
  'Mokoko Coffee': `${CDN}/mokoko_6eb325b3.jpg`,
  'Mokoko': `${CDN}/mokoko_6eb325b3.jpg`,
  'Wayland\'s Yard': `${CDN}/waylands-yard_a5de43f8.jpg`,
  'Waylands Yard': `${CDN}/waylands-yard_a5de43f8.jpg`,
  'The Crafty Egg Stokes Croft': `${CDN}/bristol-cafe-italian_0136aa87.jpg`,
  'The Crafty Egg Bedminster': `${CDN}/bristol-cafe-italian_0136aa87.jpg`,
  'The Crafty Egg': `${CDN}/bristol-cafe-italian_0136aa87.jpg`,
  'Tobacco Factory Theatres Cafe': `${CDN}/tobacco-factory_29346d64.jpg`,
  'Tobacco Factory': `${CDN}/tobacco-factory_29346d64.jpg`,
  'Bocabar': `${CDN}/bocabar_96e308f9.jpg`,
  'Playground Coffee House': `${CDN}/playground-coffee_7c00ae05.jpg`,
  'Playground Coffee': `${CDN}/playground-coffee_7c00ae05.jpg`,
  'Friska Glass Wharf': `${CDN}/friska_ad3e175a.jpg`,
  'Friska': `${CDN}/friska_ad3e175a.jpg`,
  'The Bristol Loaf Bedminster': `${CDN}/harts-bakery_85ca6177.jpg`,
  'The Bristol Loaf Beacon': `${CDN}/bakesmiths_3f2a1651.jpg`,
  'The Bristol Loaf': `${CDN}/harts-bakery_85ca6177.jpg`,
  'Coffee Under Pressure': `${CDN}/small-street-espresso_d5cf41e1.jpg`,
  'Mocha Mocha': `${CDN}/mokoko-2_7bf37ade.jpg`,
  'The Arnolfini Cafe': `${CDN}/arnolfini_1c370815.jpg`,
  'Arnolfini': `${CDN}/arnolfini_1c370815.jpg`,
  'Arnolfini Cafe Bar': `${CDN}/arnolfini-2_7d5fcf25.jpg`,
  'Primrose Cafe': `${CDN}/primrose-cafe_5efa83b5.jpg`,
  'The Old Bookshop': `${CDN}/old-bookshop_e3b1ec67.jpg`,
  'Old Bookshop': `${CDN}/old-bookshop_e3b1ec67.jpg`,
  'Spoke & Stringer': `${CDN}/spoke-stringer_320b068c.jpg`,
  'Spoke and Stringer': `${CDN}/spoke-stringer-2_1e2f8d5e.jpg`,
  'Little Victories': `${CDN}/little-victories_e226a06e.jpg`,
  'Nº12 Easton': `${CDN}/grounded_5667691e.jpg`,
  'N°12 Easton': `${CDN}/grounded_5667691e.jpg`,
  '25A Old Market': `${CDN}/emmeline_9815c859.jpg`,
  'FED 313': `${CDN}/hotplate_53bdc94e.jpg`,
  'The Cloakroom Cafe': `${CDN}/cloakroom-cafe_c1b32e6c.jpg`,
  'Cloakroom Cafe': `${CDN}/cloakroom-cafe_c1b32e6c.jpg`,
  'Workhouse Cafe': `${CDN}/illustrate_89c325b0.jpg`,
  'Poco': `${CDN}/bocabar_96e308f9.jpg`,
  'East Village Cafe': `${CDN}/grounded_5667691e.jpg`,
  'Bakesmiths': `${CDN}/bakesmiths_3f2a1651.jpg`,
  'Flour House': `${CDN}/harts-bakery_85ca6177.jpg`,
  'Coffee + Beer': `${CDN}/kongs_b5f768cf.jpg`,
  'Monty Carlos': `${CDN}/tincan-coffee_e8841bb4.jpg`,
  'The Red Church': `${CDN}/red-church_dbd31bca.jpg`,
  'Red Church': `${CDN}/red-church_dbd31bca.jpg`,
  'Catley\'s': `${CDN}/full-court-press_89c0263d.jpg`,
  'Peggy\'s Bristol': `${CDN}/mrs-potts_500f48d1.jpg`,
  '1B Pitville': `${CDN}/emmeline_9815c859.jpg`,
  'Lounge Southville': `${CDN}/primrose-cafe_5efa83b5.jpg`,
  'Ahh Toots': `${CDN}/ahh-toots_393f31e8.jpg`,
  'Ahh Toots Totterdown': `${CDN}/ahh-toots_393f31e8.jpg`,

  // ─── Libraries ───
  'Bristol Central Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Clifton Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Bedminster Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Bishopston Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Henleaze Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Redland Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Knowle Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Fishponds Library': `${CDN}/bristol-central-library_1f782e36.jpg`,

  // ─── Coworking Spaces ───
  'DeskLodge Old Market': `${CDN}/desklodge_fc8e6e68.jpg`,
  'DeskLodge': `${CDN}/desklodge_fc8e6e68.jpg`,
  'Engine Shed': `${CDN}/engine-shed_3ed2dd99.jpg`,
  'Hamilton House': `${CDN}/hamilton-house_1a0e4400.jpg`,
  'Origin Workspace': `${CDN}/desklodge-2_58119534.jpg`,
  'Runway East Bristol': `${CDN}/engine-shed_3ed2dd99.jpg`,
  'Spaces Glass Wharf': `${CDN}/desklodge_fc8e6e68.jpg`,
  'The Guild': `${CDN}/hamilton-house_1a0e4400.jpg`,
  'Raw Space': `${CDN}/desklodge-2_58119534.jpg`,
  'Redbrick House': `${CDN}/engine-shed_3ed2dd99.jpg`,
  'Broad Quay House': `${CDN}/desklodge_fc8e6e68.jpg`,

  // ─── Hotel Lounges ───
  'Hotel du Vin Bristol': `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
  'Bristol Harbour Hotel': `${CDN}/harbour-hotel_fe37ecf9.jpg`,
  'Harbour Hotel': `${CDN}/harbour-hotel_fe37ecf9.jpg`,
  'The Bristol Hotel': `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
  'Mercure Bristol Grand Hotel': `${CDN}/arnos-manor_208f0de8.jpg`,
  'Hilton Garden Inn Bristol': `${CDN}/harbour-hotel_fe37ecf9.jpg`,
  'Arnos Manor Hotel Lounge': `${CDN}/arnos-manor_208f0de8.jpg`,
  'Arnos Manor': `${CDN}/arnos-manor_208f0de8.jpg`,

  // ─── Nature/Greenery ───
  'Brandon Hill & Cabot Tower': `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
  'Castle Park': `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
  'The Downs': `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
  'St Andrew\'s Churchyard': `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
  'Greville Smyth Park': `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,

  // ─── Hidden Gems ───
  'Kongs of King Street': `${CDN}/kongs_b5f768cf.jpg`,
  'Spike Island Cafe': `${CDN}/spike-island_1431a1bd.jpg`,
  'Spike Island': `${CDN}/spike-island_1431a1bd.jpg`,
  'The Grain Barge': `${CDN}/grain-barge_6c35c004.jpg`,
  'Grain Barge': `${CDN}/grain-barge_6c35c004.jpg`,
  'Wardrobe Theatre Cafe': `${CDN}/wardrobe-theatre_1f1fdef6.jpg`,
  'Wardrobe Theatre': `${CDN}/wardrobe-theatre_1f1fdef6.jpg`,
  'Storysmith': `${CDN}/storysmith_bbf15e69.jpg`,
  'Storysmith Books': `${CDN}/storysmith_bbf15e69.jpg`,
  'Emmeline': `${CDN}/emmeline_9815c859.jpg`,
  'Tradewind Espresso': `${CDN}/tincan-coffee_e8841bb4.jpg`,
  'Redpoint Climbing Centre Cafe': `${CDN}/redpoint_44bdb0ed.jpg`,
  'Redpoint Climbing': `${CDN}/redpoint_44bdb0ed.jpg`,
  'Tincan Coffee': `${CDN}/tincan-coffee_e8841bb4.jpg`,
  'Small Street Espresso': `${CDN}/small-street-espresso_d5cf41e1.jpg`,
  'Hart\'s Bakery': `${CDN}/harts-bakery_85ca6177.jpg`,
  'Harts Bakery': `${CDN}/harts-bakery_85ca6177.jpg`,

  // ─── Late-Night / Misc ───
  'Bristolian Cafe': `${CDN}/bocabar_96e308f9.jpg`,
  'Bristolian Cafe & Bar': `${CDN}/spoke-stringer_320b068c.jpg`,
  'Wapping Wharf Container Yard': `${CDN}/wapping-wharf_57a4cb1f.jpg`,
  'Wapping Wharf': `${CDN}/wapping-wharf_57a4cb1f.jpg`,
  'Alchemy 198': `${CDN}/little-victories_e226a06e.jpg`,
  'Cafe Grounded': `${CDN}/grounded_5667691e.jpg`,
  'M Shed Cafe': `${CDN}/m-shed_0cf4341c.jpg`,
  'M Shed': `${CDN}/m-shed_0cf4341c.jpg`,
  'Bristol Museum & Art Gallery Cafe': `${CDN}/arnolfini-2_7d5fcf25.jpg`,
  'We The Curious Cafe': `${CDN}/watershed-2_d4abdbd2.jpg`,
};

// ── Bristol-specific category image pools (fallback for any unmatched venues) ──
const BRISTOL_CATEGORY_IMAGES: Record<string, string[]> = {
  'Quiet Study Cafe': [
    `${CDN}/society-cafe_5b75364d.jpg`,
    `${CDN}/full-court-press_89c0263d.jpg`,
    `${CDN}/boston-tea-party_d76a7570.jpg`,
    `${CDN}/cloakroom-cafe_c1b32e6c.jpg`,
    `${CDN}/spicer-cole_fd96aab2.jpg`,
    `${CDN}/folk-house-cafe_e11869ea.jpg`,
    `${CDN}/hotplate_53bdc94e.jpg`,
    `${CDN}/hatter-house_abcce641.jpg`,
    `${CDN}/coffee1_5b34360d.jpg`,
    `${CDN}/mrs-potts_500f48d1.jpg`,
    `${CDN}/illustrate_89c325b0.jpg`,
    `${CDN}/waylands-yard_a5de43f8.jpg`,
    `${CDN}/grounded_5667691e.jpg`,
    `${CDN}/primrose-cafe_5efa83b5.jpg`,
  ],
  'Aesthetic Cafe': [
    `${CDN}/society-cafe-2_8794bd62.jpg`,
    `${CDN}/red-church_dbd31bca.jpg`,
    `${CDN}/pinkmans_610f190b.jpg`,
    `${CDN}/playground-coffee_7c00ae05.jpg`,
    `${CDN}/little-victories_e226a06e.jpg`,
    `${CDN}/emmeline_9815c859.jpg`,
    `${CDN}/old-bookshop_e3b1ec67.jpg`,
  ],
  'Library': [
    `${CDN}/bristol-central-library_1f782e36.jpg`,
  ],
  'Creative Workspace': [
    `${CDN}/hamilton-house_1a0e4400.jpg`,
    `${CDN}/spike-island_1431a1bd.jpg`,
    `${CDN}/tobacco-factory_29346d64.jpg`,
    `${CDN}/bocabar_96e308f9.jpg`,
  ],
  'Coworking Space': [
    `${CDN}/desklodge_fc8e6e68.jpg`,
    `${CDN}/desklodge-2_58119534.jpg`,
    `${CDN}/engine-shed_3ed2dd99.jpg`,
  ],
  'Hotel Lounge': [
    `${CDN}/harbour-hotel_fe37ecf9.jpg`,
    `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
    `${CDN}/arnos-manor_208f0de8.jpg`,
  ],
  'Bookstore Cafe': [
    `${CDN}/storysmith_bbf15e69.jpg`,
    `${CDN}/old-bookshop_e3b1ec67.jpg`,
  ],
  'Museum/Gallery Cafe': [
    `${CDN}/arnolfini_1c370815.jpg`,
    `${CDN}/arnolfini-2_7d5fcf25.jpg`,
    `${CDN}/watershed_00de9b68.jpg`,
    `${CDN}/m-shed_0cf4341c.jpg`,
  ],
  'Nature/Greenery': [
    `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
    `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
  ],
  'Bakery/Patisserie': [
    `${CDN}/pinkmans_610f190b.jpg`,
    `${CDN}/mokoko_6eb325b3.jpg`,
    `${CDN}/harts-bakery_85ca6177.jpg`,
    `${CDN}/bakesmiths_3f2a1651.jpg`,
    `${CDN}/ahh-toots_393f31e8.jpg`,
  ],
  'Hidden Gem': [
    `${CDN}/kongs_b5f768cf.jpg`,
    `${CDN}/grain-barge_6c35c004.jpg`,
    `${CDN}/wardrobe-theatre_1f1fdef6.jpg`,
    `${CDN}/redpoint_44bdb0ed.jpg`,
    `${CDN}/tincan-coffee_e8841bb4.jpg`,
    `${CDN}/small-street-espresso_d5cf41e1.jpg`,
    `${CDN}/emmeline_9815c859.jpg`,
    `${CDN}/spoke-stringer_320b068c.jpg`,
  ],
  'Late-Night Cafe': [
    `${CDN}/red-church_dbd31bca.jpg`,
    `${CDN}/bocabar_96e308f9.jpg`,
    `${CDN}/kongs_b5f768cf.jpg`,
  ],
};

/** Category hero images for the "Explore by Type" section */
export const BRISTOL_CATEGORY_HERO: Record<string, string> = {
  'Quiet Study Cafe': `${CDN}/society-cafe_5b75364d.jpg`,
  'Aesthetic Cafe': `${CDN}/red-church_dbd31bca.jpg`,
  'Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Creative Workspace': `${CDN}/spike-island_1431a1bd.jpg`,
  'Coworking Space': `${CDN}/desklodge_fc8e6e68.jpg`,
  'Hotel Lounge': `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
  'Bookstore Cafe': `${CDN}/storysmith_bbf15e69.jpg`,
  'Museum/Gallery Cafe': `${CDN}/arnolfini_1c370815.jpg`,
  'Nature/Greenery': `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
  'Bakery/Patisserie': `${CDN}/pinkmans_610f190b.jpg`,
  'Hidden Gem': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Late-Night Cafe': `${CDN}/red-church-2_fd19635d.jpg`,
};

// ── Simple hash for deterministic image selection ──
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get an image for a Bristol location.
 * Priority: 1) Exact venue name match, 2) Category pool with deterministic hash
 * All images are real Bristol venue photos — no London overlap.
 */
export function getBristolLocationImage(name: string, category: string): string {
  // 1. Try exact venue name match (case-insensitive partial match)
  const nameLower = name.toLowerCase();
  for (const [key, url] of Object.entries(BRISTOL_VENUE_IMAGES)) {
    if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
      return url;
    }
  }

  // 2. Try category pool
  const images = BRISTOL_CATEGORY_IMAGES[category];
  if (images && images.length > 0) {
    const index = simpleHash(name) % images.length;
    return images[index]!;
  }

  // 3. Fallback to quiet study cafe pool (always Bristol images)
  const fallback = BRISTOL_CATEGORY_IMAGES['Quiet Study Cafe']!;
  const index = simpleHash(name) % fallback.length;
  return fallback[index]!;
}
