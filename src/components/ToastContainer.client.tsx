'use client';

import React from 'react';
import Toast from '@/components/Toast';
import { useToast } from '@/contexts/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-root">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
