import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'RAPTOR LAB', description: 'Propulsion Engineering' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
