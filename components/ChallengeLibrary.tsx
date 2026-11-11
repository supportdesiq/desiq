"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, Eye, X, Sparkles, CheckCircle2, Wallet, Layers3 } from "lucide-react";

type Challenge = {
  slug: string; n: string; name: string; level: string; time: string; budget: string;
  desc: string; tags: string[]; discipline: string; type: "building" | "outdoor" | "interior";
  brief: string; goals: string[]; toolkit: string[];
};
const challenges: Challenge[] = [
 {slug:"dream-house",n:"01",name:"Design your dream house",level:"Beginner",time:"30–45 min",budget:"₹30 lakh",desc:"Plan a family home with rooms, furniture, wall openings and a live cost estimate.",tags:["Residential","Floor planning","Budget"],discipline:"RESIDENTIAL",type:"building",brief:"Create a comfortable family home that makes every square metre count. Balance privacy, daylight, circulation and the budget.",goals:["Arrange living, sleeping and service spaces","Place doors, windows and furniture","Keep the plan within the project budget"],toolkit:["Rooms and partitions","Doors and windows","Furniture and fixtures","Finishes and cost estimate"]},
 {slug:"community-cafe",n:"02",name:"Design a neighbourhood café",level:"Intermediate",time:"35–50 min",budget:"₹28 lakh",desc:"Create a welcoming café with seating, service counter, prep kitchen and customer circulation.",tags:["Hospitality","Interiors","Service flow"],discipline:"HOSPITALITY",type:"building",brief:"Turn a small commercial space into a café people want to spend time in. Make customer flow, service and seating work together.",goals:["Create a welcoming entrance and queue","Separate customer seating from food preparation","Fit practical seating without blocking circulation"],toolkit:["Tables and seating","Service counter","Prep kitchen","Lighting and interior finishes"]},
 {slug:"traffic-bridge",n:"03",name:"Build a bridge for smoother traffic",level:"Advanced",time:"45–60 min",budget:"₹1.2 crore",desc:"Plan vehicle lanes, pedestrian paths, cycle access, bridge supports, ramps and traffic safety.",tags:["Infrastructure","Mobility","Engineering"],discipline:"INFRASTRUCTURE",type:"outdoor",brief:"Plan a conceptual bridge crossing that helps vehicles, pedestrians and cyclists move more safely and clearly through the site.",goals:["Organise lanes and crossing points","Connect pedestrian and cycle routes","Place supports, ramps and safety elements"],toolkit:["Road and lane markers","Bridge supports","Pedestrian and cycle paths","Signals, barriers and crossings"]},
 {slug:"community-auditorium",n:"04",name:"Design a community auditorium",level:"Advanced",time:"45–60 min",budget:"₹1.6 crore",desc:"Arrange the stage, audience seating, lobby, backstage, accessible aisles and AV facilities.",tags:["Public buildings","Acoustics","Accessibility"],discipline:"PUBLIC BUILDINGS",type:"building",brief:"Design a public venue that welcomes a crowd and supports performances, events and community gatherings.",goals:["Plan stage, audience and backstage zones","Keep accessible routes and clear exits","Arrange seating and AV facilities"],toolkit:["Stage and backstage zones","Audience seating","Lobby and circulation","AV and lighting elements"]},
 {slug:"public-park",n:"05",name:"Create a neighbourhood park",level:"Intermediate",time:"35–50 min",budget:"₹55 lakh",desc:"Shape a public landscape with lawns, play areas, paths, shaded seating and green spaces.",tags:["Landscape","Recreation","Public realm"],discipline:"LANDSCAPE",type:"outdoor",brief:"Turn an open site into an inclusive neighbourhood park with places to play, rest, meet and enjoy nature.",goals:["Connect entrances with accessible paths","Balance play, quiet and gathering zones","Add shade, planting and seating"],toolkit:["Trees and planting","Paths and lawns","Play equipment","Benches, lighting and shelters"]},
 {slug:"pedestrian-plaza",n:"06",name:"Reimagine a busy street",level:"Intermediate",time:"35–50 min",budget:"₹50 lakh",desc:"Transform a congested street into a safer people-first space with crossings, cycle parking and public seating.",tags:["Urban design","Street safety","Mobility"],discipline:"URBAN DESIGN",type:"outdoor",brief:"Rework a busy street so people can walk, cycle, wait and cross more comfortably while keeping essential movement connected.",goals:["Make crossings visible and direct","Create space for walking and cycling","Add seating, shade and transit facilities"],toolkit:["Road lanes and crossings","Cycle parking","Bus stop and street furniture","Trees, lights and seating"]},
 {slug:"studio-renovation",n:"07",name:"Renovate a compact apartment",level:"Beginner",time:"25–40 min",budget:"₹15 lakh",desc:"Refresh an existing apartment with smarter furniture, storage, lighting and finishes.",tags:["Interiors","Renovation","Furniture"],discipline:"INTERIORS",type:"interior",brief:"Refresh a compact apartment without changing its footprint. Improve storage, furniture placement, lighting and everyday comfort.",goals:["Rearrange furniture for better movement","Add useful storage and lighting","Choose finishes within the renovation allowance"],toolkit:["Sofas, beds and tables","Storage units","Lighting and décor","Floor and wall finishes"]}
];
const filters = [{id:"all",label:"All challenges"},{id:"building",label:"Buildings"},{id:"outdoor",label:"Outdoor + public space"},{id:"interior",label:"Interiors"}] as const;

