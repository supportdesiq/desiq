"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { ArrowRight, BriefcaseBusiness, Building2, Check, ChevronRight, ClipboardList, FileText, Layers3, Plus, RefreshCw, Users } from "lucide-react";

const choices = [
 ["Architecture & Building Planning","Building plans, elevations, sections and documentation"],
 ["Interior Design","Space planning, furniture, finishes and lighting"],
 ["Landscape Architecture","Site layouts, planting, paving and outdoor spaces"],
 ["Urban Design & Town Planning","Land use, zoning, public realm and infrastructure plans"],
 ["Project & Construction Management","Budgets, schedules, site coordination and progress"],
 ["BIM & Digital Consultancy","Model documentation, coordination and quantity schedules"],
 ["Historic Preservation & Restoration","Building surveys, conservation and adaptive reuse"],
 ["Sustainability & Environmental Consulting","Energy, materials, water and green-building assessments"],
 ["Vernacular Architecture","Regional materials, climate-responsive and traditional design"],
 ["Structural & Civil Engineering","Structural documentation and engineering coordination"],
 ["MEP Design & Coordination","Electrical, plumbing, HVAC and fire-services coordination"],
 ["Quantity Surveying & Cost Consultancy","BOQs, rate analysis, tenders and cost reports"]
] as const;
type Project={id:string;project_name:string;client_name:string;location:string;updated_at:string};
export default function ProfessionalDashboard(){
 const [userEmail,setUserEmail]=useState(""); const [selected,setSelected]=useState<string[]>([]);
 const [projects,setProjects]=useState<Project[]>([]); const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
 const db=getSupabase();
 useEffect(()=>{let alive=true;(async()=>{if(!db){setError("Supabase is not configured.");setLoading(false);return;}
 const {data:{user}}=await db.auth.getUser();if(!alive)return;if(!user){setError("Please sign in to access Professional Studio.");setLoading(false);return;}setUserEmail(user.email||"");
 const [profile,projectRows]=await Promise.all([
 db.from("professional_profiles").select("specialisations").eq("user_id",user.id).maybeSingle(),
 db.from("professional_projects").select("id,project_name,client_name,location,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(8)
 ]);
 if(!alive)return;
 if(profile.error)setError("Could not load your specialisations. Run the V6.2 SQL migration and refresh.");
 else setSelected(profile.data?.specialisations||[]);
 if(projectRows.error)setError(projectRows.error.message);else setProjects(projectRows.data||[]);
 setLoading(false);
 })();return()=>{alive=false}},[]);
 const toggle=(name:string)=>setSelected(old=>old.includes(name)?old.filter(x=>x!==name):[...old,name]);
 async function save(){if(!db)return;setSaving(true);setMessage("");setError("");const {data:{user}}=await db.auth.getUser();if(!user){setError("Please sign in again.");setSaving(false);return;}
 const {error:e}=await db.from("professional_profiles").upsert({user_id:user.id,specialisations:selected,updated_at:new Date().toISOString()},{onConflict:"user_id"});
 if(e)setError(e.message);else setMessage("Your specialisations have been saved.");setSaving(false);}
 const activeCount=selected.length;
 if(loading)return <main className="min-h-screen bg-slate-50 p-8 text-slate-700">Loading your Professional Studio…</main>;
 return <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
  <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/architecture/professional" className="text-lg font-black tracking-tight">DESIQ <span className="font-medium text-slate-500">/ Professional Studio</span></Link><span className="text-sm text-slate-500">{userEmail}</span></div></header>
  <div className="mx-auto max-w-7xl space-y-7 px-5 py-8">
   <section className="rounded-3xl bg-slate-950 p-7 text-white md:p-9"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Unified professional workspace · V6.2</p><h1 className="mt-3 text-3xl font-bold md:text-4xl">Your work, connected.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Manage projects across every service you offer. Choose multiple specialisations once, then use one shared workspace for clients, drawings, estimates and quotations.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/architecture/professional" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900">Open drawing & estimating studio <ArrowRight size={16}/></Link><a href="#specialisations" className="rounded-xl border border-white/30 px-4 py-3 text-sm font-semibold">Manage specialisations</a></div></section>
   {error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{message&&<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}
   <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[{label:"Selected specialisations",value:String(activeCount),icon:Layers3},{label:"Recent projects",value:String(projects.length),icon:BriefcaseBusiness},{label:"Shared client workspace",value:"Ready",icon:Users},{label:"Estimates & quotations",value:"Connected",icon:FileText}].map(x=><div key={x.label} className="rounded-2xl border border-slate-200 bg-white p-5"><x.icon className="text-slate-500" size={20}/><p className="mt-4 text-2xl font-bold">{x.value}</p><p className="mt-1 text-xs text-slate-500">{x.label}</p></div>)}
   </section>
   <section id="specialisations" className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Your professional profile</p><h2 className="mt-2 text-2xl font-bold">Choose your specialisations</h2><p className="mt-2 text-sm text-slate-500">Select all services you provide. You can change these later.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{activeCount} selected</span></div>
    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{choices.map(([name,desc])=>{const active=selected.includes(name);return <button type="button" key={name} onClick={()=>toggle(name)} aria-pressed={active} className={`rounded-2xl border p-4 text-left transition ${active?"border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200":"border-slate-200 bg-white hover:border-slate-400"}`}><div className="flex items-start justify-between gap-3"><span className="font-semibold">{name}</span><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${active?"bg-indigo-600 text-white":"bg-slate-100 text-slate-400"}`}>{active?<Check size={15}/>:<Plus size={15}/>}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{desc}</p></button>})}</div>
    <div className="mt-6 flex flex-wrap items-center gap-3"><button disabled={saving} onClick={save} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{saving?"Saving…":"Save specialisations"}</button><span className="text-xs text-slate-500">Saved to your professional account.</span></div>
   </section>
   <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Workspace</p><h2 className="mt-2 text-2xl font-bold">Recent projects</h2></div><Link href="/architecture/professional" className="text-sm font-semibold text-indigo-700">View all projects <ChevronRight className="inline" size={16}/></Link></div>
    {projects.length===0?<p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Your saved professional projects will appear here.</p>:<div className="mt-5 divide-y divide-slate-100">{projects.map(p=><div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{p.project_name}</p><p className="mt-1 text-xs text-slate-500">{p.client_name||"No client assigned"}{p.location?` · ${p.location}`:""}</p></div><Link href="/architecture/professional" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Open studio <ArrowRight className="ml-1 inline" size={13}/></Link></div>)}</div>}
   </section>
   <p className="text-center text-xs text-slate-400">DESIQ Professional Studio · One account · Multiple specialisations · Connected projects</p>
  </div>
 </main>;
}
