"use client";
import { useEffect,useState,type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function AccountPage(){
 const [mode,setMode]=useState<"signin"|"signup">("signup");
 const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
 const [showPassword,setShowPassword]=useState(false); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
 const configured=!!process.env.NEXT_PUBLIC_SUPABASE_URL&&!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 useEffect(()=>{const db=getSupabase();if(db)db.auth.getSession().then(({data})=>{if(data.session)window.location.href="/dashboard";});},[]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");
  const supabase=getSupabase(); if(!supabase){setError("Student accounts are not connected yet. Add the Supabase project URL and anon key to your Vercel environment variables, then redeploy.");setBusy(false);return;}
  try{
   if(mode==="signup"){
    const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
    if(error)throw error;
    if(data.session){window.location.href="/dashboard";return;}
    setMessage("Your account has been created. Check your email to confirm your address, then sign in.");
   }else{
    const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;window.location.href="/dashboard";return;
   }
  }catch(err){setError(err instanceof Error?err.message:"Something went wrong. Please try again.");}
  finally{setBusy(false);}
 }
 return <main className="student-auth-page"><div className="student-auth-card">
  <div className="student-auth-brand"><span className="brand-mark">D</span><span>DESIQ<small>STUDENT LEARNING</small></span></div>
  <div className="student-auth-icon"><GraduationCap size={24}/></div>
  <span className="eyebrow">YOUR LEARNING JOURNEY</span>
  <h1>{mode==="signup"?"Create your student account.":"Welcome back."}</h1>
  <p>Save your projects, continue where you left off and keep track of every challenge you complete.</p>
  <div className="auth-tabs"><button className={mode==="signup"?"active":""} onClick={()=>{setMode("signup");setError("");setMessage("");}}>Create account</button><button className={mode==="signin"?"active":""} onClick={()=>{setMode("signin");setError("");setMessage("");}}>Sign in</button></div>
  <form onSubmit={submit}>
   {mode==="signup"&&<label>Full name<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Your name"/></label>}
   <label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com"/></label>
   <label>Password <span className="auth-password"><input required type={showPassword?"text":"password"} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="signup"?"new-password":"current-password"} placeholder="At least 8 characters"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></span></label>
   {error&&<div className="auth-alert auth-error">{error}</div>}{message&&<div className="auth-alert auth-success">{message}</div>}
   <button className="auth-submit" disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create my account":"Sign in"} <ArrowRight size={16}/></button>
  </form>
  <div className="auth-privacy"><ShieldCheck size={15}/> Your projects are private to your account.</div>
  {!configured&&<div className="auth-setup-note">Account setup is awaiting the DESIQ Supabase connection. The sign-up form will activate after the project keys are configured.</div>}
  <Link href="/" className="auth-back">← Back to DESIQ</Link>
 </div></main>;
}
