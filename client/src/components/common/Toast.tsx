import { motion, AnimatePresence } from 'framer-motion';
import { Toast as ToastType } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: number) => void;
}

const typeStyles = {
  success: 'bg-emerald-600/90 border-emerald-500/50 text-emerald-50',
  error: 'bg-red-600/90 border-red-500/50 text-red-50',
  info: 'bg-blue-600/90 border-blue-500/50 text-blue-50',
};

const icons = { success: '✅', error: '❌', info: 'ℹ️' };

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-xl cursor-pointer min-w-[280px] ${typeStyles[toast.type]}`}
            onClick={() => onRemove(toast.id)}
          >
            <span>{icons[toast.type]}</span>
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
