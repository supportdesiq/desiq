"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sun, Moon, ChevronDown, UserRound } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function Header(){
 const [dark,setDark]=useState(false);
 const [userName,setUserName]=useState('');
 const [menuOpen,setMenuOpen]=useState(false);
 useEffect(()=>{
  const saved=localStorage.getItem('desiq-theme');
  const initial=saved==='dark';
  setDark(initial);
  document.documentElement.dataset.theme=initial?'dark':'light';
  const db=getSupabase();
  if(!db)return;
  db.auth.getSession().then(({data})=>setUserName(data.session?.user.user_metadata?.full_name || data.session?.user.email?.split('@')[0] || ''));
  const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>{
   setUserName(session?.user.user_metadata?.full_name || session?.user.email?.split('@')[0] || '');
  });
  return ()=>subscription.unsubscribe();
 },[]);
 function toggleTheme(){
  const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';localStorage.setItem('desiq-theme',next?'dark':'light');
 }
 async function signOut(){
  const db=getSupabase();if(db)await db.auth.signOut();setMenuOpen(false);window.location.href='/';
 }
 return <header className="site-header">
  <Link href="/" className="brand" aria-label="DESIQ home"><span className="brand-mark">D</span><span>DESIQ<small>DESIGN + IQ</small></span></Link>
  <nav className="desktop-nav"><a href="/#worlds">Explore worlds</a><a href="/#how">How it works</a><a href="/#pricing">Pricing</a><a href="/#contact">Contact</a></nav>
  <div className="header-actions">
   <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Light mode':'Dark mode'}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
   {userName?<div className="user-menu-wrap"><button type="button" className="user-menu-trigger" onClick={()=>setMenuOpen(v=>!v)}><span className="user-avatar"><UserRound size={15}/></span><span>{userName}</span><ChevronDown size={14}/></button>{menuOpen&&<div className="user-menu"><Link href="/dashboard" onClick={()=>setMenuOpen(false)}>My dashboard</Link><Link href="/account" onClick={()=>setMenuOpen(false)}>Account</Link><button type="button" onClick={signOut}>Sign out</button></div>}</div>:<Link className="login-link" href="/account">Sign in</Link>}
   {!userName&&<Link className="button button-small" href="/account">Get started <span>↗</span></Link>}
  </div>
 </header>;
}
