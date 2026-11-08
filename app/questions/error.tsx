'use client';

export default function QuestionsError({ reset }: { reset: () => void }) {
  return <main className="container pt-12">
    <div className="card p-8 text-center" role="alert">
      <h1 className="subheading">Pitanja trenutno nisu dostupna</h1>
      <p className="muted mt-3">Proverite Supabase pristup i ponovo pokušajte.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Pokušaj ponovo</button>
    </div>
  </main>;
}
