'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ExpenseProvider } from '@/contexts/ExpenseContext';

export default function Providers({ children }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true}
    >
      <AuthProvider>
        <ExpenseProvider>
          {children}
        </ExpenseProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 