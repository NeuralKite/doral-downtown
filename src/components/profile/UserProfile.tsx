import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from '@tanstack/react-router';
import { 
  User, 
  Heart, 
  Calendar,
  MapPin,
  Settings,
  Bell,
  Shield,
  Edit,
  Camera,
  Star,
  Clock
} from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateProfile, isAuthenticated, isLoading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    business_name: user?.business_name || '',
    business_description: user?.business_description || '',
    business_address: user?.business_address || '',
    business_website: user?.business_website || ''
  });

  // Show simple loading only if still checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" search={{ redirect: '/profile' }} />;
  }

  const handleSaveProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };
  // Mock data - in real app this would come from API
  const userStats = {
    favoriteBusinesses: 12,
    reviewsWritten: 8,
    eventsAttended: 5,
    memberSince: '2024-03-15'
  };

  const favoriteBusinesses = [
    { id: 1, name: 'Bulla Gastrobar', category: 'Dining', rating: 4.5, image: 'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg' },
    { id: 2, name: 'CityPlace Doral', category: 'Shopping', rating: 4.3, image: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg' },
    { id: 3, name: 'Doral Spa', category: 'Beauty', rating: 4.8, image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg' },
  ];

  const recentActivity = [
    { id: 1, type: 'review', business: 'Bulla Gastrobar', action: 'Left a 5-star review', date: '2025-01-08' },
    { id: 2, type: 'favorite', business: 'CityPlace Doral', action: 'Added to favorites', date: '2025-01-07' },
    { id: 3, type: 'event', business: 'Doral Cultural Center', action: 'Attended Wine Tasting', date: '2025-01-05' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Food & Wine Festival', date: '2025-01-15', time: '6:00 PM', location: 'CityPlace Doral' },
    { id: 2, title: 'Family Fun Day', date: '2025-01-22', time: '10:00 AM', location: 'Doral Central Park' },
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className={`text-white rounded-2xl p-6 ${
        user?.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-600' :
        user?.role === 'business' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
        'bg-gradient-to-r from-green-500 to-green-600'
      }`}>
        <h2 className="text-2xl font-bold mb-2">
          Welcome, {user?.name}!
        </h2>
        <p className={`${
          user?.role === 'admin' ? 'text-red-100' :
          user?.role === 'business' ? 'text-blue-100' :
          'text-green-100'
        }`}>
          {user?.role === 'admin' && 'Manage the entire Doral Downtown platform and community.'}
          {user?.role === 'business' && 'Manage your business listings, events, and customer interactions.'}
          {user?.role === 'user' && 'Manage your profile, favorites, and discover amazing places in Doral.'}
        </p>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img 
              src={user?.avatar_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brand-primary">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Member since {userStats.memberSince}</span>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Doral, FL
                  </span>
                </div>
              </div>
              <Button 
                variant="outline" 
                icon={Edit}
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              >
                {isEditing ? 'Save' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input label="Email" value={user?.email} disabled />
              <Input 
                label="Phone" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <Input label="Location" value="Doral, FL" disabled />
              
              {user?.role === 'business' && (
                <>
                  <Input 
                    label="Business Name" 
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  />
                  <Input 
                    label="Business Website" 
                    value={formData.business_website}
                    onChange={(e) => setFormData({...formData, business_website: e.target.value})}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Description
                    </label>
                    <textarea
                      value={formData.business_description}
                      onChange={(e) => setFormData({...formData, business_description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      placeholder="Describe your business..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input 
                      label="Business Address" 
                      value={formData.business_address}
                      onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-brand-primary">{userStats.favoriteBusinesses}</p>
          <p className="text-sm text-gray-600">Favorite Places</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-brand-primary">{userStats.reviewsWritten}</p>
          <p className="text-sm text-gray-600">Reviews Written</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-brand-primary">{userStats.eventsAttended}</p>
          <p className="text-sm text-gray-600">Events Attended</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-brand-primary">2</p>
          <p className="text-sm text-gray-600">Years Active</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-brand-primary mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map(activity => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${
                activity.type === 'review' ? 'bg-yellow-100' :
                activity.type === 'favorite' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {activity.type === 'review' && <Star className="h-4 w-4 text-yellow-600" />}
                {activity.type === 'favorite' && <Heart className="h-4 w-4 text-red-600" />}
                {activity.type === 'event' && <Calendar className="h-4 w-4 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.business}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-brand-primary">My Favorite Places</h3>
        <p className="text-gray-600">{favoriteBusinesses.length} places</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteBusinesses.map(business => (
          <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={business.image} 
              alt={business.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-brand-primary">{business.name}</h4>
                <button className="text-red-500 hover:text-red-600">
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{business.category}</p>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm font-medium">{business.rating}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-brand-primary">My Events</h3>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-brand-primary mb-4">Upcoming Events</h4>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{event.title}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{event.date}</span>
                  <span>{event.time}</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-primary">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account and preferences</p>
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
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'favorites' && renderFavorites()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Account Settings</h3>
                <p className="text-gray-500">Manage your account preferences and privacy settings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;