/**
 * Bristol Hero & Category Images — Real Bristol venue photos
 */

export const BRISTOL_HERO_IMAGES = {
  main: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-clifton-bridge_6c6f1c38.jpg',
  harbourside: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-society-cafe_8fa395ae.jpg',
  clifton: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-cafe-aesthetic_19a33611.jpg',
  stokescroft: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-stokes-croft_a50c3138.jpg',
  library: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-central-library_223f6f8c.jpg',
  coworking: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-coworking_14e1c912.png',
  garden: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-brandon-hill_31fd2884.jpg',
  university: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-library-interior_a469bbb4.jpg',
  hotel: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-hotel-lounge_e768c349.jpg',
  bakery: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-bakery_ee9b489d.jpg',
  museum: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-museum-cafe_45fa0400.jpg',
  bookshop: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-bookshop_27ed9240.jpg',
  creative: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-creative-space_b6eb0e09.jpg',
  workspace: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-workspace_909f6815.jpg',
  wapping: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-wapping-wharf_82f3d571.jpg',
  cafeInterior: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-cafe-interior_077449e5.jpg',
  cafeCozy: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-cafe-cozy_d5f8b7fa.jpg',
  studyCafe: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-study-cafe_6ac92cb5.jpg',
};

/** Category hero images for the "Explore by Type" section — covers all 12 Bristol categories */
export const BRISTOL_CATEGORY_HERO: Record<string, string> = {
  'Quiet Study Cafe': BRISTOL_HERO_IMAGES.studyCafe,
  'Library': BRISTOL_HERO_IMAGES.library,
  'Creative Workspace': BRISTOL_HERO_IMAGES.creative,
  'Coworking Space': BRISTOL_HERO_IMAGES.coworking,
  'Nature/Greenery': BRISTOL_HERO_IMAGES.garden,
  'Hotel Lounge': BRISTOL_HERO_IMAGES.hotel,
  'Aesthetic Cafe': BRISTOL_HERO_IMAGES.clifton,
  'Hidden Gem': BRISTOL_HERO_IMAGES.stokescroft,
  'Bakery/Patisserie': BRISTOL_HERO_IMAGES.bakery,
  'Museum/Gallery Cafe': BRISTOL_HERO_IMAGES.museum,
  'Late-Night Cafe': BRISTOL_HERO_IMAGES.workspace,
  'Bookstore Cafe': BRISTOL_HERO_IMAGES.bookshop,
};

/**
 * Get a Bristol-specific image for a location.
 * Uses a deterministic rotation based on location ID to provide variety.
 */
const BRISTOL_LOCATION_IMAGES = [
  BRISTOL_HERO_IMAGES.harbourside,
  BRISTOL_HERO_IMAGES.clifton,
  BRISTOL_HERO_IMAGES.studyCafe,
  BRISTOL_HERO_IMAGES.cafeInterior,
  BRISTOL_HERO_IMAGES.cafeCozy,
  BRISTOL_HERO_IMAGES.workspace,
  BRISTOL_HERO_IMAGES.wapping,
  BRISTOL_HERO_IMAGES.stokescroft,
];

export function getBristolLocationImage(locationId: number, category: string): string {
  // First try the category hero
  if (BRISTOL_CATEGORY_HERO[category]) {
    // Rotate within category to add variety
    const idx = locationId % BRISTOL_LOCATION_IMAGES.length;
    return BRISTOL_LOCATION_IMAGES[idx];
  }
  return BRISTOL_LOCATION_IMAGES[locationId % BRISTOL_LOCATION_IMAGES.length];
}
