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
// These map directly to Bristol location names in bristolLocations.ts
export const BRISTOL_VENUE_IMAGES: Record<string, string> = {
  // Cafes
  'Society Cafe': `${CDN}/society-cafe_5b75364d.jpg`,
  'Society Café': `${CDN}/society-cafe_5b75364d.jpg`,
  'Society Cafe Harbourside': `${CDN}/society-cafe-2_8794bd62.jpg`,
  'Full Court Press': `${CDN}/full-court-press_8c2e5584.jpg`,
  'FCP Coffee': `${CDN}/full-court-press-2_72666405.jpg`,
  'Boston Tea Party Park Street': `${CDN}/boston-tea-party_d76a7570.jpg`,
  'Boston Tea Party': `${CDN}/boston-tea-party_d76a7570.jpg`,
  'Boston Tea Party Stokes Croft': `${CDN}/boston-tea-party_d76a7570.jpg`,
  'Boston Tea Party Clifton': `${CDN}/boston-tea-party_d76a7570.jpg`,
  'The Red Church': `${CDN}/red-church_dbd31bca.jpg`,
  'Red Church': `${CDN}/red-church_dbd31bca.jpg`,
  'Folk House Cafe': `${CDN}/folk-house-cafe_e11869ea.jpg`,
  'The Folk House': `${CDN}/folk-house-cafe_e11869ea.jpg`,
  'Folk House': `${CDN}/folk-house-cafe_e11869ea.jpg`,
  'Mokoko Coffee': `${CDN}/mokoko_5ffcebd0.jpg`,
  'Mokoko': `${CDN}/mokoko_5ffcebd0.jpg`,
  'Mokoko Coffee & Bakery': `${CDN}/mokoko_5ffcebd0.jpg`,
  'Cafe Kino': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Café Kino': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Spicer + Cole': `${CDN}/spicer-cole_5ae62df6.jpg`,
  'Spicer and Cole': `${CDN}/spicer-cole_5ae62df6.jpg`,
  'Spicer & Cole': `${CDN}/spicer-cole_5ae62df6.jpg`,
  'Pinkmans': `${CDN}/pinkmans_badad3a2.jpg`,
  "Pinkmans Bakery": `${CDN}/pinkmans_badad3a2.jpg`,
  'Playground Coffee House': `${CDN}/playground-coffee_f4b003a0.jpg`,
  'Playground Coffee': `${CDN}/playground-coffee_f4b003a0.jpg`,
  'The Cloakroom Cafe': `${CDN}/cloakroom-cafe_c1b32e6c.jpg`,
  'Cloakroom Cafe': `${CDN}/cloakroom-cafe_c1b32e6c.jpg`,
  'Friska': `${CDN}/friska_ad3e175a.jpg`,
  'Friska Harbourside': `${CDN}/friska_ad3e175a.jpg`,

  // Libraries
  'Bristol Central Library': `${CDN}/bristol-central-library_1f782e36.jpg`,

  // Arts / Gallery
  'Arnolfini': `${CDN}/arnolfini-cafe_008d3627.jpg`,
  'Arnolfini Cafe': `${CDN}/arnolfini-cafe_008d3627.jpg`,
  'Arnolfini Cafe Bar': `${CDN}/arnolfini-cafe_008d3627.jpg`,

  // Coworking
  'DeskLodge': `${CDN}/desklodge_fc8e6e68.jpg`,
  'DeskLodge Temple Meads': `${CDN}/desklodge-2_58119534.jpg`,
  'Engine Shed': `${CDN}/engine-shed_3ed2dd99.jpg`,
  'Hamilton House': `${CDN}/hamilton-house_1a0e4400.jpg`,

  // Hotel
  'Bristol Harbour Hotel': `${CDN}/harbour-hotel_fe37ecf9.jpg`,
  'Harbour Hotel': `${CDN}/harbour-hotel_fe37ecf9.jpg`,

  // Arts / Culture
  'Watershed': `${CDN}/watershed_deb8dac1.jpg`,
  'Watershed Cafe': `${CDN}/watershed_deb8dac1.jpg`,
  'Spike Island': `${CDN}/spike-island_1431a1bd.jpg`,
  'Spike Island Cafe': `${CDN}/spike-island_1431a1bd.jpg`,
  'Tobacco Factory': `${CDN}/tobacco-factory_29346d64.jpg`,
  'Tobacco Factory Cafe': `${CDN}/tobacco-factory_29346d64.jpg`,

  // Bookshops
  'Storysmith': `${CDN}/storysmith_bbf15e69.jpg`,
  'Storysmith Books': `${CDN}/storysmith_bbf15e69.jpg`,

  // Wapping Wharf
  'Wapping Wharf': `${CDN}/wapping-wharf_57a4cb1f.jpg`,
};

