import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/auth';
import { SessionProvider } from '@/src/components/SessionProvider';
import { ImpersonationBanner } from '@/src/components/ImpersonationBanner';

export const metadata: Metadata = {
  title: 'PV Manager',
  description: 'Solar Stats rewrite workspace',
  viewport: 'width=device-width, initial-scale=1',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <ImpersonationBanner />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
