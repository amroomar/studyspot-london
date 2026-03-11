/**
 * Bristol Social Videos — TikTok & Instagram content about Bristol study spots
 * Thumbnails use real Bristol venue photos from CDN
 */

export interface BristolSocialVideo {
  id: number;
  platform: 'tiktok' | 'instagram';
  url: string;
  thumbnail: string;
  title: string;
  creator: string;
  tags: string[];
  neighborhood: string;
  likes: number;
  views: number;
}

// Real Bristol venue images from CDN
const B = {
  societyCafe: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-society-cafe_8fa395ae.jpg',
  stokesCroft: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-stokes-croft_a50c3138.jpg',
  centralLibrary: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-central-library_223f6f8c.jpg',
  coworking: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-coworking_14e1c912.png',
  brandonHill: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-brandon-hill_31fd2884.jpg',
  libraryInterior: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-library-interior_a469bbb4.jpg',
  hotelLounge: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-hotel-lounge_e768c349.jpg',
  bakery: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-bakery_ee9b489d.jpg',
  bookshop: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-bookshop_27ed9240.jpg',
  creativeSpace: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-creative-space_b6eb0e09.jpg',
  wappingWharf: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-wapping-wharf_82f3d571.jpg',
  cafeCozy: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663360861914/iS6PF6sNRzFgoX75DyiZb8/bristol-cafe-cozy_d5f8b7fa.jpg',
};

export const bristolSocialVideos: BristolSocialVideo[] = [
  {
    id: 1,
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@bristoluni',
    thumbnail: B.societyCafe,
    title: 'Best cafes to study in Bristol ☕📚',
    creator: '@bristolstudent',
    tags: ['study', 'cafe', 'bristol'],
    neighborhood: 'Clifton',
    likes: 12400,
    views: 89000,
  },
  {
    id: 2,
    platform: 'instagram',
    url: 'https://www.instagram.com/visitbristol',
    thumbnail: B.stokesCroft,
    title: 'Hidden study spots in Stokes Croft 🎨',
    creator: '@bristolvibes',
    tags: ['hidden gem', 'stokes croft', 'study'],
    neighborhood: 'Stokes Croft',
    likes: 8700,
    views: 45000,
  },
  {
    id: 3,
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@bristoluni',
    thumbnail: B.libraryInterior,
    title: 'UoB library tour - where to study 📖',
    creator: '@uoblife',
    tags: ['university', 'library', 'tour'],
    neighborhood: 'Clifton',
    likes: 23100,
    views: 156000,
  },
  {
    id: 4,
    platform: 'instagram',
    url: 'https://www.instagram.com/visitbristol',
    thumbnail: B.coworking,
    title: 'Coworking spaces with harbour views 🌊',
    creator: '@bristolfreelancer',
    tags: ['coworking', 'harbourside', 'views'],
    neighborhood: 'Harbourside',
    likes: 5600,
    views: 32000,
  },
  {
    id: 5,
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@bristoluni',
    thumbnail: B.cafeCozy,
    title: 'Study with me at Boston Tea Party 🍵',
    creator: '@studywithme_bristol',
    tags: ['study with me', 'cafe', 'aesthetic'],
    neighborhood: 'Stokes Croft',
    likes: 18900,
    views: 112000,
  },
  {
    id: 6,
    platform: 'instagram',
    url: 'https://www.instagram.com/visitbristol',
    thumbnail: B.centralLibrary,
    title: 'Wills Memorial Building study vibes ✨',
    creator: '@bristolarchitecture',
    tags: ['architecture', 'historic', 'study'],
    neighborhood: 'Clifton',
    likes: 31200,
    views: 198000,
  },
  {
    id: 7,
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@bristoluni',
    thumbnail: B.brandonHill,
    title: 'Outdoor study spots in Bristol parks 🌿',
    creator: '@greenbrislol',
    tags: ['outdoor', 'parks', 'nature'],
    neighborhood: 'Redland',
    likes: 7800,
    views: 54000,
  },
  {
    id: 8,
    platform: 'instagram',
    url: 'https://www.instagram.com/visitbristol',
    thumbnail: B.creativeSpace,
    title: 'UWE Frenchay campus study guide 📝',
    creator: '@uwelife',
    tags: ['uwe', 'campus', 'guide'],
    neighborhood: 'Frenchay',
    likes: 9400,
    views: 67000,
  },
  {
    id: 9,
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@bristoluni',
    thumbnail: B.bakery,
    title: 'Bedminster cafe crawl for studying 🚶',
    creator: '@southbristol',
    tags: ['bedminster', 'cafe crawl', 'study'],
    neighborhood: 'Bedminster',
    likes: 4200,
    views: 28000,
  },
  {
    id: 10,
    platform: 'instagram',
    url: 'https://www.instagram.com/visitbristol',
    thumbnail: B.centralLibrary,
    title: 'Bristol Central Library - a hidden gem 💎',
    creator: '@bristollibraries',
    tags: ['library', 'central', 'free'],
    neighborhood: 'City Centre',
    likes: 15600,
    views: 98000,
  },
  {
    id: 11,
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@bristoluni',
    thumbnail: B.bookshop,
    title: 'Gloucester Road indie cafe study spots ☕',
    creator: '@gloucesterrd',
    tags: ['gloucester road', 'indie', 'cafe'],
    neighborhood: 'Bishopston',
    likes: 6300,
    views: 41000,
  },
  {
    id: 12,
    platform: 'instagram',
    url: 'https://www.instagram.com/visitbristol',
    thumbnail: B.wappingWharf,
    title: 'Late night study spots in Bristol 🌙',
    creator: '@bristolnightowl',
    tags: ['late night', '24/7', 'study'],
    neighborhood: 'City Centre',
    likes: 11800,
    views: 82000,
  },
];
