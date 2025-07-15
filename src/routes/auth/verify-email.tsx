import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const searchSchema = z.object({
  email: z.string().optional().default(''),
  token: z.string().optional().default(''),
  role: z.string().optional().default('')
});

export const Route = createFileRoute('/auth/verify-email')({
  component: EmailVerificationPage,
  validateSearch: searchSchema,
});

function EmailVerificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { email, token, role } = useSearch({ from: '/auth/verify-email' });
  const { resendVerification } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    // Track time spent on verification page
    const timeTracker = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timeTracker);
  }, []);

  useEffect(() => {
    // Check if user is already authenticated (email was verified)
    const checkAuthStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          return;
        }
        
        if (session?.user) {
          // Check if user has a profile (email is verified and profile created)
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile) {
            setIsVerified(true);
            setMessage('✅ Email verified successfully! Welcome to Doral Downtown!');
            setMessageType('success');
            
            // Wait at least 3 seconds before redirecting so user can see the success message
            const minWaitTime = Math.max(3000 - (timeSpent * 1000), 1000);
            setTimeout(() => {
              navigate({ to: '/' });
            }, minWaitTime);
          }
        }
      } catch (error) {
        console.error('Error in checkAuthStatus:', error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Listen for auth state changes (when email verification completes)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // Wait a moment for the profile to be created by the trigger
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (profile) {
              setIsVerified(true);
              setMessage('✅ Email verified successfully! Welcome to Doral Downtown!');
              setMessageType('success');
              
              // Ensure user sees success message for at least 3 seconds
              const minWaitTime = Math.max(3000 - (timeSpent * 1000), 1000);
              setTimeout(() => {
                navigate({ to: '/' });
              }, minWaitTime);
            }
          }, 1000); // Wait 1 second for profile creation
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check URL parameters for automatic verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenHash = urlParams.get('token_hash') || urlParams.get('access_token');
    const type = urlParams.get('type');
    
    if (tokenHash && (type === 'email' || type === 'signup')) {
      // Supabase will handle this automatically, just show a message
      setMessage('Verifying your email...');
      setMessageType('success');
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('Email address is required to resend verification.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await resendVerification(email);
      if (result) {
        setMessage('Verification email sent successfully!');
        setMessageType('success');
        setCountdown(60); // 60 second cooldown
      } else {
        setMessage('Failed to send verification email.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 text-brand-secondary hover:text-brand-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-brand-primary">
            Check Your Email
          </h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification link to
          </p>
          {email && (
            <div className="mt-2">
              <p className="font-medium text-brand-primary">
                {email}
              </p>
              {role && (
                <p className="text-sm text-gray-500 mt-1">
                  Account type: <span className="capitalize font-medium">{role}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                messageType === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message}
              </span>
            </div>
          )}

          {!isVerified && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
              </p>
              
              {timeSpent > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    ⏱️ Time on this page: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Take your time to check your email thoroughly
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  ¿No recibiste el email?
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Revisa tu carpeta de spam o correo no deseado</li>
                  {email && <li>• Asegúrate de que {email} sea correcto</li>}
                  <li>• La entrega del email puede tomar 1-5 minutos</li>
                  <li>• Algunos proveedores de email pueden demorar más</li>
                </ul>
              </div>

              {/* Resend Button */}
              {email && (
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading || countdown > 0}
                  className="w-full bg-brand-primary text-white py-3 rounded-lg hover:bg-brand-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : countdown > 0 ? (
                    <span>Reenviar en {countdown}s</span>
                  ) : (
                    timeSpent >= 30 ? ( // Only show resend after 30 seconds
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Reenviar Email de Verificación</span>
                    </>
                    ) : (
                      <span>Espera {30 - timeSpent}s para reenviar</span>
                    )
                  )
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Help */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="#contact" className="text-brand-primary hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}