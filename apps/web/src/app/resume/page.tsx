import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata:Metadata={title:'Resume',description:'Experience, technical skills, and selected work.'};
const api=process.env.INTERNAL_API_URL??process.env.NEXT_PUBLIC_API_URL??'http://localhost:4000/api/v1';

async function getResume(){try{const response=await fetch(`${api}/resume`,{cache:'no-store'});if(!response.ok)return null;return (await response.json() as {data:{viewUrl:string;downloadUrl:string;expiresIn:number}}).data}catch{return null}}

export default async function ResumePage(){const resume=await getResume();return <>
  <header className="flex flex-col gap-8 pb-12 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-16">
    <div><p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">Resume</p><h1 className="mt-5 text-5xl font-semibold tracking-[-.045em] sm:text-7xl">Experience, <span className="text-slate-400">at a glance.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">A concise overview of my engineering experience, technical strengths, and the products I have helped build.</p></div>
    {resume&&<a className="shrink-0 rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5" href={resume.downloadUrl}>Download PDF</a>}
  </header>
  {resume?<section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111114] shadow-soft"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex gap-2"><span className="h-3 w-3 rounded-full bg-red-400/80"/><span className="h-3 w-3 rounded-full bg-amber-400/80"/><span className="h-3 w-3 rounded-full bg-emerald-400/80"/></div><span className="text-xs text-slate-500">Akinode-Resume.pdf</span><a className="text-xs font-semibold text-accent hover:underline" href={resume.viewUrl} target="_blank" rel="noreferrer">Open full screen</a></div><iframe className="h-[75vh] min-h-[640px] w-full bg-white" src={resume.viewUrl} title="Akinode resume PDF"/></section>:<section className="rounded-[2rem] border border-white/10 bg-white p-10 text-center shadow-soft sm:p-16"><p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">Temporarily unavailable</p><h2 className="mt-4 text-3xl font-semibold">The résumé has not been uploaded yet.</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">Please check back soon, or contact me directly for a copy.</p><Link className="mt-7 inline-block rounded-full border border-white/15 px-6 py-3 text-sm font-semibold" href="/contact">Contact me</Link></section>}
  <p className="mt-5 text-center text-xs text-slate-500">For privacy and storage security, document links expire automatically.</p>
  </>}
