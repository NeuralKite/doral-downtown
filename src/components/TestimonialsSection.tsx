import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      name: 'María González',
      role: 'Local Resident',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      rating: 5,
      text: 'Doral Downtown has transformed how I discover local businesses. The platform makes it so easy to find exactly what I need in my neighborhood.'
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      role: 'Business Owner',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      rating: 5,
      text: 'Since joining Doral Downtown, my restaurant has seen a 40% increase in new customers. The community engagement is incredible!'
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      role: 'Event Organizer',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      rating: 5,
      text: 'The events section has been a game-changer for promoting our cultural activities. We reach so many more people now!'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
            What Our Community Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover why thousands of residents and businesses trust Doral Downtown
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 relative group"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-brand-primary/20 group-hover:text-brand-primary/30 transition-colors">
                <Quote className="h-8 w-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-brand-primary">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-brand-primary mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-gray-600 mb-6">
              Be part of Doral's most vibrant community platform and discover everything our city has to offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-brand-primary text-white px-8 py-3 rounded-xl hover:bg-brand-primary/90 transition-colors font-semibold">
                Explore Businesses
              </button>
              <button className="bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold">
                List Your Business
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;