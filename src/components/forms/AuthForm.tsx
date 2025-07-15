import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button, Input, Card } from '../ui';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  loading = false,
  error,
  success
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Card className="max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-brand-primary">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="mt-2 text-gray-600">
          {type === 'login' 
            ? 'Sign in to your Doral Downtown account'
            : 'Join the Doral Downtown community'
          }
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            icon={User}
            placeholder="Enter your full name"
            required
          />
        )}

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          icon={Mail}
          placeholder="Enter your email"
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            icon={Lock}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {type === 'register' && (
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            icon={Lock}
            placeholder="Confirm your password"
            required
          />
        )}

        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
        >
          {type === 'login' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      {type === 'login' && (
        <div className="mt-4 text-center">
          <button className="text-sm text-brand-primary hover:underline">
            Forgot your password?
          </button>
        </div>
      )}
    </Card>
  );
};

export default AuthForm;