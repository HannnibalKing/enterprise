import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'ARTEMIS OPS', description: 'Crew Operations' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
