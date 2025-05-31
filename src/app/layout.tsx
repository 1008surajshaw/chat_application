import { cn } from '@/lib/utils';
import Providers from '@/providers/providers';
import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';

const satoshi = localFont({
  display: 'swap',
  src: [
    {
      path: '../../public/fonts/satoshi.ttf',
    },
  ],
  variable: '--font-satoshi',
});

export const metadata: Metadata = {
  title: 'chat',
  description: 'chat',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          'font-satoshi antialiased bg-gradient-light dark:bg-gradient min-h-screen relative flex flex-col',
          satoshi.variable
        )}
      >
        <Providers>
          <main className="h-full w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}