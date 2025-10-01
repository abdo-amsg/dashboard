import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import AuthLayout from './AuthLayout';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success('Login successful!');
      if (user?.is_superuser) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email before logging in.');
        navigate('/verify-email');
      } else {
        toast.error('Login failed. Please check your credentials.');
        console.error('Login error:', error);
      }
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      linkTo="/signup"
      linkText="Sign Up"
      promptText="Don't have an account?"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register('email')}
            className={`mt-1 block w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-sm shadow-sm placeholder-slate-400
              focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
              ${errors.email ? 'border-danger' : ''}`}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={`mt-1 block w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-sm shadow-sm placeholder-slate-400
            focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
            ${errors.password ? 'border-danger' : ''}`}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-button-text bg-button hover:bg-button-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
