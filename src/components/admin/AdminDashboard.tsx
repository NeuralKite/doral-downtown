import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Building, 
  FileText, 
  Calendar,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../ui';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);

  // Mock data - in real app this would come from API
  const stats = {
    totalUsers: 1247,
    totalBusinesses: 89,
    totalArticles: 156,
    totalEvents: 23,
    monthlyGrowth: 12.5,
    activeUsers: 892
  };

  const recentUsers = [
    { id: 1, name: 'Ana Fernandez', email: 'ana@gmail.com', role: 'user', joinDate: '2025-01-08', verified: true },
    { id: 2, name: 'Carlos Mendez', email: 'carlos@business.com', role: 'business', joinDate: '2025-01-07', verified: true },
    { id: 3, name: 'Lucia Martinez', email: 'lucia@gmail.com', role: 'user', joinDate: '2025-01-06', verified: false },
  ];

  const recentBusinesses = [
    { id: 1, name: 'Bulla Gastrobar', owner: 'Carlos Mendez', category: 'Dining', status: 'active', featured: true },
    { id: 2, name: 'CityPlace Doral', owner: 'Sofia Gutierrez', category: 'Shopping', status: 'active', featured: true },
    { id: 3, name: 'Doral Spa', owner: 'Miguel Santos', category: 'Beauty', status: 'pending', featured: false },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'businesses', label: 'Businesses', icon: Building },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-red-100">You have administrator privileges. Manage users, businesses, and content from this dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-brand-primary">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +{stats.monthlyGrowth}% this month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Businesses</p>
              <p className="text-2xl font-bold text-brand-primary">{stats.totalBusinesses}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Articles</p>
              <p className="text-2xl font-bold text-brand-primary">{stats.totalArticles}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Events</p>
              <p className="text-2xl font-bold text-brand-primary">{stats.totalEvents}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-primary">Recent Users</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    user.role === 'business' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{user.joinDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-primary">Recent Businesses</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentBusinesses.map(business => (
              <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{business.name}</p>
                  <p className="text-sm text-gray-600">{business.owner}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    business.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {business.status}
                  </span>
                  {business.featured && (
                    <p className="text-xs text-blue-600 mt-1">Featured</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-brand-primary">User Management</h3>
        <Button icon={Plus}>Add User</Button>
      </div>

      <div className="flex space-x-4">
        <Input placeholder="Search users..." icon={Search} className="flex-1" />
        <Button variant="outline" icon={Filter}>Filter</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.role === 'business' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" icon={Eye} />
                      <Button variant="ghost" size="sm" icon={Edit} />
                      <Button variant="ghost" size="sm" icon={Trash2} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-primary">Admin Dashboard</h1>
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
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'businesses' && (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Business Management</h3>
                <p className="text-gray-500">Manage business listings, approvals, and features.</p>
              </div>
            )}
            {activeTab === 'content' && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Content Management</h3>
                <p className="text-gray-500">Manage news articles, announcements, and content.</p>
              </div>
            )}
            {activeTab === 'events' && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Event Management</h3>
                <p className="text-gray-500">Manage community events and activities.</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">System Settings</h3>
                <p className="text-gray-500">Configure system settings and preferences.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;