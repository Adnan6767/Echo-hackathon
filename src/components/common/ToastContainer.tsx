import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast, type ToastVariant } from '../../hooks/useToast';

const variantStyles: Record<ToastVariant, { icon: typeof CheckCircle2; color: string; border: string }> = {
  success: { icon: CheckCircle2, color: 'text-[#40C98A]', border: 'border-[#40C98A]/30' },
  warning: { icon: AlertTriangle, color: 'text-[#E8B75B]', border: 'border-[#E8B75B]/30' },
  error: { icon: XCircle, color: 'text-[#E56D65]', border: 'border-[#E56D65]/30' },
  info: { icon: Info, color: 'text-[#FF7139]', border: 'border-[#FF7139]/30' },
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = variantStyles[toast.variant];
          const Icon = style.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto bg-[#1B1B1B] border ${style.border} rounded-xl px-4 py-3.5 shadow-2xl flex items-start gap-3`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.color}`} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F5F0E8]">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-[#929292] mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-[#929292] hover:text-[#F5F0E8] p-1 rounded-md transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