// ── Bristol-specific category image pools ──
const BRISTOL_CATEGORY_IMAGES: Record<string, string[]> = {
  'Quiet Study Cafe': [
    `${CDN}/society-cafe_5b75364d.jpg`,
    `${CDN}/full-court-press_8c2e5584.jpg`,
    `${CDN}/boston-tea-party_d76a7570.jpg`,
    `${CDN}/cloakroom-cafe_c1b32e6c.jpg`,
    `${CDN}/spicer-cole_5ae62df6.jpg`,
    `${CDN}/folk-house-cafe_e11869ea.jpg`,
    `${CDN}/bristol-cafe-generic_2600eec9.jpg`,
    `${CDN}/friska_ad3e175a.jpg`,
  ],
  'Aesthetic Cafe': [
    `${CDN}/society-cafe-2_8794bd62.jpg`,
    `${CDN}/red-church_dbd31bca.jpg`,
    `${CDN}/full-court-press-2_72666405.jpg`,
    `${CDN}/pinkmans_badad3a2.jpg`,
    `${CDN}/bristol-cafe-italian_0136aa87.jpg`,
    `${CDN}/playground-coffee_f4b003a0.jpg`,
  ],
  'Library': [
    `${CDN}/bristol-central-library_1f782e36.jpg`,
  ],
  'Creative Workspace': [
    `${CDN}/hamilton-house_1a0e4400.jpg`,
    `${CDN}/spike-island_1431a1bd.jpg`,
    `${CDN}/spike-island-2_f3ec4bda.jpg`,
    `${CDN}/tobacco-factory_29346d64.jpg`,
  ],
  'Coworking Space': [
    `${CDN}/desklodge_fc8e6e68.jpg`,
    `${CDN}/desklodge-2_58119534.jpg`,
    `${CDN}/engine-shed_3ed2dd99.jpg`,
  ],
  'Hotel Lounge': [
    `${CDN}/harbour-hotel_fe37ecf9.jpg`,
    `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
  ],
  'Bookstore': [
    `${CDN}/storysmith_bbf15e69.jpg`,
    `${CDN}/storysmith-2_331f3e52.jpg`,
  ],
  'Bookstore Cafe': [
    `${CDN}/storysmith_bbf15e69.jpg`,
    `${CDN}/storysmith-2_331f3e52.jpg`,
  ],
  'Museum/Gallery Cafe': [
    `${CDN}/arnolfini-cafe_008d3627.jpg`,
    `${CDN}/arnolfini-building_2c0410c1.jpg`,
    `${CDN}/watershed_deb8dac1.jpg`,
    `${CDN}/watershed-2_7645d0c5.jpg`,
  ],
  'Nature/Greenery': [
    `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
    `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
  ],
  'Bakery/Patisserie': [
    `${CDN}/pinkmans-2_adf747e6.jpg`,
    `${CDN}/pinkmans_badad3a2.jpg`,
    `${CDN}/mokoko_5ffcebd0.jpg`,
  ],
  'Hidden Gem': [
    `${CDN}/red-church-2_fd19635d.jpg`,
    `${CDN}/cafe-kino_3e14323e.jpg`,
    `${CDN}/playground-coffee_f4b003a0.jpg`,
    `${CDN}/folk-house-cafe_e11869ea.jpg`,
    `${CDN}/friska-2_8aa61d22.jpg`,
    `${CDN}/wapping-wharf_57a4cb1f.jpg`,
  ],
  'Late-Night Cafe': [
    `${CDN}/red-church_dbd31bca.jpg`,
    `${CDN}/bristol-cafe-italian_0136aa87.jpg`,
  ],
  'Rooftop': [
    `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
    `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
  ],
  'Luxury Cafe': [
    `${CDN}/harbour-hotel-lounge_99e4755d.jpg`,
    `${CDN}/red-church-2_fd19635d.jpg`,
  ],
  'Community Hub': [
    `${CDN}/hamilton-house_1a0e4400.jpg`,
    `${CDN}/tobacco-factory_29346d64.jpg`,
    `${CDN}/spike-island-2_f3ec4bda.jpg`,
  ],
  'Harbourside': [
    `${CDN}/watershed_deb8dac1.jpg`,
    `${CDN}/arnolfini-cafe_008d3627.jpg`,
    `${CDN}/wapping-wharf_57a4cb1f.jpg`,
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
  'Museum/Gallery Cafe': `${CDN}/arnolfini-cafe_008d3627.jpg`,
  'Nature/Greenery': `${CDN}/bristol-colourful-houses_3e1bfa1d.jpg`,
  'Bakery/Patisserie': `${CDN}/pinkmans_badad3a2.jpg`,
  'Hidden Gem': `${CDN}/cafe-kino_3e14323e.jpg`,
  'Community Hub': `${CDN}/hamilton-house_1a0e4400.jpg`,
  'Harbourside': `${CDN}/watershed_deb8dac1.jpg`,
  'Late-Night Cafe': `${CDN}/red-church-2_fd19635d.jpg`,
  'Rooftop': `${CDN}/clifton-bridge-sunset_091e9d31.jpg`,
  'Luxury Cafe': `${CDN}/harbour-hotel_fe37ecf9.jpg`,
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
