import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import AuthLayout from './AuthLayout';

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      await signup(data.email, data.username, data.password);
      toast.success(
        'Signup successful! Please check your email to verify your account.'
      );
      navigate('/verify-email');
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          toast.error(error.response.data.detail);
        } else {
          toast.error('An error occurred during signup');
        }
      } else {
        toast.error('Signup failed. Please try again.');
        console.error('Signup error:', error);
      }
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      linkTo="/login"
      linkText="Sign In"
      promptText="Already have an account?"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            htmlFor="username"
            className="block text-sm font-medium text-text-secondary"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className={`mt-1 block w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-sm shadow-sm placeholder-slate-400
            focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
            ${errors.username ? 'border-danger' : ''}`}
          />
          {errors.username && (
            <p className="mt-2 text-sm text-danger">
              {errors.username.message}
            </p>
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
            autoComplete="new-password"
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
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text-secondary"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={`mt-1 block w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-sm shadow-sm placeholder-slate-400
            focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
            ${errors.confirmPassword ? 'border-danger' : ''}`}
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-button-text bg-button hover:bg-button-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
