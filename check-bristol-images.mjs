// Quick test to check what images Bristol locations resolve to
import { readFileSync } from 'fs';

// Parse the bristolLocations data manually
const locContent = readFileSync('./client/src/lib/bristolLocations.ts', 'utf-8');
const nameMatches = [...locContent.matchAll(/"name": "([^"]+)"/g)].map(m => m[1]);
const catMatches = [...locContent.matchAll(/"category": "([^"]+)"/g)].map(m => m[1]);

// Parse the BRISTOL_VENUE_IMAGES keys
const imgContent = readFileSync('./client/src/lib/bristolImages.ts', 'utf-8');
const venueKeys = [...imgContent.matchAll(/'([^']+)':\s*`\$\{CDN\}/g)].map(m => m[1]);

console.log(`Total Bristol locations: ${nameMatches.length}`);
console.log(`Total venue image keys: ${venueKeys.length}`);
console.log('');

// Check which locations match a venue image key
let matched = 0;
let unmatched = [];
for (let i = 0; i < nameMatches.length; i++) {
  const name = nameMatches[i];
  const nameLower = name.toLowerCase();
  let found = false;
  for (const key of venueKeys) {
    if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
      found = true;
      break;
    }
  }
  if (found) {
    matched++;
  } else {
    unmatched.push({ name, category: catMatches[i] });
  }
}

console.log(`Matched to venue image: ${matched}`);
console.log(`Falling back to category pool: ${unmatched.length}`);
console.log('');
console.log('Locations using category pool fallback:');
unmatched.forEach(u => console.log(`  - "${u.name}" (${u.category})`));
