'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { SubjectCard } from './subject-card';
import type { Subject } from '@/lib/data';

export function SubjectsBrowser({ subjects, initialSearch }: { subjects: Subject[]; initialSearch: string }) {
  const [year, setYear] = useState(0);
  const [search, setSearch] = useState(initialSearch);
  const filtered = subjects.filter(subject =>
    (!year || subject.year === year) &&
    subject.name.toLocaleLowerCase('sr').includes(search.trim().toLocaleLowerCase('sr'))
  );

  return <>
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-9">
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map(value =>
          <button key={value} onClick={() => setYear(value)} className={`pill ${year === value ? 'active' : ''}`}>
            {value === 0 ? 'Sve godine' : `${value}. godina`}
          </button>
        )}
      </div>
      <div className="relative w-full sm:w-72">
        <Search size={17} className="absolute left-3 top-3.5 text-[#8ca29f]" />
        <input className="field pl-10" value={search} onChange={event => setSearch(event.target.value)} placeholder="Pretraži predmete..." />
      </div>
    </div>
    <div className="mt-5 mb-5 text-sm muted">Pronađeno predmeta: {filtered.length}</div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {filtered.map(subject => <SubjectCard key={subject.id} subject={subject} />)}
    </div>
    {filtered.length === 0 && <div className="card text-center py-16 muted">
      {subjects.length === 0 ? 'Trenutno nema dostupnih predmeta.' : 'Nema pronađenih predmeta. Pokušajte drugu pretragu.'}
    </div>}
  </>;
}
