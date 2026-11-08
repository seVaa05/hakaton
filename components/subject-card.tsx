import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import type { Subject } from '@/lib/data';

export function SubjectCard({ subject }: { subject: Subject }) {
  return <Link href={`/subjects/${subject.id}`} className="card subject-card p-6 min-h-[250px] flex flex-col">
    <div className="flex justify-between items-start">
      <div className="icon-box mint"><BookOpen size={22} /></div>
      <ArrowUpRight size={19} className="text-[#95aba7]" />
    </div>
    <div className="mt-6 text-xs font-bold text-[#79918e]">
      {subject.year === null ? 'GODINA NIJE NAVEDENA' : `${subject.year}. GODINA`}
    </div>
    <h3 className="font-bold text-[18px] mt-2 leading-snug">{subject.name}</h3>
    <div className="border-t border-[#edf1ef] mt-auto pt-4 text-[#007c72] text-sm font-bold">
      Pogledaj predmet →
    </div>
  </Link>;
}
