export default function AiQuizLoading() {
  return <main className="container pt-12" role="status" aria-label="Učitavanje PDF materijala">
    <div className="eyebrow">UČITE IZ SVOJIH MATERIJALA</div>
    <h1 className="heading mt-2">AI test iz PDF-a</h1>
    <p className="muted mt-3">Učitavanje materijala...</p>
    <div className="card max-w-3xl mx-auto mt-10 p-8 h-72 animate-pulse bg-[#f7faf8]" />
  </main>;
}
