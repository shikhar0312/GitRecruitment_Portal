import React, { useEffect, useState } from 'react';
import { useToastStore, type Toast } from '../../store/toastStore';

const VARIANT_STYLES: Record<
  Toast['variant'],
  { bar: string; icon: string; iconColor: string }
> = {
  success: { bar: 'bg-green-600', icon: 'check_circle', iconColor: 'text-green-600' },
  error: { bar: 'bg-error', icon: 'error', iconColor: 'text-error' },
  info: { bar: 'bg-primary', icon: 'info', iconColor: 'text-primary' },
};

// A single toast: mounts hidden, slides in, auto-dismisses after its duration,
// and animates out before the store actually removes it.
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const styles = VARIANT_STYLES[toast.variant];

  const close = () => {
    setVisible(false);
    // Wait out the exit transition before removing from the store.
    window.setTimeout(() => onDismiss(toast.id), 200);
  };

  useEffect(() => {
    // Trigger the enter transition on the next frame.
    const raf = requestAnimationFrame(() => setVisible(true));
    let timer: number | undefined;
    if (toast.duration > 0) {
      timer = window.setTimeout(close, toast.duration);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <div className={`w-1 self-stretch shrink-0 ${styles.bar}`} aria-hidden="true" />
      <span className={`material-symbols-outlined mt-3 ${styles.iconColor}`} aria-hidden="true">
        {styles.icon}
      </span>
      <p className="flex-1 py-3 text-sm text-on-surface pr-1">{toast.message}</p>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss notification"
        className="p-2 mt-1 mr-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-variant/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

export const ToastViewport: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
};
