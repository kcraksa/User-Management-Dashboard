'use client';
import { useState } from 'react';
import { Button, Card, Input, Typography, Divider, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/store';
import styles from './style.module.scss';
import Image from 'next/image';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Use next-auth credentials provider to validate against backend
      const response = await signIn('credentials', {
        redirect: false,
        username,
        password,
      } as any);

      if (!response || response.error) {
        setError(response?.error || 'Login gagal. Periksa kredensial.');
        setLoading(false);
        return;
      }

      // fetch session to get user and token from callbacks
      const session = await getSession();
      const user = session?.user || { username };
      const token = (session as any)?.accessToken || null;

      // update local store for compatibility (optional)
      login({ user, token });

      router.push('/dashboard');
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-bg']}>
      <Card
        className={styles['login-card']}
        bordered={false}
        bodyStyle={{ padding: 32 }}
        style={{ position: 'relative' }}
      >
        {loading && (
          <div
            aria-hidden={!loading}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.72)',
              borderRadius: 18,
              zIndex: 20,
            }}
          >
            <Spin size="large" tip="Masuk..." />
          </div>
        )}
        <div className={styles['login-logo-container']}>
          {/* Dummy Logo */}
          <div>
            <Image
              src={'/images/front-trans.png'}
              alt="Logo"
              width={100}
              height={100}
            />
          </div>
          <Title level={3} className={styles['login-title']}>
            Documents Management System
          </Title>
          <Text className={styles['login-subtitle']}>
            Enterprise Backoffice
          </Text>
        </div>
        <Divider style={{ margin: '16px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            placeholder="Username"
            size="large"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ borderRadius: 8 }}
            autoFocus
            disabled={loading}
          />
          <Input.Password
            placeholder="Password"
            size="large"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ borderRadius: 8 }}
            disabled={loading}
          />
          {error && (
            <Text type="danger" style={{ textAlign: 'center' }}>
              {error}
            </Text>
          )}
          <Button
            type="primary"
            block
            size="large"
            className={styles['login-btn']}
            onClick={handleLogin}
            loading={loading}
            disabled={loading}
          >
            Login
          </Button>
        </div>
        <Divider style={{ margin: '24px 0 8px 0' }} />
        <Text className={styles['login-footer']}>© 2025 Gunanusa</Text>
      </Card>
    </div>
  );
}
