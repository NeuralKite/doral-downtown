import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Heart,
  Share2,
  Navigation,
  Facebook,
  Instagram,
  Twitter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Shield,
  Calendar,
  Users,
  CreditCard,
  Ticket
} from 'lucide-react';
import { Business } from '../types';

interface BusinessDetailProps {
  business: Business;
  onBack: () => void;
}

const BusinessDetail: React.FC<BusinessDetailProps> = ({ business, onBack }) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const images = business.gallery || [business.image];
  const isVerified = business.featured; // Using featured as verification for demo

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleGetDirections = () => {
    const address = encodeURIComponent(business.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const handleCall = () => {
    if (business.phone) {
      window.open(`tel:${business.phone}`);
    }
  };

  const handleWebsite = () => {
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderCategorySpecificContent = () => {
    switch (business.subcategory) {
      case 'restaurants':
        return (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-brand-primary mb-4">Make a Reservation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowReservationModal(true)}
                className="flex items-center justify-center space-x-2 bg-brand-primary text-white py-3 px-6 rounded-xl hover:bg-brand-primary/90 transition-colors font-medium"
              >
                <Calendar className="h-5 w-5" />
                <span>Book Table</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-6 rounded-xl hover:bg-green-600 transition-colors font-medium">
                <Phone className="h-5 w-5" />
                <span>Call to Reserve</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors font-medium">
                <Globe className="h-5 w-5" />
                <span>View Menu</span>
              </button>
            </div>
          </div>
        );
      
      case 'festivals':
      case 'cultural':
      case 'family':
      case 'community':
        return (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-brand-primary mb-4">Event Tickets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowTicketModal(true)}
                className="flex items-center justify-center space-x-2 bg-brand-primary text-white py-3 px-6 rounded-xl hover:bg-brand-primary/90 transition-colors font-medium"
              >
                <Ticket className="h-5 w-5" />
                <span>Buy Tickets</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-6 rounded-xl hover:bg-purple-600 transition-colors font-medium">
                <Users className="h-5 w-5" />
                <span>Group Booking</span>
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-brand-secondary hover:text-brand-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('back')}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={images[currentImageIndex]} 
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-brand-primary' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${business.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-brand-primary">
                      {business.name}
                    </h1>
                    {isVerified && (
                      <div className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-medium">
                      {t(business.subcategory)}
                    </span>
                    {business.subcategory === 'restaurants' && (
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Accepts Reservations
                      </span>
                    )}
                  </div>
                </div>
                
                {business.rating && (
                  <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{business.rating}</span>
                    <span className="text-gray-500">({business.reviews} {t('reviews')})</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {business.description}
              </p>

              {/* Category-specific content */}
              {renderCategorySpecificContent()}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleGetDirections}
                  className="flex items-center justify-center space-x-2 bg-brand-primary text-white py-3 px-6 rounded-xl hover:bg-brand-primary/90 transition-colors font-medium"
                >
                  <Navigation className="h-5 w-5" />
                  <span>{t('get_directions')}</span>
                </button>
                
                {business.phone && (
                  <button
                    onClick={handleCall}
                    className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-6 rounded-xl hover:bg-green-600 transition-colors font-medium"
                  >
                    <Phone className="h-5 w-5" />
                    <span>{t('call_now')}</span>
                  </button>
                )}
                
                {business.website && (
                  <button
                    onClick={handleWebsite}
                    className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors font-medium"
                  >
                    <Globe className="h-5 w-5" />
                    <span>{t('visit_website')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-brand-primary mb-4">
                {t('contact')} & {t('hours')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700">{t('address')}</p>
                    <p className="text-gray-600">{business.address}</p>
                  </div>
                </div>
                
                {business.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{t('phone')}</p>
                      <p className="text-gray-600">{business.phone}</p>
                    </div>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{t('website')}</p>
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
                
                {business.hours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{t('hours')}</p>
                      <p className="text-gray-600">{business.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {business.socialMedia && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-brand-primary mb-4">
                  {t('social_media')}
                </h3>
                
                <div className="flex space-x-4">
                  {business.socialMedia.facebook && (
                    <a
                      href={business.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                  )}
                  
                  {business.socialMedia.instagram && (
                    <a
                      href={business.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                  )}
                  
                  {business.socialMedia.twitter && (
                    <a
                      href={business.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-brand-primary mb-4">
                {t('location')}
              </h3>
              
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive Map</p>
                    <p className="text-sm">Click to view in full map</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-brand-primary mb-4">Make a Reservation</h3>
            <div className="space-y-4">
              <input type="date" className="w-full p-3 border rounded-lg" />
              <input type="time" className="w-full p-3 border rounded-lg" />
              <select className="w-full p-3 border rounded-lg">
                <option>2 People</option>
                <option>4 People</option>
                <option>6 People</option>
                <option>8+ People</option>
              </select>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowReservationModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-brand-primary text-white py-3 rounded-lg">
                  Reserve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-brand-primary mb-4">Buy Event Tickets</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span>General Admission</span>
                  <span className="font-bold">$25</span>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span>VIP Access</span>
                  <span className="font-bold">$50</span>
                </div>
              </div>
              <select className="w-full p-3 border rounded-lg">
                <option>1 Ticket</option>
                <option>2 Tickets</option>
                <option>3 Tickets</option>
                <option>4+ Tickets</option>
              </select>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-brand-primary text-white py-3 rounded-lg flex items-center justify-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDetail;