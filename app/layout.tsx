import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
export const metadata: Metadata = { title: 'Učimo — Učite bolje zajedno', description: 'Pronađite materijale, pitanja sa prethodnih ispita i testove za vežbanje za sve godine studija.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sr"><body><Header />{children}<Footer /></body></html>;
}
