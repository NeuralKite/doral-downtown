import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const Route = createFileRoute('/auth/confirm')({
  component: ConfirmPage,
});

function ConfirmPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type = (params.get('type') || 'email') as 'email' | 'signup';

    const verify = async () => {
      if (tokenHash) {
        try {
          await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        } catch (err) {
          console.error('Error verifying email:', err);
        }
      }
      navigate({ to: '/auth/verify-email' });
    };

    verify();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Confirming your email...</p>
    </div>
  );
}

export default ConfirmPage;
