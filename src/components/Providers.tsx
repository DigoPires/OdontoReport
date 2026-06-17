'use client';

import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/contexts/ToastContext';

const ToastContainer = dynamic(() => import('./ToastContainer.client'), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </SessionProvider>
  );
}
