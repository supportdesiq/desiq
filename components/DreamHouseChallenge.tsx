"use client";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Grid3X3, House, Layers, Minus, Plus, RotateCcw, Ruler, Sparkles, Trash2, Box as BoxIcon, Sun, Wind, Accessibility, ShieldCheck } from "lucide-react";
import RealisticHouse3D, { type ModelItem, type ModelRoom } from "./RealisticHouse3D";

type Room=ModelRoom;
type PlacedItem=ModelItem & {priceType:"fixed"|"length"|"area";rate:number;quantity:number;unit:string};
type Opening={id:number;kind:"door"|"window";wall:string;offset:number;width:number;height:number};
type Floor={id:number,name:string,rooms:Room[],items:PlacedItem[],openings:Opening[]};
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
const challengePresets:Record<string,{title:string;tagline:string;length:number;width:number;budget:number;rate:number;brief:string;goal:string;level:string;time:string}>={
 "dream-house":{title:"Design your dream house",tagline:"Create a home that fits the way you live.",length:12,width:10,budget:30,rate:1450,brief:"Design a practical family home. Balance shared spaces, private rooms, daylight, ventilation and budget.",goal:"Create a complete family floor plan and explain your design choices.",level:"Beginner",time:"30–45 MIN"},
 "tiny-home":{title:"The 40 m² tiny home",tagline:"Make every square metre work harder.",length:8,width:5,budget:18,rate:1450,brief:"Design a compact home for one or two people. Fit sleeping, cooking, bathing, storage and a flexible living area into a small footprint.",goal:"Use space efficiently without sacrificing comfort or circulation.",level:"Beginner",time:"25–35 MIN"},
 "climate-smart":{title:"Design a climate-smart home",tagline:"Let the climate shape the architecture.",length:12,width:9,budget:35,rate:1850,brief:"Plan a home that responds to heat, sun, shade, daylight and cross-ventilation. Choose openings and materials thoughtfully.",goal:"Explain how orientation, shading, ventilation and materials improve comfort.",level:"Intermediate",time:"35–50 MIN"},
 "accessible-home":{title:"A home for every generation",tagline:"Design for comfort, dignity and access.",length:14,width:11,budget:42,rate:1850,brief:"Create a home for children, adults and an older family member. Consider step-free access, wider movement routes, bathroom safety and privacy.",goal:"Prioritise accessibility, safe movement and flexible shared spaces.",level:"Intermediate",time:"40–55 MIN"},
 "courtyard-home":{title:"The courtyard home",tagline:"Bring light and nature into the centre.",length:16,width:12,budget:48,rate:1850,brief:"Organise a home around a small courtyard. Explore privacy, daylight, airflow and the relationship between indoor and outdoor space.",goal:"Use a courtyard to connect rooms while maintaining privacy.",level:"Intermediate",time:"40–55 MIN"},
 "community-cafe":{title:"Design a neighbourhood café",tagline:"Make a small public space welcoming.",length:12,width:8,budget:28,rate:1450,brief:"Design a compact café with seating, counter, kitchen/prep, storage and accessible circulation. Think about customer and staff movement.",goal:"Separate customer and service circulation and create a welcoming layout.",level:"Intermediate",time:"35–50 MIN"},
 "studio-renovation":{title:"Renovate a compact apartment",tagline:"Make an existing space feel new.",length:10,width:7,budget:15,rate:1100,brief:"Rework a compact apartment layout using furniture, storage, lighting and finishes. Keep the structure simple and make the most of the existing footprint.",goal:"Improve functionality through layout and furnishing choices.",level:"Beginner",time:"25–40 MIN"}
};
export default function DreamHouseChallenge({challengeKey="dream-house"}:{challengeKey?:string}){
 const challenge=challengePresets[challengeKey]||challengePresets["dream-house"];
 const [length,setLength]=useState(challenge.length),[width,setWidth]=useState(challenge.width),[budget,setBudget]=useState(challenge.budget),[rate,setRate]=useState(challenge.rate);
 const [floors,setFloors]=useState<Floor[]>([{id:1,name:"Ground floor",rooms:challengeKey==="dream-house"?[{id:11,kind:"living",name:"Living room",x:.2,y:.2,w:4,h:4},{id:12,kind:"bedroom",name:"Bedroom",x:4.5,y:.2,w:3.5,h:3.5},{id:13,kind:"kitchen",name:"Kitchen",x:.2,y:4.5,w:3,h:3}]:[],items:[],openings:[]}]);
 const [selectedOpening,setSelectedOpening]=useState<number|null>(null);
 const [wallHeight,setWallHeight]=useState(2.8),[roof,setRoof]=useState("flat"),[material,setMaterial]=useState("warm"),[openingWall,setOpeningWall]=useState("Outer North");
 const [floorIndex,setFloorIndex]=useState(0),[view,setView]=useState<"2d"|"3d">("2d"),[active,setActive]=useState<{type:"room"|"item";id:number}|null>(null);
 const [drag,setDrag]=useState<{type:"room"|"item";id:number;px:number;py:number;x:number;y:number}|null>(null);
 const [name,setName]=useState(challenge.title),[expanded,setExpanded]=useState("Kitchen");
 const [checks,setChecks]=useState<string[]>([]),[explanation,setExplanation]=useState(""),[evaluated,setEvaluated]=useState(false);
 const canvas=useRef<HTMLDivElement>(null);
 const current=floors[floorIndex]||floors[0];
 const area=length*width,areaSqFt=area*10.7639;
 const baseCost=areaSqFt*rate*floors.length;
 const openingsCount=floors.reduce((n,f)=>n+f.openings.length,0);
 const allExtras=floors.reduce((sum,f)=>sum+f.items.reduce((s,i)=>s+itemCost(i),0),0);
 const total=baseCost+allExtras,over=total>budget*100000;
 const currentRooms=current.rooms,currentItems=current.items,currentOpenings=current.openings||[];
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
 function addOpening(kind:"door"|"window"){
  const isDoor=kind==="door";const opening:Opening={id:Date.now(),kind,wall:openingWall,offset:.8,width:isDoor ? .9 : 1.2,height:isDoor ? 2.1 : 1.2};
  const roomMatch=openingWall.match(/^Room (\d+) (North|East|South|West)$/);
  const roomTarget=roomMatch?currentRooms.find(r=>r.id===Number(roomMatch[1])):undefined;
  const side=roomMatch?roomMatch[2]:openingWall.replace("Outer ","");
  const span=roomTarget?(side==="East"||side==="West"?roomTarget.h:roomTarget.w):(side==="East"||side==="West"?width:length);
  if(opening.offset+opening.width>span-.2){opening.offset=Math.max(.2,span-opening.width-.2);}
  patchFloor({openings:[...currentOpenings,opening]});setActive(null);
 }
 function removeOpening(id:number){patchFloor({openings:currentOpenings.filter(o=>o.id!==id)});}
 function adjustOpening(id:number,patch:Partial<Opening>){
  patchFloor({openings:currentOpenings.map(o=>o.id===id?{...o,...patch}:o)});
 }
 function addFloor(){if(floors.length>=4){alert("The learning planner currently supports up to four floors.");return;}const f={id:Date.now(),name:["Ground floor","First floor","Second floor","Third floor"][floors.length],rooms:[],items:[],openings:[]};setFloors([...floors,f]);setFloorIndex(floors.length);setActive(null);}
 function removeFloor(){if(floors.length===1)return;if(!confirm("Remove this floor and its rooms and fittings?"))return;const next=floors.filter((_,i)=>i!==floorIndex);setFloors(next);setFloorIndex(Math.max(0,floorIndex-1));setActive(null);}
 function reset(){setLength(challenge.length);setWidth(challenge.width);setBudget(challenge.budget);setRate(challenge.rate);setFloors([{id:1,name:"Ground floor",rooms:[],items:[],openings:[]}]);setFloorIndex(0);setActive(null);setEvaluated(false);setChecks([]);setExplanation("");setWallHeight(2.8);setRoof("flat");setMaterial("warm");}
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
 const builtUpM2=area*floors.length;
 const outerWallArea=Math.max(0,2*(length+width)*wallHeight*floors.length-openingsCount*1.8);
 const brickVolume=outerWallArea*.23;
 const slabConcrete=builtUpM2*.12;
 const brickQty=Math.ceil(brickVolume*500);
 const cementBags=Math.ceil(brickVolume*1.6+slabConcrete*8);
 const steelKg=Math.ceil(slabConcrete*80);
 const sandM3=+(brickVolume*.30+slabConcrete*.42).toFixed(1);
 const aggregateM3=+(slabConcrete*.84).toFixed(1);
 const tileM2=+(builtUpM2*1.08).toFixed(1);
 const paintM2=+(outerWallArea*1.8).toFixed(1);
 const estimatorRows=[
  ["Bricks",`${brickQty.toLocaleString("en-IN")} pcs`,money(brickQty*9),"Outer-wall volume × 500 bricks/m³"],
  ["Cement",`${cementBags} bags`,money(cementBags*420),"Masonry + slab allowance"],
  ["Reinforcement steel",`${steelKg.toLocaleString("en-IN")} kg`,money(steelKg*68),"RCC slab allowance × 80 kg/m³"],
  ["Sand",`${sandM3} m³`,money(sandM3*1900),"Masonry + concrete allowance"],
  ["Coarse aggregate",`${aggregateM3} m³`,money(aggregateM3*1700),"Concrete allowance"],
  ["Floor tiles",`${tileM2} m²`,money(tileM2*950),"Built-up area + 8% wastage"],
  ["Paint",`${paintM2} m²`,money(paintM2*180),"Approx. wall surface allowance"],
 ];
 const materialSubtotal=brickQty*9+cementBags*420+steelKg*68+sandM3*1900+aggregateM3*1700+tileM2*950+paintM2*180;
 const labourAllowance=Math.round(materialSubtotal*.3);
 const score=(over?0:20)+Math.min(25,allRooms*3)+Math.min(30,checks.length*3)+(explanation.trim().length>50?15:0)+(floors.length>1?10:0);
 return <main className="builder-page">
  <div className="builder-top"><Link href="/subjects/architecture"><ArrowLeft size={15}/> Architecture world</Link><span><i/> INTERACTIVE FLOOR PLAN STUDIO</span></div>
  <header className="builder-hero"><div><div className="builder-kicker"><Sparkles size={14}/> DESIQ ARCHITECTURE · CHALLENGE 01</div><h1>{challenge.title.split(" ").slice(0,3).join(" ")}<br/><em>{challenge.title.split(" ").slice(3).join(" ")||"your big ideas."}</em></h1><p>Set the plot, choose your budget, add rooms and furnishings, then arrange every element on your plan. Your estimate responds to the dimensions and quantities you choose.</p><div className="builder-tags"><span>DRAG & ARRANGE</span><span>LIVE COST ESTIMATE</span><span>2D TO 3D</span></div></div><div className="builder-hero-art"><div className="hero-blueprint"><span>DESIGN STUDIO</span><b>01</b><div className="hero-plan-lines"><i/><i/><i/><i/></div></div><House size={100}/></div></header>

  <section className="challenge-brief-panel"><div><span className="builder-step">DESIQ LIVE CHALLENGE · {challenge.level.toUpperCase()}</span><h2>{challenge.title}</h2><p>{challenge.brief}</p><div className="challenge-brief-meta"><span>{challenge.time}</span><span>INTERACTIVE DESIGN</span><span>SELF-PACED</span></div></div><div className="challenge-goal"><small>YOUR DESIGN GOAL</small><b>{challenge.goal}</b><Link href="/architecture/challenges">Explore other challenges ↗</Link></div></section>
  <section className="builder-section"><div className="builder-section-head"><div><span className="builder-step">01 · PROJECT SETTINGS</span><h2>Start with your plot.</h2><p>Choose the footprint, number of floors, construction finish and total budget.</p></div><button className="builder-reset" onClick={reset}><RotateCcw size={14}/> Reset project</button></div>
   <div className="settings-grid">
    <label>Plot length <b>{length.toFixed(1)} m</b><input type="range" min="5" max="30" step=".5" value={length} onChange={e=>{const v=+e.target.value;setLength(v);setFloors(fs=>fs.map(f=>({...f,rooms:f.rooms.map(r=>({...r,w:Math.min(r.w,v),x:Math.min(r.x,Math.max(0,v-r.w))})),items:f.items.map(i=>({...i,w:Math.min(i.w,v),x:Math.min(i.x,Math.max(0,v-i.w))}))})));}}/><small>5–30 metres</small></label>
    <label>Plot width <b>{width.toFixed(1)} m</b><input type="range" min="5" max="30" step=".5" value={width} onChange={e=>{const v=+e.target.value;setWidth(v);setFloors(fs=>fs.map(f=>({...f,rooms:f.rooms.map(r=>({...r,h:Math.min(r.h,v),y:Math.min(r.y,Math.max(0,v-r.h))})),items:f.items.map(i=>({...i,h:Math.min(i.h,v),y:Math.min(i.y,Math.max(0,v-i.h))}))})));}}/><small>5–30 metres</small></label>
    <label>Maximum budget <b>{money(budget*100000)}</b><input type="range" min="5" max="150" step="1" value={budget} onChange={e=>setBudget(+e.target.value)}/><small>₹5 lakh–₹1.5 crore</small></label>
    <label>Construction rate <b>{money(rate)} / sq ft</b><select value={rate} onChange={e=>setRate(+e.target.value)}><option value={1100}>Basic · ₹1,100 / sq ft</option><option value={1450}>Standard · ₹1,450 / sq ft</option><option value={1850}>Premium · ₹1,850 / sq ft</option><option value={2300}>High finish · ₹2,300 / sq ft</option></select><small>Indicative learning estimate · India</small></label>
    <label>Wall height <b>{wallHeight.toFixed(1)} m</b><input type="range" min="2.4" max="4.2" step=".1" value={wallHeight} onChange={e=>setWallHeight(+e.target.value)}/><small>Floor-to-ceiling height</small></label>
    <label>Roof design <b>{roof==="flat"?"Flat roof":roof==="pitched"?"Pitched roof":"Open roof / no cover"}</b><select value={roof} onChange={e=>setRoof(e.target.value)}><option value="flat">Flat roof</option><option value="pitched">Pitched roof</option><option value="open">Open roof / cutaway</option></select><small>3D concept setting</small></label>
    <label>Material palette <b>{material==="warm"?"Warm natural":material==="cool"?"Cool modern":"Dark contemporary"}</b><select value={material} onChange={e=>setMaterial(e.target.value)}><option value="warm">Warm natural</option><option value="cool">Cool modern</option><option value="dark">Dark contemporary</option></select><small>Changes floor and wall finishes</small></label>
   </div>
   <div className="project-metrics"><div><small>PLOT AREA / FLOOR</small><b>{area.toFixed(1)} m²</b><span>{areaSqFt.toFixed(0)} sq ft</span></div><div><small>BUILT-UP AREA</small><b>{(area*floors.length).toFixed(1)} m²</b><span>{floors.length} floor(s)</span></div><div><small>ESTIMATED TOTAL</small><b className={over?"cost-over":""}>{money(total)}</b><span>{over?"Over your budget":"Within your budget"}</span></div><div><small>REMAINING</small><b className={over?"cost-over":""}>{money(Math.abs(budget*100000-total))}</b><span>{over?"Amount over budget":"Available balance"}</span></div></div>
  </section>

  <section className="builder-section"><div className="builder-section-head"><div><span className="builder-step">02 · DESIGN YOUR FLOOR PLAN</span><h2>Place. Move. Make it yours.</h2><p>Rooms are placed in open spaces. Furniture and fixtures are separate movable objects that can sit inside rooms.</p></div><div className="view-switch"><button className={view==="2d"?"selected":""} onClick={()=>setView("2d")}><Grid3X3 size={14}/> 2D plan</button><button className={view==="3d"?"selected":""} onClick={()=>setView("3d")}><BoxIcon size={14}/> 3D model</button></div></div>
   <div className="floor-tabs">{floors.map((f,i)=><button key={f.id} className={floorIndex===i?"active":""} onClick={()=>{setFloorIndex(i);setActive(null);setSelectedOpening(null)}}><Layers size={13}/>{f.name}</button>)}<button className="add-floor" onClick={addFloor}><Plus size={14}/> Add floor</button>{floors.length>1&&<button className="delete-floor" onClick={removeFloor}><Trash2 size={13}/> Remove floor</button>}</div>
   <div className="studio-grid"><aside className="studio-catalogue"><div className="catalogue-title">ROOM CATALOGUE <span>{roomTypes.length} TYPES</span></div>{roomTypes.map(t=><button key={t.kind} className="catalogue-row" onClick={()=>addRoom(t.kind)}><span className="catalogue-swatch" style={{background:t.color}}/><span><b>{t.name}</b><small>{t.w} × {t.h} m</small></span><Plus size={16}/></button>)}<div className="catalogue-title catalogue-extra">WALL OPENINGS <span>ATTACH TO WALL</span></div>
    <select className="wall-target-select" value={openingWall} onChange={e=>setOpeningWall(e.target.value)}>
     {["Outer North","Outer East","Outer South","Outer West"].map(w=><option key={w} value={w}>{w} wall</option>)}{currentRooms.map(r=>["North","East","South","West"].map(side=><option key={`${r.id}-${side}`} value={`Room ${r.id} ${side}`}>{r.name} · {side} wall</option>))}
    </select>
    <div className="opening-actions"><button onClick={()=>addOpening("door")}>＋ Add door</button><button onClick={()=>addOpening("window")}>＋ Add window</button></div>
    {currentOpenings.map(o=><div className="opening-row" key={o.id}><span>{o.kind==="door"?"Door":"Window"} · {o.wall}</span><button onClick={()=>{removeOpening(o.id);setSelectedOpening(null)}}><Trash2 size={12}/></button></div>)}
    <div className="catalogue-title catalogue-extra">FIXTURES & FURNITURE <span>PLACE IN PLAN</span></div>{categories.map(cat=><div key={cat} className="catalogue-group"><button className="catalogue-category" onClick={()=>setExpanded(expanded===cat?"":cat)}>{cat}<ChevronDown size={14}/></button>{expanded===cat&&catalogue.filter(i=>i.category===cat).map(i=><button key={i.id} className="extra-row" onClick={()=>addItem(i.id)}><span>{i.name}<small>{i.priceType==="length"?`${money(i.rate)} / running m`:i.priceType==="area"?`${money(i.rate)} / m²`:`${money(i.rate)} / each`}</small></span><Plus size={14}/></button>)}</div>)}</aside>
    <div className="plan-workspace"><div className="plan-toolbar"><div><b>{current.name}</b><input value={name} onChange={e=>setName(e.target.value)} aria-label="Project name" maxLength={40}/></div><span><Ruler size={13}/> {length} m × {width} m</span></div>
     {view==="2d"?<div className="plan-stage"><div className="plan-measure-top">{length} m</div><div className="plan-measure-left">{width} m</div><div ref={canvas} className="floor-canvas" style={{aspectRatio:`${length}/${width}`}} onPointerMove={pointerMove} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>{currentRooms.map(r=><div key={r.id} onPointerDown={e=>pointerDown(e,"room",r)} className={`placed-room ${active?.id===r.id?"room-active":""}`} style={{left:`${r.x/length*100}%`,top:`${r.y/width*100}%`,width:`${r.w/length*100}%`,height:`${r.h/width*100}%`,background:roomTypes.find(t=>t.kind===r.kind)?.color}}><b>{r.name}</b><small>{r.w.toFixed(1)} × {r.h.toFixed(1)} m</small></div>)}{currentItems.map(i=><div key={i.id} onPointerDown={e=>pointerDown(e,"item",i)} className={`placed-item ${active?.id===i.id?"item-active":""}`} style={{left:`${i.x/length*100}%`,top:`${i.y/width*100}%`,width:`${i.w/length*100}%`,height:`${i.h/width*100}%`,background:i.color}} title={`${i.name} · ${money(itemCost(i))}`}><b>{i.name}</b><small>{i.w.toFixed(1)} × {i.h.toFixed(1)} m</small></div>)}{currentOpenings.map(o=>{const match=o.wall.match(/^Room (\d+) (North|East|South|West)$/);const target=match?currentRooms.find(r=>r.id===Number(match[1])):undefined;const side=match?match[2]:o.wall.replace("Outer ","");const ox=target?target.x:0,oy=target?target.y:0,spanX=target?target.w:length,spanY=target?target.h:width;const pos=side==="North"?{left:`${(ox+o.offset)/length*100}%`,top:`${oy/width*100}%`,width:`${o.width/length*100}%`,height:"2.5%"}:side==="South"?{left:`${(ox+o.offset)/length*100}%`,top:`${(oy+spanY)/width*100}%`,width:`${o.width/length*100}%`,height:"2.5%"}:side==="West"?{top:`${(oy+o.offset)/width*100}%`,left:`${ox/length*100}%`,height:`${o.width/width*100}%`,width:"2.5%"}:{top:`${(oy+o.offset)/width*100}%`,left:`${(ox+spanX)/length*100}%`,height:`${o.width/width*100}%`,width:"2.5%"};return <div key={o.id} className={`wall-opening ${o.kind} ${selectedOpening===o.id?"opening-active":""}`} onClick={()=>setSelectedOpening(o.id)} style={pos} title={`${o.kind} on ${o.wall}`}>{o.kind==="door"?"D":"W"}</div>})}{currentRooms.length===0&&currentItems.length===0&&<div className="empty-plan">Add rooms and fittings from the catalogue to begin.</div>}</div></div>:<RealisticHouse3D length={length} width={width} rooms={currentRooms} items={currentItems} openings={currentOpenings} wallHeight={wallHeight} roof={roof} material={material} showStairs={floors.length>1}/>}
     <div className="plan-hint">↔ Drag to reposition · Select an element to edit its dimensions · Items can be arranged inside rooms</div>
     {(selectedRoom||selectedItem)&&<div className="room-editor"><div><b>{selectedRoom?.name||selectedItem?.name}</b><small>{selectedRoom?"Selected room":"Selected fixture / furniture"}</small></div>{(["w","h"] as const).map(axis=><label key={axis}>{axis==="w"?"Width":"Depth"}<button onClick={()=>resizeSelected(axis,-.25)}><Minus size={12}/></button><b>{(selectedRoom||selectedItem)![axis].toFixed(2)} m</b><button onClick={()=>resizeSelected(axis,.25)}><Plus size={12}/></button></label>)}{selectedItem&&selectedItem.priceType==="length"&&<span className="item-live-price">Length cost: {money(itemCost(selectedItem))}</span>}<button className="remove-room" onClick={()=>{if(selectedRoom)patchFloor({rooms:currentRooms.filter(r=>r.id!==selectedRoom.id)});if(selectedItem)patchFloor({items:currentItems.filter(i=>i.id!==selectedItem.id)});setActive(null)}}><Trash2 size={14}/> Remove</button></div>}
     {selectedOpening!==null&&currentOpenings.find(o=>o.id===selectedOpening)&&<div className="room-editor opening-editor"><div><b>{currentOpenings.find(o=>o.id===selectedOpening)!.kind==="door"?"Door":"Window"} · {currentOpenings.find(o=>o.id===selectedOpening)!.wall}</b><small>Opening is attached to this external wall</small></div><label>Width <button onClick={()=>adjustOpening(selectedOpening,{width:Math.max(.6,currentOpenings.find(o=>o.id===selectedOpening)!.width-.1)})}><Minus size={12}/></button><b>{currentOpenings.find(o=>o.id===selectedOpening)!.width.toFixed(1)} m</b><button onClick={()=>adjustOpening(selectedOpening,{width:Math.min(2.4,currentOpenings.find(o=>o.id===selectedOpening)!.width+.1)})}><Plus size={12}/></button></label><label>Position <input type="range" min="0.2" max={Math.max(.2,(currentOpenings.find(o=>o.id===selectedOpening)!.wall.match(/^Room (\d+) /)?(()=>{const m=currentOpenings.find(o=>o.id===selectedOpening)!.wall.match(/^Room (\d+) (North|East|South|West)$/)!;const r=currentRooms.find(x=>x.id===Number(m[1]));return r?(m[2]==="East"||m[2]==="West"?r.h:r.w):length;})():(currentOpenings.find(o=>o.id===selectedOpening)!.wall.includes("North")||currentOpenings.find(o=>o.id===selectedOpening)!.wall.includes("South")?length:width))-currentOpenings.find(o=>o.id===selectedOpening)!.width-.2)} step=".1" value={currentOpenings.find(o=>o.id===selectedOpening)!.offset} onChange={e=>adjustOpening(selectedOpening,{offset:+e.target.value})}/></label><button className="remove-room" onClick={()=>{removeOpening(selectedOpening);setSelectedOpening(null)}}><Trash2 size={14}/> Remove opening</button></div>}
    </div></div>
  </section>

  <section className="builder-section"><div className="builder-section-head"><div><span className="builder-step">03 · LIVE COST ESTIMATE</span><h2>Every dimension has a cost.</h2><p>Floor area drives the construction estimate. Linear items such as kitchen slabs are priced by length; area finishes are priced by square metre.</p></div></div>
   <div className="estimate-panel"><div className="estimate-main"><small>ESTIMATED PROJECT COST</small><strong>{money(total)}</strong><span className={over?"estimate-warning":"estimate-good"}>{over?"Over budget — adjust your plan":"Within selected budget"}</span><div className="estimate-bar"><i style={{width:`${Math.min(total/(budget*100000)*100,100)}%`}}/></div><div className="estimate-limit"><span>₹0</span><b>Budget {money(budget*100000)}</b></div></div><div className="estimate-breakdown"><div><span>Construction ({areaSqFt.toFixed(0)} sq ft × {floors.length} floors)</span><b>{money(baseCost)}</b></div><div><span>Fixtures, furniture & finishes ({floors.reduce((n,f)=>n+f.items.length,0)} items)</span><b>{money(allExtras)}</b></div><div><span>Floors / levels</span><b>{floors.length}</b></div><div className="estimate-total"><span>Total estimate</span><b>{money(total)}</b></div>{floors.map(f=><div className="floor-cost-row" key={f.id}><span>{f.name} extras</span><b>{money(f.items.reduce((s,i)=>s+itemCost(i),0))}</b></div>)}</div></div>
   <p className="estimate-disclaimer">Educational estimate only. Construction rates and catalogue prices are illustrative assumptions, not a contractor quotation. Actual costs vary by location, specification, labour, structure, taxes and site conditions.</p>
  </section>

  <section className="builder-section"><div className="builder-section-head"><div><span className="builder-step">04 · CONSTRUCTION QUANTITY ESTIMATOR</span><h2>See what your design may need.</h2><p>Indicative quantities based on plot area, floor count, wall height and openings. The assumptions are visible so students can learn how estimates are formed.</p></div></div>
   <div className="quantity-summary"><div><small>BUILT-UP AREA</small><b>{builtUpM2.toFixed(1)} m²</b></div><div><small>APPROX. OUTER WALL AREA</small><b>{outerWallArea.toFixed(1)} m²</b></div><div><small>MATERIALS ALLOWANCE</small><b>{money(materialSubtotal)}</b></div><div><small>LABOUR ALLOWANCE</small><b>{money(labourAllowance)}</b></div></div>
   <div className="quantity-table-wrap"><table className="quantity-table"><thead><tr><th>Material / work item</th><th>Estimated quantity</th><th>Indicative allowance</th><th>How it is estimated</th></tr></thead><tbody>{estimatorRows.map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody><tfoot><tr><td colSpan={2}>Materials + labour allowance (indicative)</td><td>{money(materialSubtotal+labourAllowance)}</td><td>Labour provision modelled at 30% of material allowance</td></tr></tfoot></table></div>
   <p className="estimate-disclaimer">This is a simplified teaching estimator, not a bill of quantities or contractor quote. Its materials-and-labour subtotal is shown as a learning cross-check and is not added again to the main construction-rate estimate, to avoid double counting. It currently estimates external wall masonry and a basic slab allowance; it does not calculate foundations, columns, beams, internal partitions, lintels, plumbing, electricals, taxes, site conditions or structural design. Local engineers and quantity surveyors must verify all quantities and rates.</p>
  </section>

  <section className="builder-section reflection-section"><div className="builder-section-head"><div><span className="builder-step">05 · DESIGN THINKING & LIVEABILITY</span><h2>Design for the way people live.</h2><p>Architecture is more than fitting rooms into a plot. Think about comfort, climate, privacy, accessibility and the future.</p></div></div>
   <div className="design-thinking-grid">{checksList.map(([id,title,desc],i)=><label key={id} className={`thinking-card ${checks.includes(id)?"thinking-checked":""}`}><input type="checkbox" checked={checks.includes(id)} onChange={e=>{setChecks(c=>e.target.checked?[...c,id]:c.filter(x=>x!==id));setEvaluated(false)}}/><span className="thinking-check">{checks.includes(id)?"✓":String(i+1).padStart(2,"0")}</span><span><b>{title}</b><small>{desc}</small></span></label>)}</div>
   <label className="reflection-label">Explain your design decisions<textarea rows={5} value={explanation} onChange={e=>{setExplanation(e.target.value);setEvaluated(false)}} placeholder="Who will live here? Why did you place the bedrooms where you did? How have you considered sunlight, airflow, privacy and movement? What did your budget make you change?"/></label>
   <button className="evaluate-button" onClick={()=>setEvaluated(true)}>Evaluate my design <ArrowUpRight size={16}/></button>
   {evaluated&&<div className="score-panel"><div><small>LEARNING SCORE</small><strong>{Math.min(100,score)}<span>/100</span></strong><b>{score>=80?"Thoughtful design!":score>=55?"Good progress — refine your plan.":"A first draft is a great start."}</b></div><p>{over?"Your estimate is above budget. Consider revising the plot, finish level or fittings.":"Your project is within budget."} You reviewed {checks.length} liveability considerations and designed across {floors.length} floor(s). This is an educational self-review, not a professional architectural assessment.</p></div>}
  </section>
  <footer className="builder-footer"><div><span className="builder-step">DESIQ ARCHITECTURE</span><h2>Every great space<br/><em>starts with a question.</em></h2></div><Link className="builder-back-button" href="/subjects/architecture">Back to Architecture <ArrowUpRight size={15}/></Link></footer>
 </main>;
}
