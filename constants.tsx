
import { Property, PropertyCategory } from './types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'New Oak Heights',
    price: 850000,
    location: 'Haatso, Accra',
    description: 'A landmark of modern luxury, New Oak Heights features distinctive terracotta-tiled facades and an intricate geometric lattice exterior. Offering panoramic views of the Haatso skyline, it is the pinnacle of contemporary Ghanaian architecture.',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'],
    category: PropertyCategory.PENTHOUSE,
    beds: 4,
    baths: 4,
    sqft: 3200,
    featured: true,
    coordinates: { lat: 5.6795, lng: -0.2030 }
  },
  {
    id: '2',
    title: 'Ashongman Suburban Estate',
    price: 380000,
    location: 'Musuku Junction, Accra',
    description: 'Perfect for growing families, this spacious home at Musuku Junction combines security with a peaceful suburban atmosphere.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
    category: PropertyCategory.RESIDENTIAL,
    beds: 5,
    baths: 4,
    sqft: 4500,
    featured: true,
    coordinates: { lat: 5.6948, lng: -0.2117 }
  },
  {
    id: '3',
    title: 'The Sanctuary Villas',
    price: 520000,
    location: 'Ashongman Estate, Accra',
    description: 'Find your slice of paradise in these modern townhouses. Featuring gated security, private balconies, and proximity to major city hubs.',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'],
    category: PropertyCategory.VILLA,
    beds: 4,
    baths: 4.5,
    sqft: 3800,
    featured: true,
    coordinates: { lat: 5.7000, lng: -0.2100 }
  },
  {
    id: '4',
    title: 'Wisconsin University Court',
    price: 250000,
    location: 'Haatso (Opp. Wisconsin Uni), Accra',
    description: 'Strategically located directly opposite Wisconsin University, these units are ideal for investment, students, and faculty alike.',
    images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200'],
    category: PropertyCategory.RESIDENTIAL,
    beds: 2,
    baths: 2,
    sqft: 1400,
    featured: false,
    coordinates: { lat: 5.6810, lng: -0.2015 }
  }
];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Upcoming Projects', path: '/upcoming-projects' },
  { name: 'Blog', path: '/blog' },
  { name: 'Our Services', path: '/#services' }
];
