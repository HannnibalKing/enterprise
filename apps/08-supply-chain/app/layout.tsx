import type { Metadata } from 'next';
import '@/app/globals.css';
export const metadata:Metadata={title:'ATLAS CHAIN — Global Supply Chain',description:'Supply chain visibility platform'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
