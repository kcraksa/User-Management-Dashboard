'use client';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useProtectedRoute() {
  const { status } = useSession();
  // while loading, do nothing (component can show loading state)
  if (status === 'loading') return;
  if (status === 'unauthenticated') {
    redirect('/login');
  }
}