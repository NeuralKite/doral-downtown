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
      if (!tokenHash) {
        navigate({ to: '/auth/login' });
        return;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error) {
          console.error('Error verifying email:', error);
          navigate({ to: '/auth/login' });
          return;
        }

        if (data.session) {
          await supabase.auth.setSession(data.session);
        }

        const role = (data.user?.user_metadata?.role as 'user' | 'business') || 'user';
        const name =
          (data.user?.user_metadata?.name as string) ||
          (data.user?.user_metadata?.full_name as string) ||
          '';

        navigate({ to: '/auth/onboarding', search: { role, name } });
      } catch (err) {
        console.error('Error verifying email:', err);
        navigate({ to: '/auth/login' });
      }
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
