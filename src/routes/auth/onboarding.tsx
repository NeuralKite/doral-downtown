import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const searchSchema = z.object({
  role: z.string().optional(),
  name: z.string().optional(),
});

export const Route = createFileRoute('/auth/onboarding')({
  component: OnboardingPage,
  validateSearch: searchSchema,
});

function OnboardingPage() {
  const { user, updateProfile, getRoleBasedRedirectPath } = useSupabaseAuth();
  const navigate = useNavigate();
  const { role: roleFromSearch, name: nameFromSearch } = Route.useSearch();

  const [form, setForm] = useState({
    name: user?.name || nameFromSearch || '',
    phone: user?.phone || '',
    business_name: user?.business_name || '',
    business_description: user?.business_description || '',
    business_address: user?.business_address || '',
    business_website: user?.business_website || '',
  });

  useEffect(() => {
    setForm({
      name: user?.name || nameFromSearch || '',
      phone: user?.phone || '',
      business_name: user?.business_name || '',
      business_description: user?.business_description || '',
      business_address: user?.business_address || '',
      business_website: user?.business_website || '',
    });
  }, [user, nameFromSearch]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isBusiness = (user.role || roleFromSearch) === 'business';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile(form);
    if (ok) {
      const redirect = getRoleBasedRedirectPath(user.role);
      navigate({ to: redirect as never });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 w-full max-w-md">
        <h1 className="text-xl font-semibold text-center">
          {form.name ? `Welcome, ${form.name}!` : 'Complete your profile'}
        </h1>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="border p-2 w-full rounded"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-2 w-full rounded"
        />
        {isBusiness && (
          <>
            <input
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Business Name"
              className="border p-2 w-full rounded"
            />
            <input
              name="business_description"
              value={form.business_description}
              onChange={handleChange}
              placeholder="Business Description"
              className="border p-2 w-full rounded"
            />
            <input
              name="business_address"
              value={form.business_address}
              onChange={handleChange}
              placeholder="Business Address"
              className="border p-2 w-full rounded"
            />
            <input
              name="business_website"
              value={form.business_website}
              onChange={handleChange}
              placeholder="Business Website"
              className="border p-2 w-full rounded"
            />
          </>
        )}
        <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">
          Finish
        </button>
      </form>
    </div>
  );
}

export default OnboardingPage;