function Scene({slug}:{slug:string}) {
 return <div className={`challenge-scene scene-${slug}`} aria-hidden="true">
  <div className="scene-sky"/><div className="scene-sun"/>
  {slug==="dream-house" && <><div className="scene-ground"/><div className="house-plan"><i/><i/><i/><i/></div><div className="house-body"><i className="house-window"/><i className="house-door"/></div><div className="house-roof"/></>}
  {slug==="community-cafe" && <><div className="cafe-building"><i className="cafe-awning"/><i className="cafe-window"/><i className="cafe-door"/></div><div className="cafe-sign">CAFÉ</div><div className="cafe-table table-a"/><div className="cafe-table table-b"/><div className="cafe-chair chair-a"/><div className="cafe-chair chair-b"/></>}
  {slug==="traffic-bridge" && <><div className="bridge-water"/><div className="bridge-deck"/><div className="bridge-arch"/><div className="bridge-pier pier-a"/><div className="bridge-pier pier-b"/><div className="bridge-car car-a"/><div className="bridge-car car-b"/><div className="bridge-lane"/></>}
  {slug==="community-auditorium" && <><div className="auditorium-wall"/><div className="auditorium-stage"/><div className="auditorium-curtain"/><div className="auditorium-seats">{Array.from({length:12},(_,i)=><i key={i}/>)}</div><div className="auditorium-spotlight"/></>}
  {slug==="public-park" && <><div className="park-lawn"/><div className="park-path"/><div className="park-pond"/><div className="park-tree tree-a"/><div className="park-tree tree-b"/><div className="park-tree tree-c"/><div className="park-bench"/></>}
  {slug==="pedestrian-plaza" && <><div className="street-road"/><div className="street-crossing"/><div className="street-cycle"/><div className="street-tree tree-a"/><div className="street-tree tree-b"/><div className="street-bench"/><div className="street-person person-a"/><div className="street-person person-b"/></>}
  {slug==="studio-renovation" && <><div className="interior-wall"/><div className="interior-window"/><div className="interior-rug"/><div className="interior-sofa"/><div className="interior-cushion"/><div className="interior-table"/><div className="interior-plant"/></>}
  <div className="scene-label">{({ "dream-house":"HOME / 01","community-cafe":"HOSPITALITY / 02","traffic-bridge":"INFRASTRUCTURE / 03","community-auditorium":"PUBLIC SPACE / 04","public-park":"LANDSCAPE / 05","pedestrian-plaza":"URBAN DESIGN / 06","studio-renovation":"INTERIORS / 07"} as Record<string,string>)[slug]}</div>
 </div>;
}

