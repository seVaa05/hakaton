'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { MaterialCard } from './material-card';
import type { Material, Subject } from '@/lib/data';

type SortOrder = 'newest' | 'oldest' | 'title';

export function MaterialsBrowser({
  initialMaterials,
  subjects,
  initialSubject,
}: {
  initialMaterials: Material[];
  subjects: Subject[];
  initialSubject: string;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [sort, setSort] = useState<SortOrder>('newest');
  const [search, setSearch] = useState('');
  const query = search.trim().toLocaleLowerCase('sr');
  const subjectNames = new Map(subjects.map(item => [item.id, item.name]));

  const visible = initialMaterials
    .filter(material =>
      (!subject || material.subjectId === subject) &&
      (`${material.title} ${material.description ?? ''}`.toLocaleLowerCase('sr').includes(query))
    )
    .sort((a, b) => sort === 'title'
      ? a.title.localeCompare(b.title, 'sr')
      : sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt));

  return <>
    <div className="flex flex-col md:flex-row gap-3 md:items-center mt-9">
      <div className="relative flex-1">
        <Search size={17} className="absolute left-3 top-3.5 text-[#8ca29f]" />
        <input className="field pl-10" placeholder="Pretraži materijale..." value={search} onChange={event => setSearch(event.target.value)} />
      </div>
      <select aria-label="Filtriraj po predmetu" className="field md:w-56" value={subject} onChange={event => setSubject(event.target.value)}>
        <option value="">Svi predmeti</option>
        {subjects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select aria-label="Sortiraj materijale" className="field md:w-44" value={sort} onChange={event => setSort(event.target.value as SortOrder)}>
        <option value="newest">Najnovije</option>
        <option value="oldest">Najstarije</option>
        <option value="title">Po nazivu</option>
      </select>
    </div>
    <p className="muted text-sm mt-5 mb-5">Pronađeno materijala: {visible.length}</p>
    <div className="grid md:grid-cols-2 gap-5">
      {visible.map(material =>
        <MaterialCard key={material.id} material={material} subjectName={subjectNames.get(material.subjectId)} />
      )}
    </div>
    {visible.length === 0 && <div className="card text-center py-16 muted">
      {initialMaterials.length === 0
        ? 'Trenutno nema dostupnih materijala.'
        : 'Nema materijala za izabrane kriterijume.'}
    </div>}
  </>;
}
