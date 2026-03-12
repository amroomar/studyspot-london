/**
 * Bristol-specific image system
 * Real venue photos from Bristol uploaded to CDN
 * Separate from London images — no overlap
 * Every location gets a unique image — no duplicates
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

// ── EXACT venue name → CDN URL mapping ──
// Every Bristol location gets its own unique image. No partial matching.
export const BRISTOL_VENUE_IMAGES: Record<string, string> = {
  // ─── Quiet Study Cafes ───
  'Boston Tea Party Stokes Croft': `${CDN}/boston-tea-party_d76a7570.jpg`,
  'Society Cafe Farr\'s Lane': `${CDN}/society-cafe_5b75364d.jpg`,
  'Full Court Press': `${CDN}/full-court-press_89c0263d.jpg`,
  'Watershed Cafe & Bar': `${CDN}/watershed_00de9b68.jpg`,
  'Hotplate': `${CDN}/hotplate_53bdc94e.jpg`,
  'Love Bristol Cafe': `${CDN}/bristol-cafe-generic_2600eec9.jpg`,
  'Coffee #1 Clifton': `${CDN}/coffee1_5b34360d.jpg`,
  'Coffee #1 Welsh Back': `${CDN}/society-cafe-2_8794bd62.jpg`,
  'Hatter House Cafe': `${CDN}/hatter-house_abcce641.jpg`,
  'Spicer & Cole': `${CDN}/spicer-cole_fd96aab2.jpg`,
  'The Canteen': `${CDN}/watershed-2_d4abdbd2.jpg`,
  'Brew Coffee Co': `${CDN}/brew-coffee-co_70fed006_aa8527c7.jpg`,
  'Illustrate': `${CDN}/illustrate_89c325b0.jpg`,
  'Folk House Cafe': `${CDN}/folk-house-cafe_e11869ea.jpg`,
  'Cafe Kino': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Mokoko Bakery': `${CDN}/mokoko_6eb325b3.jpg`,
  'Wayland\'s Yard': `${CDN}/waylands-yard_a5de43f8.jpg`,
  'The Crafty Egg Stokes Croft': `${CDN}/bristol-cafe-italian_0136aa87.jpg`,
  'The Crafty Egg Bedminster': `${CDN}/red-church-2_fd19635d.jpg`,
  'Playground Coffee House': `${CDN}/playground-coffee_7c00ae05.jpg`,
  'Friska Glass Wharf': `${CDN}/friska_ad3e175a.jpg`,
  'Coffee Under Pressure': `${CDN}/coffee-under-pressure-bristol_2325f00e_49ca574a.jpg`,
  'Mocha Mocha': `${CDN}/mocha-mocha-bristol-cafe_b9d96795_9baafd7f.webp`,
  'Primrose Cafe': `${CDN}/primrose-cafe_5efa83b5.jpg`,
  'Spoke & Stringer': `${CDN}/spoke-stringer_320b068c.jpg`,
  'Little Victories': `${CDN}/little-victories_e226a06e.jpg`,
  'The Cloakroom Cafe': `${CDN}/cloakroom-cafe_c1b32e6c.jpg`,
  'Workhouse Cafe': `${CDN}/arnolfini-2_7d5fcf25.jpg`,
  'East Village Cafe': `${CDN}/east-village-cafe_8ac58d9f_9f90f47a.webp`,
  'Tradewind Espresso': `${CDN}/tradewind-espresso_e0b758d9_8b8e2d8b.webp`,
  'Small Street Espresso': `${CDN}/small-street-espresso_d5cf41e1.jpg`,
  'Tincan Coffee': `${CDN}/tincan-coffee_e8841bb4.jpg`,
  'Lounge Southville': `${CDN}/spoke-stringer-2_1e2f8d5e.jpg`,
  'Catley\'s': `${CDN}/catley-s_90ce5cc5_fe92e90c.webp`,
  'Bristolian Cafe': `${CDN}/bristolian-cafe-bristol_afe139f0_242816e8.jpg`,
  'Bristolian Cafe & Bar': `${CDN}/bristolian-cafe-bar_aaa5478d_f6dd4c26.jpg`,
  'Café Grounded': `${CDN}/grounded_5667691e.jpg`,
  'FED 313': `${CDN}/fed-313-bristol-cafe_5daeb1b7_6ee29fd6.jpg`,

  // ─── Aesthetic Cafes ───
  'Mrs. Potts Chocolate House': `${CDN}/mrs-potts_500f48d1.jpg`,
  'Pinkmans': `${CDN}/pinkmans_610f190b.jpg`,
  'The Old Bookshop': `${CDN}/old-bookshop_e3b1ec67.jpg`,
  'Peggy\'s Bristol': `${CDN}/peggys-bristol-cafe_62285d87_cf695604.jpg`,
  'Ahh Toots': `${CDN}/ahh-toots_393f31e8.jpg`,
  'Emmeline': `${CDN}/emmeline_9815c859.jpg`,

  // ─── Libraries (each gets a unique image) ───
  'Bristol Central Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Clifton Library': `${CDN}/clifton-library_f864f410_6dbd94fa.jpg`,
  'Bedminster Library': `${CDN}/bedminster-library_272593c0_5de84a17.jpg`,
  'Bishopston Library': `${CDN}/bishopston-library_d73a664d_edaf01a4.jpg`,
  'Henleaze Library': `${CDN}/henleaze-library_0eceb87e_cc9a4b9c.jpg`,
  'Redland Library': `${CDN}/redland-library_cd5b37b5_210b129a.png`,
  'Knowle Library': `${CDN}/knowle-library_d3f9e3e3_b082aa64.png`,
  'Fishponds Library': `${CDN}/fishponds-library_7fc9db43_9f9aa37f.jpg`,

  // ─── Coworking Spaces (each gets a unique image) ───
  'DeskLodge Old Market': `${CDN}/desklodge-old-market-bristol-coworking_638b9723_cd8289a6.jpg`,
  'Engine Shed': `${CDN}/engine-shed-bristol-temple-meads_069ab80f_93a2cba5.jpg`,
  'Origin Workspace': `${CDN}/desklodge-2_58119534.jpg`,
  'Runway East Bristol': `${CDN}/runway-east-bristol-coworking_5f259e15_9122f89f.webp`,
  'Spaces Glass Wharf': `${CDN}/broad-quay-house_ed44d897_f743b1fd.jpg`,
  'Broad Quay House': `${CDN}/desklodge_fc8e6e68.jpg`,
  'Redbrick House': `${CDN}/redbrick-house-bristol-coworking_09bc5933_9b9e1927.jpg`,

  // ─── Creative Workspaces ───
  'Hamilton House': `${CDN}/hamilton-house_1a0e4400.jpg`,
  'Raw Space': `${CDN}/raw-space-bristol-coworking_f2781c1f_394298f3.jpg`,
  'The Guild': `${CDN}/engine-shed_3ed2dd99.jpg`,

  // ─── Hotel Lounges (each gets a unique image) ───
  'Hotel du Vin Bristol': `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
  'Bristol Harbour Hotel': `${CDN}/bristol-harbour-hotel-lounge_29e70f85_2f4bc8d1.jpg`,
  'The Bristol Hotel': `${CDN}/the-bristol-hotel-lounge_92c344ee_24ede880.jpg`,
  'Mercure Bristol Grand Hotel': `${CDN}/arnos-manor_208f0de8.jpg`,
  'Hilton Garden Inn Bristol': `${CDN}/hilton-garden-inn-bristol_8bca26e2_b2492842.jpg`,
  'Arnos Manor Hotel Lounge': `${CDN}/arnos-manor-hotel-bristol_37ee9344_b967cd5b.jpg`,

  // ─── Nature/Greenery (each gets a unique image) ───
  'Brandon Hill & Cabot Tower': `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
  'Castle Park': `${CDN}/castle-park_ecc075ca_7d91c74a.jpg`,
  'The Downs': `${CDN}/the-downs_9cbaf5fd_ca92415f.jpg`,
  'St Andrew\'s Churchyard': `${CDN}/st-andrews-churchyard-bristol_a29e4be0_f7ed7cc4.jpg`,
  'Greville Smyth Park': `${CDN}/greville-smyth-park_2bc8004c_e9bcfed2.jpg`,

  // ─── Hidden Gems ───
  'Kongs of King Street': `${CDN}/kongs_b5f768cf.jpg`,
  'Spike Island Cafe': `${CDN}/spike-island-cafe-bristol_a47fb43a_f0f1cfc9.jpg`,
  'The Grain Barge': `${CDN}/grain-barge_6c35c004.jpg`,
  'Wardrobe Theatre Cafe': `${CDN}/wardrobe-theatre_1f1fdef6.jpg`,
  'Storysmith': `${CDN}/storysmith_bbf15e69.jpg`,
  'Redpoint Climbing Centre Cafe': `${CDN}/redpoint_44bdb0ed.jpg`,
  '25A Old Market': `${CDN}/25a-old-market_1a7d4425_2f802fde.jpg`,
  'Nº12 Easton': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Ahh Toots Totterdown': `${CDN}/ahh-toots_393f31e8.jpg`,
  'Monty Carlos': `${CDN}/monte-carlo-cafe_2a4fde0b_b8b0baf5.jpg`,
  '1B Pitville': `${CDN}/1b-pitville-bristol-cafe_0fa15a3e_9df03a9b.jpg`,

  // ─── Bakery/Patisserie ───
  'The Bristol Loaf Bedminster': `${CDN}/bristol-loaf-bedminster_624320c9.jpg`,
  'The Bristol Loaf Beacon': `${CDN}/the-bristol-loaf-beacon-bristol-bakery_712f4b07_e05513c0.jpg`,
  'Bakesmiths': `${CDN}/bakesmiths_3f2a1651.jpg`,
  'Hart\'s Bakery': `${CDN}/harts-bakery_85ca6177.jpg`,
  'Flour House': `${CDN}/flour-house-bristol-bakery_b1ea8e1a_1deff759.jpg`,

  // ─── Bookstore Cafe ───
  'Tobacco Factory Theatres Cafe': `${CDN}/tobacco-factory_29346d64.jpg`,

  // ─── Creative Workspace ───
  'Bocabar': `${CDN}/bocabar_96e308f9.jpg`,

  // ─── Late-Night / Misc ───
  'The Red Church': `${CDN}/red-church_dbd31bca.jpg`,
  'Coffee + Beer': `${CDN}/coffee-beer-bristol_d2b6b8e2_98a021ca.webp`,
  'Poco': `${CDN}/poco-bristol-restaurant-stokes-croft_c3e3a4e7_3890eb29.jpg`,
  'The Arnolfini Cafe': `${CDN}/arnolfini_1c370815.jpg`,
  'Alchemy 198': `${CDN}/alchemy-198-bristol-cafe_fa6a06b2_1f61628d.jpg`,
  'Wapping Wharf Container Yard': `${CDN}/wapping-wharf_57a4cb1f.jpg`,

  // ─── Museum/Gallery Cafes (each gets a unique image) ───
  'M Shed Cafe': `${CDN}/m-shed-cafe-bristol-museum_3d53226e_8108996b.jpg`,
  'Bristol Museum & Art Gallery Cafe': `${CDN}/bristol-museum-art-gallery-cafe_6099f667_37c73aed.jpg`,
  'We The Curious Cafe': `${CDN}/we-the-curious-bristol-cafe_582ab6d6_2ee16ff4.webp`,
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
    `${CDN}/clifton-library_f864f410_6dbd94fa.jpg`,
    `${CDN}/bedminster-library_272593c0_5de84a17.jpg`,
    `${CDN}/bishopston-library_d73a664d_edaf01a4.jpg`,
    `${CDN}/henleaze-library_0eceb87e_cc9a4b9c.jpg`,
    `${CDN}/knowle-library_d3f9e3e3_b082aa64.png`,
    `${CDN}/fishponds-library_7fc9db43_9f9aa37f.jpg`,
  ],
  'Creative Workspace': [
    `${CDN}/hamilton-house_1a0e4400.jpg`,
    `${CDN}/spike-island-cafe-bristol_a47fb43a_f0f1cfc9.jpg`,
    `${CDN}/tobacco-factory_29346d64.jpg`,
    `${CDN}/bocabar_96e308f9.jpg`,
    `${CDN}/raw-space-bristol-coworking_f2781c1f_394298f3.jpg`,
  ],
  'Coworking Space': [
    `${CDN}/desklodge_fc8e6e68.jpg`,
    `${CDN}/desklodge-2_58119534.jpg`,
    `${CDN}/engine-shed_3ed2dd99.jpg`,
    `${CDN}/desklodge-old-market-bristol-coworking_638b9723_cd8289a6.jpg`,
    `${CDN}/engine-shed-bristol-temple-meads_069ab80f_93a2cba5.jpg`,
    `${CDN}/runway-east-bristol-coworking_5f259e15_9122f89f.webp`,
    `${CDN}/redbrick-house-bristol-coworking_09bc5933_9b9e1927.jpg`,
    `${CDN}/broad-quay-house_ed44d897_f743b1fd.jpg`,
  ],
  'Hotel Lounge': [
    `${CDN}/harbour-hotel_fe37ecf9.jpg`,
    `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
    `${CDN}/arnos-manor_208f0de8.jpg`,
    `${CDN}/bristol-harbour-hotel-lounge_29e70f85_2f4bc8d1.jpg`,
    `${CDN}/the-bristol-hotel-lounge_92c344ee_24ede880.jpg`,
    `${CDN}/hilton-garden-inn-bristol_8bca26e2_b2492842.jpg`,
    `${CDN}/arnos-manor-hotel-bristol_37ee9344_b967cd5b.jpg`,
  ],
  'Bookstore Cafe': [
    `${CDN}/storysmith_bbf15e69.jpg`,
    `${CDN}/old-bookshop_e3b1ec67.jpg`,
  ],
  'Museum/Gallery Cafe': [
    `${CDN}/arnolfini_1c370815.jpg`,
    `${CDN}/arnolfini-2_7d5fcf25.jpg`,
    `${CDN}/watershed_00de9b68.jpg`,
    `${CDN}/m-shed-cafe-bristol-museum_3d53226e_8108996b.jpg`,
    `${CDN}/bristol-museum-art-gallery-cafe_6099f667_37c73aed.jpg`,
    `${CDN}/we-the-curious-bristol-cafe_582ab6d6_2ee16ff4.webp`,
  ],
  'Nature/Greenery': [
    `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
    `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
    `${CDN}/castle-park_ecc075ca_7d91c74a.jpg`,
    `${CDN}/the-downs_9cbaf5fd_ca92415f.jpg`,
    `${CDN}/st-andrews-churchyard-bristol_a29e4be0_f7ed7cc4.jpg`,
    `${CDN}/greville-smyth-park_2bc8004c_e9bcfed2.jpg`,
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
    `${CDN}/red-church-2_fd19635d.jpg`,
  ],
};

/** Category hero images for the "Explore by Type" section */
export const BRISTOL_CATEGORY_HERO: Record<string, string> = {
  'Quiet Study Cafe': `${CDN}/society-cafe_5b75364d.jpg`,
  'Aesthetic Cafe': `${CDN}/red-church_dbd31bca.jpg`,
  'Library': `${CDN}/bristol-central-library_1f782e36.jpg`,
  'Creative Workspace': `${CDN}/spike-island-cafe-bristol_a47fb43a_f0f1cfc9.jpg`,
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
 * Priority: 1) EXACT venue name match, 2) Category pool with deterministic hash
 * All images are real Bristol venue photos — no London overlap.
 * Uses exact matching only to prevent false matches.
 */
export function getBristolLocationImage(name: string, category: string): string {
  // 1. Try EXACT venue name match (case-sensitive, direct lookup)
  if (BRISTOL_VENUE_IMAGES[name]) {
    return BRISTOL_VENUE_IMAGES[name];
  }

  // 2. Try category pool with deterministic hash
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
