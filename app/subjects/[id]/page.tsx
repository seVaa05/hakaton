import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, FileQuestion } from 'lucide-react';
import { getMaterials, getSubject } from '@/lib/data';
import { MaterialCard } from '@/components/material-card';
import { srCount } from '@/lib/locale';

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) notFound();
  const materials = await getMaterials(subject.id);

  return <main className="container pt-12">
    <Link href="/subjects" className="text-sm muted flex gap-2 items-center"><ArrowLeft size={16} /> Svi predmeti</Link>
    <div className="card p-8 md:p-10 mt-7">
      <div className="icon-box mint"><BookOpen size={24} /></div>
      <div className="eyebrow mt-6">
        {subject.year === null ? 'GODINA NIJE NAVEDENA' : `${subject.year}. GODINA STUDIJA`}
      </div>
      <h1 className="heading mt-2">{subject.name}</h1>
      <div className="flex flex-wrap gap-3 mt-7">
        <Link className="btn btn-primary" href={`/materials?subject=${subject.id}`}>Pogledaj materijale <ArrowRight size={16} /></Link>
        <Link className="btn btn-outline" href={`/questions?subject=${subject.id}`}>Ispitna pitanja</Link>
        <Link className="btn btn-outline" href={`/quiz?subject=${subject.id}`}>Test za vežbanje</Link>
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-5 mt-8">
      <Link href={`/materials?subject=${subject.id}`} className="card p-7 flex items-start gap-5 subject-card">
        <div className="icon-box mint"><BookOpen size={23} /></div>
        <div><h2 className="text-xl font-bold">Materijali za učenje</h2><p className="muted text-sm mt-2">{srCount(materials.length, 'materijal', 'materijala', 'materijala')}</p><span className="text-[#007c72] font-bold text-sm mt-4 inline-flex gap-2 items-center">Otvori materijale <ArrowRight size={15} /></span></div>
      </Link>
      <Link href={`/questions?subject=${subject.id}`} className="card p-7 flex items-start gap-5 subject-card">
        <div className="icon-box violet"><FileQuestion size={23} /></div>
        <div><h2 className="text-xl font-bold">Ispitna pitanja</h2><span className="text-[#007c72] font-bold text-sm mt-4 inline-flex gap-2 items-center">Otvori pitanja <ArrowRight size={15} /></span></div>
      </Link>
    </div>
    <section className="mt-10">
      <h2 className="subheading mb-5">Materijali za ovaj predmet</h2>
      {materials.length > 0
        ? <div className="grid md:grid-cols-2 gap-5">
            {materials.map(material => <MaterialCard key={material.id} material={material} />)}
          </div>
        : <div className="card text-center py-12 muted">Trenutno nema materijala za ovaj predmet.</div>}
    </section>
  </main>;
}
