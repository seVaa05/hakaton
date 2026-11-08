'use client';

import { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

type Counts = { likes: number; dislikes: number; ownVote: 1 | -1 | null };

export function MaterialVote({ materialId }: { materialId: string }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/materials/votes?materialId=${encodeURIComponent(materialId)}`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Glasanje nije dostupno.');
        return data as Counts;
      })
      .then(data => { if (active) setCounts(data); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Glasanje nije dostupno.'); });
    return () => { active = false; };
  }, [materialId]);

  async function vote(value: 1 | -1) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/materials/votes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, vote: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Glas nije sačuvan.');
      setCounts(data as Counts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Glas nije sačuvan.');
    } finally {
      setBusy(false);
    }
  }

  const total = (counts?.likes ?? 0) + (counts?.dislikes ?? 0);
  return <div className="mt-5" aria-label="Ocena korisnosti materijala">
    {counts ? <>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => vote(1)} disabled={busy} aria-pressed={counts.ownVote === 1}
          className={`pill inline-flex items-center gap-1.5 ${counts.ownVote === 1 ? 'active' : ''}`}><ThumbsUp size={15} /> {counts.likes}</button>
        <button type="button" onClick={() => vote(-1)} disabled={busy} aria-pressed={counts.ownVote === -1}
          className={`pill inline-flex items-center gap-1.5 ${counts.ownVote === -1 ? 'active' : ''}`}><ThumbsDown size={15} /> {counts.dislikes}</button>
        <span className="muted text-xs">{total ? `${Math.round(counts.likes / total * 100)}% korisno` : 'Još nema glasova'}</span>
      </div>
      {busy && <span role="status" className="muted text-xs">Čuvanje glasa...</span>}
    </> : !error && <span role="status" className="muted text-xs">Učitavanje glasova...</span>}
    {error && <p role="alert" className="text-xs text-red-700 mt-1">{error}</p>}
  </div>;
}
