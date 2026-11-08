export default function MaterialsLoading() {
  return <main className="container pt-12" role="status" aria-label="Učitavanje materijala">
    <div className="eyebrow">DELIMO ZNANJE</div>
    <h1 className="heading mt-2">Materijali za učenje</h1>
    <p className="muted mt-3">Učitavanje materijala...</p>
    <div className="grid md:grid-cols-2 gap-5 mt-9">
      {[0, 1].map(value => <div key={value} className="card p-6 h-56 animate-pulse bg-[#f7faf8]" />)}
    </div>
  </main>;
}
