import '@styles/globals.css';
import ClientProviders from './ClientProviders';

export const metadata = {
  title: 'Gunanusa - Access Management System',
  description: 'Access Management System by Gunanusa',
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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
