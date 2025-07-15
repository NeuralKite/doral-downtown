import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { galleryImages } from '../data/mockData';

const PhotoGallery: React.FC = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % galleryImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-brand-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary">
              {t('photo_gallery')}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore the beauty and vibrancy of Doral through our lens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className={`group cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <div className={`relative ${index === 0 ? 'h-64 md:h-full' : 'h-64'}`}>
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <h3 className="font-semibold text-brand-primary text-sm md:text-base">
                      {image.title}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {image.category}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            
            <div className="max-w-4xl max-h-full">
              <img 
                src={galleryImages[selectedImage].url} 
                alt={galleryImages[selectedImage].title}
                className="max-w-full max-h-full object-contain"
              />
              <div className="text-center mt-4">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {galleryImages[selectedImage].title}
                </h3>
                <p className="text-gray-300">
                  {galleryImages[selectedImage].category}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PhotoGallery;