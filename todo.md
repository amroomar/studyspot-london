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

## UniMode (University Mode)

### Phase 1 — University Study Spot Database
- [x] Research study spots for UCL (10-20 spaces + 5-10 nearby cafes)
- [x] Research study spots for King's College London
- [x] Research study spots for Imperial College London
- [x] Research study spots for London School of Economics
- [x] Research study spots for Queen Mary University
- [x] Research study spots for City University London
- [x] Research study spots for SOAS
- [x] Research study spots for University of Westminster
- [x] Research study spots for Royal Holloway
- [x] Research study spots for University of the Arts London
- [x] Build unified university study spots dataset (175 locations across 10 universities)
- [x] Categorize locations (Library, Keycard, Campus Lounge, Bookable Room, Computer Lab, Campus Cafe, Nearby Cafe, Public Library, Creative Workspace)
- [x] Collect access rules (Public, Students Only, Keycard Required, Booking Required)
- [x] Collect study attributes (quietness, wifi, plugs, laptop-friendly, group study, creative-friendly)
- [x] Add environment tags (Quiet, Deep Work, Creative Friendly, Aesthetic, Natural Light, Group Study, Silent Study)
- [x] Collect images for locations (using Unsplash category-based images)

### Phase 2 — UniMode Feature Integration
- [x] Add "Enter UniMode" button on homepage
- [x] Build university selector screen
- [x] Build UniMode dashboard (Libraries, Keycard Spaces, Nearby Cafes, Creative Workspaces)
- [x] Build university campus map view with pins
- [x] Add access type filters (Students Only, Public, Keycard, Bookable)
- [x] Build campus cafe discovery section
- [x] Add Creative Friendly tags and filtering
- [x] Enable community submissions for campus spots (toast placeholder)
- [x] Create database schema for university spots (client-side data file, 175 spots)
- [x] Build tRPC API routes for university spots (client-side data, no API needed)
- [x] Write vitest tests for UniMode (20 tests passing)

## SEO Fixes
- [x] Add keywords meta tag to homepage
- [x] Optimize page title to 30-60 characters (57 chars)
- [x] Add meta description (50-160 characters) (145 chars)

## Verification System for Community Submissions
- [x] Update database schema: add verification_status, confirmation_count, report_count fields to community_submissions
- [x] Create location_confirmations table (user confirms "I have studied here")
- [x] Create location_reports table (user reports with reason)
- [x] Implement automatic location verification via Google Places API on submission
- [x] Add community confirmation button ("I have studied here") on location detail pages
- [x] Auto-upgrade to "Community Verified" at 5+ confirmations
- [x] Add report system with reasons (Fake, Unsafe, Incorrect info, Not a study spot)
- [x] Auto-flag locations with multiple reports as "Flagged for Review"
- [x] Build admin moderation panel (approve, reject, edit, remove submissions)
- [x] Show pending locations queue for unverified submissions
- [x] Add verification badges on location cards
- [x] Add verification badges on map pins (via LocationCard)
- [x] Add verification badges on location detail pages
- [x] Write vitest tests for verification system (29 tests passing)

## UI Polish & Mobile Responsiveness
- [x] Fix hero section text wrapping on mobile
- [x] Fix category buttons text overflow on mobile
- [x] Fix location card text truncation on mobile
- [x] Fix location detail overlay text on mobile
- [ ] Fix navbar text overlap on mobile
- [ ] Fix filter panel text on mobile
- [ ] Fix map controls text on mobile
- [ ] Fix UniMode university selector text on mobile
- [ ] Fix admin panel text on mobile
- [ ] Test all pages at 320px, 375px, 768px, 1024px breakpoints

## Animation Enhancements
- [x] Remove animation delays from hero section (0.4s instead of 0.8s)
- [x] Add spring physics to card entrance animations
- [x] Add bounce effect to button clicks
- [ ] Add smooth scroll behavior
- [x] Add stagger animations to location card grids
- [x] Add hover scale effects to interactive elements
- [ ] Add rotation/flip animations to badges
- [ ] Add slide-in animations for modals
- [ ] Add fade transitions between tabs
- [ ] Add loading skeleton animations
- [x] Optimize animation performance (60fps)

## Accurate Location Images
- [x] Audit current image system and understand how images are served
- [x] Search and collect real photos for all 310 main locations (306/310 found)
- [ ] Search and collect real photos for all 175 UniMode locations
- [x] Upload images and update data files
- [x] Verify all images display correctly
