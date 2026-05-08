import type { Metadata } from 'next';
import '@/app/globals.css';
export const metadata: Metadata = { title: 'NEXUS CAPITAL — Trading Intelligence', description: 'Institutional trading platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
