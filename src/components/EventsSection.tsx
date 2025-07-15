import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, ArrowRight, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';
import { upcomingEvents } from '../data/mockData';

const EventsSection: React.FC = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % upcomingEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
              {t('upcoming_events')}
            </h2>
            <p className="text-xl text-gray-600">
              Don't miss out on these exciting happenings
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button className="flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80 transition-colors font-medium">
              <span>{t('see_all')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="w-full flex-shrink-0 px-2"
              >
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 max-w-4xl mx-auto">
                  <div className="md:flex">
                    <div className="md:w-1/2 relative">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <div className="bg-white rounded-lg p-3 text-center shadow-lg">
                          <div className="text-brand-primary font-bold text-lg">
                            {new Date(event.date).getDate()}
                          </div>
                          <div className="text-gray-600 text-xs uppercase">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <span className="bg-brand-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="md:w-1/2 p-8">
                      <h3 className="text-2xl font-bold text-brand-primary mb-4 group-hover:text-brand-primary/80 transition-colors">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {event.description}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Ticket className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span className="font-medium text-brand-primary">{event.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2">
                          <Ticket className="h-4 w-4" />
                          <span>Buy Tickets</span>
                        </button>
                        <button className="px-6 py-3 border border-brand-primary text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-colors font-medium">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {upcomingEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-brand-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex justify-center mt-8 md:hidden space-x-4">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mt-8 md:hidden">
          <button className="flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80 transition-colors font-medium mx-auto">
            <span>{t('see_all')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;