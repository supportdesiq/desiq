"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ClipboardList, GraduationCap, LoaderCircle, MailPlus, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { subjects } from "@/lib/subjects";

type Overview = { registered_students:number; new_registrations_7d:number; active_today:number; learning_events_7d:number; active_staff:number; pending_invitations:number; completed_challenges:number; saved_projects:number };
type Staff = { user_id:string; full_name:string; email:string; role:string; status:string; created_at:string };
type Invitation = { id:string; email:string; full_name:string; role:string; status:string; expires_at:string; created_at:string };
const blankOverview:Overview={registered_students:0,new_registrations_7d:0,active_today:0,learning_events_7d:0,active_staff:0,pending_invitations:0,completed_challenges:0,saved_projects:0};
const capabilities=[
  {id:"view_assigned_students",label:"View assigned student progress"},
  {id:"review_submissions",label:"Review submissions and give feedback"},
  {id:"manage_assigned_challenges",label:"Manage challenges in assigned worlds"},
  {id:"view_assigned_tickets",label:"View assigned support tickets"},
  {id:"issue_certificate_recommendations",label:"Recommend students for certificates"},
];
export default function AdminDashboard(){
 const [loading,setLoading]=useState(true); const [allowed,setAllowed]=useState(false); const [isSuper,setIsSuper]=useState(false);
 const [tab,setTab]=useState<"overview"|"staff">("overview"); const [overview,setOverview]=useState<Overview>(blankOverview);
 const [staff,setStaff]=useState<Staff[]>([]); const [invitations,setInvitations]=useState<Invitation[]>([]);
 const [error,setError]=useState(""); const [notice,setNotice]=useState(""); const [busy,setBusy]=useState(false); const [showInvite,setShowInvite]=useState(false);
 const [fullName,setFullName]=useState(""); const [email,setEmail]=useState(""); const [role,setRole]=useState("learning_teacher");
 const [worlds,setWorlds]=useState<string[]>([]); const [studentIds,setStudentIds]=useState(""); const [selectedCapabilities,setSelectedCapabilities]=useState<string[]>(["view_assigned_students","review_submissions"]);
 const db=getSupabase();
 const load=useCallback(async()=>{
  if(!db){setError("Supabase is not configured. Check the Vercel environment variables.");setLoading(false);return;}
  setError("");
  const {data:{user}}=await db.auth.getUser();
  if(!user){window.location.href="/account";return;}
  const {data:profile,error:profileError}=await db.from("admin_profiles").select("role,status,full_name").eq("user_id",user.id).maybeSingle();
  if(profileError){setError(profileError.message.includes("admin_profiles")?"Run supabase/admin_dashboard_v1.sql in Supabase SQL Editor first.":profileError.message);setLoading(false);return;}
  if(!profile||profile.status!=="active"){setAllowed(false);setLoading(false);return;}
  setAllowed(true);setIsSuper(profile.role==="super_admin");
  const {data:summary,error:summaryError}=await db.rpc("desiq_admin_overview");
  if(summaryError)setError(summaryError.message);else setOverview({...blankOverview,...summary});
  if(profile.role==="super_admin"){
   const [{data:staffRows,error:staffError},{data:inviteRows,error:inviteError}]=await Promise.all([
    db.from("admin_profiles").select("user_id,full_name,email,role,status,created_at").order("created_at",{ascending:false}),
    db.from("admin_invitations").select("id,email,full_name,role,status,expires_at,created_at").order("created_at",{ascending:false}).limit(50)
   ]);
   if(staffError)setError(staffError.message);else setStaff(staffRows||[]);
   if(inviteError)setError(inviteError.message);else setInvitations(inviteRows||[]);
  }
  setLoading(false);
 },[db]);
 useEffect(()=>{void load();},[load]);
 function toggleWorld(slug:string){setWorlds(current=>current.includes(slug)?current.filter(x=>x!==slug):[...current,slug]);}
 function toggleCapability(id:string){setSelectedCapabilities(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);}
 async function invite(e:FormEvent){e.preventDefault();if(!db)return;setBusy(true);setError("");setNotice("");
  const ids=studentIds.split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean);
  if(ids.some(x=>!/^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(x))){setError("Student assignments must be valid Supabase user UUIDs.");setBusy(false);return;}
  const {data,error:invokeError}=await db.functions.invoke("admin-invite",{body:{fullName,email,role,learningWorlds:worlds,studentIds:ids,capabilities:selectedCapabilities}});
  if(invokeError||data?.error){setError(data?.error||invokeError?.message||"Invitation could not be sent.");}
  else{setNotice(data.message||"Invitation sent.");setFullName("");setEmail("");setStudentIds("");setWorlds([]);setShowInvite(false);await load();}
  setBusy(false);
 }
 if(loading)return <main className="admin-page"><div className="admin-loading"><LoaderCircle className="admin-spin"/> Checking DESIQ access…</div></main>;
 if(!allowed)return <main className="admin-page"><section className="admin-denied"><ShieldCheck size={34}/><span className="admin-eyebrow">DESIQ / RESTRICTED AREA</span><h1>Admin access required</h1><p>This workspace is available only to staff members invited by the DESIQ Super Admin.</p><Link href="/" className="admin-back-link">Return to DESIQ <ArrowUpRight size={15}/></Link></section></main>;
 const metrics=[
  ["Registered students",overview.registered_students,Users,"All student accounts"],
  ["Active today",overview.active_today,GraduationCap,"Based on last sign-in"],
  ["New this week",overview.new_registrations_7d,ArrowUpRight,"Registrations in 7 days"],
  ["Learning events",overview.learning_events_7d,BookOpen,"Recorded in 7 days"],
  ["Active staff",overview.active_staff,ShieldCheck,"Admin and teacher accounts"],
  ["Pending invitations",overview.pending_invitations,MailPlus,"Awaiting staff setup"],
  ["Challenge completions",overview.completed_challenges,ClipboardList,"Saved completion records"],
  ["Saved projects",overview.saved_projects,BookOpen,"Student design projects"],
 ] as const;
 return <main className="admin-page"><div className="admin-shell">
  <header className="admin-header"><div><span className="admin-eyebrow">DESIQ / CONTROL CENTRE</span><h1>Admin Dashboard</h1><p>Manage learning, people and progress across DESIQ.</p></div><div className="admin-header-actions"><span className="admin-role-pill"><ShieldCheck size={14}/>{isSuper?"Super Admin":"Staff Workspace"}</span><button className="admin-icon-button" onClick={()=>{setLoading(true);void load();}} aria-label="Refresh dashboard"><RefreshCw size={16}/></button></div></header>
  <nav className="admin-tabs"><button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Overview</button>{isSuper&&<button className={tab==="staff"?"active":""} onClick={()=>setTab("staff")}>Staff & invitations</button>}</nav>
  {tab==="overview"&&<><div className="admin-section-heading"><div><h2>Platform overview</h2><p>Live counts from the DESIQ database. Activity metrics appear as events are recorded.</p></div></div><div className="admin-metrics">{metrics.map(([label,value,Icon,detail])=><article className="admin-metric" key={label}><div className="admin-metric-top"><span>{label}</span><Icon size={17}/></div><strong>{Number(value).toLocaleString("en-IN")}</strong><small>{detail}</small></article>)}</div><div className="admin-lower-grid"><section className="admin-info-card"><span className="admin-eyebrow">LEARNING WORLDS</span><h3>Explore the DESIQ curriculum</h3><p>Ten learning worlds are currently listed in the platform catalogue.</p><div className="admin-world-chips">{subjects.map(s=><span key={s.slug}>{s.icon} {s.title}</span>)}</div></section><section className="admin-info-card"><span className="admin-eyebrow">QUICK LINKS</span><h3>Existing workspaces</h3><Link href="/subjects/it-support/admin" className="admin-quick-link">IT Support administration <ArrowUpRight size={15}/></Link><Link href="/dashboard" className="admin-quick-link">Student learning dashboard <ArrowUpRight size={15}/></Link><p className="admin-note">Detailed student records, world-scoped analytics and submission review will be enabled in the next implementation phase.</p></section></div></>}
  {tab==="staff"&&isSuper&&<><div className="admin-section-heading"><div><h2>Staff & teachers</h2><p>Invite trusted team members and define their access before they join.</p></div><button className="admin-primary-button" onClick={()=>setShowInvite(v=>!v)}><MailPlus size={16}/>{showInvite?"Close invitation":"Invite staff"}</button></div>
   {showInvite&&<form className="admin-invite-card" onSubmit={invite}><div className="admin-form-heading"><div><span className="admin-eyebrow">NEW STAFF INVITATION</span><h3>Set up access</h3></div><span className="admin-secure-label"><ShieldCheck size={14}/> Super Admin only</span></div><div className="admin-form-grid"><label>Full name<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Staff member name"/></label><label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label><label>Role<select value={role} onChange={e=>setRole(e.target.value)}><option value="learning_teacher">Learning Teacher</option><option value="staff_admin">Staff Admin</option></select></label></div><div className="admin-field-block"><b>Learning worlds</b><p>Choose the worlds this person can work in. Leave blank if their access is student-specific only.</p><div className="admin-check-grid">{subjects.map(s=><label key={s.slug}><input type="checkbox" checked={worlds.includes(s.slug)} onChange={()=>toggleWorld(s.slug)}/><span>{s.title}</span></label>)}</div></div><label className="admin-student-ids">Individual student assignments <textarea rows={2} value={studentIds} onChange={e=>setStudentIds(e.target.value)} placeholder="Paste student user UUIDs, separated by commas or new lines"/><small>Use Supabase user UUIDs. Detailed student access is limited to assigned records.</small></label><div className="admin-field-block"><b>Capabilities</b><div className="admin-check-grid admin-capability-grid">{capabilities.map(c=><label key={c.id}><input type="checkbox" checked={selectedCapabilities.includes(c.id)} onChange={()=>toggleCapability(c.id)}/><span>{c.label}</span></label>)}</div></div><div className="admin-form-footer"><span>Invitation expires after 7 days. The invitee sets up access through the secure email link.</span><button className="admin-primary-button" disabled={busy}>{busy?<><LoaderCircle className="admin-spin" size={15}/> Sending…</>:<><MailPlus size={15}/> Send invitation</>}</button></div></form>}
   <section className="admin-info-card admin-staff-card"><h3>Current staff access</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{staff.map(s=><tr key={s.user_id}><td>{s.full_name||"—"}</td><td>{s.email}</td><td>{s.role.replaceAll("_"," ")}</td><td><span className={`admin-status ${s.status}`}>{s.status}</span></td></tr>)}</tbody></table></div></section>
   <section className="admin-info-card admin-staff-card"><h3>Invitation history</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Invitee</th><th>Role</th><th>Status</th><th>Expires</th></tr></thead><tbody>{invitations.map(i=><tr key={i.id}><td><b>{i.full_name}</b><small>{i.email}</small></td><td>{i.role.replaceAll("_"," ")}</td><td><span className={`admin-status ${i.status}`}>{i.status}</span></td><td>{new Date(i.expires_at).toLocaleDateString("en-IN")}</td></tr>)}{!invitations.length&&<tr><td colSpan={4}>No invitations yet.</td></tr>}</tbody></table></div></section>
  </>}
  {error&&<div className="admin-alert error">{error}</div>}{notice&&<div className="admin-alert success">{notice}</div>}
  <footer className="admin-footer"><span>DESIQ · Admin workspace</span><Link href="/">Back to website</Link></footer>
 </div></main>;
}
