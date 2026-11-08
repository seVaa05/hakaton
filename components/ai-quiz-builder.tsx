'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileText, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import type { Subject } from '@/lib/data';
import type { GeneratedQuestion } from '@/lib/ai-quiz';

type PdfMaterial = { id: string; subjectId: string; title: string };
type QuestionType = 'SINGLE_CHOICE' | 'OPEN' | 'MIXED';
type Phase = 'setup' | 'generating' | 'quiz' | 'results';

export function AiQuizBuilder({ subjects, materials, initialSubject }: {
  subjects: Subject[];
  materials: PdfMaterial[];
  initialSubject: string;
}) {
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [materialId, setMaterialId] = useState('');
  const [count, setCount] = useState<5 | 10 | 15>(5);
  const [type, setType] = useState<QuestionType>('MIXED');
  const [phase, setPhase] = useState<Phase>('setup');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [reviewed, setReviewed] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState(0);
  const available = materials.filter(material => material.subjectId === subjectId);
  const question = questions[current];
  const multipleChoice = questions.reduce((total, item) => total + Number(item.type === 'SINGLE_CHOICE'), 0);
  const correctChoice = questions.reduce((total, item, index) =>
    total + Number(item.type === 'SINGLE_CHOICE' && answers[index] === item.correctOptionIndex), 0);
  const openCount = questions.length - multipleChoice;
  const correctOpen = questions.reduce((total, item, index) =>
    total + Number(item.type === 'OPEN' && reviewed[index] === true), 0);

  async function generate() {
    if (!materialId || !available.some(material => material.id === materialId)) return;
    setError('');
    setPhase('generating');
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, count, type }),
        signal: AbortSignal.timeout(115_000),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
          ? result.error : 'Generisanje pitanja nije uspelo.';
        throw new Error(message);
      }
      if (!result || typeof result !== 'object' || !('questions' in result) ||
        !Array.isArray(result.questions) || result.questions.length === 0) {
        throw new Error('AI nije vratio pitanja.');
      }
      setQuestions(result.questions as GeneratedQuestion[]);
      setAnswers({});
      setReviewed({});
      setCurrent(0);
      setPhase('quiz');
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== 'TimeoutError'
        ? cause.message : 'Zahtev je istekao. Pokušajte ponovo.');
      setPhase('setup');
    }
  }

  return <div className="max-w-3xl mx-auto mt-10">
    {phase === 'setup' && <div className="card p-7 md:p-10">
      <div className="icon-box mint"><Sparkles size={24} /></div>
      <h2 className="subheading mt-5">Napravite AI test</h2>
      <p className="muted mt-2 text-sm">Pitanja se generišu iz sadržaja izabranog PDF materijala.</p>
      <div className="grid sm:grid-cols-2 gap-5 mt-8">
        <div><label className="label" htmlFor="ai-subject">Predmet</label>
          <select id="ai-subject" className="field" value={subjectId} onChange={event => { setSubjectId(event.target.value); setMaterialId(''); }}>
            <option value="">Izaberite predmet</option>
            {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="ai-material">PDF materijal</label>
          <select id="ai-material" className="field" value={materialId} onChange={event => setMaterialId(event.target.value)} disabled={!subjectId || available.length === 0}>
            <option value="">Izaberite PDF</option>
            {available.map(material => <option key={material.id} value={material.id}>{material.title}</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="ai-count">Broj pitanja</label>
          <select id="ai-count" className="field" value={count} onChange={event => setCount(Number(event.target.value) as 5 | 10 | 15)}>
            {[5, 10, 15].map(value => <option key={value} value={value}>{value} pitanja</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="ai-type">Tip pitanja</label>
          <select id="ai-type" className="field" value={type} onChange={event => setType(event.target.value as QuestionType)}>
            <option value="MIXED">Mešovita</option>
            <option value="SINGLE_CHOICE">Višestruki izbor</option>
            <option value="OPEN">Otvorena pitanja</option>
          </select>
        </div>
      </div>
      {subjectId && available.length === 0 && <p className="bg-[#fff2e7] text-[#9b6438] rounded-xl p-4 mt-6 text-sm">Nema PDF materijala za ovaj predmet.</p>}
      {error && <p className="bg-[#fff0ed] text-[#b45043] rounded-xl p-4 mt-6 text-sm" role="alert">{error}</p>}
      <button onClick={generate} disabled={!materialId} className="btn btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
        Generiši pitanja <ArrowRight size={17} />
      </button>
      <p className="muted text-xs mt-4">Generisanje može potrajati oko minut. Test se ne čuva u bazi.</p>
    </div>}

    {phase === 'generating' && <div className="card p-10 text-center" role="status" aria-live="polite">
      <div className="icon-box mint mx-auto animate-pulse"><FileText size={24} /></div>
      <h2 className="subheading mt-6">Pripremamo vaš test</h2>
      <p className="muted mt-3">Učitavamo PDF i generišemo pitanja zasnovana na njegovom sadržaju...</p>
    </div>}

    {phase === 'quiz' && question && <>
      <div className="flex justify-between text-sm font-bold mb-3">
        <span>Pitanje {current + 1} od {questions.length}</span>
        <span className="text-[#007c72]">{Math.round(((current + 1) / questions.length) * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#dcebe5] mb-6"><div className="h-full rounded-full bg-[#007c72]" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      <div className="card p-7 md:p-10">
        <span className="tag tag-violet">{question.type === 'SINGLE_CHOICE' ? 'Višestruki izbor' : 'Otvoreno pitanje'}</span>
        <h2 className="text-xl md:text-2xl font-bold leading-snug mt-7">{question.prompt}</h2>
        {question.type === 'SINGLE_CHOICE'
          ? <div className="space-y-3 mt-7">{question.options.map((option, index) =>
              <button key={index} onClick={() => setAnswers({ ...answers, [current]: index })}
                className={`w-full text-left rounded-xl border p-4 flex items-center gap-3 text-sm font-semibold ${answers[current] === index ? 'border-[#007c72] bg-[#e9f7f1] text-[#006c64]' : 'border-[#dce9e5] hover:border-[#81b5aa]'}`}>
                <span className={`w-7 h-7 rounded-full border grid place-items-center shrink-0 ${answers[current] === index ? 'bg-[#007c72] border-[#007c72] text-white' : 'border-[#cbdcd5] text-[#78918b]'}`}>{'ABCD'[index]}</span>
                {option}
              </button>
            )}</div>
          : <div className="mt-7"><label className="label" htmlFor="ai-answer">Vaš odgovor</label>
              <textarea id="ai-answer" rows={6} className="field" placeholder="Unesite svoj odgovor..."
                value={String(answers[current] ?? '')} onChange={event => setAnswers({ ...answers, [current]: event.target.value })} />
              <p className="muted text-xs mt-2">Predlog odgovora videćete nakon završetka testa.</p>
            </div>}
        <div className="border-t border-[#e5eeea] mt-8 pt-6 flex justify-between">
          <button className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}><ArrowLeft size={16} /> Prethodno</button>
          {current < questions.length - 1
            ? <button className="btn btn-primary" onClick={() => setCurrent(current + 1)}>Sledeće <ArrowRight size={16} /></button>
            : <button className="btn btn-primary" onClick={() => setPhase('results')}>Završi test <Check size={16} /></button>}
        </div>
      </div>
      {questions.length < count && <p className="muted text-xs mt-4 text-center">Materijal je omogućio {questions.length} pouzdanih pitanja od traženih {count}.</p>}
    </>}

    {phase === 'results' && <>
      <div className="card p-8 md:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#e2f4ea] text-[#168365] grid place-items-center mx-auto"><CheckCircle2 size={32} /></div>
        <div className="eyebrow mt-5">TEST JE ZAVRŠEN</div>
        <h2 className="heading mt-2">Rezultat</h2>
        {multipleChoice > 0 && <p className="muted mt-3">Pitanja sa višestrukim izborom: {correctChoice} tačnih odgovora od {multipleChoice}.</p>}
        <div className="text-4xl font-extrabold text-[#007c72] mt-5">{correctChoice + correctOpen} / {questions.length}</div>
        {openCount > 0 && <p className="muted text-xs mt-2">Ocenite otvorena pitanja ispod da biste dovršili rezultat.</p>}
        <button className="btn btn-outline mt-6" onClick={() => { setPhase('setup'); setQuestions([]); setError(''); }}><RotateCcw size={16} /> Napravi novi test</button>
      </div>
      <h3 className="subheading mt-10 mb-5">Pregled odgovora</h3>
      <div className="space-y-4">{questions.map((item, index) => {
        const correct = item.type === 'SINGLE_CHOICE' && answers[index] === item.correctOptionIndex;
        return <article key={index} className="card p-6">
          <div className="flex gap-3 items-start">
            <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 ${item.type === 'SINGLE_CHOICE' ? (correct ? 'bg-[#e1f5e9] text-[#20835b]' : 'bg-[#fceae8] text-[#d36758]') : 'bg-[#eaf2ff] text-[#567aac]'}`}>
              {item.type === 'SINGLE_CHOICE' ? (correct ? <Check size={16} /> : <XCircle size={16} />) : index + 1}
            </span>
            <div className="min-w-0 w-full">
              <h4 className="font-bold">{item.prompt}</h4>
              {item.type === 'SINGLE_CHOICE'
                ? <><p className="text-sm muted mt-3">Vaš odgovor: <b className={correct ? 'text-[#21805c]' : 'text-[#c65f53]'}>{typeof answers[index] === 'number' ? item.options[Number(answers[index])] : 'Bez odgovora'}</b></p>
                    <p className="text-sm mt-1">Tačan odgovor: <b className="text-[#21805c]">{item.options[item.correctOptionIndex ?? 0]}</b></p></>
                : <><p className="text-sm muted mt-3">Vaš odgovor: <span className="text-[#173337]">{String(answers[index] ?? 'Bez odgovora')}</span></p>
                    <div className="bg-[#eff8f4] rounded-lg p-4 text-sm mt-3"><b className="text-[#007c72]">Predlog odgovora</b><p className="mt-1">{item.suggestedAnswer}</p></div>
                    <div className="flex flex-wrap gap-2 items-center mt-4"><span className="text-sm font-bold mr-1">Da li je odgovor tačan?</span>
                      <button className={`pill ${reviewed[index] === true ? 'active' : ''}`} onClick={() => setReviewed({ ...reviewed, [index]: true })}>Da</button>
                      <button className={`pill ${reviewed[index] === false ? 'active' : ''}`} onClick={() => setReviewed({ ...reviewed, [index]: false })}>Još ne</button>
                    </div></>}
              <div className="border-t border-[#e5eeea] mt-5 pt-4 text-sm"><b>Objašnjenje:</b> {item.explanation}</div>
              <p className="muted text-sm mt-3"><b>Navod iz PDF-a:</b> „{item.evidence}”</p>
              {item.reference && <p className="muted text-xs mt-2">Izvor: {item.reference}</p>}
            </div>
          </div>
        </article>;
      })}</div>
    </>}
  </div>;
}
