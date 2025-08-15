import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building,
  Phone,
  Globe,
  MapPin,
  Users,
  Shield
} from 'lucide-react';
import { UserRole } from '../../types';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessWebsite?: string;
}

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useSupabaseAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    businessWebsite: ''
  });

  const validateForm = () => {
    if (!selectedRole) {
      setError('Please select an account type');
      return false;
    }

    if (!formData.email || !formData.password || !formData.name) {
      setError('Email, password, and name are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (selectedRole === 'business') {
      if (!formData.businessName) {
        setError('Business name is required for business accounts');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: selectedRole,
        phone: formData.phone || undefined,
        businessName: selectedRole === 'business' ? formData.businessName : undefined,
        businessDescription: selectedRole === 'business' ? formData.businessDescription : undefined,
        businessAddress: selectedRole === 'business' ? formData.businessAddress : undefined,
        businessWebsite: selectedRole === 'business' ? formData.businessWebsite : undefined,
      };

      console.log('Submitting registration for:', {
        email: registerData.email,
        role: registerData.role,
        hasBusinessData: selectedRole === 'business' && !!registerData.businessName
      });

      const result = await register(registerData);
      
      if (result) {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        
        // Navigate to verification page immediately
        setTimeout(() => {
          navigate({ to: '/auth/verify-email', search: { email: formData.email, role: selectedRole } });
        }, 2000); // Give more time to show the success message
      } else {
        setError('Registration failed. Please check if the email is already in use or try again.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'user':
        return {
          icon: Users,
          title: 'Personal Account',
          description: 'Explore and discover amazing places in Doral',
          color: 'from-green-500 to-green-600',
          borderColor: 'border-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case 'business':
        return {
          icon: Building,
          title: 'Business Owner',
          description: 'Manage your business listings and connect with customers',
          color: 'from-blue-500 to-blue-600',
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700'
        };
      case 'admin':
        return {
          icon: Shield,
          title: 'Administrator',
          description: 'Manage platform content and users',
          color: 'from-red-500 to-red-600',
          borderColor: 'border-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      default:
        return getRoleInfo('user');
    }
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleSwitchToLogin = () => {
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 text-brand-secondary hover:text-brand-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
          
          <h2 className="text-3xl font-bold text-brand-primary">
            Create Your Account
          </h2>
          <p className="mt-2 text-gray-600">
            Join the Doral Downtown community
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {!selectedRole && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Account Type</h3>
              <p className="text-gray-600">Select the option that best describes you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {(['user', 'business', 'admin'] as UserRole[]).map((role) => {
                const roleInfo = getRoleInfo(role);
                const IconComponent = roleInfo.icon;
                
                return (
                  <div
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        {roleInfo.title}
                      </h4>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {roleInfo.description}
                      </p>
                      
                      <button className={`w-full bg-gradient-to-r ${roleInfo.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}>
                        Select {roleInfo.title}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {selectedRole && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            {/* Selected Role Display */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {(() => {
                    const roleInfo = getRoleInfo(selectedRole);
                    const IconComponent = roleInfo.icon;
                    return (
                      <>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{roleInfo.title}</h3>
                          <p className="text-gray-600">{roleInfo.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="(305) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-600" />
                  Account Information
                </h4>
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                          placeholder="Create password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information (only for business accounts) */}
              {selectedRole === 'business' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-gray-600" />
                    Business Information
                  </h4>
                  <div className="space-y-6">
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                          placeholder="Enter your business name"
                          required
                        />
                      </div>
                    </div>

                    {/* Business Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description
                      </label>
                      <textarea
                        value={formData.businessDescription}
                        onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        placeholder="Describe your business..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Business Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.businessAddress}
                            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            placeholder="Business address"
                          />
                        </div>
                      </div>

                      {/* Business Website */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.businessWebsite}
                            onChange={(e) => setFormData({ ...formData, businessWebsite: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            placeholder="https://yourbusiness.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${getRoleInfo(selectedRole).color} text-white py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Creating Account...' : `Create ${getRoleInfo(selectedRole).title}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={handleSwitchToLogin}
              className="text-brand-primary hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}