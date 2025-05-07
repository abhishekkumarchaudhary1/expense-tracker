'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage({ searchParams }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ResetPasswordForm token={searchParams?.token} />
    </div>
  );
} 