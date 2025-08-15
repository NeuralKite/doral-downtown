import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRight } from 'lucide-react';
import { newsArticles } from '../data/mockData';

interface NewsSectionProps {
  onNewsDetail?: (newsId: string) => void;
}

const NewsSection: React.FC<NewsSectionProps> = ({ onNewsDetail }) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleArticleClick = (articleId: string) => {
    if (onNewsDetail) {
      onNewsDetail(articleId);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
              {t('latest_news')}
            </h2>
            <p className="text-xl text-gray-600">
              Stay updated with what's happening in Doral
            </p>
          </div>
          <button className="hidden md:flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80 transition-colors font-medium">
            <span>{t('see_all')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsArticles.map((article, index) => (
            <article
              key={article.id}
              onClick={() => handleArticleClick(article.id)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-brand-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                      {article.category}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center text-white text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(article.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-brand-primary mb-3 group-hover:text-brand-primary/80 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <button className="flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80 transition-colors font-medium">
                    <span>{t('read_more')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
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

export default NewsSection;