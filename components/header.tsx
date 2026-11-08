'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
const links = [['/subjects','Predmeti'],['/materials','Materijali'],['/questions','Ispitna pitanja'],['/quiz','Generator testova']];
export function Header(){
 const pathname=usePathname(); const [open,setOpen]=useState(false);
 return <header className="bg-white border-b border-[#e1ebe8] sticky top-0 z-50"><div className="container h-[72px] flex items-center justify-between gap-5"><Link href="/" className="flex items-center gap-2.5 font-extrabold text-[21px] tracking-tight"><span className="w-9 h-9 rounded-[10px] bg-[#006d68] text-white grid place-items-center"><BookOpen size={19}/></span><span>učimo<span className="text-[#007c72]">.</span></span></Link><nav className="hidden md:flex items-center gap-8">{links.map(([href,label])=><Link key={href} href={href} className={`nav-link ${pathname.startsWith(href)?'active':''}`}>{label}</Link>)}</nav><Link href="/quiz" className="btn btn-primary hidden md:inline-flex !py-2.5">Počni vežbanje <span>↗</span></Link><button aria-label="Otvori ili zatvori meni" className="md:hidden p-2" onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button></div>{open&&<nav className="md:hidden bg-white border-t border-[#e1ebe8] px-6 py-4 flex flex-col gap-4">{links.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="nav-link">{label}</Link>)}</nav>}</header>
}
