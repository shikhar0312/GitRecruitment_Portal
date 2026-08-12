import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { loginSchema, type LoginFormValues } from '../../../schemas/auth.schema';
import { useLogin, getLoginErrorMessage } from '../hooks/useLogin';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';

const DEV_DEFAULT_CREDENTIALS: LoginFormValues = {
  email: 'admin@gitrecruitment.com',
  password: 'Admin@123',
};

export const LoginPage: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [formData, setFormData] = useState<LoginFormValues>(DEV_DEFAULT_CREDENTIALS);
  const [validationError, setValidationError] = useState('');

  const loginMutation = useLogin();

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    loginMutation.mutate(parsed.data);
  };

  const errorMessage =
    validationError ||
    (loginMutation.isError ? getLoginErrorMessage(loginMutation.error) : '');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background absolute inset-0">
      <div className="absolute top-6 left-6">
        <Link
          to="/worktracker-app"
          className="flex items-center gap-2 px-4 py-2 bg-surface shadow-sm border border-outline-variant rounded-md text-primary hover:bg-primary-container/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">work</span>
          <span className="font-semibold text-sm">Open WorkTracker</span>
        </Link>
      </div>
      <div className="bg-surface-container-lowest p-8 rounded-brand shadow-sm border border-outline-variant w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-brand flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">rocket_launch</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            GIT Tech Portal
          </h1>
          <p className="text-on-surface-variant font-body-sm mt-1">
            Sign in to your enterprise account
          </p>
        </div>

        <ErrorAlert message={errorMessage} className="mb-4" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary text-on-primary py-2 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
