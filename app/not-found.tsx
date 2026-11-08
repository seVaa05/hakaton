import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return <main className="container py-24 text-center">
    <div className="eyebrow">GREŠKA 404</div>
    <h1 className="heading mt-3">Stranica nije pronađena</h1>
    <p className="muted mt-4">Proverite adresu ili se vratite na početnu stranicu.</p>
    <Link href="/" className="btn btn-primary mt-8"><ArrowLeft size={16}/> Nazad na početnu</Link>
  </main>;
}
