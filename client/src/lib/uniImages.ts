/**
 * Image utility for UniMode study spots
 * Uses real venue photos when available, falls back to category-based Unsplash images
 */

const UNI_TYPE_IMAGES: Record<string, string[]> = {
  'University Library': [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529007196863-d07650a3f0ea?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=400&fit=crop',
  ],
  'Keycard Study Space': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
  ],
  'Campus Study Lounge': [
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=600&h=400&fit=crop',
  ],
  'Bookable Study Room': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&h=400&fit=crop',
  ],
  'Computer Lab': [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
  ],
  'Campus Cafe': [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
  ],
  'Nearby Study Cafe': [
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=600&h=400&fit=crop',
  ],
  'Public Library': [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=400&fit=crop',
  ],
  'Creative Workspace': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
  ],
};

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
 * Get the image for a UniMode study spot.
 * Uses the real venue image if available, otherwise falls back to a category-based generic image.
 */
export function getUniSpotImage(name: string, locationType: string, image?: string): string {
  // Use real venue image if available
  if (image) return image;
  // Fallback to category-based generic image
  const images = UNI_TYPE_IMAGES[locationType] || UNI_TYPE_IMAGES['Campus Study Lounge']!;
  const index = simpleHash(name) % images.length;
  return images[index]!;
}
