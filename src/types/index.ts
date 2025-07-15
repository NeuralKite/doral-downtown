export interface Business {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  image: string;
  gallery?: string[];
  rating?: number;
  reviews?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
  color: string;
}

export interface Subcategory {
  id: string;
  name: string;
  count: number;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  query?: string;
  location?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  slug: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  price?: string;
  organizer: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'business' | 'admin';
  businessId?: string;
}

export type UserRole = 'user' | 'business' | 'admin';