
import { Property, PropertyCategory, ProjectStatus } from './types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'New Oak Heights',
    price: 850000,
    location: 'Haatso, Accra',
    description: 'A landmark of modern luxury, New Oak Heights features distinctive terracotta-tiled facades and an intricate geometric lattice exterior. Offering panoramic views of the Haatso skyline, it is the pinnacle of contemporary Ghanaian architecture.',
    images: [
      '/hero_new_oak_heights.png',
      // Rooftop infinity pool with city skyline panorama
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=90&w=1400',
      // Designer marble open-plan kitchen
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=90&w=1400',
      // Floor-to-ceiling glass master bedroom with skyline view
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=90&w=1400',
      // Backlit walk-in wardrobe dressing suite
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=90&w=1400',
    ],
    category: PropertyCategory.PENTHOUSE,
    beds: 4,
    baths: 4,
    sqft: 3200,
    featured: true,
    coordinates: { lat: 5.6795, lng: -0.2030 }
  },
  {
    id: '2',
    title: 'The Sovereign Spire',
    price: 1250000,
    location: 'Haatso Highway, Accra',
    description: 'Standing tall as a symbol of architectural courage, The Sovereign Spire combines terracotta-hued geometric lattices with soaring glass curtain walls. An elite vertical enclave designed for high-net-worth individuals.',
    images: [
      '/hero_new_oak_tower.jpg',
      // Ultra-luxury private indoor wellness spa & steam room
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=90&w=1400',
      // Bespoke backlit walnut & glass wine cellar lounge
      'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?auto=format&fit=crop&q=90&w=1400',
      // Panoramic glass-walled executive penthouse living room
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=90&w=1400',
      // Cinematic private home theatre & entertainment suite
      'https://images.unsplash.com/photo-1593784991095-a205069533cd?auto=format&fit=crop&q=90&w=1400',
    ],
    category: PropertyCategory.PENTHOUSE,
    beds: 5,
    baths: 5.5,
    sqft: 5400,
    featured: true,
    coordinates: { lat: 5.6770, lng: -0.2060 }
  },
  {
    id: '3',
    title: 'The Sanctuary Oasis',
    price: 680000,
    location: 'Ashongman Estate, Accra',
    description: 'Nestled in a gated parkland, this premium villa is a masterclass in modern tropical architecture. Boasting a private infinity pool deck, open-plan structural lounges, and double-height glass doors that merge indoor and outdoor living.',
    images: [
      '/hero_new_oak_villa.jpg',
      // Tropical outdoor infinity pool with lush landscaping
      'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?auto=format&fit=crop&q=90&w=1400',
      // Double-height open-plan tropical living room
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=90&w=1400',
      // Private outdoor cabana & pergola entertainment terrace
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=90&w=1400',
      // Spa-grade ensuite bathroom with freestanding tub
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=90&w=1400',
    ],
    category: PropertyCategory.VILLA,
    beds: 4,
    baths: 4.5,
    sqft: 4200,
    featured: true,
    coordinates: { lat: 5.6980, lng: -0.2105 }
  },
  {
    id: '4',
    title: 'The Geometric Pavilion',
    price: 450000,
    location: 'Haatso Court, Accra',
    description: 'A beautiful manifestation of contemporary geometric minimalism. The Geometric Pavilion is characterized by balanced framing, high-ceiling layouts, and custom oak fittings, offering the perfect family residence.',
    images: [
      '/hero_new_oak_facade.png',
      // Sophisticated minimalist family living room in warm oak tones
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=90&w=1400',
      // Modern chef's kitchen with island & premium appliances
      'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=90&w=1400',
      // Private garden courtyard & landscaped outdoor play space
      'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=90&w=1400',
      // Custom built-in oak bookshelf & home office study nook
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&q=90&w=1400',
    ],
    category: PropertyCategory.RESIDENTIAL,
    beds: 3,
    baths: 3.5,
    sqft: 2800,
    featured: true,
    coordinates: { lat: 5.6815, lng: -0.2045 }
  },
  {
    id: '5',
    title: 'The Sunset Pavilion',
    price: 590000,
    location: 'Musuku Junction, Accra',
    description: 'Experience breathtaking Accra sunsets from this architectural masterpiece. Designed with deep overhangs for natural shade, thermal-insulating terracotta screens, and expansive glass railings overlooking custom water features.',
    images: [
      '/hero_new_oak_dusk.jpg',
      // Sunset-lit terrace & outdoor lounge with water feature
      'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&q=90&w=1400',
      // Deep-overhanging pergola lounge at golden hour
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&q=90&w=1400',
      // Premium master suite with terracotta-toned sunset palette
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=90&w=1400',
      // Custom fireplace lounge with warm earthy interior palette
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=90&w=1400',
    ],
    category: PropertyCategory.VILLA,
    beds: 4,
    baths: 4,
    sqft: 3600,
    featured: true,
    coordinates: { lat: 5.6850, lng: -0.2010 }
  }
];


