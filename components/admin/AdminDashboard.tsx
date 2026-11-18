"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ClipboardList, GraduationCap, LoaderCircle, MailPlus, RefreshCw, ShieldCheck, Users, X, Pencil, Search, Clock3, Activity, FolderOpen, Award, UserRound } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { subjects } from "@/lib/subjects";

type Overview = { registered_students:number; new_registrations_7d:number; active_today:number; learning_events_7d:number; active_staff:number; pending_invitations:number; completed_challenges:number; saved_projects:number };
type Staff = { user_id:string; full_name:string; email:string; role:string; status:string; created_at:string };
type Invitation = { id:string; email:string; full_name:string; role:string; status:string; expires_at:string; created_at:string };
type DetailRow = Record<string, any>;
const blankOverview:Overview={registered_students:0,new_registrations_7d:0,active_today:0,learning_events_7d:0,active_staff:0,pending_invitations:0,completed_challenges:0,saved_projects:0};
const capabilities=[
  {id:"view_assigned_students",label:"View assigned student progress"},
  {id:"review_submissions",label:"Review submissions and give feedback"},
  {id:"manage_assigned_challenges",label:"Manage challenges in assigned worlds"},
  {id:"view_assigned_tickets",label:"View assigned support tickets"},
  {id:"issue_certificate_recommendations",label:"Recommend students for certificates"},
];
const metricConfig=[
  {key:"registered_students",label:"Registered students",icon:Users,detail:"All student accounts"},
  {key:"active_today",label:"Active today",icon:GraduationCap,detail:"Based on last sign-in"},
  {key:"new_registrations_7d",label:"New this week",icon:ArrowUpRight,detail:"Registrations in 7 days"},
  {key:"learning_events_7d",label:"Learning events",icon:BookOpen,detail:"Recorded in 7 days"},
  {key:"active_staff",label:"Active staff",icon:ShieldCheck,detail:"Admin and teacher accounts"},
  {key:"pending_invitations",label:"Pending invitations",icon:MailPlus,detail:"Awaiting staff setup"},
  {key:"completed_challenges",label:"Challenge completions",icon:ClipboardList,detail:"Saved completion records"},
  {key:"saved_projects",label:"Saved projects",icon:BookOpen,detail:"Student design projects"},
] as const;
const detailTitles:Record<string,string>={
 registered_students:"Registered students",active_today:"Students active today",new_registrations_7d:"New registrations this week",
 learning_events_7d:"Learning activity",active_staff:"Active staff",pending_invitations:"Pending invitations",
 completed_challenges:"Challenge completions",saved_projects:"Saved projects"
};
const detailColumns:Record<string,[string,string][]>={
 registered_students:[["full_name","Name"],["email","Email"],["created_at","Registered"],["last_sign_in_at","Last sign-in"]],
 active_today:[["full_name","Name"],["email","Email"],["last_sign_in_at","Last sign-in"]],
 new_registrations_7d:[["full_name","Name"],["email","Email"],["created_at","Registered"]],
 learning_events_7d:[["student_name","Student"],["email","Email"],["world_slug","Learning world"],["event_label","Activity"],["created_at","When"]],
 active_staff:[["full_name","Name"],["email","Email"],["role","Role"],["status","Status"]],
 pending_invitations:[["full_name","Invitee"],["email","Email"],["role","Role"],["created_at","Invited"],["expires_at","Expires"]],
 completed_challenges:[["student_name","Student"],["email","Email"],["challenge_key","Challenge"],["project_name","Project"],["score","Score"],["completed_at","Completed"]],
 saved_projects:[["student_name","Student"],["email","Email"],["project_name","Project"],["challenge_key","Learning activity"],["updated_at","Last updated"]],
};
function dateLabel(value:any){if(!value)return "—";const d=new Date(value);return Number.isNaN(d.getTime())?"—":d.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"});}
function displayValue(value:any){if(value===null||value===undefined||value==="")return "—";if(typeof value==="boolean")return value?"Yes":"No";return String(value).replaceAll("_"," ");}
export default function AdminDashboard(){
 const [loading,setLoading]=useState(true); const [allowed,setAllowed]=useState(false); const [isSuper,setIsSuper]=useState(false);
 const [tab,setTab]=useState<"overview"|"staff">("overview"); const [overview,setOverview]=useState<Overview>(blankOverview);
 const [staff,setStaff]=useState<Staff[]>([]); const [invitations,setInvitations]=useState<Invitation[]>([]);
 const [error,setError]=useState(""); const [notice,setNotice]=useState(""); const [busy,setBusy]=useState(false); const [showInvite,setShowInvite]=useState(false);
 const [fullName,setFullName]=useState(""); const [email,setEmail]=useState(""); const [role,setRole]=useState("learning_teacher");
 const [worlds,setWorlds]=useState<string[]>([]); const [studentIds,setStudentIds]=useState(""); const [selectedCapabilities,setSelectedCapabilities]=useState<string[]>(["view_assigned_students","review_submissions"]);
 const [detailKey,setDetailKey]=useState<string|null>(null); const [detailRows,setDetailRows]=useState<DetailRow[]>([]); const [detailLoading,setDetailLoading]=useState(false); const [detailSearch,setDetailSearch]=useState("");
 const [studentProfile,setStudentProfile]=useState<DetailRow|null>(null); const [profileLoading,setProfileLoading]=useState(false);
 const [editingStaff,setEditingStaff]=useState<Staff|null>(null); const [editRole,setEditRole]=useState("learning_teacher"); const [editStatus,setEditStatus]=useState("active"); const [editWorlds,setEditWorlds]=useState<string[]>([]); const [editStudentIds,setEditStudentIds]=useState<string[]>([]); const [editCapabilities,setEditCapabilities]=useState<string[]>([]);
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
 function toggleEditWorld(slug:string){setEditWorlds(current=>current.includes(slug)?current.filter(x=>x!==slug):[...current,slug]);}
 function toggleEditCapability(id:string){setEditCapabilities(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);}
 async function invite(e:FormEvent){e.preventDefault();if(!db)return;setBusy(true);setError("");setNotice("");
  const ids=studentIds.split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean);
  if(ids.some(x=>!/^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(x))){setError("Student assignments must be valid Supabase user UUIDs.");setBusy(false);return;}
  const {data,error:invokeError}=await db.functions.invoke("admin-invite",{body:{fullName,email,role,learningWorlds:worlds,studentIds:ids,capabilities:selectedCapabilities}});
  if(invokeError||data?.error){setError(data?.error||invokeError?.message||"Invitation could not be sent.");}
  else{setNotice(data.message||"Invitation sent.");setFullName("");setEmail("");setStudentIds("");setWorlds([]);setShowInvite(false);await load();}
  setBusy(false);
 }
 async function openMetric(key:string){
  if(!db)return;setDetailKey(key);setDetailRows([]);setDetailSearch("");setDetailLoading(true);
  const {data,error}=await db.rpc("desiq_admin_metric_details",{p_metric:key});
  if(error)setError(error.message);else setDetailRows(Array.isArray(data?.items)?data.items:[]);
  setDetailLoading(false);
 }
 async function openStudent(userId:string){
  if(!db)return;setStudentProfile(null);setProfileLoading(true);
  const {data,error}=await db.rpc("desiq_admin_student_profile",{p_student_id:userId});
  if(error)setError(error.message);else setStudentProfile(data);
  setProfileLoading(false);
 }
 async function startEdit(s:Staff){
  if(!db)return;setError("");setNotice("");setEditingStaff(s);setEditRole(s.role);setEditStatus(s.status);
  const [{data:w,error:we},{data:st,error:se},{data:p,error:pe}]=await Promise.all([
   db.from("admin_world_assignments").select("world_slug").eq("admin_user_id",s.user_id),
   db.from("admin_student_assignments").select("student_user_id").eq("admin_user_id",s.user_id),
   db.from("admin_permissions").select("capability").eq("admin_user_id",s.user_id)
  ]);
  if(we||se||pe){setError(we?.message||se?.message||pe?.message||"Could not load staff access.");return;}
  setEditWorlds((w||[]).map(x=>x.world_slug));setEditStudentIds((st||[]).map(x=>x.student_user_id));setEditCapabilities((p||[]).map(x=>x.capability));
 }
 async function saveStaffAccess(e:FormEvent){
  e.preventDefault();if(!db||!editingStaff)return;setBusy(true);setError("");setNotice("");
  const {error}=await db.rpc("desiq_update_staff_access",{p_staff_user_id:editingStaff.user_id,p_role:editRole,p_status:editStatus,p_worlds:editWorlds,p_student_ids:editStudentIds,p_capabilities:editCapabilities});
  if(error)setError(error.message);else{setNotice(`Access updated for ${editingStaff.full_name||editingStaff.email}.`);setEditingStaff(null);await load();}
  setBusy(false);
 }
 const filteredRows=detailRows.filter(row=>!detailSearch||Object.values(row).some(v=>String(v??"").toLowerCase().includes(detailSearch.toLowerCase())));
 if(loading)return <main className="admin-page"><div className="admin-loading"><LoaderCircle className="admin-spin"/> Checking DESIQ access…</div></main>;
 if(!allowed)return <main className="admin-page"><section className="admin-denied"><ShieldCheck size={34}/><span className="admin-eyebrow">DESIQ / RESTRICTED AREA</span><h1>Admin access required</h1><p>This workspace is available only to staff members invited by the DESIQ Super Admin.</p><Link href="/" className="admin-back-link">Return to DESIQ <ArrowUpRight size={15}/></Link></section></main>;
 return <main className="admin-page"><div className="admin-shell">
  <header className="admin-header"><div><span className="admin-eyebrow">DESIQ / CONTROL CENTRE</span><h1>Admin Dashboard</h1><p>Manage learning, people and progress across DESIQ.</p></div><div className="admin-header-actions"><span className="admin-role-pill"><ShieldCheck size={14}/>{isSuper?"Super Admin":"Staff Workspace"}</span><button className="admin-icon-button" onClick={()=>{setLoading(true);void load();}} aria-label="Refresh dashboard"><RefreshCw size={16}/></button></div></header>
  <nav className="admin-tabs"><button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Overview</button>{isSuper&&<button className={tab==="staff"?"active":""} onClick={()=>setTab("staff")}>Staff & invitations</button>}</nav>
  {tab==="overview"&&<><div className="admin-section-heading"><div><h2>Platform overview</h2><p>Live counts from the DESIQ database. Select a metric to inspect its underlying records.</p></div></div><div className="admin-metrics">{metricConfig.map(({key,label,icon:Icon,detail})=><button type="button" className="admin-metric admin-metric-button" key={key} onClick={()=>void openMetric(key)} aria-label={`View details: ${label}`}><div className="admin-metric-top"><span>{label}</span><Icon size={17}/></div><strong>{Number(overview[key as keyof Overview]).toLocaleString("en-IN")}</strong><small>{detail}</small><span className="admin-metric-hint">View details <ArrowUpRight size={12}/></span></button>)}</div><div className="admin-lower-grid"><section className="admin-info-card"><span className="admin-eyebrow">LEARNING WORLDS</span><h3>Explore the DESIQ curriculum</h3><p>Ten learning worlds are currently listed in the platform catalogue.</p><div className="admin-world-chips">{subjects.map(s=><span key={s.slug}>{s.icon} {s.title}</span>)}</div></section><section className="admin-info-card"><span className="admin-eyebrow">QUICK LINKS</span><h3>Existing workspaces</h3><Link href="/subjects/it-support/admin" className="admin-quick-link">IT Support administration <ArrowUpRight size={15}/></Link><Link href="/dashboard" className="admin-quick-link">Student learning dashboard <ArrowUpRight size={15}/></Link><p className="admin-note">Select a metric above to inspect student, staff and learning records.</p></section></div></>}
  {tab==="staff"&&isSuper&&<><div className="admin-section-heading"><div><h2>Staff & teachers</h2><p>Invite trusted team members and manage their access at any time.</p></div><button className="admin-primary-button" onClick={()=>setShowInvite(v=>!v)}><MailPlus size={16}/>{showInvite?"Close invitation":"Invite staff"}</button></div>
   {showInvite&&<form className="admin-invite-card" onSubmit={invite}><div className="admin-form-heading"><div><span className="admin-eyebrow">NEW STAFF INVITATION</span><h3>Set up access</h3></div><span className="admin-secure-label"><ShieldCheck size={14}/> Super Admin only</span></div><div className="admin-form-grid"><label>Full name<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Staff member name"/></label><label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label><label>Role<select value={role} onChange={e=>setRole(e.target.value)}><option value="learning_teacher">Learning Teacher</option><option value="staff_admin">Staff Admin</option></select></label></div><div className="admin-field-block"><b>Learning worlds</b><p>Choose the worlds this person can work in. Leave blank if their access is student-specific only.</p><div className="admin-check-grid">{subjects.map(s=><label key={s.slug}><input type="checkbox" checked={worlds.includes(s.slug)} onChange={()=>toggleWorld(s.slug)}/><span>{s.title}</span></label>)}</div></div><label className="admin-student-ids">Individual student assignments <textarea rows={2} value={studentIds} onChange={e=>setStudentIds(e.target.value)} placeholder="Paste student user UUIDs, separated by commas or new lines"/><small>Use Supabase user UUIDs. Detailed student access is limited to assigned records.</small></label><div className="admin-field-block"><b>Capabilities</b><div className="admin-check-grid admin-capability-grid">{capabilities.map(c=><label key={c.id}><input type="checkbox" checked={selectedCapabilities.includes(c.id)} onChange={()=>toggleCapability(c.id)}/><span>{c.label}</span></label>)}</div></div><div className="admin-form-footer"><span>Invitation expires after 7 days. The invitee sets up access through the secure email link.</span><button className="admin-primary-button" disabled={busy}>{busy?<><LoaderCircle className="admin-spin" size={15}/> Sending…</>:<><MailPlus size={15}/> Send invitation</>}</button></div></form>}
   <section className="admin-info-card admin-staff-card"><h3>Current staff access</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Access</th></tr></thead><tbody>{staff.map(s=><tr key={s.user_id}><td>{s.full_name||"—"}</td><td>{s.email}</td><td>{s.role.replaceAll("_"," ")}</td><td><span className={`admin-status ${s.status}`}>{s.status}</span></td><td>{s.role!=="super_admin"&&<button className="admin-small-button" onClick={()=>void startEdit(s)}><Pencil size={13}/> Edit access</button>}</td></tr>)}</tbody></table></div></section>
   <section className="admin-info-card admin-staff-card"><h3>Invitation history</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Invitee</th><th>Role</th><th>Status</th><th>Expires</th></tr></thead><tbody>{invitations.map(i=><tr key={i.id}><td><b>{i.full_name}</b><small>{i.email}</small></td><td>{i.role.replaceAll("_"," ")}</td><td><span className={`admin-status ${i.status}`}>{i.status}</span></td><td>{new Date(i.expires_at).toLocaleDateString("en-IN")}</td></tr>)}{!invitations.length&&<tr><td colSpan={4}>No invitations yet.</td></tr>}</tbody></table></div></section>
  </>}
  {error&&<div className="admin-alert error">{error}</div>}{notice&&<div className="admin-alert success">{notice}</div>}
  <footer className="admin-footer"><span>DESIQ · Admin workspace</span><Link href="/">Back to website</Link></footer>
 </div>
 {detailKey&&<div className="admin-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDetailKey(null);}}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-detail-title"><div className="admin-modal-head"><div><span className="admin-eyebrow">DESIQ / LIVE RECORDS</span><h2 id="admin-detail-title">{detailTitles[detailKey]||"Details"}</h2><p>{detailRows.length} records returned from Supabase</p></div><button className="admin-icon-button" onClick={()=>setDetailKey(null)} aria-label="Close details"><X size={18}/></button></div><label className="admin-detail-search"><Search size={16}/><input value={detailSearch} onChange={e=>setDetailSearch(e.target.value)} placeholder="Search these records"/></label>{detailLoading?<div className="admin-loading"><LoaderCircle className="admin-spin"/> Loading records…</div>:<div className="admin-detail-table-wrap"><table className="admin-table"><thead><tr>{(detailColumns[detailKey]||[]).map(([key,label])=><th key={key}>{label}</th>)}{["registered_students","active_today","new_registrations_7d","learning_events_7d","completed_challenges","saved_projects"].includes(detailKey)&&<th>Profile</th>}</tr></thead><tbody>{filteredRows.map((row,i)=><tr key={row.id||row.user_id||i}>{(detailColumns[detailKey]||[]).map(([key])=><td key={key}>{key.endsWith("_at")?dateLabel(row[key]):displayValue(row[key])}</td>)}{["registered_students","active_today","new_registrations_7d","learning_events_7d","completed_challenges","saved_projects"].includes(detailKey)&&<td>{row.user_id&&<button className="admin-small-button" onClick={()=>void openStudent(row.user_id)}><UserRound size={13}/> View profile</button>}</td>}</tr>)}{!filteredRows.length&&<tr><td colSpan={(detailColumns[detailKey]||[]).length+1}>{detailLoading?"Loading…":"No matching records found."}</td></tr>}</tbody></table></div>}</section></div>}
 {editingStaff&&<div className="admin-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setEditingStaff(null);}}><form className="admin-modal admin-edit-modal" onSubmit={saveStaffAccess} role="dialog" aria-modal="true"><div className="admin-modal-head"><div><span className="admin-eyebrow">SUPER ADMIN / ACCESS CONTROL</span><h2>Edit staff access</h2><p>{editingStaff.full_name} · {editingStaff.email}</p></div><button type="button" className="admin-icon-button" onClick={()=>setEditingStaff(null)} aria-label="Close editor"><X size={18}/></button></div><div className="admin-form-grid"><label>Role<select value={editRole} onChange={e=>setEditRole(e.target.value)}><option value="learning_teacher">Learning Teacher</option><option value="staff_admin">Staff Admin</option></select></label><label>Account status<select value={editStatus} onChange={e=>setEditStatus(e.target.value)}><option value="active">Active</option><option value="suspended">Suspended</option></select></label></div><div className="admin-field-block"><b>Learning worlds</b><div className="admin-check-grid">{subjects.map(s=><label key={s.slug}><input type="checkbox" checked={editWorlds.includes(s.slug)} onChange={()=>toggleEditWorld(s.slug)}/><span>{s.title}</span></label>)}</div></div><div className="admin-field-block"><b>Individual student UUIDs</b><textarea rows={3} value={editStudentIds.join("\n")} onChange={e=>setEditStudentIds(e.target.value.split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean))} placeholder="One student UUID per line"/></div><div className="admin-field-block"><b>Capabilities</b><div className="admin-check-grid admin-capability-grid">{capabilities.map(c=><label key={c.id}><input type="checkbox" checked={editCapabilities.includes(c.id)} onChange={()=>toggleEditCapability(c.id)}/><span>{c.label}</span></label>)}</div></div><div className="admin-form-footer"><span>Changes apply immediately. Suspended staff lose dashboard access.</span><button className="admin-primary-button" disabled={busy}>{busy?<><LoaderCircle className="admin-spin" size={15}/> Saving…</>: "Save access changes"}</button></div></form></div>}
 {profileLoading&&<div className="admin-modal-backdrop"><section className="admin-modal"><div className="admin-loading"><LoaderCircle className="admin-spin"/> Loading student profile…</div></section></div>}
 {studentProfile&&<div className="admin-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setStudentProfile(null);}}><section className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-head"><div><span className="admin-eyebrow">STUDENT / PROFILE</span><h2>{studentProfile.student?.full_name||studentProfile.student?.email||"Student profile"}</h2><p>{studentProfile.student?.email}</p></div><button className="admin-icon-button" onClick={()=>setStudentProfile(null)}><X size={18}/></button></div><div className="admin-profile-stats"><div><b>{studentProfile.events?.length||0}</b><span>Learning events</span></div><div><b>{studentProfile.projects?.length||0}</b><span>Saved projects</span></div><div><b>{studentProfile.completions?.length||0}</b><span>Completions</span></div></div><h3><Activity size={16}/> Recent activity</h3><div className="admin-profile-list">{(studentProfile.events||[]).map((x:DetailRow)=><div key={x.id}><b>{x.event_label||x.event_type}</b><span>{x.world_slug} · {dateLabel(x.created_at)}</span></div>)}{!studentProfile.events?.length&&<p>No recorded learning events yet.</p>}</div><h3><FolderOpen size={16}/> Saved projects</h3><div className="admin-profile-list">{(studentProfile.projects||[]).map((x:DetailRow)=><div key={x.id}><b>{x.project_name}</b><span>{x.challenge_key} · {dateLabel(x.updated_at)}</span></div>)}{!studentProfile.projects?.length&&<p>No saved projects.</p>}</div><h3><Award size={16}/> Challenge completions</h3><div className="admin-profile-list">{(studentProfile.completions||[]).map((x:DetailRow)=><div key={x.id}><b>{x.project_name}</b><span>{x.challenge_key} · Score {x.score} · {dateLabel(x.completed_at)}</span></div>)}{!studentProfile.completions?.length&&<p>No completed challenges.</p>}</div></section></div>}
 </main>;
}
