"use client";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Grid3X3, House, Layers, Minus, Plus, RotateCcw, Ruler, Sparkles, Trash2, Box as BoxIcon, Sun, Wind, Accessibility, ShieldCheck } from "lucide-react";
import RealisticHouse3D, { type ModelItem, type ModelRoom } from "./RealisticHouse3D";

type Room=ModelRoom;
type PlacedItem=ModelItem & {priceType:"fixed"|"length"|"area";rate:number;quantity:number;unit:string};
type Floor={id:number,name:string,rooms:Room[],items:PlacedItem[]};
const roomTypes=[
 {kind:"living",name:"Living room",w:4,h:4,color:"#dce9ff"},
 {kind:"bedroom",name:"Bedroom",w:3.5,h:3.5,color:"#f8e9d9"},
 {kind:"kitchen",name:"Kitchen",w:3,h:3,color:"#e2f0df"},
 {kind:"bathroom",name:"Bathroom",w:2,h:2,color:"#dff0f1"},
 {kind:"dining",name:"Dining",w:3,h:3,color:"#f3e7fa"},
 {kind:"study",name:"Study",w:2.5,h:3,color:"#f8f1d8"},
 {kind:"balcony",name:"Balcony",w:3,h:1.5,color:"#e0f1e8"},
 {kind:"store",name:"Store room",w:1.5,h:2,color:"#eee9e1"},
];
const catalogue=[
 {id:"slab",name:"Kitchen counter / slab",category:"Kitchen",w:2.4,h:.65,rate:6500,priceType:"length" as const,unit:"running metre",color:"#c8c1b4"},
 {id:"sink",name:"Kitchen sink",category:"Kitchen",w:.8,h:.55,rate:9500,priceType:"fixed" as const,unit:"each",color:"#9eb7c4"},
 {id:"hob",name:"Cooktop",category:"Kitchen",w:.65,h:.55,rate:8500,priceType:"fixed" as const,unit:"each",color:"#59677b"},
 {id:"island",name:"Kitchen island",category:"Kitchen",w:1.8,h:.9,rate:28000,priceType:"fixed" as const,unit:"each",color:"#b5a28b"},
 {id:"wardrobe",name:"Built-in wardrobe",category:"Storage",w:1.8,h:.65,rate:18000,priceType:"length" as const,unit:"running metre",color:"#b98e70"},
 {id:"shoe",name:"Shoe cabinet",category:"Storage",w:1.1,h:.4,rate:9000,priceType:"length" as const,unit:"running metre",color:"#c7a98d"},
 {id:"sofa",name:"Sofa",category:"Furniture",w:2,h:.9,rate:32000,priceType:"fixed" as const,unit:"each",color:"#8ba6bd"},
 {id:"bed",name:"Double bed",category:"Furniture",w:2,h:1.8,rate:38000,priceType:"fixed" as const,unit:"each",color:"#b78e82"},
 {id:"singlebed",name:"Single bed",category:"Furniture",w:1,h:2,rate:22000,priceType:"fixed" as const,unit:"each",color:"#c3a28c"},
 {id:"diningtable",name:"Dining table",category:"Furniture",w:1.6,h:.9,rate:24000,priceType:"fixed" as const,unit:"each",color:"#b28d62"},
 {id:"desk",name:"Study desk",category:"Furniture",w:1.2,h:.6,rate:12000,priceType:"fixed" as const,unit:"each",color:"#b79b7c"},
 {id:"tv",name:"TV unit",category:"Furniture",w:1.6,h:.4,rate:16000,priceType:"length" as const,unit:"running metre",color:"#747f91"},
 {id:"toilet",name:"WC / toilet",category:"Bathroom",w:.7,h:1.1,rate:12500,priceType:"fixed" as const,unit:"each",color:"#f5f6f4"},
 {id:"vanity",name:"Wash basin vanity",category:"Bathroom",w:.9,h:.55,rate:14500,priceType:"fixed" as const,unit:"each",color:"#d5c6b5"},
 {id:"shower",name:"Shower enclosure",category:"Bathroom",w:1,h:1,rate:18000,priceType:"fixed" as const,unit:"each",color:"#a8c8d5"},
 {id:"bathtub",name:"Bathtub",category:"Bathroom",w:1.7,h:.8,rate:42000,priceType:"fixed" as const,unit:"each",color:"#e8eeee"},
 {id:"door",name:"Door",category:"Doors & windows",w:.9,h:.18,rate:8500,priceType:"fixed" as const,unit:"each",color:"#9b7558"},
 {id:"window",name:"Window",category:"Doors & windows",w:1.2,h:.15,rate:11000,priceType:"fixed" as const,unit:"each",color:"#8ebbd7"},
 {id:"sliding",name:"Sliding glass door",category:"Doors & windows",w:1.8,h:.15,rate:26000,priceType:"fixed" as const,unit:"each",color:"#8ebbd7"},
 {id:"solar",name:"Solar panel allowance",category:"Sustainability",w:1.6,h:1,rate:18000,priceType:"fixed" as const,unit:"each",color:"#55708f"},
 {id:"rain",name:"Rainwater harvesting unit",category:"Sustainability",w:1,h:1,rate:28000,priceType:"fixed" as const,unit:"each",color:"#83b4ae"},
 {id:"tiles",name:"Floor finish / tiles",category:"Finishes",w:2,h:2,rate:950,priceType:"area" as const,unit:"sq metre",color:"#d7c9ad"},
 {id:"paint",name:"Wall paint allowance",category:"Finishes",w:1,h:.5,rate:180,priceType:"area" as const,unit:"sq metre",color:"#e8dfcc"},
];
const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const overlap=(a:{x:number;y:number;w:number;h:number},b:{x:number;y:number;w:number;h:number},gap=.08)=>a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;
function findSpace(w:number,h:number,length:number,width:number,occupied:{x:number;y:number;w:number;h:number}[]){
 for(let y=.15;y+h<=width+.001;y+=.25)for(let x=.15;x+w<=length+.001;x+=.25){const candidate={x,y,w,h};if(!occupied.some(o=>overlap(candidate,o,.08)))return candidate;}
 return null;
}
function itemCost(i:PlacedItem){return i.priceType==="length"?i.rate*i.w:i.priceType==="area"?i.rate*i.w*i.h:i.rate*i.quantity;}
export default function DreamHouseChallenge(){
 const [length,setLength]=useState(12),[width,setWidth]=useState(10),[budget,setBudget]=useState(30),[rate,setRate]=useState(1450);
 const [floors,setFloors]=useState<Floor[]>([{id:1,name:"Ground floor",rooms:[{id:11,kind:"living",name:"Living room",x:.2,y:.2,w:4,h:4},{id:12,kind:"bedroom",name:"Bedroom",x:4.5,y:.2,w:3.5,h:3.5},{id:13,kind:"kitchen",name:"Kitchen",x:.2,y:4.5,w:3,h:3}],items:[]}]);
 const [floorIndex,setFloorIndex]=useState(0),[view,setView]=useState<"2d"|"3d">("2d"),[active,setActive]=useState<{type:"room"|"item";id:number}|null>(null);
 const [drag,setDrag]=useState<{type:"room"|"item";id:number;px:number;py:number;x:number;y:number}|null>(null);
 const [name,setName]=useState("My dream home"),[expanded,setExpanded]=useState("Kitchen");
 const [checks,setChecks]=useState<string[]>([]),[explanation,setExplanation]=useState(""),[evaluated,setEvaluated]=useState(false);
 const canvas=useRef<HTMLDivElement>(null);
 const current=floors[floorIndex]||floors[0];
 const area=length*width,areaSqFt=area*10.7639;
 const baseCost=areaSqFt*rate*floors.length;
 const allExtras=floors.reduce((sum,f)=>sum+f.items.reduce((s,i)=>s+itemCost(i),0),0);
 const total=baseCost+allExtras,over=total>budget*100000;
 const currentRooms=current.rooms,currentItems=current.items;
 const selectedRoom=active?.type==="room"?currentRooms.find(r=>r.id===active.id):undefined;
 const selectedItem=active?.type==="item"?currentItems.find(i=>i.id===active.id):undefined;
 const roomArea=currentRooms.reduce((s,r)=>s+r.w*r.h,0);
 const allRooms=floors.reduce((a,f)=>a+f.rooms.length,0);
 const categories=useMemo(()=>[...new Set(catalogue.map(i=>i.category))],[]);
 function patchFloor(patch:Partial<Floor>){setFloors(fs=>fs.map((f,i)=>i===floorIndex?{...f,...patch}:f));setEvaluated(false);}
 function addRoom(kind:string){
  const t=roomTypes.find(r=>r.kind===kind)!;const p=findSpace(t.w,t.h,length,width,currentRooms);
  if(!p){alert("There isn't enough clear space on this floor. Increase the plot dimensions or move/remove an item.");return;}
  const room={...p,id:Date.now(),kind,name:t.name};patchFloor({rooms:[...currentRooms,room]});setActive({type:"room",id:room.id});
 }
 function addItem(id:string){
  const t=catalogue.find(i=>i.id===id)!;const p=findSpace(t.w,t.h,length,width,currentItems);
  if(!p){alert("No clear space is available for this item. Try another area or a larger plot.");return;}
  const item:PlacedItem={...p,id:Date.now(),name:t.name,kind:t.id,color:t.color,priceType:t.priceType,rate:t.rate,quantity:1,unit:t.unit};
  patchFloor({items:[...currentItems,item]});setActive({type:"item",id:item.id});
 }
 function move(type:"room"|"item",id:number,x:number,y:number){
  if(type==="room"){
   const obj=currentRooms.find(v=>v.id===id);if(!obj)return;
   const candidate:Room={...obj,x:Math.max(0,Math.min(length-obj.w,x)),y:Math.max(0,Math.min(width-obj.h,y))};
   const occupied=currentRooms.filter(r=>r.id!==id);
   if(!occupied.some(o=>overlap(candidate,o,.06)))patchFloor({rooms:currentRooms.map(r=>r.id===id?candidate:r)});
  }else{
   const obj=currentItems.find(v=>v.id===id);if(!obj)return;
   const candidate:PlacedItem={...obj,x:Math.max(0,Math.min(length-obj.w,x)),y:Math.max(0,Math.min(width-obj.h,y))};
   const occupied=currentItems.filter(i=>i.id!==id);
   if(!occupied.some(o=>overlap(candidate,o,.06)))patchFloor({items:currentItems.map(i=>i.id===id?candidate:i)});
  }
 }
 function pointerDown(e:PointerEvent<HTMLDivElement>,type:"room"|"item",obj:Room|PlacedItem){
  e.preventDefault();e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);setActive({type,id:obj.id});setDrag({type,id:obj.id,px:e.clientX,py:e.clientY,x:obj.x,y:obj.y});
 }
 function pointerMove(e:PointerEvent<HTMLDivElement>){
  if(!drag||!canvas.current)return;const rect=canvas.current.getBoundingClientRect();
  move(drag.type,drag.id,drag.x+(e.clientX-drag.px)/rect.width*length,drag.y+(e.clientY-drag.py)/rect.height*width);
 }
 function resizeSelected(axis:"w"|"h",delta:number){
  if(selectedRoom){const next={...selectedRoom,[axis]:Math.max(1,selectedRoom[axis]+delta)};if(next.x+next.w<=length&&next.y+next.h<=width&&!currentRooms.filter(r=>r.id!==selectedRoom.id).some(o=>overlap(next,o,.05)))patchFloor({rooms:currentRooms.map(r=>r.id===next.id?next:r)});}
  if(selectedItem){const next={...selectedItem,[axis]:Math.max(.25,+(selectedItem[axis]+delta).toFixed(2))};if(next.x+next.w<=length&&next.y+next.h<=width&&!currentItems.filter(i=>i.id!==selectedItem.id).some(o=>overlap(next,o,.05)))patchFloor({items:currentItems.map(i=>i.id===next.id?next:i)});}
 }
 function addFloor(){if(floors.length>=4){alert("The learning planner currently supports up to four floors.");return;}const f={id:Date.now(),name:["Ground floor","First floor","Second floor","Third floor"][floors.length],rooms:[],items:[]};setFloors([...floors,f]);setFloorIndex(floors.length);setActive(null);}
 function removeFloor(){if(floors.length===1)return;if(!confirm("Remove this floor and its rooms and fittings?"))return;const next=floors.filter((_,i)=>i!==floorIndex);setFloors(next);setFloorIndex(Math.max(0,floorIndex-1));setActive(null);}
 function reset(){setLength(12);setWidth(10);setBudget(30);setRate(1450);setFloors([{id:1,name:"Ground floor",rooms:[],items:[]}]);setFloorIndex(0);setActive(null);setEvaluated(false);setChecks([]);setExplanation("");}
 const checksList=[
  ["daylight","Natural daylight","Living spaces and bedrooms have access to windows or daylight."],
  ["airflow","Cross ventilation","Openings can allow air to move through the home."],
  ["privacy","Privacy zoning","Bedrooms are separated from public living areas."],
  ["circulation","Clear circulation","There is a practical route between rooms and entrances."],
  ["accessibility","Accessible movement","Doorways and routes consider children, older people and mobility needs."],
  ["safety","Safety and exits","The layout considers safe exits and clear paths."],
  ["water","Water and plumbing","Kitchen and bathrooms are grouped sensibly to reduce plumbing complexity."],
  ["storage","Storage planning","Everyday storage is included without blocking movement."],
  ["orientation","Climate and orientation","The design responds to sun direction, shade and local climate."],
  ["future","Future flexibility","The home can adapt as the family’s needs change."],
 ];
 const score=(over?0:20)+Math.min(25,allRooms*3)+Math.min(30,checks.length*3)+(explanation.trim().length>50?15:0)+(floors.length>1?10:0);
 return <main className="builder-page">
  <div className="builder-top"><Link href="/subjects/architecture"><ArrowLeft size={15}/> Architecture world</Link><span><i/> INTERACTIVE FLOOR PLAN STUDIO</span></div>
  <header className="builder-hero"><div><div className="builder-kicker"><Sparkles size={14}/> DESIQ ARCHITECTURE · CHALLENGE 01</div><h1>Make space for<br/><em>your big ideas.</em></h1><p>Set the plot, choose your budget, add rooms and furnishings, then arrange every element on your plan. Your estimate responds to the dimensions and quantities you choose.</p><div className="builder-tags"><span>DRAG & ARRANGE</span><span>LIVE COST ESTIMATE</span><span>2D TO 3D</span></div></div><div className="builder-hero-art"><div className="hero-blueprint"><span>DESIGN STUDIO</span><b>01</b><div className="hero-plan-lines"><i/><i/><i/><i/></div></div><House size={100}/></div></header>

  <section className="builder-section"><div className="builder-section-head"><div><span className="builder-step">01 · PROJECT SETTINGS</span><h2>Start with your plot.</h2><p>Choose the footprint, number of floors, construction finish and total budget.</p></div><button className="builder-reset" onClick={reset}><RotateCcw size={14}/> Reset project</button></div>
   <div className="settings-grid">
    <label>Plot length <b>{length.toFixed(1)} m</b><input type="range" min="5" max="30" step=".5" value={length} onChange={e=>{const v=+e.target.value;setLength(v);setFloors(fs=>fs.map(f=>({...f,rooms:f.rooms.map(r=>({...r,w:Math.min(r.w,v),x:Math.min(r.x,Math.max(0,v-r.w))})),items:f.items.map(i=>({...i,w:Math.min(i.w,v),x:Math.min(i.x,Math.max(0,v-i.w))}))})));}}/><small>5–30 metres</small></label>
    <label>Plot width <b>{width.toFixed(1)} m</b><input type="range" min="5" max="30" step=".5" value={width} onChange={e=>{const v=+e.target.value;setWidth(v);setFloors(fs=>fs.map(f=>({...f,rooms:f.rooms.map(r=>({...r,h:Math.min(r.h,v),y:Math.min(r.y,Math.max(0,v-r.h))})),items:f.items.map(i=>({...i,h:Math.min(i.h,v),y:Math.min(i.y,Math.max(0,v-i.h))}))})));}}/><small>5–30 metres</small></label>
    <label>Maximum budget <b>{money(budget*100000)}</b><input type="range" min="5" max="150" step="1" value={budget} onChange={e=>setBudget(+e.target.value)}/><small>₹5 lakh–₹1.5 crore</small></label>
    <label>Construction rate <b>{money(rate)} / sq ft</b><select value={rate} onChange={e=>setRate(+e.target.value)}><option value={1100}>Basic · ₹1,100 / sq ft</option><option value={1450}>Standard · ₹1,450 / sq ft</option><option value={1850}>Premium · ₹1,850 / sq ft</option><option value={2300}>High finish · ₹2,300 / sq ft</option></select><small>Indicative learning estimate · India</small></label>
   </div>
   <div className="project-metrics"><div><small>PLOT AREA / FLOOR</small><b>{area.toFixed(1)} m²</b><span>{areaSqFt.toFixed(0)} sq ft</span></div><div><small>BUILT-UP AREA</small><b>{(area*floors.length).toFixed(1)} m²</b><span>{floors.length} floor(s)</span></div><div><small>ESTIMATED TOTAL</small><b className={over?"cost-over":""}>{money(total)}</b><span>{over?"Over your budget":"Within your budget"}</span></div><div><small>REMAINING</small><b className={over?"cost-over":""}>{money(Math.abs(budget*100000-total))}</b><span>{over?"Amount over budget":"Available balance"}</span></div></div>
  </section>

  <section className="builder-section"><div className="builder-section-head"><div><span className="builder-step">02 · DESIGN YOUR FLOOR PLAN</span><h2>Place. Move. Make it yours.</h2><p>Rooms are placed in open spaces. Furniture and fixtures are separate movable objects that can sit inside rooms.</p></div><div className="view-switch"><button className={view==="2d"?"selected":""} onClick={()=>setView("2d")}><Grid3X3 size={14}/> 2D plan</button><button className={view==="3d"?"selected":""} onClick={()=>setView("3d")}><BoxIcon size={14}/> 3D model</button></div></div>
   <div className="floor-tabs">{floors.map((f,i)=><button key={f.id} className={floorIndex===i?"active":""} onClick={()=>{setFloorIndex(i);setActive(null)}}><Layers size={13}/>{f.name}</button>)}<button className="add-floor" onClick={addFloor}><Plus size={14}/> Add floor</button>{floors.length>1&&<button className="delete-floor" onClick={removeFloor}><Trash2 size={13}/> Remove floor</button>}</div>
   <div className="studio-grid"><aside className="studio-catalogue"><div className="catalogue-title">ROOM CATALOGUE <span>{roomTypes.length} TYPES</span></div>{roomTypes.map(t=><button key={t.kind} className="catalogue-row" onClick={()=>addRoom(t.kind)}><span className="catalogue-swatch" style={{background:t.color}}/><span><b>{t.name}</b><small>{t.w} × {t.h} m</small></span><Plus size={16}/></button>)}<div className="catalogue-title catalogue-extra">FIXTURES & FURNITURE <span>PLACE IN PLAN</span></div>{categories.map(cat=><div key={cat} className="catalogue-group"><button className="catalogue-category" onClick={()=>setExpanded(expanded===cat?"":cat)}>{cat}<ChevronDown size={14}/></button>{expanded===cat&&catalogue.filter(i=>i.category===cat).map(i=><button key={i.id} className="extra-row" onClick={()=>addItem(i.id)}><span>{i.name}<small>{i.priceType==="length"?`${money(i.rate)} / running m`:i.priceType==="area"?`${money(i.rate)} / m²`:`${money(i.rate)} / each`}</small></span><Plus size={14}/></button>)}</div>)}</aside>
    <div className="plan-workspace"><div className="plan-toolbar"><div><b>{current.name}</b><input value={name} onChange={e=>setName(e.target.value)} aria-label="Project name" maxLength={40}/></div><span><Ruler size={13}/> {length} m × {width} m</span></div>
     {view==="2d"?<div className="plan-stage"><div className="plan-measure-top">{length} m</div><div className="plan-measure-left">{width} m</div><div ref={canvas} className="floor-canvas" style={{aspectRatio:`${length}/${width}`}} onPointerMove={pointerMove} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>{currentRooms.map(r=><div key={r.id} onPointerDown={e=>pointerDown(e,"room",r)} className={`placed-room ${active?.id===r.id?"room-active":""}`} style={{left:`${r.x/length*100}%`,top:`${r.y/width*100}%`,width:`${r.w/length*100}%`,height:`${r.h/width*100}%`,background:roomTypes.find(t=>t.kind===r.kind)?.color}}><b>{r.name}</b><small>{r.w.toFixed(1)} × {r.h.toFixed(1)} m</small></div>)}{currentItems.map(i=><div key={i.id} onPointerDown={e=>pointerDown(e,"item",i)} className={`placed-item ${active?.id===i.id?"item-active":""}`} style={{left:`${i.x/length*100}%`,top:`${i.y/width*100}%`,width:`${i.w/length*100}%`,height:`${i.h/width*100}%`,background:i.color}} title={`${i.name} · ${money(itemCost(i))}`}><b>{i.name}</b><small>{i.w.toFixed(1)} × {i.h.toFixed(1)} m</small></div>)}{currentRooms.length===0&&currentItems.length===0&&<div className="empty-plan">Add rooms and fittings from the catalogue to begin.</div>}</div></div>:<RealisticHouse3D length={length} width={width} rooms={currentRooms} items={currentItems}/>}
     <div className="plan-hint">↔ Drag to reposition · Select an element to edit its dimensions · Items can be arranged inside rooms</div>
     {(selectedRoom||selectedItem)&&<div className="room-editor"><div><b>{selectedRoom?.name||selectedItem?.name}</b><small>{selectedRoom?"Selected room":"Selected fixture / furniture"}</small></div>{(["w","h"] as const).map(axis=><label key={axis}>{axis==="w"?"Width":"Depth"}<button onClick={()=>resizeSelected(axis,-.25)}><Minus size={12}/></button><b>{(selectedRoom||selectedItem)![axis].toFixed(2)} m</b><button onClick={()=>resizeSelected(axis,.25)}><Plus size={12}/></button></label>)}{selectedItem&&selectedItem.priceType==="length"&&<span className="item-live-price">Length cost: {money(itemCost(selectedItem))}</span>}<button className="remove-room" onClick={()=>{if(selectedRoom)patchFloor({rooms:currentRooms.filter(r=>r.id!==selectedRoom.id)});if(selectedItem)patchFloor({items:currentItems.filter(i=>i.id!==selectedItem.id)});setActive(null)}}><Trash2 size={14}/> Remove</button></div>}
    </div></div>
  </section>

  <section className="builder-section"><div className="builder-section-head"><div><span className="builder-step">03 · LIVE COST ESTIMATE</span><h2>Every dimension has a cost.</h2><p>Floor area drives the construction estimate. Linear items such as kitchen slabs are priced by length; area finishes are priced by square metre.</p></div></div>
   <div className="estimate-panel"><div className="estimate-main"><small>ESTIMATED PROJECT COST</small><strong>{money(total)}</strong><span className={over?"estimate-warning":"estimate-good"}>{over?"Over budget — adjust your plan":"Within selected budget"}</span><div className="estimate-bar"><i style={{width:`${Math.min(total/(budget*100000)*100,100)}%`}}/></div><div className="estimate-limit"><span>₹0</span><b>Budget {money(budget*100000)}</b></div></div><div className="estimate-breakdown"><div><span>Construction ({areaSqFt.toFixed(0)} sq ft × {floors.length} floors)</span><b>{money(baseCost)}</b></div><div><span>Fixtures, furniture & finishes ({floors.reduce((n,f)=>n+f.items.length,0)} items)</span><b>{money(allExtras)}</b></div><div><span>Floors / levels</span><b>{floors.length}</b></div><div className="estimate-total"><span>Total estimate</span><b>{money(total)}</b></div>{floors.map(f=><div className="floor-cost-row" key={f.id}><span>{f.name} extras</span><b>{money(f.items.reduce((s,i)=>s+itemCost(i),0))}</b></div>)}</div></div>
   <p className="estimate-disclaimer">Educational estimate only. Construction rates and catalogue prices are illustrative assumptions, not a contractor quotation. Actual costs vary by location, specification, labour, structure, taxes and site conditions.</p>
  </section>

  <section className="builder-section reflection-section"><div className="builder-section-head"><div><span className="builder-step">04 · DESIGN THINKING & LIVEABILITY</span><h2>Design for the way people live.</h2><p>Architecture is more than fitting rooms into a plot. Think about comfort, climate, privacy, accessibility and the future.</p></div></div>
   <div className="design-thinking-grid">{checksList.map(([id,title,desc],i)=><label key={id} className={`thinking-card ${checks.includes(id)?"thinking-checked":""}`}><input type="checkbox" checked={checks.includes(id)} onChange={e=>{setChecks(c=>e.target.checked?[...c,id]:c.filter(x=>x!==id));setEvaluated(false)}}/><span className="thinking-check">{checks.includes(id)?"✓":String(i+1).padStart(2,"0")}</span><span><b>{title}</b><small>{desc}</small></span></label>)}</div>
   <label className="reflection-label">Explain your design decisions<textarea rows={5} value={explanation} onChange={e=>{setExplanation(e.target.value);setEvaluated(false)}} placeholder="Who will live here? Why did you place the bedrooms where you did? How have you considered sunlight, airflow, privacy and movement? What did your budget make you change?"/></label>
   <button className="evaluate-button" onClick={()=>setEvaluated(true)}>Evaluate my design <ArrowUpRight size={16}/></button>
   {evaluated&&<div className="score-panel"><div><small>LEARNING SCORE</small><strong>{Math.min(100,score)}<span>/100</span></strong><b>{score>=80?"Thoughtful design!":score>=55?"Good progress — refine your plan.":"A first draft is a great start."}</b></div><p>{over?"Your estimate is above budget. Consider revising the plot, finish level or fittings.":"Your project is within budget."} You reviewed {checks.length} liveability considerations and designed across {floors.length} floor(s). This is an educational self-review, not a professional architectural assessment.</p></div>}
  </section>
  <footer className="builder-footer"><div><span className="builder-step">DESIQ ARCHITECTURE</span><h2>Every great space<br/><em>starts with a question.</em></h2></div><Link className="builder-back-button" href="/subjects/architecture">Back to Architecture <ArrowUpRight size={15}/></Link></footer>
 </main>;
}
