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
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-slate-800 dark:bg-slate-700',
  };

  return (
    <div className={`fixed bottom-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-xl animate-in slide-in-from-bottom-4 ${colors[type]}`}>
      {type === 'success' ? <CheckCircleIcon className="w-4 h-4" /> : type === 'error' ? <ExclamationCircleIcon className="w-4 h-4" /> : <InformationCircleIcon className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
