'use client';

import React from 'react';
import { SWRConfig } from 'swr';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import theme from '@/theme/ant-theme-config';
import NextAuthProvider from './providers/NextAuthProvider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      <AntdRegistry>
        <ConfigProvider theme={theme}>
          <NextAuthProvider>{children}</NextAuthProvider>
        </ConfigProvider>
      </AntdRegistry>
    </SWRConfig>
  );
}
