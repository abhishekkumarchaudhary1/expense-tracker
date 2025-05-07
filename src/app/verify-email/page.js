'use client';

import { Suspense } from 'react';
import EmailVerification from './EmailVerification';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center py-4">
            <p className="text-gray-600">Loading verification...</p>
          </div>
        </div>
      }>
        <EmailVerification />
      </Suspense>
    </div>
  );
} 