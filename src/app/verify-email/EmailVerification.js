'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function EmailVerification() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Verification token is missing. Please check your email link.');
          setLoading(false);
          return;
        }

        const result = await verifyEmail(token);
        
        if (result.success) {
          setSuccess(result.message || 'Email verified successfully! You can now log in.');
        } else {
          setError(result.error || 'Failed to verify email. Please try again.');
        }
      } catch (err) {
        setError('An error occurred during verification. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, verifyEmail]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Email Verification</h1>
      
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Link 
          href="/auth/login" 
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
} 