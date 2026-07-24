import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cx, uniqueId } from '../../lib/utils';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_ICON = { success: CheckCircle2, error: AlertTriangle, info: Info };
const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'border-success-500/30 text-success-700',
  error: 'border-danger-500/30 text-danger-700',
  info: 'border-primary-500/30 text-primary-700',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = uniqueId('toast');
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
          {toasts.map((toast) => {
            const Icon = TONE_ICON[toast.tone];
            return (
              <div
                key={toast.id}
                className={cx(
                  'flex items-start gap-2.5 rounded-lg border bg-white px-4 py-3 shadow-sm',
                  TONE_CLASSES[toast.tone],
                )}
              >
                <Icon size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-body-sm text-ink-700">{toast.message}</p>
                <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="text-ink-400 hover:text-ink-600">
                  <X size={14} strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
