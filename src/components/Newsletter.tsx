import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle } from 'lucide-react';

const Newsletter: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-brand-primary to-brand-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Thank you for subscribing!
            </h2>
            <p className="text-xl text-gray-200">
              You'll receive the latest updates about Doral in your inbox.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-brand-primary to-brand-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <Mail className="h-16 w-16 text-white mx-auto mb-6" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('newsletter')}
          </h2>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {t('newsletter_text')}. Get exclusive updates about new businesses, events, and community news.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-gray-300"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-white text-brand-primary px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Subscribing...' : t('subscribe')}
              </button>
            </div>
          </form>
          
          <p className="text-sm text-gray-300 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;