/**
 * Image utility for StudySpot London
 * Maps categories to curated, high-quality Unsplash photos
 * Uses a deterministic hash to ensure consistent images per location
 */

// Hero images (generated, high quality)
export const HERO_IMAGES = {
  main: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/hero-main-Yzt3hPe9yvmDGBqnvwHpXm.webp',
  library: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/hero-library-eaTQbUTN7CXZ7Gy5VB2cvY.webp',
  coworking: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/hero-coworking-EXh2xmeBM5UKhCMH2ceaPb.webp',
  garden: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/hero-garden-ecuimEHyQDQVNGooEhBYuY.webp',
  hotel: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/hero-hotel-WxD3JvusUXrayZQuV5ZZSW.webp',
};

// Curated Unsplash images by category (diverse, high quality)
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Quiet Study Cafe': [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
  ],
  'Aesthetic Cafe': [
    'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop',
  ],
  'Library': [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529007196863-d07650a3f0ea?w=600&h=400&fit=crop',
  ],
  'Creative Workspace': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop',
  ],
  'Coworking Space': [
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=600&h=400&fit=crop',
  ],
  'Hotel Lounge': [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
  ],
  'Bookstore': [
    'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop',
  ],
  'Museum/Gallery Cafe': [
    'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=600&h=400&fit=crop',
  ],
  'Nature/Greenery': [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=400&fit=crop',
  ],
  'Bakery/Patisserie': [
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=600&h=400&fit=crop',
  ],
  'Hidden Gem': [
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
  ],
  'Rooftop': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop',
  ],
  'Late-Night Cafe': [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop',
  ],
  'Luxury Cafe': [
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop',
  ],
};

// Simple hash function for deterministic image selection
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getLocationImage(name: string, category: string): string {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Quiet Study Cafe']!;
  const index = simpleHash(name) % images.length;
  return images[index]!;
}

// Category icon mapping
export const CATEGORY_ICONS: Record<string, string> = {
  'Quiet Study Cafe': '☕',
  'Aesthetic Cafe': '✨',
  'Library': '📚',
  'Creative Workspace': '🎨',
  'Coworking Space': '💻',
  'Hotel Lounge': '🏨',
  'Bookstore': '📖',
  'Bookstore Cafe': '📖',
  'Museum/Gallery Cafe': '🖼️',
  'Nature/Greenery': '🌿',
  'Bakery/Patisserie': '🥐',
  'Hidden Gem': '💎',
  'Rooftop': '🌇',
  'Late-Night Cafe': '🌙',
  'Luxury Cafe': '👑',
};
