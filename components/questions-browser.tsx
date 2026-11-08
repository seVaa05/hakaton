'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import type { ExamQuestion, Subject } from '@/lib/data';

const examLabels = { EXAM: 'Ispit', MIDTERM: 'Kolokvijum', TEST: 'Test' } as const;

export function QuestionsBrowser({ initialQuestions, subjects, initialSubject }: {
  initialQuestions: ExamQuestion[]; subjects: Subject[]; initialSubject: string;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(initialSubject);
  const [examType, setExamType] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [newType, setNewType] = useState<'OPEN' | 'SINGLE_CHOICE'>('SINGLE_CHOICE');
  const [revealed, setRevealed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const visible = initialQuestions.filter(question =>
    (!subject || question.subjectId === subject) &&
    (!examType || question.examType === examType) &&
    `${question.prompt} ${question.options?.join(' ') ?? ''}`.toLocaleLowerCase('sr')
      .includes(search.trim().toLocaleLowerCase('sr'))
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const form = new FormData(event.currentTarget);
    const options = newType === 'SINGLE_CHOICE'
      ? [0, 1, 2, 3].map(index => String(form.get(`option${index}`) ?? '').trim())
      : undefined;
    const body = {
      subjectId: String(form.get('subject') ?? ''),
      examType: String(form.get('examType') ?? ''),
      examDate: String(form.get('examDate') ?? '') || null,
      questionType: newType,
      questionText: String(form.get('prompt') ?? '').trim(),
      ...(newType === 'OPEN'
        ? { correctAnswer: String(form.get('sampleAnswer') ?? '').trim() }
        : { options, correctOption: Number(form.get('correctAnswer')) }),
    };
    setBusy(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || 'Čuvanje pitanja nije uspelo.');
      setOpen(false);
      setSuccess('Pitanje je sačuvano i dostupno svim studentima.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Čuvanje pitanja nije uspelo.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between mt-9">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative sm:max-w-xs flex-1"><Search size={17} className="absolute left-3 top-3.5 text-[#8ca29f]" />
          <input className="field pl-10" placeholder="Pretraži pitanja..." value={search} onChange={event => setSearch(event.target.value)} /></div>
        <select aria-label="Filtriraj po predmetu" className="field sm:w-52" value={subject} onChange={event => setSubject(event.target.value)}>
          <option value="">Svi predmeti</option>{subjects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select aria-label="Filtriraj po tipu ispita" className="field sm:w-40" value={examType} onChange={event => setExamType(event.target.value)}>
          <option value="">Svi tipovi provere</option>{Object.entries(examLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <button className="btn btn-primary" onClick={() => { setError(''); setOpen(true); }} disabled={subjects.length === 0}><Plus size={17} /> Dodaj pitanje</button>
    </div>
    {success && <p role="status" className="text-sm text-[#007c72] mt-4">{success}</p>}
    <p className="muted text-sm mt-5 mb-5">Pronađeno pitanja: {visible.length}</p>
    <div className="space-y-4">{visible.map((question, index) => <article key={question.id} className="card p-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="tag">{subjects.find(item => item.id === question.subjectId)?.name ?? 'Predmet'}</span>
        <span className={`tag ${question.examType === 'EXAM' ? 'tag-violet' : 'tag-orange'}`}>{examLabels[question.examType]}</span>
        <span className="tag tag-blue">{question.type === 'multiple-choice' ? 'Višestruki izbor' : 'Otvoreno pitanje'}</span>
        {question.examDate && <time className="ml-auto muted text-xs" dateTime={question.examDate}>{question.examDate}</time>}
      </div>
      <h2 className="font-bold text-lg mt-5"><span className="text-[#99b3ac] mr-2">{String(index + 1).padStart(2, '0')}.</span>{question.prompt}</h2>
      {question.options && <div className="grid sm:grid-cols-2 gap-2 mt-5">{question.options.map((option, optionIndex) =>
        <div key={optionIndex} className={`rounded-lg border px-4 py-2.5 text-sm ${revealed.includes(question.id) && question.correctAnswer === optionIndex ? 'border-[#93d0bd] bg-[#e7f7ef] text-[#176d57]' : 'border-[#e5eeea] bg-[#fbfcfb]'}`}>
          <b className="text-[#8ba29d] mr-2">{'ABCD'[optionIndex]}.</b>{option}
        </div>)}</div>}
      {revealed.includes(question.id) && question.type === 'open-ended' && <div className="mt-4 rounded-lg bg-[#eff8f4] p-4 text-sm"><b className="text-[#00786e]">Tačan odgovor</b><p className="mt-1">{question.sampleAnswer}</p></div>}
      <button onClick={() => setRevealed(revealed.includes(question.id) ? revealed.filter(id => id !== question.id) : [...revealed, question.id])}
        className="text-[#007c72] font-bold text-sm flex gap-1.5 items-center mt-5">
        {revealed.includes(question.id) ? 'Sakrij odgovor' : 'Prikaži odgovor'} <ChevronDown size={15} className={revealed.includes(question.id) ? 'rotate-180' : ''} />
      </button>
    </article>)}</div>
    {visible.length === 0 && <div className="card text-center py-16 muted">Nema pronađenih pitanja. Promenite filter ili dodajte pitanje.</div>}
    {open && <div className="fixed inset-0 z-[60] bg-[#103c39]/45 p-4 grid place-items-center" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setOpen(false); }}>
      <div className="card w-full max-w-xl p-7 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center"><h2 className="subheading">Dodaj ispitno pitanje</h2><button aria-label="Zatvori" onClick={() => setOpen(false)} disabled={busy}><X size={20} /></button></div>
        <p className="muted text-sm mt-2 mb-6">Podelite pitanje i tačan odgovor sa prethodne provere.</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4"><div><label className="label" htmlFor="q-subject">Predmet</label><select id="q-subject" name="subject" required className="field" defaultValue="" disabled={busy}><option value="" disabled>Izaberite predmet</option>{subjects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div><label className="label" htmlFor="q-exam">Tip provere</label><select id="q-exam" name="examType" className="field" disabled={busy}>{Object.entries(examLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
          <div className="grid sm:grid-cols-2 gap-4"><div><label className="label" htmlFor="q-date">Datum provere (opciono)</label><input id="q-date" name="examDate" type="date" max={new Date().toISOString().slice(0, 10)} className="field" disabled={busy} /></div>
          <div><label className="label" htmlFor="q-type">Tip pitanja</label><select id="q-type" className="field" value={newType} onChange={event => setNewType(event.target.value as typeof newType)} disabled={busy}><option value="SINGLE_CHOICE">Višestruki izbor</option><option value="OPEN">Otvoreno pitanje</option></select></div></div>
          <div><label className="label" htmlFor="q-prompt">Pitanje</label><textarea id="q-prompt" name="prompt" required minLength={10} maxLength={2000} rows={3} className="field" disabled={busy} placeholder="Unesite pitanje..." /></div>
          {newType === 'SINGLE_CHOICE' ? <><div className="grid sm:grid-cols-2 gap-3">{[0, 1, 2, 3].map(index => <div key={index}><label className="label" htmlFor={`option${index}`}>Odgovor {'ABCD'[index]}</label><input id={`option${index}`} name={`option${index}`} required maxLength={500} className="field" disabled={busy} /></div>)}</div>
            <div><label className="label" htmlFor="correct">Tačan odgovor</label><select id="correct" name="correctAnswer" className="field" disabled={busy}>{[0, 1, 2, 3].map(index => <option key={index} value={index}>Odgovor {'ABCD'[index]}</option>)}</select></div></>
            : <div><label className="label" htmlFor="sample">Tačan odgovor</label><textarea id="sample" name="sampleAnswer" required maxLength={2000} rows={3} className="field" disabled={busy} placeholder="Unesite tačan odgovor" /></div>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Čuvanje u toku...' : 'Podeli pitanje'}</button>
        </form>
      </div>
    </div>}
  </>;
}
