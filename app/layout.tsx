import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export const metadata: Metadata = { title:'DESIQ — Where Ideas Become Skills', description:'Explore seven worlds of practical learning. Learn by building, solve real-world challenges and grow your skills with DESIQ.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
