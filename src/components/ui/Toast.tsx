'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      {/* บนมือถือต้องยกให้พ้นแถบเมนูล่าง (80px) และ home indicator ของ iPhone */}
      <div
        className="toast-stack fixed right-4 md:right-6 left-4 md:left-auto z-[100] flex flex-col gap-2 items-stretch md:items-end"
        style={{ bottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = {
    success: { icon: CheckCircle, className: 'bg-[var(--success-container)] border-[var(--success)]/20 text-[var(--success)]' },
    error:   { icon: XCircle,    className: 'bg-[var(--error-container)]   border-[var(--error)]/20   text-[var(--error)]' },
    warning: { icon: AlertTriangle, className: 'bg-[var(--warning-container)] border-[var(--warning)]/20 text-[var(--warning)]' },
    info:    { icon: Info,       className: 'bg-[var(--info-container)]    border-[var(--info)]/20    text-[var(--info)]' },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
      animate-fade-in-up w-full md:min-w-[280px] md:w-auto max-w-sm ${config.className}`}
      style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1 text-[var(--on-surface)]">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)}
        className="p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
