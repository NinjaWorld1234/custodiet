import React from 'react';
import { useAppStore } from '../../store';
import { ToastMessage, ToastType } from '../../types';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
    case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'info': return <Info className="w-5 h-5 text-primary-500" />;
  }
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  return (
    <div className={clsx(
      "pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-lg bg-white ring-1 ring-black ring-opacity-5 shadow-lg transition-all animate-slide-in-right mb-3",
      "rtl:animate-slide-in-left"
    )}>
      <div className="p-4 flex items-start gap-3 w-full">
        <div className="shrink-0 mt-0.5">
          <ToastIcon type={toast.type} />
        </div>
        <div className="flex-1 w-0">
          {toast.title && <p className="text-sm font-medium text-slate-900">{toast.title}</p>}
          <p className="mt-1 text-sm text-slate-500 leading-tight">{toast.message}</p>
        </div>
        <div className="ml-4 flex shrink-0">
          <button
            onClick={() => onRemove(toast.id)}
            className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div aria-live="assertive" className="pointer-events-none fixed inset-0 flex flex-col items-end px-4 py-6 sm:items-start sm:p-6 z-[60]">
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
};