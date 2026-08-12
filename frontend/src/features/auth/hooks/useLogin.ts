import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api/services/auth.service';
import { useAuthStore } from '../../../store/authStore';
import { isApiError, getApiErrorMessage } from '../../../lib/errors';
import type { LoginFormValues } from '../../../schemas/auth.schema';

function getLoginErrorMessage(error: unknown): string {
  if (isApiError(error) && error.response?.status === 429) {
    return 'Too many login attempts. Please wait 15 minutes before trying again.';
  }
  return getApiErrorMessage(error, 'Login failed. Please check your credentials.');
}

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginFormValues) => login(credentials),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate('/', { replace: true });
    },
  });
}

export { getLoginErrorMessage };
