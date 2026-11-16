import Link from 'next/link';
import { subjects } from '@/lib/subjects';
import { Headphones, Clock3, Timer, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function Footer(){
 return <footer className="footer" id="contact">
  <div className="footer-main">
   <div>
    <Link href="/" className="brand footer-brand"><span className="brand-mark">D</span><span>DESIQ<small>DESIGN + IQ</small></span></Link>
    <p>Learn by doing. Build skills you can show.</p>
   </div>
   <div><b>Explore</b>{subjects.map(s=><Link key={s.slug} href={s.slug === "it" ? "/subjects/it-support" : `/subjects/${s.slug}`}>{s.short}</Link>)}</div>
   <div><b>DESIQ</b><a href="/#how">How it works</a><a href="/#pricing">Pricing</a><a href="mailto:supportdesiq@gmail.com?subject=School%20partnership">School partnerships</a><a href="mailto:supportdesiq@gmail.com">Contact us</a><Link href="/subjects/it-support/tickets">IT Support Desk</Link></div>
   <div className="footer-support-column">
    <b>NEED HELP?</b>
    <p>Questions about classes, plans or partnerships? Talk to the DESIQ support team.</p>
    <div className="support-card">
     <div className="support-card-top">
      <span className="support-headset"><Headphones size={19}/></span>
      <span className="support-online"><i/> HERE FOR YOU</span>
     </div>
     <span className="support-card-title">DESIQ Support</span>
     <a className="footer-email" href="mailto:supportdesiq@gmail.com">supportdesiq@gmail.com <ArrowUpRight size={14}/></a>
     <div className="support-card-divider"/>
     <div className="support-fact"><span className="support-fact-icon"><Clock3 size={16}/></span><span><strong>Available 24/7</strong><small>We're here around the clock</small></span><CheckCircle2 className="support-check" size={15}/></div>
     <div className="support-fact"><span className="support-fact-icon"><Timer size={16}/></span><span><strong>Reply within 30 minutes</strong><small>Our target response time</small></span><CheckCircle2 className="support-check" size={15}/></div>
    </div>
   </div>
  </div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} DESIQ. All rights reserved.</span><span>Learn. Build. Experiment. Become.</span></div>
 </footer>;
}
