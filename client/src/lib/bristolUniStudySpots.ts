/**
 * Bristol University Study Spots Database
 * Total spots: 20
 */

export interface BristolUniversity {
  id: number;
  name: string;
  shortName: string;
  color: string;
  lat: number;
  lng: number;
  logo: string;
}

export interface BristolUniStudySpot {
  id: number;
  universityId: number;
  name: string;
  building: string;
  floor: string;
  category: string;
  lat: number;
  lng: number;
  noiseLevel: number;
  seatingComfort: string;
  lightingQuality: string;
  plugSockets: boolean;
  wifi: boolean;
  openingHours: string;
  capacity: number;
  studyScore: number;
  atmosphere: string;
  tags: string[];
  image: string;
}

export const bristolUniversities: BristolUniversity[] = [
  {
    "id": 1,
    "name": "University of Bristol",
    "shortName": "UoB",
    "color": "#B01C2E",
    "lat": 51.4584,
    "lng": -2.603,
    "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/University_of_Bristol_coat_of_arms.svg/200px-University_of_Bristol_coat_of_arms.svg.png"
  },
  {
    "id": 2,
    "name": "University of the West of England",
    "shortName": "UWE",
    "color": "#5B2C82",
    "lat": 51.5,
    "lng": -2.548,
    "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/UWE_Bristol_logo.svg/200px-UWE_Bristol_logo.svg.png"
  }
];

