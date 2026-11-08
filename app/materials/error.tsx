'use client';

export default function MaterialsError({ reset }: { reset: () => void }) {
  return <main className="container pt-12">
    <div className="card p-8 text-center" role="alert">
      <h1 className="subheading">Materijali trenutno nisu dostupni</h1>
      <p className="muted mt-3">Učitavanje nije uspelo. Pokušajte ponovo.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Pokušaj ponovo</button>
    </div>
  </main>;
}
