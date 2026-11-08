import { getMaterials, getSubjects } from '@/lib/data';
import { MaterialsBrowser } from '@/components/materials-browser';
import { MaterialUploadForm } from '@/components/material-upload-form';

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const [materials, subjects, params] = await Promise.all([getMaterials(), getSubjects(), searchParams]);
  return <main className="container pt-12">
    <div className="eyebrow">DELIMO ZNANJE</div>
    <h1 className="heading mt-2">Materijali za učenje</h1>
    <p className="muted mt-3">Korisni materijali za vaše predmete.</p>
    <MaterialUploadForm subjects={subjects} initialSubject={params.subject ?? ''} />
    <MaterialsBrowser initialMaterials={materials} subjects={subjects} initialSubject={params.subject ?? ''} />
  </main>;
}
