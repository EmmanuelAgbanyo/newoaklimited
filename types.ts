
export enum PropertyCategory {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  VILLA = 'Villa',
  PENTHOUSE = 'Penthouse'
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  images: string[];
  category: PropertyCategory;
  beds: number;
  baths: number;
  sqft: number;
  featured: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled'
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  status: BookingStatus;
  createdAt: string;
}

export interface User {
  id: string;
  role: 'admin' | 'guest';
}

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  COMING_SOON = 'Coming Soon'
}

export interface UpcomingProject {
  id: string;
  title: string;
  description: string;
  location: string;
  expectedCompletion: string;
  status: ProjectStatus;
  images: string[];
  highlights: string[];
  estimatedUnits?: number;
  featured: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}
