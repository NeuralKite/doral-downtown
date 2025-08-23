import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, Facebook, Twitter, Linkedin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { NewsArticle } from '../types';

interface NewsDetailProps {
  articleId: string;
  onBack: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ articleId, onBack }) => {
  const { t } = useTranslation();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*, author:user_profiles(name)')
        .eq('id', articleId)
        .maybeSingle();
      if (!error && data) {
        setArticle({
          id: data.id,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          image: data.image_url || '',
          date: data.published_at || '',
          category: data.category,
          slug: data.slug,
          author_name: data.author?.name,
        });
      }
    };
    fetchArticle();
  }, [articleId]);

  const readTime = article?.content
    ? `${Math.ceil(article.content.split(/\s+/).length / 200)} min read`
    : '';

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

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-brand-primary border-t-transparent" />
      </div>
    );
  }

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
                      <span>{formatDate(article.date || '')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{readTime}</span>
            </div>
            <div>
              By <span className="font-medium text-gray-700">{article.author_name}</span>
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
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
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