export const INITIAL_SERVICES = [
  {
    id: '1',
    title: 'Estate Development',
    description: 'Sovereign-grade suburban planning with meticulous attention to Ghanaian heritage and global architectural standards.',
    features: ['Master-planned communities', 'Premium location selection', 'Sovereign-grade design'],
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
    icon: 'Shield',
    order: 1
  },
  {
    id: '2',
    title: 'Accessible Investment',
    description: 'Strategic ROI optimization with humanity. We offer tailored payment plans that empower the middle class to build generational wealth effortlessly.',
    features: ['Flexible payment structures', 'High-yield appreciation', 'Transparency focus'],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
    icon: 'TrendingUp',
    order: 2
  },
  {
    id: '3',
    title: 'Architecture',
    description: 'Merging local Accra context with global luxury standards. Fusion of terracotta warmth and geometric precision.',
    features: ['Contemporary Ghanaian design', 'Sustainable innovation', 'Terracotta & geometric fusion'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    icon: 'Landmark',
    order: 3
  },
  {
    id: '4',
    title: 'Concierge',
    description: 'End-to-end property maintenance and management with 24/7 gated security protocols for your peace of mind.',
    features: ['24/7 security protocols', 'Property management', '24/7 maintenance care'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    icon: 'Key',
    order: 4
  }
];

export const INITIAL_GALLERY = [
  {
    id: '1',
    title: "Bespoke Culinary Spaces",
    subtitle: "Italian Marble & Integrated Appliances",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
    isMain: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: "Minimalist Living",
    subtitle: "Open Plan Design",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
    isMain: false,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: "Pool Deck",
    subtitle: "Resort Style Amenities",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    isMain: false,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: "Master Bath",
    subtitle: "Spa-like Retreat",
    image: "https://images.unsplash.com/photo-1600566753086-00f18cf6b3ea?auto=format&fit=crop&q=80&w=800",
    isMain: false,
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    title: "Facade Detail",
    subtitle: "Modern Architecture",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
    isMain: false,
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    title: "Bespoke Dressing Room",
    subtitle: "Luxury Backlit Wooden Closets & Island",
    image: "/amenity_walk_in_closet.png",
    isMain: false,
    order: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    title: "Executive Study",
    subtitle: "Marble Wall Accent & Walnut Office Study",
    image: "/amenity_executive_office.png",
    isMain: false,
    order: 7,
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    title: "Private Wellness Spa",
    subtitle: "Glass-Walled Steam Shower & Sauna Wellness Suite",
    image: "/amenity_wellness_spa.png",
    isMain: false,
    order: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    title: "Glass Wine Cellar Cabinet",
    subtitle: "Custom Backlit Oak Wine Rack Shelving",
    image: "/amenity_wine_cellar.png",
    isMain: false,
    order: 9,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TEAM = [
  {
    id: '1',
    name: 'Emmanuel Agbanyo',
    role: 'CEO & Chief Architect',
    bio: 'Pioneering global-standard Ghanaian architecture. Emmanuel fuses traditional terracotta warmth with high-end glassmorphic geometry, setting a new bar for premium African estates.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
    linkedin: 'https://linkedin.com',
    email: 'ceo@newoaklimited.com',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sarah Boateng',
    role: 'Chief Operating Officer',
    bio: 'Sarah leads development logistics with outstanding precision. Her execution makes diaspora real estate investment fully transparent, secure, and hassle-free.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    linkedin: 'https://linkedin.com',
    email: 'sarah.boateng@newoaklimited.com',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Kwame Mensah',
    role: 'Head of Diaspora Relations',
    bio: 'Kwame specializes in matching modern Ghanaian professionals and global investors with premium real estate opportunities that drive long-term ROI.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
    linkedin: 'https://linkedin.com',
    email: 'kwame.mensah@newoaklimited.com',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_UPCOMING_PROJECTS = [
  {
    id: '1',
    title: 'NewOak Terracotta Plaza',
    description: 'A sovereign-grade commercial development integrating traditional terracotta heat-insulating facades with geometric steel support structures. Providing ultra-premium boutique corporate office suites directly off the Haatso highway.',
    location: 'Haatso Highway, Accra',
    expectedCompletion: 'Q4 2026',
    status: ProjectStatus.IN_PROGRESS,
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'],
    highlights: ['Premium prime highway frontage', 'Terracotta heat management facade', 'State-of-the-art security & high-speed fiber'],
    estimatedUnits: 18,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'The Oak Pavilion',
    description: 'An exclusive collection of 5-bedroom smart villas. Fusing contemporary minimalist aesthetics with sprawling double-height glass doors that look out to private infinity pools.',
    location: 'East Legon Hills, Accra',
    expectedCompletion: 'Q2 2027',
    status: ProjectStatus.PLANNING,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
    highlights: ['Multi-zone automated smart home hubs', 'Individual private infinity pool decks', 'Gated sovereign estate security'],
    estimatedUnits: 8,
    featured: true,
    createdAt: new Date().toISOString()
  }
];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Upcoming Projects', path: '/upcoming-projects' },
  { name: 'Blog', path: '/blog' },
  { name: 'Our Services', path: '/#services' }
];
