import type { Metadata } from 'next';
import '@/app/globals.css';
export const metadata: Metadata = { title: 'MERIDIAN HEALTH — Hospital Operations', description: 'Hospital management system' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
