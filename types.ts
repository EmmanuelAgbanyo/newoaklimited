
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
