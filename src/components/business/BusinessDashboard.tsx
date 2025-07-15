import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Store, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Settings,
  Plus,
  Eye,
  Edit,
  Star,
  MapPin,
  Phone,
  Globe,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../ui';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const BusinessDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);

  // Mock data - in real app this would come from API
  const businessStats = {
    totalViews: 2847,
    monthlyViews: 456,
    totalReviews: 89,
    averageRating: 4.5,
    totalBookings: 234,
    monthlyBookings: 45
  };

  const myBusinesses = [
    {
      id: 1,
      name: 'Bulla Gastrobar',
      category: 'Dining',
      address: '5335 NW 87th Ave, Doral, FL 33178',
      phone: '(305) 441-0107',
      website: 'https://bullagastrobar.com',
      rating: 4.5,
      reviews: 342,
      status: 'active',
      featured: true,
      image: 'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg'
    }
  ];

  const recentReviews = [
    { id: 1, customer: 'Ana Fernandez', rating: 5, comment: 'Amazing food and service!', date: '2025-01-08' },
    { id: 2, customer: 'Ricardo Silva', rating: 4, comment: 'Great atmosphere, will come back.', date: '2025-01-07' },
    { id: 3, customer: 'Lucia Martinez', rating: 5, comment: 'Best tapas in Doral!', date: '2025-01-06' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Wine Tasting Night', date: '2025-01-15', time: '7:00 PM', attendees: 25 },
    { id: 2, title: 'Spanish Cooking Class', date: '2025-01-22', time: '6:00 PM', attendees: 12 },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'businesses', label: 'My Businesses', icon: Store },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-blue-100">Manage your business listings, events, and customer interactions from this dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-brand-primary">{businessStats.totalViews}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +{businessStats.monthlyViews} this month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-brand-primary">{businessStats.averageRating}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{businessStats.totalReviews} reviews</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bookings</p>
              <p className="text-2xl font-bold text-brand-primary">{businessStats.totalBookings}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">+{businessStats.monthlyBookings} this month</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-primary">Recent Reviews</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentReviews.map(review => (
              <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{review.customer}</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-1">{review.date}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-primary">Upcoming Events</h3>
            <Button variant="outline" size="sm" icon={Plus}>Add Event</Button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{event.date}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {event.attendees}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderBusinesses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-brand-primary">My Businesses</h3>
        <Button icon={Plus}>Add Business</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myBusinesses.map(business => (
          <Card key={business.id} className="overflow-hidden">
            <img 
              src={business.image} 
              alt={business.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-brand-primary">{business.name}</h4>
                  <p className="text-sm text-gray-600">{business.category}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{business.rating}</span>
                  <span className="text-sm text-gray-500">({business.reviews})</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {business.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {business.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    business.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {business.status}
                  </span>
                  {business.featured && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" icon={Eye} />
                  <Button variant="outline" size="sm" icon={Edit} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-primary">Business Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'businesses' && renderBusinesses()}
            {activeTab === 'events' && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Event Management</h3>
                <p className="text-gray-500">Create and manage events for your business.</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Review Management</h3>
                <p className="text-gray-500">Manage customer reviews and feedback.</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Business Settings</h3>
                <p className="text-gray-500">Configure your business profile and preferences.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;