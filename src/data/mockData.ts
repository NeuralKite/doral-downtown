import { Business, Category, NewsArticle, Event } from '../types';

export const categories: Category[] = [
  {
    id: 'dining',
    name: 'Dining',
    icon: 'Utensils',
    color: '#FF6B6B',
    subcategories: [
      { id: 'restaurants', name: 'Restaurants', count: 45 },
      { id: 'cafes', name: 'Cafés', count: 23 },
      { id: 'bars', name: 'Bars & Lounges', count: 18 }
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#4ECDC4',
    subcategories: [
      { id: 'stores', name: 'Stores', count: 67 },
      { id: 'beauty', name: 'Beauty', count: 34 },
      { id: 'services', name: 'Services', count: 89 },
      { id: 'boutiques', name: 'Boutiques', count: 12 },
      { id: 'technology', name: 'Technology', count: 28 }
    ]
  },
  {
    id: 'living',
    name: 'Living',
    icon: 'Home',
    color: '#45B7D1',
    subcategories: [
      { id: 'communities', name: 'Communities', count: 15 },
      { id: 'real-estate', name: 'Real Estate', count: 156 },
      { id: 'residential', name: 'Residential Spaces', count: 89 }
    ]
  },
  {
    id: 'events',
    name: 'Events',
    icon: 'Calendar',
    color: '#96CEB4',
    subcategories: [
      { id: 'festivals', name: 'Festivals', count: 8 },
      { id: 'cultural', name: 'Cultural', count: 23 },
      { id: 'family', name: 'Family', count: 34 },
      { id: 'community', name: 'Community', count: 45 }
    ]
  }
];

export const businesses: Business[] = [
  {
    id: '1',
    name: 'Bulla Gastrobar',
    category: 'dining',
    subcategory: 'restaurants',
    description: 'Contemporary Spanish cuisine with modern tapas and an extensive wine selection in an elegant atmosphere.',
    address: '5335 NW 87th Ave, Doral, FL 33178',
    phone: '(305) 441-0107',
    website: 'https://bullagastrobar.com',
    hours: '11:30 AM - 12:00 AM',
    image: 'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg',
    gallery: [
      'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg',
      'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'
    ],
    rating: 4.5,
    reviews: 342,
    coordinates: { lat: 25.8267, lng: -80.3573 },
    socialMedia: {
      facebook: 'https://facebook.com/bullagastrobar',
      instagram: 'https://instagram.com/bullagastrobar'
    },
    featured: true
  },
  {
    id: '2',
    name: 'CityPlace Doral',
    category: 'shopping',
    subcategory: 'stores',
    description: 'Premier shopping destination featuring luxury brands, dining, and entertainment in the heart of Doral.',
    address: '8300 NW 36th St, Doral, FL 33166',
    phone: '(305) 593-6000',
    website: 'https://cityplacedoral.com',
    hours: '10:00 AM - 10:00 PM',
    image: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg',
    gallery: [
      'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg',
      'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg',
      'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg'
    ],
    rating: 4.3,
    reviews: 892,
    coordinates: { lat: 25.8078, lng: -80.3420 },
    socialMedia: {
      facebook: 'https://facebook.com/cityplacedoral',
      instagram: 'https://instagram.com/cityplacedoral'
    },
    featured: true
  },
  {
    id: '3',
    name: 'Doral Legacy Park',
    category: 'living',
    subcategory: 'communities',
    description: 'Luxury residential community offering modern amenities, green spaces, and family-friendly environment.',
    address: '10800 NW 58th St, Doral, FL 33178',
    phone: '(305) 718-4000',
    website: 'https://dorallegacypark.com',
    hours: '9:00 AM - 6:00 PM',
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    gallery: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    rating: 4.7,
    reviews: 156,
    coordinates: { lat: 25.8156, lng: -80.3789 },
    socialMedia: {
      facebook: 'https://facebook.com/dorallegacypark',
      instagram: 'https://instagram.com/dorallegacypark'
    }
  },
  {
    id: '4',
    name: 'Doral Cultural Arts Center',
    category: 'events',
    subcategory: 'cultural',
    description: 'State-of-the-art venue hosting theatrical performances, concerts, and cultural events year-round.',
    address: '8395 NW 52nd Terrace, Doral, FL 33166',
    phone: '(305) 593-6000',
    website: 'https://doralculturalarts.org',
    hours: 'Varies by event',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    gallery: [
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
      'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'
    ],
    rating: 4.6,
    reviews: 234,
    coordinates: { lat: 25.8089, lng: -80.3445 },
    socialMedia: {
      facebook: 'https://facebook.com/doralculturalarts',
      instagram: 'https://instagram.com/doralculturalarts'
    }
  },
  {
    id: '5',
    name: 'Café Bustelo',
    category: 'dining',
    subcategory: 'cafes',
    description: 'Authentic Cuban coffee experience with traditional pastries and a warm, welcoming atmosphere.',
    address: '8405 NW 53rd St, Doral, FL 33166',
    phone: '(305) 592-2233',
    hours: '6:00 AM - 8:00 PM',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    gallery: [
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
      'https://images.pexels.com/photos/1833586/pexels-photo-1833586.jpeg'
    ],
    rating: 4.4,
    reviews: 189,
    coordinates: { lat: 25.8095, lng: -80.3456 },
    socialMedia: {
      instagram: 'https://instagram.com/cafebustelo'
    }
  },
  {
    id: '6',
    name: 'Doral Spa & Wellness',
    category: 'shopping',
    subcategory: 'beauty',
    description: 'Full-service spa offering rejuvenating treatments, massages, and wellness services in a tranquil setting.',
    address: '8320 NW 36th St, Doral, FL 33166',
    phone: '(305) 591-7772',
    website: 'https://doralspa.com',
    hours: '9:00 AM - 7:00 PM',
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
    gallery: [
      'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
      'https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg'
    ],
    rating: 4.8,
    reviews: 267,
    coordinates: { lat: 25.8076, lng: -80.3418 },
    socialMedia: {
      facebook: 'https://facebook.com/doralspa',
      instagram: 'https://instagram.com/doralspa'
    }
  }
];

export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'New Luxury Shopping District Opens in Doral',
    excerpt: 'CityPlace Doral expands with new high-end retailers and dining options, bringing world-class shopping to the community.',
    image: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg',
    date: '2025-01-15',
    category: 'Shopping',
    slug: 'new-luxury-shopping-district-opens'
  },
  {
    id: '2',
    title: 'Doral Cultural Festival Returns This Spring',
    excerpt: 'The annual celebration of arts, music, and culture promises to be bigger than ever with international performers.',
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    date: '2025-01-12',
    category: 'Events',
    slug: 'doral-cultural-festival-returns'
  },
  {
    id: '3',
    title: 'Best New Restaurants to Try in Doral',
    excerpt: 'Discover the latest culinary hotspots that are redefining the dining scene in our vibrant community.',
    image: 'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg',
    date: '2025-01-10',
    category: 'Dining',
    slug: 'best-new-restaurants-doral'
  }
];

