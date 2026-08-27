import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  /** Auto-dismiss after this many ms. 0 keeps it until dismissed. */
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

// Store lives outside React so toasts can be fired from anywhere — including
// mutation onSuccess/onError callbacks that aren't inside a component tree.
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

function show(variant: ToastVariant, message: string, duration?: number) {
  return useToastStore.getState().push({
    variant,
    message,
    duration: duration ?? (variant === 'error' ? ERROR_DURATION : DEFAULT_DURATION),
  });
}

// Terse helper for firing toasts from anywhere: toast.success('Saved').
export const toast = {
  success: (message: string, duration?: number) => show('success', message, duration),
  error: (message: string, duration?: number) => show('error', message, duration),
  info: (message: string, duration?: number) => show('info', message, duration),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
