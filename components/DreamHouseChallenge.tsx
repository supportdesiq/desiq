"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Grid3X3, House, Minus, Plus, RotateCcw, Ruler, Sparkles, Trash2, Box as BoxIcon } from "lucide-react";

type Room = { id: number; kind: string; name: string; x: number; y: number; w: number; h: number; };
type Item = { id: number; name: string; price: number; category: string; };
const roomTypes = [
  {kind:"living",name:"Living room",w:4,h:4,color:"#dce9ff"},
  {kind:"bedroom",name:"Bedroom",w:3.5,h:3.5,color:"#f8e9d9"},
  {kind:"kitchen",name:"Kitchen",w:3,h:3,color:"#e2f0df"},
  {kind:"bathroom",name:"Bathroom",w:2,h:2,color:"#dff0f1"},
  {kind:"dining",name:"Dining",w:3,h:3,color:"#f3e7fa"},
  {kind:"study",name:"Study",w:2.5,h:3,color:"#f8f1d8"},
  {kind:"balcony",name:"Balcony",w:3,h:1.5,color:"#e0f1e8"},
  {kind:"store",name:"Store room",w:1.5,h:2,color:"#eee9e1"},
];
const catalogue: Item[] = [
  {id:1,name:"Main door",price:12000,category:"Doors & windows"},
  {id:2,name:"Internal door",price:6500,category:"Doors & windows"},
  {id:3,name:"Window",price:8500,category:"Doors & windows"},
  {id:4,name:"Sliding window",price:14500,category:"Doors & windows"},
  {id:5,name:"Kitchen counter",price:38000,category:"Fixtures"},
  {id:6,name:"Bathroom fittings",price:28000,category:"Fixtures"},
  {id:7,name:"Wardrobe",price:32000,category:"Furniture"},
  {id:8,name:"Sofa set",price:45000,category:"Furniture"},
  {id:9,name:"Dining table",price:22000,category:"Furniture"},
  {id:10,name:"Study desk",price:12000,category:"Furniture"},
  {id:11,name:"Solar panel allowance",price:55000,category:"Sustainable"},
  {id:12,name:"Rainwater harvesting",price:30000,category:"Sustainable"},
];
const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const lakh=(n:number)=>`₹${(n/100000).toFixed(2)} lakh`;

