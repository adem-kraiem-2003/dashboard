'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DashboardToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function DashboardToast({ message, type, onClose }: DashboardToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-slate-800 dark:bg-slate-700',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`fixed bottom-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-xl animate-in slide-in-from-bottom-4 ${colors[type]}`}
    >
      {type === 'success' ? (
        <CheckCircleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : type === 'error' ? (
        <ExclamationCircleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <InformationCircleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Fermer la notification"
        className="ml-2 opacity-70 hover:opacity-100 focus:opacity-100 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <XMarkIcon className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
