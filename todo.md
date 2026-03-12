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

## Accurate Location Images (Round 2)
- [x] Re-apply real venue photos to 310 main locations from previous search (306/310)
- [x] Search and collect real photos for 175 UniMode university spots (156/175)
- [x] Update UniMode data file with real venue images
- [x] Verify all images display correctly — all 55 tests pass

## Image Fix — Replace ALL Placeholders
- [x] Diagnose why main location images show placeholders (LocationCard/Detail ignored image field)
- [x] Diagnose why UniMode images appear grey/broken (getUniSpotImage not receiving image param)
- [x] Fix main location image rendering — 295/310 have permanent real images (95%)
- [x] Fix UniMode image rendering — 149/175 have permanent real images (85%)
- [x] Replace all manuscdn temporary URLs with permanent URLs
- [x] Verify images display correctly — all 55 tests pass

## Bug Fixes & UI Improvements (Round 3)

### Bugs
- [x] Fix favorites: allow adding locations to custom lists
- [x] Fix social page: missing TikTok/Instagram thumbnails
- [x] Fix discover page: only showing 60 locations instead of 300+ (load-more pagination)
- [x] Fix search page: location thumbnail images not updated to real photos

### Admin Image Management
- [x] Add admin panel section for managing location images
- [x] Allow manual image URL editing for all 310 main locations
- [x] Allow manual image URL editing for all 175 UniMode locations
- [x] Save image changes to database/persistent storage (location_images table)

### Map Improvements
- [x] Show community-submitted locations on the map
- [x] Add filter toggle to show/hide community spots on map

### UI/UX Enhancements
- [x] Add dark mode toggle with proper theme switching
- [x] Improve button styles (more polished, consistent)
- [x] Add smoother and cooler animations throughout
- [x] Redesign discover/home page for a more sleek and professional look
- [x] Improve overall visual polish and consistency

### Admin Access
- [x] Add login prompt when accessing /admin for unauthenticated users

### Verified Badge
- [x] Add verified badge to community spots that admin verifies

### UI Fixes
- [x] Fix map/satellite button overlapping with study spots count text on map page
- [x] Move verified badge next to rating number on LocationCard

### Image Override Bug
- [x] Admin-set images from Image Manager do not override default location images in the app

### Theme Default
- [x] Make dark mode the default, light mode toggled on

### Reviews Bug
- [x] Reviews don't show up to everyone — migrated from localStorage to database-backed tRPC

### Reviews Enhancement
- [x] Add image upload support to reviews
- [x] Add sorting options (date, rating) to reviews
- [x] Allow reviewers to choose name or remain anonymous
- [x] Add review images to schema and storage

### Admin Portal Enhancement
- [x] Add reviews management section to admin portal (view, delete reviews)
- [x] Add community spot editing in admin portal (edit name, category, address, etc.)

### Dark Mode & Mobile Fixes
- [x] Fix icons not visible in dark mode
- [x] Fix mobile map button overlap

### Admin Notifications
- [x] Create admin_notifications database table
- [x] Build tRPC endpoints for notifications (list, markRead, markAllRead, count)
- [x] Trigger notification on new review submission
- [x] Add notification bell with badge count to admin panel
- [x] Add notifications tab with review details, mark-as-read, mark-all-read, and delete

## StudySpot Bristol — New City Section

### Research
- [x] Research Bristol study cafes, libraries, coworking spaces, hidden gems (100+ spots)
- [x] Research Bristol universities and their campus study spots for UniMode

### Data Files
- [x] Build Bristol locations data file with all study spots (100 locations)
- [x] Build Bristol university study spots data file for UniMode (20 spots: UoB 12, UWE 8)
- [x] Collect real images for Bristol locations
- [x] Build Bristol social videos data file (12 videos)

### Architecture
- [x] Create city selector / routing architecture (London vs Bristol)
- [x] Create Bristol-specific color scheme (harbour-teal/cyan distinct from London fog-sage/gold)
- [x] Create CityContext for city state management

### Bristol Pages & Features
- [x] Bristol Home/Discover page with Bristol color scheme
- [x] Bristol Search page (shared component with Bristol data)
- [x] Bristol Map page (centered on Bristol: 51.4545, -2.5879)
- [x] Bristol Social page with Bristol-specific videos (12 videos)
- [x] Bristol Favorites & Badges (shared components)
- [x] Bristol UniMode with UoB and UWE (20 campus spots)
- [x] Bristol community submissions support (shared SubmitSpotPage)
- [x] Wire Bristol into admin panel and shared features

### Integration
- [x] City selector on landing page (/cities)
- [x] Navbar city switcher (ArrowLeftRight icon)
- [x] Tests for Bristol features (25 tests passing)

## Bristol Full Parity Fixes

### Images
- [x] Replace AI placeholder images in Bristol with real venue photos (19 CDN images uploaded)
- [x] Fix explore-by-type thumbnails loading in Bristol (all 12 categories have real CDN images)
- [x] Add proper hero/discovery section image for Bristol (Clifton Bridge hero)
- [x] Add real thumbnails to Bristol social section (12 real Bristol venue thumbnails)

