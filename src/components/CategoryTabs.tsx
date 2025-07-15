import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { categories } from '../data/mockData';
import * as Icons from 'lucide-react';

interface CategoryTabsProps {
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ onCategoryChange }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('dining');

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  return (
    <section className="bg-white py-8 sticky top-16 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-brand-primary text-white shadow-lg'
                  : 'bg-gray-100 text-brand-secondary hover:bg-gray-200'
              }`}
            >
              {getIcon(category.icon)}
              <span className="font-medium">{t(category.id)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryTabs;