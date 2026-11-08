'use client';

export default function AiQuizError({ reset }: { reset: () => void }) {
  return <main className="container pt-12">
    <div className="card p-8 text-center" role="alert">
      <h1 className="subheading">AI test trenutno nije dostupan</h1>
      <p className="muted mt-3">Materijali nisu mogli da se učitaju. Pokušajte ponovo.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Pokušaj ponovo</button>
    </div>
  </main>;
}
