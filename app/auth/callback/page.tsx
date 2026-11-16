"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage(){
 const [status,setStatus]=useState<"working"|"success"|"error">("working");
 const [detail,setDetail]=useState("Confirming your email address…");
 const [seconds,setSeconds]=useState(5);
 useEffect(()=>{
  let alive=true;
  async function confirm(){
   const db=getSupabase();
   if(!db){if(alive){setStatus("error");setDetail("We couldn't connect to DESIQ. Please return to the sign-in page and try again.");}return;}
   try{
    const url=new URL(window.location.href);
    const tokenHash=url.searchParams.get("token_hash");
    const type=url.searchParams.get("type");
    const code=url.searchParams.get("code");
    const hashParams=new URLSearchParams(url.hash.replace(/^#/,""));
    const accessToken=hashParams.get("access_token");
    const refreshToken=hashParams.get("refresh_token");
    let error:any=null;
    if(tokenHash && (type==="signup"||type==="email")) {
      const result=await db.auth.verifyOtp({token_hash:tokenHash,type:type as "signup"|"email"});error=result.error;
    } else if(code) {
      const result=await db.auth.exchangeCodeForSession(code);error=result.error;
    } else if(accessToken && refreshToken) {
      const result=await db.auth.setSession({access_token:accessToken,refresh_token:refreshToken});error=result.error;
    } else {
      const result=await db.auth.getSession();
      if(!result.data.session) throw new Error("This confirmation link is invalid or has expired. Please request a new email.");
    }
    if(error)throw error;
    if(alive){setStatus("success");setDetail("Your email is confirmed and your DESIQ account is ready.");}
   }catch(e){if(alive){setStatus("error");setDetail(e instanceof Error?e.message:"We couldn't confirm this link. Please request a new one.");}}
  }
  confirm();return()=>{alive=false};
 },[]);
 useEffect(()=>{
  if(status!=="success")return;
  const timer=window.setInterval(()=>setSeconds(v=>{if(v<=1){window.location.href="/";return 0;}return v-1}),1000);
  return()=>window.clearInterval(timer);
 },[status]);
 return <main className="verify-page"><section className="verify-card">
  <div className={`verify-icon ${status}`}>{status==="working"?<LoaderCircle className="spin" size={28}/>:status==="success"?<CheckCircle2 size={30}/>:<AlertCircle size={30}/>}</div>
  <div className="eyebrow">DESIQ ACCOUNT</div>
  <h1>{status==="working"?"Confirming your email":status==="success"?"You're all set.":"We couldn't confirm that link."}</h1>
  <p>{detail}</p>
  {status==="success"&&<div className="verify-countdown">Taking you to the DESIQ homepage in <b>{seconds}</b> seconds…</div>}
  {status==="error"&&<Link className="button" href="/account">Return to sign in</Link>}
  {status==="working"&&<span className="verify-muted">Please keep this page open.</span>}
 </section></main>;
}
