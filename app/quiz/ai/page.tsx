import { getMaterials, getSubjects } from '@/lib/data';
import { AiQuizBuilder } from '@/components/ai-quiz-builder';

export default async function AiQuizPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const [subjects, materials, params] = await Promise.all([getSubjects(), getMaterials(), searchParams]);
  const projectOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
  const pdfMaterials = materials
    .filter(material => {
      if (!material.url) return false;
      try {
        const url = new URL(material.url);
        return url.protocol === 'https:' && url.origin === projectOrigin &&
          url.pathname.startsWith('/storage/v1/object/public/study-materials/') &&
          url.pathname.toLowerCase().endsWith('.pdf') && !url.search && !url.hash;
      } catch { return false; }
    })
    .map(material => ({ id: material.id, subjectId: material.subjectId, title: material.title }));

  return <main className="container pt-12">
    <div className="eyebrow">UČITE IZ SVOJIH MATERIJALA</div>
    <h1 className="heading mt-2">AI test iz PDF-a</h1>
    <p className="muted mt-3">Izaberite materijal i vežbajte na pitanjima zasnovanim na njegovom sadržaju.</p>
    <AiQuizBuilder subjects={subjects} materials={pdfMaterials} initialSubject={params.subject ?? ''} />
  </main>;
}
