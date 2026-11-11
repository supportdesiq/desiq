"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Award, BookOpen, Clock3, FolderOpen, LogOut, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Saved={id:string;challenge_key:string;project_name:string;updated_at:string;design_snapshot:any};
type Completion={id:string;challenge_key:string;project_name:string;score:number;completed_at:string};
const titles:Record<string,string>={"dream-house":"Design your dream house","community-cafe":"Design a neighbourhood café","traffic-bridge":"Build a bridge for smoother traffic","community-auditorium":"Design a community auditorium","public-park":"Create a neighbourhood park","pedestrian-plaza":"Reimagine a busy street","studio-renovation":"Renovate a compact apartment"};
export default function Dashboard(){
 const [user,setUser]=useState<User|null>(null);const [saved,setSaved]=useState<Saved[]>([]);const [done,setDone]=useState<Completion[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let alive=true;async function load(){const db=getSupabase();if(!db){setError("Student accounts are not configured yet. Please ask the DESIQ administrator to connect Supabase.");setLoading(false);return;}
  const {data:{user:u},error:authError}=await db.auth.getUser();if(!alive)return;if(authError||!u){window.location.href="/account";return;}setUser(u);
  const [s,c]=await Promise.all([db.from("saved_designs").select("id,challenge_key,project_name,updated_at,design_snapshot").eq("user_id",u.id).order("updated_at",{ascending:false}),db.from("challenge_completions").select("id,challenge_key,project_name,score,completed_at").eq("user_id",u.id).order("completed_at",{ascending:false})]);
  if(!alive)return;if(s.error||c.error)setError(s.error?.message||c.error?.message||"Could not load your learning record.");else{setSaved(s.data||[]);setDone(c.data||[]);}setLoading(false);
 }load();return()=>{alive=false}},[]);
 async function signOut(){const db=getSupabase();if(db)await db.auth.signOut();window.location.href="/";}
 async function remove(id:string){const db=getSupabase();if(!db||!confirm("Delete this saved design?"))return;const {error}=await db.from("saved_designs").delete().eq("id",id);if(error)setError(error.message);else setSaved(x=>x.filter(d=>d.id!==id));}
 const firstName=user?.user_metadata?.full_name?.split(" ")[0]||"designer";
 return <main className="student-dashboard"><header className="dashboard-heading"><div><span className="eyebrow">DESIQ STUDENT SPACE</span><h1>Welcome back, {firstName}.</h1><p>Your ideas, projects and progress — all in one place.</p></div><button onClick={signOut} className="dashboard-signout"><LogOut size={15}/> Sign out</button></header>
  {error&&<div className="auth-alert auth-error">{error}</div>}
  <section className="dashboard-stats"><div><FolderOpen/><b>{saved.length}</b><span>Saved designs</span></div><div><Award/><b>{done.length}</b><span>Challenges completed</span></div><div><BookOpen/><b>{new Set(done.map(x=>x.challenge_key)).size}/7</b><span>Unique briefs completed</span></div></section>
  <section className="dashboard-section"><div className="dashboard-section-title"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Your saved designs</h2></div><Link href="/architecture/challenges">Explore challenges <ArrowUpRight size={15}/></Link></div>
   {loading?<p className="dashboard-empty">Loading your projects…</p>:saved.length===0?<div className="dashboard-empty"><FolderOpen size={28}/><b>No saved designs yet</b><p>Open a challenge and use “Save design” to keep your work here.</p><Link href="/architecture/challenges">Explore design challenges <ArrowUpRight size={15}/></Link></div>:
    <div className="dashboard-project-grid">{saved.map(d=><article className="dashboard-project" key={d.id}><span className="eyebrow">{titles[d.challenge_key]?"ARCHITECTURE CHALLENGE":"DESIQ PROJECT"}</span><h3>{d.project_name||titles[d.challenge_key]||d.challenge_key}</h3><p>{titles[d.challenge_key]||d.challenge_key}</p><small><Clock3 size={13}/> Saved {new Date(d.updated_at).toLocaleDateString()}</small><div><Link href={`/architecture/challenges/${d.challenge_key}`}>Continue designing <ArrowUpRight size={15}/></Link><button onClick={()=>remove(d.id)} aria-label="Delete saved design"><Trash2 size={15}/></button></div></article>)}</div>}
  </section>
  <section className="dashboard-section"><div className="dashboard-section-title"><div><span className="eyebrow">YOUR ACHIEVEMENTS</span><h2>Completed challenges</h2></div></div>
   {done.length===0?<div className="dashboard-empty compact"><Award size={25}/><b>Your first certificate is waiting.</b><p>Complete a design challenge and submit your work to start building your portfolio.</p></div>:<div className="completion-list">{done.map(c=><div key={c.id}><span className="completion-award"><Award size={18}/></span><div><b>{c.project_name||titles[c.challenge_key]||c.challenge_key}</b><small>{titles[c.challenge_key]} · Score {c.score}/100 · {new Date(c.completed_at).toLocaleDateString()}</small></div><Link href={`/certificate/${c.id}`}>View certificate <ArrowUpRight size={14}/></Link></div>)}</div>}
  </section>
 </main>;
}
