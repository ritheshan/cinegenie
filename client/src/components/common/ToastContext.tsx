import { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastType } from '../../hooks/useToast';
import ToastContainer from './Toast';

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn('ToastContext was accessed outside of ToastProvider. Actions will fall back gracefully.');
    return {
      addToast: (message: string, type: any = 'info') => {
        console.log(`[Toast Fallback - ${type}]: ${message}`);
      }
    };
  }
  return context;
}
