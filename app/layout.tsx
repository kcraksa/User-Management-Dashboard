import '@styles/globals.css';
import { ConfigProvider } from 'antd';
import theme from '@/theme/ant-theme-config';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import NextAuthProvider from './providers/NextAuthProvider';

export const metadata = {
  title: 'Gunanusa - Document Management System',
  description: 'Document Management System by Gunanusa',
};

export default function RootLayout({
  children,
}: {
  // eslint-disable-next-line no-undef
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <NextAuthProvider>{children}</NextAuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
