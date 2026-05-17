import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <Icon className="w-12 h-12 text-cine-text-muted/40 stroke-[1.25] mb-4" />
      <h3 className="text-xl font-bold uppercase tracking-wider text-cine-text-primary mb-2 font-heading">{title}</h3>
      <p className="text-xs text-cine-text-secondary max-w-sm mb-6 leading-relaxed font-medium">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-cine-accent hover:bg-opacity-95 text-cine-bg font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded transition-all"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
