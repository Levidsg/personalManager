import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import './globals.css';
import { AppShell } from '@/components/shell/app-shell';
import { getPendencias } from '@/features/pendencias/queries';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Controle',
  description: 'Controle financeiro pessoal e estúdio freelancer.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Controle',
  },
  icons: {
    apple: '/icons/icon-192.svg',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const aparenciaCookie = cookieStore.get('controle_aparencia')?.value;
  const aparencia =
    aparenciaCookie === 'claro' || aparenciaCookie === 'escuro'
      ? aparenciaCookie
      : undefined;

  // Não aguarda: o ponto/aviso de pendências carrega em paralelo, sem segurar a página.
  const pendencias = getPendencias().catch((erro: unknown) => {
    console.error('[pendencias]', erro);
    return [];
  });

  return (
    <html
      lang="pt-BR"
      className={inter.variable}
      data-aparencia={aparencia}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <AppShell pendencias={pendencias}>{children}</AppShell>
      </body>
    </html>
  );
}
