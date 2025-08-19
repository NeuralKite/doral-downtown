import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "explore": "Explore",
      "news": "News",
      "gallery": "Gallery",
      "events_nav": "Events",
      "contact": "Contact",
      "account": "Account",
      "login": "Login",
      "register": "Register",
      "my_profile": "My Profile",
      "logout": "Logout",
      "admin_panel": "Admin Panel",
      "business_panel": "Business Panel",
      "business_dashboard": "Business Dashboard",
      "admin_dashboard": "Admin Dashboard",
      "user_dashboard": "My Profile",
      "settings": "Settings",
      "language": "Language",
      
      // Main content
      "welcome": "Everything you need in Doral is here",
      "search_placeholder": "What are you looking for in Doral today?",
      "search_button": "Search",
      
      // Categories
      "dining": "Dining",
      "shopping": "Shopping",
      "living": "Living",
      "events": "Events",
      "restaurants": "Restaurants",
      "cafes": "Cafés",
      "bars": "Bars & Lounges",
      "stores": "Stores",
      "beauty": "Beauty",
      "services": "Services",
      "boutiques": "Boutiques",
      "technology": "Technology",
      "communities": "Communities",
      "real_estate": "Real Estate",
      "residential": "Residential Spaces",
      "festivals": "Festivals",
      "cultural": "Cultural",
      "family": "Family",
      "community": "Community",
      
      // Business details
      "view_on_map": "View on Map",
      "get_directions": "Get Directions",
      "call_now": "Call Now",
      "visit_website": "Visit Website",
      "favorites": "Favorites",
      "hours": "Hours",
      "address": "Address",
      "phone": "Phone",
      "website": "Website",
      "rating": "Rating",
      "reviews": "reviews",
      "gallery_title": "Gallery",
      "social_media": "Social Media",
      "location": "Location",
      "your_location": "Your Location",
      
      // Sections
      "latest_news": "Latest News",
      "upcoming_events": "Upcoming Events",
      "featured_places": "Featured Places",
      "photo_gallery": "Photo Gallery",
      "newsletter": "Newsletter",
      "newsletter_text": "Stay updated with the latest in Doral",
      "subscribe": "Subscribe",
      "offer_services": "Offer Your Services",
      
      // Map
      "map_view": "Map View",
      "list_view": "List View",
      "nearby": "Nearby",
      "all_categories": "All Categories",
      
      // Footer
      "quick_links": "Quick Links",
      "follow_us": "Follow Us",
      "copyright": "© 2025 Doral Downtown. All rights reserved.",
      
      // Buttons and actions
      "read_more": "Read More",
      "view_details": "View Details",
      "see_all": "See All",
      "back": "Back",
      "close": "Close",
      "save": "Save",
      "share": "Share"
    }
  },
  es: {
    translation: {
      // Navigation
      "home": "Inicio",
      "explore": "Explorar",
      "news": "Noticias",
      "gallery": "Galería",
      "events_nav": "Eventos",
      "contact": "Contacto",
      "account": "Cuenta",
      "login": "Iniciar Sesión",
      "register": "Registrarse",
      "my_profile": "Mi Perfil",
      "logout": "Cerrar Sesión",
      "admin_panel": "Panel Administrativo",
      "business_panel": "Panel de Negocio",
      "settings": "Configuración",
      "language": "Idioma",
      
      // Main content
      "welcome": "Todo lo que necesitas en Doral está aquí",
      "search_placeholder": "¿Qué estás buscando hoy en Doral?",
      "search_button": "Buscar",
      
      // Categories
      "dining": "Gastronomía",
      "shopping": "Compras",
      "living": "Vivir",
      "events": "Eventos",
      "restaurants": "Restaurantes",
      "cafes": "Cafeterías",
      "bars": "Bares y Lounges",
      "stores": "Tiendas",
      "beauty": "Belleza",
      "services": "Servicios",
      "boutiques": "Boutiques",
      "technology": "Tecnología",
      "communities": "Comunidades",
      "real_estate": "Bienes Raíces",
      "residential": "Espacios Residenciales",
      "festivals": "Festivales",
      "cultural": "Cultural",
      "family": "Familiar",
      "community": "Comunidad",
      
      // Business details
      "view_on_map": "Ver en Mapa",
      "get_directions": "Cómo Llegar",
      "call_now": "Llamar Ahora",
      "visit_website": "Visitar Sitio Web",
      "favorites": "Favoritos",
      "hours": "Horarios",
      "address": "Dirección",
      "phone": "Teléfono",
      "website": "Sitio Web",
      "rating": "Calificación",
      "reviews": "reseñas",
      "gallery_title": "Galería",
      "social_media": "Redes Sociales",
      "location": "Ubicación",
      "your_location": "Tu Ubicación",
      
      // Sections
      "latest_news": "Últimas Noticias",
      "upcoming_events": "Próximos Eventos",
      "featured_places": "Lugares Destacados",
      "photo_gallery": "Galería de Fotos",
      "newsletter": "Newsletter",
      "newsletter_text": "Mantente actualizado con lo último de Doral",
      "subscribe": "Suscribirse",
      "offer_services": "Ofrece tus Servicios",
      
      // Map
      "map_view": "Vista de Mapa",
      "list_view": "Vista de Lista",
      "nearby": "Cerca de ti",
      "all_categories": "Todas las Categorías",
      
      // Footer
      "quick_links": "Enlaces Rápidos",
      "follow_us": "Síguenos",
      "copyright": "© 2025 Doral Downtown. Todos los derechos reservados.",
      
      // Buttons and actions
      "read_more": "Leer Más",
      "view_details": "Ver Detalles",
      "see_all": "Ver Todo",
      "back": "Volver",
      "close": "Cerrar",
      "save": "Guardar",
      "share": "Compartir"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;