export const bristolUniStudySpots: BristolUniStudySpot[] = [
  {
    "id": 1,
    "universityId": 1,
    "name": "Arts and Social Sciences Library",
    "building": "Tyndall Avenue",
    "floor": "All floors",
    "category": "Library",
    "lat": 51.4581,
    "lng": -2.6038,
    "noiseLevel": 1,
    "seatingComfort": "good",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8:30am-12am, Sat-Sun 10am-8pm",
    "capacity": 450,
    "studyScore": 9.2,
    "atmosphere": "Grand Victorian library with high ceilings, dedicated silent study areas, and group study rooms. The main reading room is particularly impressive.",
    "tags": [
      "silent study",
      "group rooms",
      "printing",
      "historic"
    ],
    "image": "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=400&fit=crop"
  },
  {
    "id": 2,
    "universityId": 1,
    "name": "Wills Memorial Library",
    "building": "Wills Memorial Building",
    "floor": "Ground & 1st",
    "category": "Library",
    "lat": 51.4553,
    "lng": -2.604,
    "noiseLevel": 1,
    "seatingComfort": "excellent",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 9am-9pm, Sat 10am-5pm",
    "capacity": 200,
    "studyScore": 9.5,
    "atmosphere": "Stunning Gothic Revival building with ornate reading rooms. One of the most beautiful study spaces in the UK. The Great Hall is breathtaking.",
    "tags": [
      "iconic",
      "silent study",
      "historic",
      "beautiful"
    ],
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
  },
  {
    "id": 3,
    "universityId": 1,
    "name": "Queen's Building Study Space",
    "building": "Queen's Building",
    "floor": "Multiple",
    "category": "Study Room",
    "lat": 51.4558,
    "lng": -2.602,
    "noiseLevel": 2,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "24/7 during term",
    "capacity": 300,
    "studyScore": 8.4,
    "atmosphere": "Modern engineering building with open-plan study areas, breakout spaces, and computer clusters. Buzzy atmosphere with engineering students.",
    "tags": [
      "24/7",
      "computers",
      "engineering",
      "modern"
    ],
    "image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop"
  },
  {
    "id": 4,
    "universityId": 1,
    "name": "Beacon House",
    "building": "Beacon House",
    "floor": "All floors",
    "category": "Study Room",
    "lat": 51.459,
    "lng": -2.6025,
    "noiseLevel": 2,
    "seatingComfort": "good",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-10pm, Sat-Sun 10am-6pm",
    "capacity": 250,
    "studyScore": 8.6,
    "atmosphere": "Modern purpose-built study centre with a mix of individual desks, group tables, and bookable rooms. Light and airy with large windows.",
    "tags": [
      "modern",
      "bookable rooms",
      "group study",
      "quiet zones"
    ],
    "image": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop"
  },
  {
    "id": 5,
    "universityId": 1,
    "name": "Senate House Study Lounge",
    "building": "Senate House",
    "floor": "Ground",
    "category": "Lounge",
    "lat": 51.4575,
    "lng": -2.6035,
    "noiseLevel": 3,
    "seatingComfort": "excellent",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-8pm",
    "capacity": 80,
    "studyScore": 7.8,
    "atmosphere": "Relaxed lounge area in the main university building. Comfortable sofas and armchairs alongside study desks. Good for casual study sessions.",
    "tags": [
      "comfortable",
      "casual",
      "central",
      "sofas"
    ],
    "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop"
  },
  {
    "id": 6,
    "universityId": 1,
    "name": "Physics Library",
    "building": "HH Wills Physics Laboratory",
    "floor": "2nd Floor",
    "category": "Library",
    "lat": 51.4589,
    "lng": -2.6043,
    "noiseLevel": 1,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 9am-6pm",
    "capacity": 60,
    "studyScore": 8.8,
    "atmosphere": "Small, quiet departmental library. Very focused atmosphere, ideal for deep work. Limited seating means it's rarely overcrowded.",
    "tags": [
      "quiet",
      "focused",
      "small",
      "departmental"
    ],
    "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop"
  },
  {
    "id": 7,
    "universityId": 1,
    "name": "Merchant Venturers Building",
    "building": "Merchant Venturers Building",
    "floor": "Multiple",
    "category": "Study Room",
    "lat": 51.4555,
    "lng": -2.6005,
    "noiseLevel": 2,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-9pm",
    "capacity": 180,
    "studyScore": 8.0,
    "atmosphere": "Engineering and computing hub with modern study spaces, computer labs, and collaborative areas. Good mix of quiet and social zones.",
    "tags": [
      "computers",
      "engineering",
      "collaborative",
      "modern"
    ],
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop"
  },
  {
    "id": 8,
    "universityId": 1,
    "name": "Fry Building",
    "building": "Fry Building",
    "floor": "All floors",
    "category": "Study Room",
    "lat": 51.457,
    "lng": -2.605,
    "noiseLevel": 2,
    "seatingComfort": "excellent",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-10pm, Sat 10am-6pm",
    "capacity": 200,
    "studyScore": 9.0,
    "atmosphere": "Brand new maths building with state-of-the-art study spaces. Beautiful modern architecture with lots of natural light and flexible seating.",
    "tags": [
      "new",
      "modern",
      "natural light",
      "flexible"
    ],
    "image": "https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop"
  },
  {
    "id": 9,
    "universityId": 1,
    "name": "Priory Road Complex",
    "building": "Priory Road",
    "floor": "Ground & 1st",
    "category": "Study Room",
    "lat": 51.4598,
    "lng": -2.606,
    "noiseLevel": 2,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8:30am-8pm",
    "capacity": 120,
    "studyScore": 7.9,
    "atmosphere": "Social sciences hub with seminar rooms doubling as study spaces. Quieter than the main libraries, with a nice garden courtyard for breaks.",
    "tags": [
      "social sciences",
      "courtyard",
      "seminar rooms",
      "quiet"
    ],
    "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop"
  },
  {
    "id": 10,
    "universityId": 1,
    "name": "Richmond Building",
    "building": "Richmond Building",
    "floor": "Multiple",
    "category": "Student Union",
    "lat": 51.4577,
    "lng": -2.6015,
    "noiseLevel": 4,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-11pm, Sat-Sun 10am-8pm",
    "capacity": 400,
    "studyScore": 6.5,
    "atmosphere": "Student union building with cafes, study nooks, and social spaces. Lively atmosphere \u2014 better for group work and casual study than deep focus.",
    "tags": [
      "social",
      "cafe",
      "group work",
      "student union"
    ],
    "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop"
  },
  {
    "id": 11,
    "universityId": 1,
    "name": "Victoria Rooms",
    "building": "Victoria Rooms",
    "floor": "Ground",
    "category": "Lounge",
    "lat": 51.4568,
    "lng": -2.6085,
    "noiseLevel": 2,
    "seatingComfort": "excellent",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 9am-6pm",
    "capacity": 100,
    "studyScore": 8.3,
    "atmosphere": "Beautiful Grade II listed building with elegant study spaces. The main hall is stunning with ornate plasterwork and chandeliers.",
    "tags": [
      "historic",
      "elegant",
      "beautiful",
      "music department"
    ],
    "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop"
  },
  {
    "id": 12,
    "universityId": 1,
    "name": "Life Sciences Library",
    "building": "Life Sciences Building",
    "floor": "1st Floor",
    "category": "Library",
    "lat": 51.4592,
    "lng": -2.601,
    "noiseLevel": 1,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 9am-7pm",
    "capacity": 80,
    "studyScore": 8.5,
    "atmosphere": "Compact departmental library with excellent focus atmosphere. Surrounded by biology labs, giving it a unique academic feel.",
    "tags": [
      "quiet",
      "focused",
      "biology",
      "compact"
    ],
    "image": "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=600&h=400&fit=crop"
  },
  {
    "id": 13,
    "universityId": 2,
    "name": "Bower Ashton Library",
    "building": "Bower Ashton Campus",
    "floor": "All floors",
    "category": "Library",
    "lat": 51.442,
    "lng": -2.628,
    "noiseLevel": 1,
    "seatingComfort": "excellent",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8:30am-9pm, Sat 10am-5pm",
    "capacity": 200,
    "studyScore": 9.0,
    "atmosphere": "Arts campus library with creative atmosphere. Surrounded by art studios and galleries. Inspiring environment for creative work.",
    "tags": [
      "arts",
      "creative",
      "inspiring",
      "galleries"
    ],
    "image": "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=400&fit=crop"
  },
  {
    "id": 14,
    "universityId": 2,
    "name": "Frenchay Library",
    "building": "Frenchay Campus",
    "floor": "All floors",
    "category": "Library",
    "lat": 51.5002,
    "lng": -2.549,
    "noiseLevel": 1,
    "seatingComfort": "good",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-12am, Sat-Sun 10am-8pm",
    "capacity": 600,
    "studyScore": 8.8,
    "atmosphere": "Main UWE library with extensive study spaces across multiple floors. Silent zones, group areas, and computer clusters. Recently refurbished.",
    "tags": [
      "large",
      "silent zones",
      "computers",
      "refurbished"
    ],
    "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop"
  },
  {
    "id": 15,
    "universityId": 2,
    "name": "Student Village Study Hub",
    "building": "Student Village",
    "floor": "Ground",
    "category": "Study Room",
    "lat": 51.501,
    "lng": -2.547,
    "noiseLevel": 2,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "24/7",
    "capacity": 100,
    "studyScore": 8.2,
    "atmosphere": "24/7 study space within the student accommodation area. Convenient for late-night study sessions. Mix of individual and group spaces.",
    "tags": [
      "24/7",
      "convenient",
      "late night",
      "residential"
    ],
    "image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop"
  },
  {
    "id": 16,
    "universityId": 2,
    "name": "Exhibition Centre",
    "building": "Exhibition & Conference Centre",
    "floor": "Ground",
    "category": "Lounge",
    "lat": 51.5005,
    "lng": -2.55,
    "noiseLevel": 3,
    "seatingComfort": "excellent",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-8pm",
    "capacity": 150,
    "studyScore": 7.5,
    "atmosphere": "Modern conference centre with spacious atrium and comfortable seating. Good for casual study between lectures. Nice cafe on site.",
    "tags": [
      "spacious",
      "cafe",
      "modern",
      "atrium"
    ],
    "image": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop"
  },
  {
    "id": 17,
    "universityId": 2,
    "name": "Q Block Study Space",
    "building": "Q Block",
    "floor": "Multiple",
    "category": "Study Room",
    "lat": 51.4998,
    "lng": -2.5485,
    "noiseLevel": 2,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-9pm",
    "capacity": 180,
    "studyScore": 8.0,
    "atmosphere": "Engineering and computing building with modern study pods, collaborative spaces, and quiet zones. Well-equipped with tech facilities.",
    "tags": [
      "tech",
      "study pods",
      "engineering",
      "modern"
    ],
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop"
  },
  {
    "id": 18,
    "universityId": 2,
    "name": "Glenside Library",
    "building": "Glenside Campus",
    "floor": "Ground & 1st",
    "category": "Library",
    "lat": 51.476,
    "lng": -2.535,
    "noiseLevel": 1,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8:30am-8pm, Sat 10am-4pm",
    "capacity": 120,
    "studyScore": 8.5,
    "atmosphere": "Health sciences campus library in a beautiful historic building. Quiet and focused atmosphere, popular with nursing and health students.",
    "tags": [
      "health sciences",
      "historic",
      "quiet",
      "focused"
    ],
    "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop"
  },
  {
    "id": 19,
    "universityId": 2,
    "name": "Bristol Business School Atrium",
    "building": "Bristol Business School",
    "floor": "Ground",
    "category": "Lounge",
    "lat": 51.4995,
    "lng": -2.551,
    "noiseLevel": 3,
    "seatingComfort": "good",
    "lightingQuality": "excellent",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 8am-7pm",
    "capacity": 100,
    "studyScore": 7.3,
    "atmosphere": "Open-plan atrium with natural light flooding in. Comfortable seating areas and a cafe. Good for group discussions and casual study.",
    "tags": [
      "business",
      "atrium",
      "natural light",
      "cafe"
    ],
    "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop"
  },
  {
    "id": 20,
    "universityId": 2,
    "name": "Centre for Sport Study Zone",
    "building": "Centre for Sport",
    "floor": "1st Floor",
    "category": "Study Room",
    "lat": 51.5008,
    "lng": -2.546,
    "noiseLevel": 2,
    "seatingComfort": "good",
    "lightingQuality": "good",
    "plugSockets": true,
    "wifi": true,
    "openingHours": "Mon-Fri 7am-10pm, Sat-Sun 8am-8pm",
    "capacity": 60,
    "studyScore": 7.8,
    "atmosphere": "Overlooking the sports facilities, this study zone offers a unique environment. Great for a study break with gym access nearby.",
    "tags": [
      "sports",
      "gym nearby",
      "unique view",
      "active"
    ],
    "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop"
  }
];
