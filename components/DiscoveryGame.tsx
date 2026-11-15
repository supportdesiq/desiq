"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { subjects } from "@/lib/subjects";

type Choice = { id: string; label: string; detail: string; scores: Record<string, number> };
const stages: { title: string; prompt: string; choices: Choice[] }[] = [
 { title:"Your curiosity", prompt:"Which of these would you naturally stop to explore?", choices:[
  {id:"make",label:"Making and designing",detail:"Creating something from an idea.",scores:{architecture:3,art:3,hardware:1}},
  {id:"solve",label:"Solving tricky problems",detail:"Finding out why something isn't working.",scores:{it:3,hardware:2,"code-ai":2}},
  {id:"tech",label:"Technology and digital tools",detail:"Understanding how digital things work.",scores:{it:2,hardware:2,"code-ai":3}},
  {id:"people",label:"People and communication",detail:"Explaining, connecting and sharing ideas.",scores:{languages:3,it:1}},
  {id:"nature",label:"Nature and the world around me",detail:"Making everyday life more thoughtful.",scores:{sustainability:3,architecture:1}},
  {id:"visual",label:"Drawing and visual expression",detail:"Turning what you see into something visual.",scores:{art:3,architecture:2}}
 ]},
 { title:"Your kind of activity", prompt:"What would you most enjoy spending time doing?", choices:[
  {id:"sketch",label:"Sketching or planning a space",detail:"Imagining how something could look or work.",scores:{architecture:3,art:2}},
  {id:"fix",label:"Taking things apart and fixing them",detail:"Investigating parts, faults and solutions.",scores:{hardware:3,it:2}},
  {id:"build-digital",label:"Building something on a computer",detail:"Trying tools, code or digital workflows.",scores:{"code-ai":3,it:1}},
  {id:"explain",label:"Helping someone understand",detail:"Making a difficult idea feel simple.",scores:{languages:3,it:1}},
  {id:"improve",label:"Making a process less wasteful",detail:"Finding practical ways to improve things.",scores:{sustainability:3,architecture:1}},
  {id:"draw",label:"Drawing, observing or making art",detail:"Noticing details and expressing ideas.",scores:{art:3,architecture:1}}
 ]},
 { title:"How you approach things", prompt:"When you meet a new challenge, what sounds most like you?", choices:[
  {id:"visualise",label:"I picture how it could look",detail:"I like to visualise possibilities first.",scores:{architecture:3,art:2}},
  {id:"investigate",label:"I look for clues and test ideas",detail:"I prefer to understand the cause.",scores:{it:3,hardware:2,"code-ai":1}},
  {id:"experiment",label:"I try tools and experiment",detail:"I learn by making and testing.",scores:{"code-ai":2,hardware:2,art:1}},
  {id:"organise",label:"I organise the steps",detail:"I enjoy structure and clear communication.",scores:{languages:2,it:2,sustainability:1}},
  {id:"impact",label:"I think about the bigger impact",detail:"I consider people and resources.",scores:{sustainability:3,architecture:1}}
 ]},
 { title:"A practical situation", prompt:"Which mini-mission would you choose first?", choices:[
  {id:"room",label:"Plan a small, useful room",detail:"Balance space, comfort and function.",scores:{architecture:4}},
  {id:"computer",label:"Find why a computer won't start",detail:"Work through symptoms and possible causes.",scores:{hardware:3,it:3}},
  {id:"website",label:"Make a simple website or tool",detail:"Turn a small idea into a digital result.",scores:{"code-ai":4}},
  {id:"campaign",label:"Create a clear message in another language",detail:"Help an idea reach more people.",scores:{languages:4}},
  {id:"resource",label:"Reduce water or energy use",detail:"Find a practical everyday improvement.",scores:{sustainability:4}},
  {id:"illustration",label:"Draw an object from observation",detail:"Use shape, line and proportion.",scores:{art:4}}
 ]},
 { title:"What you'd like to grow", prompt:"Which result would make you feel proud?", choices:[
  {id:"spaces",label:"A space or design I planned",detail:"A thoughtful plan that solves a real need.",scores:{architecture:4}},
  {id:"reliable",label:"A problem I diagnosed and fixed",detail:"A reliable solution that helps someone.",scores:{it:3,hardware:3}},
  {id:"digital",label:"A digital project I created",detail:"A working tool, website or prototype.",scores:{"code-ai":4}},
  {id:"change",label:"A positive change I helped make",detail:"A more sustainable way of doing something.",scores:{sustainability:4}},
  {id:"communicate",label:"A message I communicated well",detail:"Helping people understand one another.",scores:{languages:4}},
  {id:"artwork",label:"An artwork that feels like mine",detail:"A visual idea brought to life.",scores:{art:4}}
 ]}
];
const bySlug = Object.fromEntries(subjects.map(s=>[s.slug,s]));
export default function DiscoveryGame(){
 const [stage,setStage]=useState(0);
 const [selected,setSelected]=useState<string[][]>(stages.map(()=>[]));
 const [complete,setComplete]=useState(false);
 const toggle=(id:string)=>setSelected(prev=>prev.map((arr,i)=>i===stage?(arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]):arr));
 const scores=useMemo(()=>{
  const total:Record<string,number>={};
  selected.forEach((ids,i)=>ids.forEach(id=>{const c=stages[i].choices.find(x=>x.id===id);if(c)Object.entries(c.scores).forEach(([slug,n])=>total[slug]=(total[slug]||0)+n)}));
  return total;
 },[selected]);
 const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([slug])=>bySlug[slug]).filter(Boolean);
 const answered=selected[stage].length>0;
 const reset=()=>{setStage(0);setSelected(stages.map(()=>[]));setComplete(false)};
 return <div className="discovery-panel" id="discovery-game">
  <div className="discovery-panel-top"><span><i/> DESIQ DISCOVERY</span><span>{complete?"YOUR RESULT":`STEP 0${stage+1} / 05`}</span></div>
  {!complete ? <>
   <div className="discovery-progress"><span style={{width:`${(stage/5)*100}%`}}/></div>
   <div className="discovery-question"><div className="discovery-stage-label">EXPLORE YOUR INTERESTS</div><h2>{stages[stage].title}</h2><p>{stages[stage].prompt}</p><small>Select as many as feel right.</small></div>
   <div className="discovery-bubbles">{stages[stage].choices.map((c,i)=><button type="button" key={c.id} onClick={()=>toggle(c.id)} className={`discovery-bubble bubble-${i%6} ${selected[stage].includes(c.id)?"is-selected":""}`} aria-pressed={selected[stage].includes(c.id)}>
    <span className="bubble-check">{selected[stage].includes(c.id)?<Check size={13}/>:<span>{String(i+1).padStart(2,"0")}</span>}</span><b>{c.label}</b><small>{c.detail}</small>
   </button>)}</div>
   <div className="discovery-controls"><button className="discovery-back" type="button" onClick={()=>stage===0?reset():setStage(stage-1)} disabled={stage===0}><ArrowLeft size={15}/> Back</button><span>{selected.reduce((n,a)=>n+a.length,0)} choices explored</span><button className="button discovery-next" type="button" disabled={!answered} onClick={()=>stage===4?setComplete(true):setStage(stage+1)}>{stage===4?"See my directions":"Continue"} <ArrowRight size={16}/></button></div>
  </>:<div className="discovery-results">
   <div className="discovery-stage-label">YOUR DESIQ STARTING POINT</div><h2>Your curiosity has a direction.</h2><p className="discovery-result-intro">Based on the interests and activities you selected, these are three learning worlds worth exploring. They are suggestions to help you get started—not a formal aptitude assessment.</p>
   <div className="discovery-result-list">{ranked.map((s,i)=><article className="discovery-result-card" key={s.slug}><div className="result-rank">0{i+1}</div><div className="result-icon">{s.icon}</div><div className="result-copy"><b>{s.short}</b><span>{s.tagline}</span><small>{s.description}</small></div><Link href={s.slug==="it"?"/subjects/it-support":`/subjects/${s.slug}`} aria-label={`Explore ${s.short}`}><ArrowUpRight size={18}/></Link></article>)}</div>
   <div className="discovery-free-note"><Sparkles size={17}/><div><b>Try before you decide.</b><span>Explore the subject page and start with its available introductory challenges.</span></div></div>
   <div className="discovery-controls result-controls"><button className="discovery-back" type="button" onClick={reset}><RotateCcw size={15}/> Explore again</button><Link className="button discovery-next" href="#worlds">See all seven worlds <ArrowRight size={16}/></Link></div>
  </div>}
 </div>
}
