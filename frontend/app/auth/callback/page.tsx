'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        // Store token in localStorage for static site
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', userStr);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error storing auth data:', error);
        router.push('/auth/signin?error=auth_failed');
      }
    } else {
      // No token or user data, redirect to signin
      router.push('/auth/signin?error=missing_data');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
