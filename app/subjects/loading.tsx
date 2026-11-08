export default function SubjectsLoading() {
  return <main className="container pt-12" role="status" aria-label="Učitavanje predmeta">
    <div className="eyebrow">VAŠ PUT KROZ STUDIJE</div>
    <h1 className="heading mt-2">Istražite predmete</h1>
    <p className="muted mt-3">Učitavanje predmeta...</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-9">
      {[0, 1, 2].map(value => <div key={value} className="card p-6 h-52 animate-pulse bg-[#f7faf8]" />)}
    </div>
  </main>;
}
