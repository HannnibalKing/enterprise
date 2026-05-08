import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'PALAZZO NEXUS — Casino Intelligence Platform',
  description: 'Enterprise casino operations platform for Palazzo Las Vegas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
