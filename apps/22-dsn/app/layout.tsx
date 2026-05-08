import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DEEP SPACE', description: 'Ground Station Network' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
