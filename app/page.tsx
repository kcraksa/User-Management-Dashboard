'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthPayload } from '@/lib/auth';
import { Spin } from 'antd';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // perform synchronous cookie check but keep a loading state so UI doesn't jump
    const auth = getAuthPayload();
    if (auth && auth.token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
    // in case navigation doesn't happen immediately, hide spinner
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Spin tip="Checking session..." />
      </div>
    );
  }

  return null;
}
