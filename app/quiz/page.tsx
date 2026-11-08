import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getQuestions, getSubjects } from '@/lib/data';
import { QuizBuilder } from '@/components/quiz-builder';

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const [questions, subjects, params] = await Promise.all([getQuestions(), getSubjects(), searchParams]);
  return <main className="container pt-12">
    <div className="eyebrow">VEŽBOM DO USPEHA</div>
    <h1 className="heading mt-2">Generator testova</h1>
    <p className="muted mt-3">Napravite test za vežbanje od pitanja koja su podelili studenti.</p>
    <div className="max-w-3xl mx-auto mt-9 card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h2 className="font-bold">Želite pitanja iz PDF materijala?</h2><p className="muted text-sm mt-1">Napravite poseban test pomoću AI-ja.</p></div>
      <Link href={`/quiz/ai${params.subject ? `?subject=${encodeURIComponent(params.subject)}` : ''}`} className="btn btn-outline whitespace-nowrap">AI test <ArrowRight size={16} /></Link>
    </div>
    <QuizBuilder initialQuestions={questions} subjects={subjects} initialSubject={params.subject ?? ''} />
  </main>;
}
