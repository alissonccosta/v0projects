import { createContext, ReactNode, useCallback, useState } from 'react';
import Toast from '../components/ui/Toast';

interface ToastData { id: number; text: string; }

interface ToastContextData {
  showToast: (text: string) => void;
}

export const ToastContext = createContext<ToastContextData>({
  showToast: () => {}
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text }]);
  }, []);

  const remove = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <Toast key={t.id} message={t.text} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
