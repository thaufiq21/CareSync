import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input, Button, Alert, Checkbox, Select } from '@/components/ui';
import { Heart, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { extractError } from '@/services/api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
  password_confirm: z.string(),
  preferred_language: z.enum(['en', 'ta']),
  consent: z.boolean().refine(v => v, 'You must agree to continue'),
}).refine(d => d.password === d.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: doRegister, t } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_language: 'en', consent: false },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await doRegister(data);
      toast.success('Account created successfully! Welcome to CareSync.');
      navigate('/dashboard');
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold text-navy-500">Care<span className="text-teal-500">Sync</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-text-primary mb-1">{t('registerTitle')}</h1>
          <p className="text-sm text-text-secondary mb-6">Patient accounts only. Staff accounts are created by administrators.</p>

          {error && <Alert type="error" className="mb-4"><span>{error}</span></Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label={t('fullName')}
              type="text"
              autoComplete="name"
              required
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label={t('email')}
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label={t('password')}
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                hint="Min 8 characters, 1 uppercase, 1 number"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-8 text-text-secondary hover:text-text-primary focus:outline-none"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label={t('confirmPassword')}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              required
              error={errors.password_confirm?.message}
              {...register('password_confirm')}
            />
            <Select
              label={t('preferredLanguage')}
              options={[
                { value: 'en', label: t('english') },
                { value: 'ta', label: t('tamil') },
              ]}
              error={errors.preferred_language?.message}
              {...register('preferred_language')}
            />
            <Checkbox
              label={t('consent')}
              error={errors.consent?.message}
              {...register('consent')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              {t('register')}
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:underline">{t('login')}</Link>
          </p>
        </div>

        <p className="text-center text-xs text-text-secondary mt-6 max-w-sm mx-auto">
          By registering, you acknowledge that CareSync is a student demonstration project and not a real hospital service.
        </p>
      </div>
    </div>
  );
}
