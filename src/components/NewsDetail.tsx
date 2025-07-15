import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

interface NewsDetailProps {
  articleId: string;
  onBack: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ articleId, onBack }) => {
  const { t } = useTranslation();

  // Mock article data - in real app this would come from props or API
  const article = {
    id: articleId,
    title: 'New Luxury Shopping District Opens in Doral',
    excerpt: 'CityPlace Doral expands with new high-end retailers and dining options, bringing world-class shopping to the community.',
    content: `
      <p>Doral continues to establish itself as a premier destination for luxury shopping and dining with the grand opening of the newest expansion at CityPlace Doral. This exciting development brings together world-class retailers, innovative dining concepts, and entertainment options that cater to the sophisticated tastes of our growing community.</p>

      <p>The new district features over 50 premium brands, including several flagship stores making their South Florida debut. Visitors can explore everything from high-end fashion boutiques to cutting-edge technology stores, all within a beautifully designed outdoor shopping environment.</p>

      <h3>What's New</h3>
      <p>Among the notable additions are:</p>
      <ul>
        <li>Luxury fashion brands including Gucci, Louis Vuitton, and Hermès</li>
        <li>Innovative dining concepts from renowned chefs</li>
        <li>A state-of-the-art cinema complex</li>
        <li>Expanded parking facilities with valet service</li>
        <li>Beautiful landscaping and public art installations</li>
      </ul>

      <h3>Community Impact</h3>
      <p>This expansion is expected to create over 1,000 new jobs in the area and significantly boost the local economy. The development also includes sustainable design features and green spaces that enhance the overall shopping experience while respecting the environment.</p>

      <p>Mayor Juan Carlos Bermudez commented, "This expansion represents Doral's continued growth as a world-class destination. We're proud to offer our residents and visitors such exceptional shopping and dining experiences right here in our city."</p>

      <h3>Grand Opening Events</h3>
      <p>The celebration continues throughout the month with special events, exclusive previews, and promotional offers from participating retailers. Visit CityPlace Doral's website for a complete schedule of grand opening activities.</p>
    `,
    image: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg',
    date: '2025-01-15',
    category: 'Shopping',
    author: 'Maria Rodriguez',
    readTime: '5 min read'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.title;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                onClick={() => handleShare('facebook')}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 text-gray-400 hover:text-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block bg-brand-primary text-white text-sm px-3 py-1 rounded-full font-medium">
              {article.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-primary mb-6 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {article.excerpt}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
            <div>
              By <span className="font-medium text-gray-700">{article.author}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>

        {/* Article Body */}
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              lineHeight: '1.8',
              fontSize: '1.125rem'
            }}
          />
        </div>

        {/* Share Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-xl font-bold text-brand-primary mb-4">Share this article</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center space-x-2 bg-blue-400 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center space-x-2 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span>LinkedIn</span>
            </button>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-brand-primary mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <img 
                src="https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg" 
                alt="Related article"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Dining</span>
                <h4 className="text-lg font-bold text-brand-primary mt-3 mb-2">
                  Best New Restaurants to Try in Doral
                </h4>
                <p className="text-gray-600 text-sm">
                  Discover the latest culinary hotspots that are redefining the dining scene...
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <img 
                src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg" 
                alt="Related article"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Events</span>
                <h4 className="text-lg font-bold text-brand-primary mt-3 mb-2">
                  Doral Cultural Festival Returns This Spring
                </h4>
                <p className="text-gray-600 text-sm">
                  The annual celebration of arts, music, and culture promises to be bigger...
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;