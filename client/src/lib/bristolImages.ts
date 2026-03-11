/**
 * Bristol Hero & Category Images
 */

export const BRISTOL_HERO_IMAGES = {
  main: 'https://images.unsplash.com/photo-1595928642910-e1e06e5364e3?w=1200&h=600&fit=crop',
  harbourside: 'https://images.unsplash.com/photo-1604867235657-5e9a0d3a3e0d?w=800&h=500&fit=crop',
  clifton: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop',
  stokescroft: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=500&fit=crop',
  library: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=500&fit=crop',
  coworking: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop',
  garden: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=500&fit=crop',
  university: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop',
};

export const BRISTOL_CATEGORY_HERO: Record<string, string> = {
  'Quiet Study Cafe': BRISTOL_HERO_IMAGES.stokescroft,
  'Library': BRISTOL_HERO_IMAGES.library,
  'Creative Workspace': BRISTOL_HERO_IMAGES.coworking,
  'Coworking Space': BRISTOL_HERO_IMAGES.coworking,
  'Nature/Greenery': BRISTOL_HERO_IMAGES.garden,
  'Hotel Lounge': BRISTOL_HERO_IMAGES.clifton,
  'Aesthetic Cafe': BRISTOL_HERO_IMAGES.harbourside,
  'Hidden Gem': BRISTOL_HERO_IMAGES.stokescroft,
};

export function getBristolLocationImage(locationId: number, category: string): string {
  return BRISTOL_CATEGORY_HERO[category] || BRISTOL_HERO_IMAGES.main;
}
