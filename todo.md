# StudySpot London — TODO

## Initial Build
- [x] Basic homepage layout with London Fog design
- [x] Navigation menu (Discover, Search, Social, Map, Saved, Badges)
- [x] Hero section with atmospheric imagery
- [x] Category browsing (Explore by Type)
- [x] Location cards with study scores
- [x] Location detail overlay with full info
- [x] Filter system (category, neighborhood, noise, price, Wi-Fi, plugs, score)
- [x] Full-text search with geolocation-based "near me" sorting
- [x] Interactive Google Maps view with 310 pins
- [x] Favorites with custom lists
- [x] Review system
- [x] Gamification badges
- [x] 310 real London study spots database

## Functional Audit Fixes
- [x] Fix filter propagation across all tabs including map
- [x] Fix redundant tags on location cards
- [x] Add "View on Google Maps" and "Get Directions" buttons
- [x] Improve map pin interactions with preview cards
- [x] Improve image system with larger category-specific pool
- [x] Data validation (all 310 locations verified)

## Social Discovery
- [x] Social Discovery tab with 82 real videos
- [x] Platform filtering (TikTok, Instagram, YouTube)
- [x] Video-to-location matching (26 matched)
- [x] Social videos section in location detail pages
- [x] Real thumbnail previews (70/82 videos)

## Community Features
- [x] Submit a Spot form (6-step multi-step)
- [x] Live Study Vibe badges and check-in system
- [x] Study Heatmap toggle on Map tab
- [x] Community Discoveries carousel

## Backend Migration
- [x] Upgrade to full-stack (database + server + user auth)
- [x] Create community_submissions database table
- [x] Build tRPC API routes (list, create, uploadImage, delete, listAll)
- [x] S3 image upload for community submissions
- [x] Update SubmissionsContext to use API instead of localStorage
- [x] Update SubmitSpotPage for S3 uploads
- [x] Fix CommunityDiscoveries type mapping
- [x] Write vitest tests for submissions router (5 tests passing)
- [x] Verify full end-to-end flow
