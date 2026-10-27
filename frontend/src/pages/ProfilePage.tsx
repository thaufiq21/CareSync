import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profileApi, extractError } from '@/services/api';
import { Card, Input, Select, Button, Alert } from '@/components/ui';
import { User, Shield, Globe, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser, setLanguage, t } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferred_language || 'en');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    try {
      await profileApi.update({
        name: name.trim(),
        preferred_language: preferredLanguage,
      });
      setLanguage(preferredLanguage as any);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{t('profile')}</h1>
        <p className="text-text-secondary mt-1">Manage personal preferences and language settings.</p>
      </div>

      <Card>
        {error && <Alert type="error" className="mb-4"><span>{error}</span></Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('fullName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">{t('email')}</label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-text-secondary">Email addresses cannot be changed directly in the demo.</p>
          </div>

          <Select
            label={t('preferredLanguage')}
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value as any)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'ta', label: 'தமிழ் (Tamil)' },
            ]}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={isUpdating}>
              <Check className="w-4 h-4 mr-1" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-teal-600" /> Account Role & Security
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Logged in as: <strong className="capitalize text-navy-500">{user?.role}</strong>.
          Role privilege boundaries are strictly enforced on all backend endpoints.
        </p>
      </Card>
    </div>
  );
}
