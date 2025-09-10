'use client';

import { usePathname } from 'next/navigation';

export function usePathnameSafe(): string {
  try {
    return usePathname() || '';
  } catch {
    return '';
  }
}
