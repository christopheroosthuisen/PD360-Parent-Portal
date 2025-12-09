
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 animate-in slide-in-from-top-4 fade-in duration-300 ${
      type === 'error' 
        ? 'bg-rose-50 border-rose-200 text-rose-800' 
        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }`}>
      {type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
      <div>
        <h4 className="font-impact uppercase tracking-wide text-sm">{type === 'error' ? 'Error' : 'Success'}</h4>
        <p className="font-medium text-sm">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};