export default function ChallengeLibrary(){
 const [filter,setFilter]=useState<(typeof filters)[number]["id"]>("all");
 const [preview,setPreview]=useState<Challenge|null>(null);
 const visible=useMemo(()=>challenges.filter(c=>filter==="all"||c.type===filter),[filter]);
 useEffect(()=>{if(!preview)return;const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setPreview(null);};window.addEventListener("keydown",closeOnEscape);return()=>window.removeEventListener("keydown",closeOnEscape);},[preview]);
 return <>
  <div className="challenge-filter-bar" aria-label="Filter design challenges">
   <div><span className="eyebrow">PICK YOUR KIND OF PROJECT</span><p>Seven briefs. Seven different ways to think.</p></div>
   <div className="challenge-filter-options">{filters.map(f=><button type="button" key={f.id} className={filter===f.id?"active":""} onClick={()=>setFilter(f.id)} aria-pressed={filter===f.id}>{f.label}</button>)}</div>
  </div>
  <div className="challenge-library-grid">
   {visible.map(c=><article className={`challenge-library-card challenge-card-${c.slug}`} key={c.slug}>
    <div className="challenge-card-top"><span>{c.n} / {c.discipline}</span><span className={`difficulty difficulty-${c.level.toLowerCase()}`}>{c.level}</span></div>
    <Scene slug={c.slug}/>
    <div className="challenge-card-heading"><h2>{c.name}</h2><p>{c.desc}</p></div>
    <div className="challenge-card-tags">{c.tags.map(t=><span key={t}>{t}</span>)}</div>
    <div className="challenge-card-meta">
     <span><Clock3 size={13}/>{c.time}</span>
     <span><Wallet size={13}/>{c.budget}</span>
    </div>
    <div className="challenge-card-actions">
     <button type="button" className="challenge-preview-button" onClick={()=>setPreview(c)}><Eye size={14}/> Preview brief</button>
     <Link href={`/architecture/challenges/${c.slug}`}>Start challenge <ArrowUpRight size={15}/></Link>
    </div>
   </article>)}
  </div>
  <div className="challenge-library-footnote"><span><Sparkles size={14}/> BUILT TO LEARN BY DOING</span><span>Budgets are challenge allowances; live estimates update as you design.</span></div>
  {preview && <div className="challenge-preview-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPreview(null);}}>
   <section className="challenge-preview-modal" role="dialog" aria-modal="true" aria-labelledby="challenge-preview-title">
    <button type="button" className="challenge-preview-close" onClick={()=>setPreview(null)} aria-label="Close preview"><X size={19}/></button>
    <div className="challenge-preview-visual"><Scene slug={preview.slug}/><div className="preview-stamp">DESIQ CHALLENGE / {preview.n}</div></div>
    <div className="challenge-preview-content">
     <div className="eyebrow">{preview.discipline} · {preview.level.toUpperCase()}</div>
     <h2 id="challenge-preview-title">{preview.name}</h2>
     <p>{preview.brief}</p>
     <div className="preview-facts"><span><Clock3 size={15}/>{preview.time}</span><span><Wallet size={15}/>{preview.budget} brief budget</span></div>
     <div className="preview-detail-grid">
      <div><h3><CheckCircle2 size={15}/> Your design goals</h3><ul>{preview.goals.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div><h3><Layers3 size={15}/> Your design toolkit</h3><ul>{preview.toolkit.map(x=><li key={x}>{x}</li>)}</ul></div>
     </div>
     <p className="preview-estimate-note">Your project estimate changes as you add, resize and arrange elements in the studio.</p>
     <Link className="preview-start-link" href={`/architecture/challenges/${preview.slug}`}>Start this challenge <ArrowRight size={16}/></Link>
    </div>
   </section>
  </div>}
 </>;
}
