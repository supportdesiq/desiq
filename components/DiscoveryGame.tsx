 "use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { subjects } from "@/lib/subjects";

const worlds = Object.fromEntries(subjects.map(s=>[s.slug,s]));
const interestNodes = [
 {id:"space",name:"Shape spaces",hint:"Arrange places and objects",score:{architecture:4}},
 {id:"repair",name:"Find the fault",hint:"Investigate how things work",score:{it:3,hardware:3}},
 {id:"create",name:"Make visuals",hint:"Compose images and ideas",score:{art:4,architecture:1}},
 {id:"digital",name:"Build digitally",hint:"Make tools and systems",score:{"code-ai":4,it:1}},
 {id:"connect",name:"Connect people",hint:"Communicate and explain",score:{languages:4}},
 {id:"improve",name:"Improve a system",hint:"Use resources thoughtfully",score:{sustainability:4}}
];
const activityOptions=[
 {id:"hands",label:"Work with my hands",sub:"Build, arrange, repair",score:{architecture:2,hardware:2}},
 {id:"visual",label:"Think in pictures",sub:"Sketch, compose, imagine",score:{architecture:2,art:3}},
 {id:"logic",label:"Solve a puzzle",sub:"Test, reason, find patterns",score:{it:2,"code-ai":3,hardware:1}},
 {id:"people",label:"Help someone",sub:"Explain, guide, communicate",score:{languages:3,it:1}},
 {id:"systems",label:"Make things work better",sub:"Plan, improve, organise",score:{sustainability:3,it:1}}
];
const scenarioSteps=[
 {id:"notice",label:"Notice what is happening",score:{it:2,hardware:1}},
 {id:"ask",label:"Understand who it affects",score:{languages:2,it:1}},
 {id:"test",label:"Try a small safe test",score:{it:2,hardware:2,"code-ai":1}},
 {id:"plan",label:"Plan a better arrangement",score:{architecture:2,sustainability:1}},
 {id:"make",label:"Create and review a solution",score:{art:1,architecture:1,"code-ai":2,sustainability:1}}
];
const puzzles=[
 {q:"Which tile completes this simple sequence?",tiles:["○","○○","○○○","?"],answers:["○○○○","△△△△","□"],correct:"○○○○",score:{ "code-ai":2,hardware:1,it:1}},
 {q:"A room feels crowded. What would you examine first?",tiles:["SPACE","LIGHT","FLOW","?"],answers:["MOVEMENT","COLOUR","NOISE"],correct:"MOVEMENT",score:{architecture:3,sustainability:1}},
 {q:"A device stops working. What is the most useful first move?",tiles:["OBSERVE","CHECK","TEST","?"],answers:["NARROW IT DOWN","REPLACE EVERYTHING","GIVE UP"],correct:"NARROW IT DOWN",score:{it:2,hardware:2}}
];
export default function DiscoveryGame(){
 const [stage,setStage]=useState(0);
 const [picked,setPicked]=useState<string[]>([]);
 const [ranked,setRanked]=useState<string[]>([]);
 const [matches,setMatches]=useState<string[]>([]);
 const [scenario,setScenario]=useState<string[]>([]);
 const [puzzleIndex,setPuzzleIndex]=useState(0);
 const [puzzleAnswer,setPuzzleAnswer]=useState("");
 const [complete,setComplete]=useState(false);
 const [expanded,setExpanded]=useState<string|null>(null);
 const [scoreMap,setScoreMap]=useState<Record<string,number>>({});
 const addScore=(score:Partial<Record<string,number>>)=>setScoreMap(prev=>{const next={...prev};Object.entries(score).forEach(([k,v])=>{if(typeof v==="number")next[k]=(next[k]||0)+v});return next});
 const toggleInterest=(id:string)=>{const node=interestNodes.find(n=>n.id===id)!;setPicked(prev=>{const exists=prev.includes(id);if(!exists)addScore(node.score);return exists?prev.filter(x=>x!==id):[...prev,id]});setExpanded(id)};
 const rankChoice=(id:string)=>{if(ranked.includes(id))return;setRanked(prev=>[...prev,id]);const opt=activityOptions.find(o=>o.id===id)!;addScore(opt.score)};
 const scenarioChoice=(id:string)=>{if(scenario.includes(id))return;setScenario(prev=>[...prev,id]);const step=scenarioSteps.find(o=>o.id===id)!;addScore(step.score)};
 const activePuzzle=puzzles[puzzleIndex];
 const rankedWorlds=useMemo(()=>Object.entries(scoreMap).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([slug])=>worlds[slug]).filter(Boolean),[scoreMap]);
 const next=()=>{setExpanded(null);if(stage===4)setComplete(true);else setStage(s=>s+1)};
 const back=()=>{if(complete){setComplete(false);setStage(4)}else setStage(s=>Math.max(0,s-1))};
 const reset=()=>{setStage(0);setPicked([]);setRanked([]);setMatches([]);setScenario([]);setPuzzleIndex(0);setPuzzleAnswer("");setScoreMap({});setComplete(false);setExpanded(null)};
 const canContinue=[picked.length>0,ranked.length>=2,puzzleAnswer!=="",scenario.length>=2,matches.length>=1][stage];
 return <div className="discovery-panel" id="discovery-game">
  <div className="discovery-panel-top"><span><i/> DESIQ DISCOVERY</span><span>{complete?"YOUR DISCOVERY":`STAGE 0${stage+1} / 05`}</span></div>
  <div className="discovery-progress"><span style={{width:`${complete?100:((stage+1)/5)*100}%`}}/></div>
  {!complete ? <>
   {stage===0&&<section className="discovery-stage">
    <div className="discovery-stage-label">01 · EXPLORE THE MAP</div><h2>Follow what catches your eye.</h2><p>Open the bubbles that interest you. Explore their smaller ideas and collect the ones you want to know more about.</p>
    <div className="discovery-orbit"><div className="orbit-core">YOUR<br/>CURIOSITY</div>{interestNodes.map((n,i)=><button key={n.id} type="button" onMouseEnter={()=>setExpanded(n.id)} onFocus={()=>setExpanded(n.id)} onClick={()=>toggleInterest(n.id)} className={`orbit-node orbit-${i+1} ${picked.includes(n.id)?"chosen":""} ${expanded===n.id?"expanded":""}`}><span>{picked.includes(n.id)?<Check size={13}/>:["⌂","⌘","✳","</>","文","♧"][i]}</span><b>{n.name}</b><small>{n.hint}</small></button>)}</div>
    <div className="discovery-selected-line">{picked.length} directions collected <span>{picked.map(id=>interestNodes.find(n=>n.id===id)?.name).join(" · ")}</span></div>
   </section>}
   {stage===1&&<section className="discovery-stage">
    <div className="discovery-stage-label">02 · BUILD YOUR MIX</div><h2>Put the activities in your order.</h2><p>Tap the activities you would most like to try. Your first pick becomes your top preference. You can choose at least two.</p>
    <div className="activity-board">{activityOptions.map((o,i)=><button key={o.id} type="button" onClick={()=>rankChoice(o.id)} disabled={ranked.includes(o.id)} className={`activity-tile ${ranked.includes(o.id)?"ranked":""}`}><span className="activity-rank">{ranked.includes(o.id)?String(ranked.indexOf(o.id)+1).padStart(2,"0"):String(i+1).padStart(2,"0")}</span><b>{o.label}</b><small>{o.sub}</small>{ranked.includes(o.id)&&<Check size={16}/>}</button>)}</div>
    <div className="discovery-selected-line">Your order <span>{ranked.map(id=>activityOptions.find(o=>o.id===id)?.label).join(" → ")||"Choose the activities that appeal to you"}</span></div>
   </section>}
   {stage===2&&<section className="discovery-stage">
    <div className="discovery-stage-label">03 · SPOT THE CONNECTION</div><h2>A little pattern challenge.</h2><p>Look at the sequence and choose what you think comes next. This is just a playful clue about how you like to approach things.</p>
    <div className="pattern-board"><div className="pattern-question">{activePuzzle.q}</div><div className="pattern-tiles">{activePuzzle.tiles.map((t,i)=><div className={`pattern-tile ${t==="?"?"missing":""}`} key={i}>{t}</div>)}</div><div className="pattern-answers">{activePuzzle.answers.map(a=><button key={a} type="button" onClick={()=>{if(!puzzleAnswer){setPuzzleAnswer(a);if(a===activePuzzle.correct)addScore(activePuzzle.score);else addScore({"art":1,"languages":1})}}} className={puzzleAnswer===a?"selected":""} disabled={!!puzzleAnswer}>{a}</button>)}</div><div className="pattern-feedback">{puzzleAnswer?(puzzleAnswer===activePuzzle.correct?"Nice connection.":"Interesting choice. There can be different ways to think about a pattern."):"Choose the tile that feels right."}</div><button type="button" className="puzzle-refresh" onClick={()=>{setPuzzleIndex(i=>(i+1)%puzzles.length);setPuzzleAnswer("")}}>Try a different puzzle ↻</button></div>
   </section>}
   {stage===3&&<section className="discovery-stage">
    <div className="discovery-stage-label">04 · CHOOSE YOUR APPROACH</div><h2>Imagine something needs improving.</h2><p>There is no single correct route. Tap the actions you would naturally take. Add at least two to build your approach.</p>
    <div className="scenario-board"><div className="scenario-brief"><span>YOUR MISSION</span><b>A shared workspace feels confusing and difficult to use.</b><small>How would you start making it better?</small></div><div className="scenario-actions">{scenarioSteps.map((s,i)=><button key={s.id} type="button" onClick={()=>scenarioChoice(s.id)} disabled={scenario.includes(s.id)} className={scenario.includes(s.id)?"done":""}><span>{scenario.includes(s.id)?<Check size={14}/>:`0${i+1}`}</span>{s.label}<ArrowUpRight size={14}/></button>)}</div><div className="scenario-sequence">{scenario.map((id,i)=><span key={id}>{i+1}. {scenarioSteps.find(s=>s.id===id)?.label}</span>)}</div></div>
   </section>}
   {stage===4&&<section className="discovery-stage">
    <div className="discovery-stage-label">05 · YOUR INTEREST MAP</div><h2>Look at the directions you've explored.</h2><p>Tap a direction to see how it connects to the things you selected. Choose the one you'd most like to explore next.</p>
    <div className="interest-map">{subjects.map(s=>{const n=scoreMap[s.slug]||0;return <button type="button" key={s.slug} onClick={()=>{if(!matches.includes(s.slug))addScore({[s.slug]:1});setMatches(prev=>prev.includes(s.slug)?prev.filter(x=>x!==s.slug):[...prev,s.slug])}} className={matches.includes(s.slug)?"map-picked":""}><span>{s.icon}</span><b>{s.short}</b><small>{n?`${n} interest signals`:"A new direction to explore"}</small>{matches.includes(s.slug)&&<Check size={14}/>}</button>})}</div>
    <div className="discovery-selected-line">{matches.length} directions you want to explore <span>Choose at least one to reveal your profile.</span></div>
   </section>}
   <div className="discovery-controls"><button className="discovery-back" type="button" onClick={back} disabled={stage===0}><ArrowLeft size={15}/> Back</button><span>{stage===0?`${picked.length} bubbles explored`:stage===1?`${ranked.length} activities ranked`:stage===2?"Pattern activity":stage===3?`${scenario.length} actions chosen`:`${matches.length} directions saved`}</span><button className="button discovery-next" type="button" disabled={!canContinue} onClick={next}>{stage===4?"Reveal my direction":"Continue"} <ArrowRight size={16}/></button></div>
  </>:<div className="discovery-results">
   <div className="discovery-stage-label">YOUR DESIQ DISCOVERY PROFILE</div><h2>Your curiosity has a direction.</h2><p className="discovery-result-intro">Your choices point to these learning worlds. They are starting points based on what you explored—not a formal aptitude test.</p>
   <div className="discovery-result-list">{(rankedWorlds.length?rankedWorlds:subjects.slice(0,3)).map((s,i)=><article className="discovery-result-card" key={s.slug}><div className="result-rank">0{i+1}</div><div className="result-icon">{s.icon}</div><div className="result-copy"><b>{s.short}</b><span>{s.tagline}</span><small>{s.description}</small></div><Link href={s.slug==="it"?"/subjects/it-support":`/subjects/${s.slug}`} aria-label={`Explore ${s.short}`}><ArrowUpRight size={18}/></Link></article>)}</div>
   <div className="discovery-free-note"><Sparkles size={17}/><div><b>Try before you decide.</b><span>Explore your recommended worlds and start with introductory challenges.</span></div></div>
   <div className="discovery-controls result-controls"><button className="discovery-back" type="button" onClick={reset}><RotateCcw size={15}/> Explore again</button><Link className="button discovery-next" href="#worlds">See all seven worlds <ArrowRight size={16}/></Link></div>
  </div>}
 </div>
}
