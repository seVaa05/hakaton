export default function QuestionsLoading() {
  return <main className="container pt-12" role="status" aria-label="Učitavanje pitanja">
    <div className="eyebrow">SPREMAJTE SE SA SIGURNOŠĆU</div>
    <h1 className="heading mt-2">Ispitna pitanja</h1>
    <p className="muted mt-3">Učitavanje pitanja...</p>
    <div className="card p-8 mt-9 h-48 animate-pulse bg-[#f7faf8]" />
  </main>;
}
