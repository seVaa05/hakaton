import { ArrowUpRight, FileText } from 'lucide-react';
import type { Material } from '@/lib/data';
import { MaterialVote } from './material-vote';

export function MaterialCard({ material, subjectName }: { material: Material; subjectName?: string }) {
  const [year, month, day] = material.createdAt.slice(0, 10).split('-');
  const date = year && month && day ? `${day}.${month}.${year}.` : material.createdAt;

  return <article className="card p-6 min-h-[220px] flex flex-col">
    <div className="flex justify-between items-start gap-3">
      <div className="icon-box blue"><FileText size={23} /></div>
      <time dateTime={material.createdAt} className="muted text-xs">{date}</time>
    </div>
    {subjectName && <div className="text-xs font-bold text-[#78908b] mt-5">{subjectName}</div>}
    <h3 className="text-lg font-bold mt-2">{material.title}</h3>
    {material.description && <p className="muted text-sm mt-2">{material.description}</p>}
    <MaterialVote materialId={material.id} />
    <div className="border-t border-[#edf1ef] mt-auto pt-4 flex justify-end">
      {material.url
        ? <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-[#007c72] font-bold text-sm flex items-center gap-1">
            Otvori materijal <ArrowUpRight size={16} />
          </a>
        : <span className="muted text-sm">Datoteka nije dostupna</span>}
    </div>
  </article>;
}
