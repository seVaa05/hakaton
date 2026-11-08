'use client';
import Link from 'next/link';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="container py-24 text-center">
    <div className="eyebrow">DOŠLO JE DO GREŠKE</div>
    <h1 className="heading mt-3">Nešto nije u redu</h1>
    <p className="muted mt-4">Pokušajte ponovo ili se vratite na početnu stranicu.</p>
    <div className="flex justify-center gap-3 mt-8"><button className="btn btn-primary" onClick={reset}>Pokušaj ponovo</button><Link href="/" className="btn btn-outline">Nazad na početnu</Link></div>
  </main>;
}