export const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Doral Food & Wine Festival',
    description: 'A celebration of culinary excellence featuring local and international chefs, wine tastings, and live entertainment.',
    date: '2025-02-15',
    time: '6:00 PM - 11:00 PM',
    location: 'CityPlace Doral',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    category: 'Food & Drink',
    price: '$45 - $85',
    organizer: 'Doral Chamber of Commerce'
  },
  {
    id: '2',
    title: 'Family Fun Day at the Park',
    description: 'Join us for a day of family activities, games, food trucks, and live music in beautiful Doral Central Park.',
    date: '2025-02-22',
    time: '10:00 AM - 4:00 PM',
    location: 'Doral Central Park',
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg',
    category: 'Family',
    price: 'Free',
    organizer: 'City of Doral'
  },
  {
    id: '3',
    title: 'Art Gallery Opening Night',
    description: 'Discover emerging local artists and enjoy an evening of art, culture, and networking in downtown Doral.',
    date: '2025-02-28',
    time: '7:00 PM - 10:00 PM',
    location: 'Doral Cultural Arts Center',
    image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg',
    category: 'Arts & Culture',
    price: '$15',
    organizer: 'Doral Arts Foundation'
  }
];

export const galleryImages = [
  {
    id: '1',
    url: 'https://images.pexels.com/photos/2346091/pexels-photo-2346091.jpeg',
    title: 'Downtown Doral Skyline',
    category: 'Architecture'
  },
  {
    id: '2',
    url: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg',
    title: 'CityPlace Shopping',
    category: 'Shopping'
  },
  {
    id: '3',
    url: 'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg',
    title: 'Fine Dining Experience',
    category: 'Dining'
  },
  {
    id: '4',
    url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    title: 'Cultural Events',
    category: 'Events'
  },
  {
    id: '5',
    url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    title: 'Luxury Living',
    category: 'Living'
  },
  {
    id: '6',
    url: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg',
    title: 'Community Events',
    category: 'Community'
  }
];