import React from 'react';
import { useTranslation } from 'react-i18next';
import { categories } from '../data/mockData';
import * as Icons from 'lucide-react';

interface CategoryCardsProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoryCards: React.FC<CategoryCardsProps> = ({ onCategorySelect }) => {
  const { t } = useTranslation();

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="h-8 w-8" /> : null;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
            {t('explore')} Doral
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the best places and experiences our vibrant community has to offer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
            >
              <div className="p-6 text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: category.color }}
                >
                  {getIcon(category.icon)}
                </div>
                
                <h3 className="text-xl font-bold text-brand-primary mb-2 group-hover:text-brand-primary/80 transition-colors">
                  {t(category.id)}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {category.subcategories.reduce((total, sub) => total + sub.count, 0)} places
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium"
                    >
                      {t(sub.id)}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                      +{category.subcategories.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <button className="w-full bg-brand-primary/10 text-brand-primary py-2 rounded-lg hover:bg-brand-primary hover:text-white transition-colors font-medium text-sm">
                    Explore {t(category.id)}
                  </button>
                </div>
              </div>
              
              <div 
                className="h-2 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: category.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;