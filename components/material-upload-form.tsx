'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import type { Subject } from '@/lib/data';

const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function MaterialUploadForm({ subjects, initialSubject }: { subjects: Subject[]; initialSubject: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE_BYTES ||
        file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Izaberite PDF datoteku veličine do 20 MB.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/materials/upload', { method: 'POST', body: form });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || 'Otpremanje nije uspelo.');
      formRef.current?.reset();
      setSubjectId(initialSubject);
      setSuccess('Materijal je otpremljen i uskoro će se pojaviti na listi.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Otpremanje nije uspelo.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="card p-6 sm:p-8 mt-9" aria-labelledby="upload-heading">
    <div className="flex items-start gap-4">
      <div className="icon-box mint shrink-0"><Upload size={22} /></div>
      <div>
        <h2 id="upload-heading" className="text-xl font-bold">Podelite materijal</h2>
        <p className="muted text-sm mt-1">Otpremite PDF za izabrani predmet. Najveća veličina je 20 MB.</p>
      </div>
    </div>
    <form ref={formRef} onSubmit={submit} className="grid sm:grid-cols-2 gap-4 mt-6">
      <div>
        <label className="label" htmlFor="upload-subject">Predmet</label>
        <select id="upload-subject" name="subjectId" className="field" value={subjectId} onChange={event => setSubjectId(event.target.value)} required disabled={busy}>
          <option value="">Izaberite predmet</option>
          {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="upload-title">Naslov</label>
        <input id="upload-title" name="title" className="field" required minLength={3} maxLength={160} disabled={busy} placeholder="Naziv materijala" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="upload-description">Opis</label>
        <textarea id="upload-description" name="description" className="field min-h-24" maxLength={2000} disabled={busy} placeholder="Kratak opis materijala" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="upload-file">PDF datoteka</label>
        <input id="upload-file" name="file" type="file" accept="application/pdf,.pdf" className="field" required disabled={busy} />
      </div>
      <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={busy || subjects.length === 0}>
          <Upload size={16} /> {busy ? 'Otpremanje u toku...' : 'Otpremi materijal'}
        </button>
        {busy && <span className="muted text-sm" role="status">Sačekajte da se PDF sačuva.</span>}
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        {success && <p className="text-sm text-[#007c72]" role="status">{success}</p>}
      </div>
    </form>
  </section>;
}