export default function DreamHouseChallenge(){
  const [length,setLength]=useState(9);
  const [width,setWidth]=useState(8);
  const [budget,setBudget]=useState(12);
  const [rate,setRate]=useState(1200);
  const [view,setView]=useState<"2d"|"3d">("2d");
  const [rooms,setRooms]=useState<Room[]>([
    {id:1,kind:"living",name:"Living room",x:0.3,y:0.3,w:4,h:4},
    {id:2,kind:"bedroom",name:"Bedroom",x:4.6,y:0.3,w:3.5,h:3.5},
    {id:3,kind:"kitchen",name:"Kitchen",x:0.3,y:4.6,w:3,h:3},
    {id:4,kind:"bathroom",name:"Bathroom",x:3.7,y:5.2,w:2,h:2},
  ]);
  const [items,setItems]=useState<Item[]>([]);
  const [active,setActive]=useState<number|null>(null);
  const [drag,setDrag]=useState<{id:number;px:number;py:number;x:number;y:number}|null>(null);
  const [name,setName]=useState("My dream home");
  const [explanation,setExplanation]=useState("");
  const [light,setLight]=useState(false);
  const [flow,setFlow]=useState(false);
  const [evaluated,setEvaluated]=useState(false);
  const canvas=useRef<HTMLDivElement>(null);

  const area=length*width;
  const constructionCost=area*10.7639*rate;
  const extras=items.reduce((s,i)=>s+i.price,0);
  const total=constructionCost+extras;
  const over=total>budget*100000;
  const roomArea=rooms.reduce((s,r)=>s+r.w*r.h,0);
  const score=(over?0:35)+(rooms.some(r=>r.kind==="bedroom")?10:0)+(rooms.some(r=>r.kind==="kitchen")?10:0)+(rooms.some(r=>r.kind==="bathroom")?10:0)+(light?15:0)+(flow?10:0)+(explanation.trim().length>=40?10:0);
  const remaining=budget*100000-total;
  const activeRoom=rooms.find(r=>r.id===active);

  function addRoom(kind:string){
    const t=roomTypes.find(r=>r.kind===kind)!;
    const id=Date.now()+Math.floor(Math.random()*1000);
    setRooms(rs=>[...rs,{id,kind,name:t.name,x:Math.max(0.2,Math.min(length-t.w,0.4+(rs.length%3)*1.1)),y:Math.max(0.2,Math.min(width-t.h,0.4+(rs.length%2)*1.2)),w:t.w,h:t.h}]);
    setActive(id);setEvaluated(false);
  }
  function updateRoom(id:number,patch:Partial<Room>){setRooms(rs=>rs.map(r=>r.id===id?{...r,...patch}:r));setEvaluated(false);}
  function onRoomPointerDown(e:React.PointerEvent<HTMLDivElement>,r:Room){
    e.preventDefault();e.stopPropagation();(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setActive(r.id);setDrag({id:r.id,px:e.clientX,py:e.clientY,x:r.x,y:r.y});
  }
  function onCanvasPointerMove(e:React.PointerEvent<HTMLDivElement>){
    if(!drag||!canvas.current)return;
    const rect=canvas.current.getBoundingClientRect();
    const dx=(e.clientX-drag.px)/rect.width*length;
    const dy=(e.clientY-drag.py)/rect.height*width;
    const r=rooms.find(x=>x.id===drag.id);if(!r)return;
    updateRoom(drag.id,{x:Math.max(0,Math.min(length-r.w,drag.x+dx)),y:Math.max(0,Math.min(width-r.h,drag.y+dy))});
  }
  function addItem(id:number){const it=catalogue.find(x=>x.id===id)!;setItems(xs=>[...xs,it]);setEvaluated(false);}
  function reset(){setLength(9);setWidth(8);setBudget(12);setRate(1200);setRooms([]);setItems([]);setActive(null);setEvaluated(false);setExplanation("");setLight(false);setFlow(false);setName("My dream home");}
  const grouped=useMemo(()=>["Doors & windows","Fixtures","Furniture","Sustainable"].map(c=>({category:c,items:catalogue.filter(i=>i.category===c)})),[]);

  return <main className="builder-page">
    <div className="builder-top"><Link href="/subjects/architecture"><ArrowLeft size={15}/> Architecture world</Link><span><i/> INTERACTIVE FLOOR PLAN STUDIO</span></div>
    <header className="builder-hero"><div><div className="builder-kicker"><Sparkles size={14}/> DESIQ ARCHITECTURE · CHALLENGE 01</div><h1>Make space for<br/><em>your big ideas.</em></h1><p>Set your plot dimensions and budget, add rooms and fittings, then arrange the floor plan. Watch your estimated cost update as your design changes.</p><div className="builder-tags"><span>2D FLOOR PLANNER</span><span>3D-STYLE PREVIEW</span><span>BEGINNER FRIENDLY</span></div></div><div className="builder-hero-art"><div className="hero-blueprint"><span>DESIGN STUDIO</span><b>01</b><div className="hero-plan-lines"><i/><i/><i/><i/></div></div><House size={100}/></div></header>

    <section className="builder-section">
      <div className="builder-section-head"><div><span className="builder-step">01 · PROJECT SETTINGS</span><h2>Start with your plot.</h2><p>Choose a plot size and a budget. The estimate updates automatically.</p></div><button className="builder-reset" onClick={reset}><RotateCcw size={14}/> Reset project</button></div>
      <div className="settings-grid">
        <label>Plot length <b>{length.toFixed(1)} m</b><input type="range" min="5" max="20" step=".5" value={length} onChange={e=>{setLength(+e.target.value);setRooms(rs=>rs.map(r=>({...r,x:Math.min(r.x,+e.target.value-r.w)})));}}/><small>5–20 metres</small></label>
        <label>Plot width <b>{width.toFixed(1)} m</b><input type="range" min="5" max="20" step=".5" value={width} onChange={e=>{setWidth(+e.target.value);setRooms(rs=>rs.map(r=>({...r,y:Math.min(r.y,+e.target.value-r.h)})));}}/><small>5–20 metres</small></label>
        <label>Maximum budget <b>{money(budget*100000)}</b><input type="range" min="5" max="50" step="1" value={budget} onChange={e=>setBudget(+e.target.value)}/><small>₹5 lakh–₹50 lakh</small></label>
        <label>Construction rate <b>{money(rate)} / sq ft</b><select value={rate} onChange={e=>setRate(+e.target.value)}><option value={1000}>Basic · ₹1,000 / sq ft</option><option value={1200}>Standard · ₹1,200 / sq ft</option><option value={1500}>Premium · ₹1,500 / sq ft</option><option value={1800}>High finish · ₹1,800 / sq ft</option></select><small>Illustrative learning assumptions</small></label>
      </div>
      <div className="project-metrics"><div><small>PLOT AREA</small><b>{area.toFixed(1)} m²</b><span>{(area*10.7639).toFixed(0)} sq ft</span></div><div><small>ROOM FOOTPRINT</small><b>{roomArea.toFixed(1)} m²</b><span>{rooms.length} rooms placed</span></div><div><small>ESTIMATED TOTAL</small><b className={over?"cost-over":""}>{lakh(total)}</b><span>{over?"Over your budget":"Within your budget"}</span></div><div><small>REMAINING</small><b className={over?"cost-over":""}>{over?`-${lakh(-remaining)}`:lakh(remaining)}</b><span>Available balance</span></div></div>
    </section>

    <section className="builder-section">
      <div className="builder-section-head"><div><span className="builder-step">02 · DESIGN YOUR FLOOR PLAN</span><h2>Place. Move. Make it yours.</h2><p>Add rooms from the catalogue, then drag them around the plot. Select a room to resize or remove it.</p></div><div className="view-switch"><button className={view==="2d"?"selected":""} onClick={()=>setView("2d")}><Grid3X3 size={14}/> 2D plan</button><button className={view==="3d"?"selected":""} onClick={()=>setView("3d")}><BoxIcon size={14}/> 3D view</button></div></div>
      <div className="studio-grid">
        <aside className="studio-catalogue"><div className="catalogue-title">ROOM CATALOGUE <span>{roomTypes.length} TYPES</span></div>{roomTypes.map(t=><button key={t.kind} className="catalogue-row" onClick={()=>addRoom(t.kind)}><span className="catalogue-swatch" style={{background:t.color}}/><span><b>{t.name}</b><small>{t.w} × {t.h} m</small></span><Plus size={16}/></button>)}<div className="catalogue-title catalogue-extra">EXTRAS & FITTINGS <span>ADD TO ESTIMATE</span></div>{grouped.map(g=><details key={g.category} className="catalogue-group"><summary>{g.category}<ChevronDown size={14}/></summary>{g.items.map(i=><button key={i.id} className="extra-row" onClick={()=>addItem(i.id)}><span>{i.name}</span><b>+{money(i.price)}</b></button>)}</details>)}</aside>
        <div className="plan-workspace">
          <div className="plan-toolbar"><div><b>{name}</b><input value={name} onChange={e=>setName(e.target.value)} aria-label="Project name" maxLength={40}/></div><span><Ruler size={13}/> {length} m × {width} m</span></div>
          <div className={`plan-stage ${view==="3d"?"view-3d":""}`}><div className="plan-measure-top">{length} m</div><div className="plan-measure-left">{width} m</div>
            {view==="2d"?<div ref={canvas} className="floor-canvas" style={{aspectRatio:`${length}/${width}`}} onPointerMove={onCanvasPointerMove} onPointerUp={()=>setDrag(null)} onPointerLeave={()=>setDrag(null)}>{rooms.map(r=>{const t=roomTypes.find(x=>x.kind===r.kind)!;return <div key={r.id} onPointerDown={e=>onRoomPointerDown(e,r)} className={`placed-room ${active===r.id?"room-active":""}`} style={{left:`${r.x/length*100}%`,top:`${r.y/width*100}%`,width:`${r.w/length*100}%`,height:`${r.h/width*100}%`,background:t.color}}><b>{r.name}</b><small>{r.w.toFixed(1)} × {r.h.toFixed(1)} m</small></div>})}{rooms.length===0&&<div className="empty-plan">Add rooms from the catalogue to begin your floor plan.</div>}</div>:<div className="isometric-stage"><div className="iso-floor" style={{width:`${Math.min(80,length*5)}%`,height:`${Math.min(70,width*6)}%`}}>{rooms.map(r=><div key={r.id} className="iso-room" style={{left:`${r.x/length*100}%`,top:`${r.y/width*100}%`,width:`${r.w/length*100}%`,height:`${r.h/width*100}%`}}><span>{r.name}</span></div>)}</div><div className="iso-caption">CONCEPTUAL 3D-STYLE MASSING VIEW · NOT A CONSTRUCTION MODEL</div></div>}
          </div>
          <div className="plan-hint">↔ Drag rooms to reposition · Select a room to edit its size</div>
          {activeRoom&&<div className="room-editor"><div><b>{activeRoom.name}</b><small>Selected room · adjust dimensions</small></div><label>Width <button onClick={()=>updateRoom(activeRoom.id,{w:Math.max(1,+(activeRoom.w-.5).toFixed(1))})}><Minus size={12}/></button><b>{activeRoom.w.toFixed(1)} m</b><button onClick={()=>updateRoom(activeRoom.id,{w:Math.min(length-activeRoom.x,+(activeRoom.w+.5).toFixed(1))})}><Plus size={12}/></button></label><label>Depth <button onClick={()=>updateRoom(activeRoom.id,{h:Math.max(1,+(activeRoom.h-.5).toFixed(1))})}><Minus size={12}/></button><b>{activeRoom.h.toFixed(1)} m</b><button onClick={()=>updateRoom(activeRoom.id,{h:Math.min(width-activeRoom.y,+(activeRoom.h+.5).toFixed(1))})}><Plus size={12}/></button></label><button className="remove-room" onClick={()=>{setRooms(rs=>rs.filter(r=>r.id!==activeRoom.id));setActive(null)}}><Trash2 size={14}/> Remove</button></div>}
        </div>
      </div>
    </section>

    <section className="builder-section">
      <div className="builder-section-head"><div><span className="builder-step">03 · YOUR ESTIMATE</span><h2>See the cost of your choices.</h2><p>Changing plot dimensions, construction quality, rooms or fittings changes this estimate.</p></div></div>
      <div className="estimate-panel"><div className="estimate-main"><small>ESTIMATED PROJECT COST</small><strong>{lakh(total)}</strong><span className={over?"estimate-warning":"estimate-good"}>{over?"Over budget — adjust the plan":"Within selected budget"}</span><div className="estimate-bar"><i style={{width:`${Math.min(total/(budget*100000)*100,100)}%`}}/></div><div className="estimate-limit"><span>₹0</span><b>Budget {money(budget*100000)}</b></div></div><div className="estimate-breakdown"><div><span>Floor area × construction rate</span><b>{money(constructionCost)}</b></div><div><span>Rooms placed</span><b>{rooms.length}</b></div><div><span>Catalogue extras ({items.length})</span><b>{money(extras)}</b></div><div className="estimate-total"><span>Total estimate</span><b>{money(total)}</b></div>{items.length>0&&<div className="added-items">{items.map((i,idx)=><div key={`${i.id}-${idx}`}><span>{i.name} <button onClick={()=>setItems(xs=>xs.filter((_,j)=>j!==idx))}>remove</button></span><b>{money(i.price)}</b></div>)}</div>}</div></div>
    </section>

    <section className="builder-section reflection-section"><div className="builder-section-head"><div><span className="builder-step">04 · DESIGN THINKING</span><h2>Make your design work for people.</h2><p>Good architecture considers comfort and everyday life, not just the floor area.</p></div></div><div className="reflection-options"><label><input type="checkbox" checked={light} onChange={e=>setLight(e.target.checked)}/><span><b>Natural light & ventilation</b><small>I've considered daylight and airflow in the main spaces.</small></span></label><label><input type="checkbox" checked={flow} onChange={e=>setFlow(e.target.checked)}/><span><b>Practical movement</b><small>I've thought about privacy and how people move through the home.</small></span></label></div><label className="reflection-label">Explain your design decisions<textarea rows={4} value={explanation} onChange={e=>setExplanation(e.target.value)} placeholder="Who will live here? What did you prioritise? How did your budget affect your choices?"/></label><button className="evaluate-button" onClick={()=>setEvaluated(true)}>Evaluate my design <ArrowUpRight size={16}/></button>{evaluated&&<div className="score-panel"><div><small>LEARNING SCORE</small><strong>{score}<span>/100</span></strong><b>{score>=80?"Thoughtful design!":score>=55?"Good progress — refine your plan.":"A first draft is a great start."}</b></div><p>{over?"Your estimate is above budget. Try reducing the plot size, changing the construction rate or removing extras.":"Your project is within budget."} This is an educational self-check, not a professional architectural assessment.</p></div>}</section>
    <footer className="builder-footer"><div><span className="builder-step">DESIQ ARCHITECTURE</span><h2>Every great space<br/><em>starts with a question.</em></h2></div><Link className="builder-back-button" href="/subjects/architecture">Back to Architecture <ArrowUpRight size={15}/></Link></footer>
  </main>;
}
