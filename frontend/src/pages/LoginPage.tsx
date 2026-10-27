import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input, Button, Alert } from '@/components/ui';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { extractError } from '@/services/api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(t('loginError'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold text-navy-500">Care<span className="text-teal-500">Sync</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-text-primary mb-6">{t('loginTitle')}</h1>

          {/* Demo hints */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-700">
            <p className="font-semibold mb-1">Demo accounts:</p>
            <p>Patient: patient1@caresync.demo / Patient@12345</p>
            <p>Staff: staff1@caresync.demo / Staff@12345</p>
            <p>Admin: admin@caresync.demo / Admin@12345</p>
          </div>

          {error && <Alert type="error" className="mb-4"><span>{error}</span></Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
                autoComplete="current-password"
                required
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-8 text-text-secondary hover:text-text-primary"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
              {t('login')}
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-teal-600 font-medium hover:underline">{t('register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