### Community Features
- [x] Separate community discoveries between Bristol and London (added city column to DB schema)
- [x] Ensure Bristol community submissions work end-to-end (SubmitSpotPage city-aware with Bristol neighborhoods)

### Reviews
- [x] Ensure reviews work the same way in Bristol as in London (reviews already scoped by locationType+locationId, no conflicts)

### UniMode
- [x] Improve buttons in Bristol UniMode (consistent shadcn Button components)
- [x] Improve buttons in London UniMode (already using polished Button components)

### Mobile & UX
- [x] Optimize mobile experience for seamless city switching (mobile top bar with city switcher, UniMode link, dark mode toggle)
- [x] Ensure all features work seamlessly front and backend in both cities (namespaced favorites, city-filtered submissions, all 113 tests pass)

### Additional Fixes
- [x] Namespace favorites by city in localStorage (London and Bristol have separate favorite lists)
- [x] Add city column to community_submissions database schema and push migration
- [x] Update SubmissionsContext to filter by city
- [x] Update API endpoints to accept city parameter for submissions

## Bristol Fixes Round 2

### Images
- [x] Fix Bristol thumbnail not showing on /cities page (using real Clifton Bridge CDN image)
- [x] Deep search for real Bristol venue photos (40 real images uploaded to CDN)
- [x] Update Bristol location data with real venue-specific images (venue name matching + category pools)
- [x] Ensure no London images appear on Bristol locations (separate getBristolLocationImage resolver)

### Admin Panel
- [x] Add Bristol admin section with all London admin features (city filter on submissions, image manager)
- [x] Bristol admin: reviews management (shared Reviews tab works for both cities)
- [x] Bristol admin: community submissions management (city filter: All/London/Bristol, city badges)
- [x] Bristol admin: image manager for Bristol locations (605 total locations, city filter dropdown)
- [x] Bristol admin: notifications for Bristol submissions/reviews (shared Notifications tab)

### Landing Page
- [x] Make city selector the default landing page (/) — London moved to /london

## Community Spots in Search/Near-Me & Bristol Filter Fixes

### Search
- [x] Community added spots show up in search results for London (allLocationsWithCommunity passed to SearchPage)
- [x] Community added spots show up in search results for Bristol (allLocationsWithCommunity passed to SearchPage)

### Near Me / Map
- [x] Community spots show up when clicking "show spots near me" for London (mapLocations already included community spots)
- [x] Community spots show up when clicking "show spots near me" for Bristol (mapLocations already included community spots)

### Bristol Filters
- [x] Fix Harbourside filter showing 0 results (removed non-existent category from BRISTOL_CATEGORY_HERO)
- [x] Fix Rooftop filter showing 0 results (removed non-existent category from BRISTOL_CATEGORY_HERO)
- [x] Audit all Bristol filter categories for 0-result issues (removed Community Hub, Luxury Cafe too; FilterPanel now accepts optional categories prop)
- [x] Made FilterPanel accept optional categories prop so Bristol shows only its 12 real categories

## Bristol Images Deep Fix (Round 3)

- [x] Uploaded 35 additional real Bristol venue photos to CDN (total 75+ Bristol images)
- [x] Expanded venue image map from 30 to 150+ entries covering 99/100 Bristol locations
- [x] Every Bristol location now resolves to a real Bristol venue photo (0 London image leaks)
- [x] Category pools expanded with more diverse Bristol-specific images
- [x] All 113 tests pass

## Image Display Fixes (Round 4)

### Admin Image Overrides
- [ ] Scope admin image overrides by city so London overrides don't appear on Bristol locations
- [ ] Bristol locations should show gradient placeholder when no real image exists

### Broken Images
- [ ] Fix London locations showing broken image URLs as text in top corner
- [ ] Add gradient placeholder fallback for any location with no valid image

### Gradient Placeholder
- [ ] Create a clean gradient placeholder component for locations without images
- [ ] Apply gradient placeholder to both London and Bristol when image is missing/broken

## London Image Regression Fix (Round 5)
- [x] Fix London images reverting to stock placeholders — restore real images from location.image field and image resolver

## UI Consistency
- [x] Change London UniMode button to match Bristol UniMode button design

## PWA Support
- [x] Create web app manifest (manifest.json) with app name, icons, theme colors
- [x] Generate PWA app icons in multiple sizes
- [x] Create service worker for offline caching
- [x] Register service worker in the app
- [x] Add manifest link to index.html
- [x] Implement "Add to Home Screen" install prompt button
- [x] Test PWA installability
- [x] Make PWA install banner bigger and more prominent — full-width across bottom of screen

## Bug Fixes (Round 6)
- [x] Fix PWA install banner hidden behind bottom nav on map page
- [x] Fix map thumbnails showing placeholders instead of real images
- [x] Fix Bristol UniMode locations showing placeholder images — replaced all 20 with real CDN images
- [x] Add nearby locations section with geolocation on discovery page for both London and Bristol

## Marketing
- [x] Create printable marketing poster/infographic with QR code for StudySpot app

## Bristol Duplicate Images Fix
- [x] Identify all Bristol locations sharing duplicate images (69 out of 100 had duplicates)
- [x] Replace duplicates with unique real venue photos — now 98/100 unique (only Ahh Toots chain shares intentionally)
