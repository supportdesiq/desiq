"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export type ModelRoom={id:number;name:string;x:number;y:number;w:number;h:number;kind:string};
export type ModelItem={id:number;name:string;x:number;y:number;w:number;h:number;kind:string;color:string};
export type ModelOpening={id:number;kind:"door"|"window";wall:string;offset:number;width:number};
export default function RealisticHouse3D({length,width,rooms,items,openings=[],wallHeight=2.8,roof="flat",material="warm",showStairs=false,outdoor=false}:{length:number;width:number;rooms:ModelRoom[];items:ModelItem[];openings?:ModelOpening[];wallHeight?:number;roof?:string;material?:string;showStairs?:boolean;outdoor?:boolean}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color(outdoor?"#e5eee8":"#e8edf4");scene.fog=new THREE.Fog(outdoor?"#e5eee8":"#e8edf4",35,75);
  const camera=new THREE.PerspectiveCamera(38,el.clientWidth/el.clientHeight,.1,150);camera.position.set(length*1.35,width*1.5,Math.max(length,width)*1.55);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;el.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xfff7e9,0x7789a2,2.1));
  const sun=new THREE.DirectionalLight(0xffe5bf,3.1);sun.position.set(-length,width*1.7,length);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
  const fill=new THREE.PointLight(0xffffff,.45,50);fill.position.set(length/2,wallHeight+5,width/2);scene.add(fill);
  const mat=(color:string,roughness=.78)=>new THREE.MeshStandardMaterial({color,roughness});
  const floorMat=mat(outdoor?"#aeb9ad":material==="dark"?"#827c73":material==="cool"?"#b7c5ce":"#d5c8b5");
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(length+12,width+12),mat(outdoor?"#cbd9c7":"#dce3eb",1));ground.rotation.x=-Math.PI/2;ground.position.set(length/2,-.2,width/2);ground.receiveShadow=true;scene.add(ground);
  const base=new THREE.Mesh(new THREE.BoxGeometry(length,.2,width),floorMat);base.position.set(length/2,0,width/2);base.receiveShadow=true;scene.add(base);
  const wallColor=material==="dark"?"#d7d0c5":material==="cool"?"#e7f0f2":"#f4f0e7";const wallMat=mat(wallColor);const trim=mat("#b8a995");const glass= new THREE.MeshPhysicalMaterial({color:"#8fc8e5",metalness:.05,roughness:.12,transparent:true,opacity:.78});
  const wallT=.16;
  function box(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.03,w),Math.max(.03,h),Math.max(.03,d)),m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o;}
  // Perimeter walls are split where openings are requested.
  const perimeter=[{side:"North",x:length/2,z:0,w:length,h:wallT,axis:"x"},{side:"South",x:length/2,z:width,w:length,h:wallT,axis:"x"},{side:"West",x:0,z:width/2,w:wallT,h:width,axis:"z"},{side:"East",x:length,z:width/2,w:wallT,h:width,axis:"z"}];
  if(!outdoor) perimeter.forEach(p=>{
   const opening=openings.find(o=>o.wall===`Outer ${p.side}`);const span=p.axis==="x"?length:width;
   if(!opening){box(p.w,wallHeight,p.h,p.x,wallHeight/2,p.z,wallMat);return;}
   const start=Math.max(.3,Math.min(span-opening.width-.3,opening.offset));
   const a=start,b=span-start-opening.width;
   if(a>.05){if(p.axis==="x")box(a,wallHeight,wallT,a/2,wallHeight/2,p.z,wallMat);else box(wallT,wallHeight,a,p.x,wallHeight/2,a/2,wallMat);}
   if(b>.05){if(p.axis==="x")box(b,wallHeight,wallT,start+opening.width+b/2,wallHeight/2,p.z,wallMat);else box(wallT,wallHeight,b,p.x,wallHeight/2,start+opening.width+b/2,wallMat);}
   if(opening.kind==="window"){const sill=.85,head=2.1;box(opening.width,sill,wallT,p.axis==="x"?start+opening.width/2:p.x,sill/2,p.axis==="x"?p.z:start+opening.width/2,wallMat);box(opening.width,Math.max(.1,wallHeight-head),wallT,p.axis==="x"?start+opening.width/2:(p.x),head+(wallHeight-head)/2,p.axis==="x"?p.z:start+opening.width/2,wallMat);box(opening.width,1.15,.035,p.axis==="x"?start+opening.width/2:p.x,1.48,p.axis==="x"?p.z:start+opening.width/2,glass,false);}
   else {box(opening.width,wallHeight-2.1,wallT,p.axis==="x"?start+opening.width/2:p.x,2.1+(wallHeight-2.1)/2,p.axis==="x"?p.z:start+opening.width/2,wallMat);const doorMat=mat("#9a704f",.6);if(p.axis==="x"){box(opening.width-.08,2.02,.055,start+opening.width/2,1.02,p.z+.035,doorMat);const knob=new THREE.Mesh(new THREE.SphereGeometry(.045,12,12),mat("#c8a45c",.3));knob.position.set(start+opening.width-.16,1.02,p.z+.08);scene.add(knob);}else{box(.055,2.02,opening.width-.08,p.x+.035,1.02,start+opening.width/2,doorMat);const knob=new THREE.Mesh(new THREE.SphereGeometry(.045,12,12),mat("#c8a45c",.3));knob.position.set(p.x+.08,1.02,start+opening.width-.16);scene.add(knob);}}
  });
  // Room partitions, with warm skirting and subtle room rugs.
  if(!outdoor) rooms.forEach(r=>{
   const c=mat("#e4eaf0");
   const buildPartition=(side:"North"|"South"|"East"|"West")=>{
    const horizontal=side==="North"||side==="South";const span=horizontal?r.w:r.h;
    const op=openings.find(o=>o.wall===`Room ${r.id} ${side}`);
    const wallX=side==="West"?r.x:side==="East"?r.x+r.w:0;
    const wallZ=side==="North"?r.y:side==="South"?r.y+r.h:0;
    const segment=(from:number,to:number)=>{const len=Math.max(0,to-from);if(len<.04)return;if(horizontal)box(len,wallHeight,wallT,(r.x+from+to)/2,wallHeight/2,wallZ,c);else box(wallT,wallHeight,len,wallX,wallHeight/2,r.y+(from+to)/2,c);};
    if(!op){segment(0,span);return;}
    const start=Math.max(.1,Math.min(span-op.width-.1,op.offset)),end=start+op.width;
    segment(0,start);segment(end,span);
    if(op.kind==="window"){
     const sill=.85,head=2.1;
     if(horizontal){box(op.width,sill,wallT,r.x+start+op.width/2,sill/2,wallZ,c);box(op.width,Math.max(.1,wallHeight-head),wallT,r.x+start+op.width/2,head+(wallHeight-head)/2,wallZ,c);box(op.width,1.15,.035,r.x+start+op.width/2,1.48,wallZ,glass,false);}
     else{box(wallT,sill,op.width,wallX,sill/2,r.y+start+op.width/2,c);box(wallT,Math.max(.1,wallHeight-head),op.width,wallX,head+(wallHeight-head)/2,r.y+start+op.width/2,c);box(.035,1.15,op.width,wallX,1.48,r.y+start+op.width/2,glass,false);}
    }else{
     if(horizontal){box(op.width,wallHeight-2.1,wallT,r.x+start+op.width/2,2.1+(wallHeight-2.1)/2,wallZ,c);box(.07,2.05,.08,r.x+start+op.width/2,1.02,wallZ+.03,trim);}
     else{box(wallT,wallHeight-2.1,op.width,wallX,2.1+(wallHeight-2.1)/2,r.y+start+op.width/2,c);const doorMat=mat("#9a704f",.6);box(.055,2.02,op.width-.08,wallX+.035,1.02,r.y+start+op.width/2,doorMat);const knob=new THREE.Mesh(new THREE.SphereGeometry(.04,12,12),mat("#c8a45c",.3));knob.position.set(wallX+.08,1.02,r.y+start+op.width-.16);scene.add(knob);}
    }
   };
   (["North","South","West","East"] as const).forEach(buildPartition);
   const rug=mat(r.kind==="bedroom"?"#d9c4b8":r.kind==="living"?"#c9d9df":"#d8d2bd");box(Math.max(.7,r.w*.7),.025,Math.max(.7,r.h*.68),r.x+r.w/2,.12,r.y+r.h/2,rug,false);
  });
  if(outdoor) rooms.forEach(r=>{
   const zoneColor=r.kind.includes("road")||r.kind.includes("vehicle")||r.kind.includes("shared-street")?"#aeb7bd":r.kind.includes("walk")||r.kind.includes("pedestrian")||r.kind.includes("plaza")?"#d9d2c4":r.kind.includes("lawn")||r.kind.includes("garden")||r.kind.includes("play")?"#a9c99d":r.kind.includes("cycle")?"#88b9a6":r.kind.includes("river")||r.kind.includes("water")?"#8fc4d5":"#cbd7ca";
   box(r.w,.055,r.h,r.x+r.w/2,.14,r.y+r.h/2,mat(zoneColor),false);
  });
  // Distinct furniture silhouettes, coloured upholstery and recognisable forms.
  items.forEach(it=>{
   const x=it.x,z=it.y,w=it.w,d=it.h,k=it.kind;const upholstery=mat(it.color,.65),wood=mat("#8b684d"),white=mat("#eeeae2"),dark=mat("#465363"),metal=mat("#89949d",.35);
   const add=(bw:number,bh:number,bd:number,bx:number,by:number,bz:number,m:THREE.Material)=>box(bw,bh,bd,bx,by,bz,m);
   if(k==="sofa"){
    add(w*.86,.42,d*.48,x+w/2,.35,z+d*.58,upholstery);add(w*.86,.55,.18,x+w/2,.68,z+d*.88,upholstery);add(.18,.5,d*.78,x+.09,.5,z+d*.53,upholstery);add(.18,.5,d*.78,x+w-.09,.5,z+d*.53,upholstery);
    for(let n=0;n<3;n++)add(w*.24,.16,d*.38,x+w*(.16+n*.29),.62,z+d*.48,mat("#d9e2e8",.9));
    for(const xx of [x+.2,x+w-.2])for(const zz of [z+.2,z+d-.2])add(.07,.18,.07,xx,.09,zz,wood);
   }else if(k==="bed"||k==="singlebed"){
    add(w,.22,d,x+w/2,.22,z+d/2,wood);add(w*.94,.2,d*.84,x+w/2,.42,z+d*.52,white);add(w*.38,.12,d*.22,x+w*.27,.58,z+d*.23,mat("#fffaf2"));add(w*.38,.12,d*.22,x+w*.72,.58,z+d*.23,mat("#fffaf2"));add(w,.85,.12,x+w/2,.48,z+.06,upholstery);
    add(.12,.2,.12,x+.18,.1,z+.18,wood);add(.12,.2,.12,x+w-.18,.1,z+.18,wood);
   }else if(k==="diningtable"||k==="desk"||k==="island"||k==="slab"||k==="wardrobe"||k==="shoe"||k==="tv"){
    const tall=k==="wardrobe"||k==="shoe";const topY=tall?1.05:.82;add(w,tall?2:.12,d,x+w/2,tall?1:.76,z+d/2,upholstery);if(!tall){for(const xx of [x+.08,x+w-.08])for(const zz of [z+.08,z+d-.08])add(.07,.72,.07,xx,.38,zz,wood);}
    if(k==="slab"||k==="island"){add(w,.08,d,x+w/2,topY,z+d/2,white);if(k==="slab"){add(.48,.025,.32,x+w*.65,topY+.055,z+d/2,metal);}}
    if(k==="diningtable"){for(const side of [-1,1])for(let n=0;n<2;n++){const cx=x+w*(.25+n*.5),cz=z+d/2+side*.42;add(.42,.12,.42,cx,.48,cz,upholstery);add(.42,.45,.08,cx,.72,cz+side*.18,upholstery);for(const dx of [-.14,.14])for(const dz of [-.14,.14])add(.045,.4,.045,cx+dx,.22,cz+dz,wood);}}
   }else if(k==="cafe-table"){
    add(w,.1,d,x+w/2,.78,z+d/2,wood);for(const dx of [.12,w-.12])for(const dz of [.12,d-.12])add(.06,.74,.06,x+dx,.38,z+dz,metal);
   }else if(k==="cafe-chair"||k==="bar-stool"){
    const seatY=k==="bar-stool" ? .72 : .48;add(w,.1,d,x+w/2,seatY,z+d/2,upholstery);add(w,.45,.07,x+w/2,seatY+.24,z+d*.12,upholstery);
    for(const dx of [.08,w-.08])for(const dz of [.08,d-.08])add(.045,seatY,.045,x+dx,seatY/2,z+dz,wood);
    if(k==="bar-stool")add(.06,.06,.06,x+w/2,.36,z+d/2,metal);
   }else if(k==="cafe-counter"||k==="prep-table"){
    add(w,.9,d,x+w/2,.48,z+d/2,wood);add(w+.03,.08,d+.03,x+w/2,.96,z+d/2,k==="prep-table"?metal:upholstery);
   }else if(k==="espresso"){
    add(w,.5,d,x+w/2,.42,z+d/2,metal);add(w*.72,.12,d*.7,x+w/2,.75,z+d/2,dark);add(.08,.18,.08,x+w*.25,.85,z+d*.3,white);add(.08,.18,.08,x+w*.75,.85,z+d*.3,white);
   }else if(k==="display-case"){
    add(w,.12,d,x+w/2,.08,z+d/2,wood);add(w,.62,d, x+w/2,.46,z+d/2,glass);add(w,.06,d,x+w/2,.79,z+d/2,white);
   }else if(k==="commercial-sink"){
    add(w,.78,d,x+w/2,.4,z+d/2,metal);add(w*.68,.08,d*.6,x+w/2,.82,z+d/2,white);
   }else if(k==="menu-board"){
    add(w,.85,.08,x+w/2,1.5,z+d/2,dark);
   }else if(k==="pendant-light"){
    add(.035,.55,.035,x+w/2,wallHeight-.28,z+d/2,metal);add(.35,.14,.35,x+w/2,wallHeight-.55,z+d/2,upholstery);
   }else if(k==="planter"||k==="tree"){
    add(w*.75,.35,d*.75,x+w/2,.2,z+d/2,wood);const foliage=new THREE.Mesh(new THREE.SphereGeometry(Math.max(.25,w*.48),16,12),mat("#5f9367",.95));foliage.position.set(x+w/2,k==="tree"?1.25:.85,z+d/2);foliage.scale.set(1,1.2,1);scene.add(foliage);
   }else if(k==="bench"){
    add(w,.1,d,x+w/2,.5,z+d/2,wood);for(const dx of [.1,w-.1])add(.07,.48,.07,x+dx,.26,z+d/2,metal);
   }else if(k==="water-feature"){
    add(w,.25,d,x+w/2,.14,z+d/2,mat("#7eb5c7",.3));add(w*.8,.04,d*.8,x+w/2,.3,z+d/2,glass);
   }else if(k==="ramp"){
    const ramp=new THREE.Mesh(new THREE.BoxGeometry(w,.12,d),mat("#b9c2b9"));ramp.position.set(x+w/2,.12,z+d/2);ramp.rotation.z=-.12;scene.add(ramp);
   }else if(k==="grab-rail"||k==="louvre"){
    add(w,.08,d,x+w/2,1.1,z+d/2,metal);
   }else if(k==="fold-bed"){
    add(w,.18,d,x+w/2,.25,z+d/2,wood);add(w*.95,.16,d*.9,x+w/2,.42,z+d*.5,white);add(w,.9,.1,x+w/2,.55,z+.04,upholstery);
   }else if(k==="fold-table"||k==="storage-wall"){
    add(w,k==="storage-wall"?2:.1,d,x+w/2,k==="storage-wall"?1:.8,z+d/2,wood);
   }else if(k==="bridge-deck"){
    add(w,.18,d,x+w/2,.16,z+d/2,upholstery);
   }else if(k==="road-lane"||k==="crosswalk"){
    add(w,.025,d,x+w/2,.13,z+d/2,white);
    if(k==="road-lane"){for(let n=0;n<4;n++)add(.32,.025,.05,x+w*(.12+n*.24),.15,z+d/2,mat("#f1d45b"));}
   }else if(k==="lane-divider"||k==="guardrail"){
    add(w,.55,d,x+w/2,.4,z+d/2,metal);
    for(let n=0;n<Math.max(2,Math.floor(w/.45));n++)add(.06,.7,.06,x+w*(n/Math.max(1,Math.floor(w/.45))),.38,z+d/2,metal);
   }else if(k==="bridge-pier"){
    add(w,2.4,d,x+w/2,-1.1,z+d/2,mat("#89949c"));
    add(w*1.7,.2,d*1.7,x+w/2,.12,z+d/2,metal);
   }else if(k==="footpath"||k==="cycle-lane"||k==="pathway"){
    add(w,.08,d,x+w/2,.08,z+d/2,k==="cycle-lane"?mat("#78a995"):mat("#c8bda9"));
   }else if(k==="car-marker"||k==="bus-marker"){
    const vehicleLength=k==="bus-marker"?w:w*.82,vehicleHeight=k==="bus-marker"?.9:.55;
    add(vehicleLength*.94,vehicleHeight*.52,d*.88,x+w/2,.38,z+d/2,upholstery);
    add(vehicleLength*.5,vehicleHeight*.4,d*.72,x+w/2,.68,z+d/2,glass);
    for(const dx of [x+w*.22,x+w*.78])for(const dz of [z+d*.08,z+d*.92])add(.16,.16,.1,dx,.18,dz,dark);
   }else if(k==="traffic-signal"){
    add(.08,2.3,.08,x+w/2,1.15,z+d/2,metal);add(.35,.7,.25,x+w/2,2.35,z+d/2,dark);
    for(let n=0;n<3;n++){const bulb=mat(n===0?"#d64f46":n===1?"#e6b94f":"#54a76b");add(.14,.14,.04,x+w/2,2.55-n*.2,z+d/2+.14,bulb);}
   }else if(k==="street-light"||k==="park-light"){
    add(.07,3,.07,x+w/2,1.5,z+d/2,metal);add(.55,.1,.18,x+w/2,2.95,z+d/2,white);
   }else if(k==="auditorium-seat"){
    add(w,.12,d,x+w/2,.48,z+d/2,upholstery);add(w,.55,.08,x+w/2,.78,z+.05,upholstery);for(const dx of [.08,w-.08])add(.05,.42,.05,x+dx,.22,z+d/2,metal);
   }else if(k==="stage-platform"){
    add(w,.35,d,x+w/2,.2,z+d/2,wood);
   }else if(k==="screen"||k==="acoustic-panel"||k==="exit-sign"){
    add(w,.8,.08,x+w/2,1.5,z+d/2,k==="screen"?white:upholstery);
   }else if(k==="speaker"){
    add(w,.7,d,x+w/2,.55,z+d/2,dark);
   }else if(k==="lectern"||k==="ticket-counter"||k==="vendor-kiosk"||k==="bus-shelter"||k==="pergola"){
    add(w,.85,d,x+w/2,.45,z+d/2,wood);if(k==="pergola"){for(const dx of [.1,w-.1])for(const dz of [.1,d-.1])add(.08,2,.08,x+dx,1,z+dz,wood);add(w,.1,d,x+w/2,2,z+d/2,wood);}
   }else if(k==="playground"||k==="swing"){
    add(w,.12,d,x+w/2,.1,z+d/2,wood);add(.08,1.6,.08,x+w/2,.85,z+d/2,metal);add(w*.8,.08,.08,x+w/2,1.6,z+d/2,upholstery);
   }else if(k==="bollard"||k==="waste-bin"||k==="drinking-fountain"||k==="cycle-rack"||k==="wheelchair-space"){
    add(w,.7,d,x+w/2,.35,z+d/2,metal);
   }else if(k==="shade"){
    add(w,.08,d,x+w/2,wallHeight-.4,z+d/2,upholstery);
   }else if(k==="sink"||k==="vanity"){add(w,.72,d,x+w/2,.38,z+d/2,white);add(w*.65,.08,d*.65,x+w/2,.78,z+d/2,metal);add(.06,.35,.06,x+w/2,.98,z+d*.2,metal);}
   else if(k==="toilet"){add(w*.8,.28,d*.58,x+w/2,.25,z+d*.58,white);add(w*.72,.52,d*.25,x+w/2,.42,z+d*.2,white);}
   else if(k==="bathtub"){add(w,.48,d,x+w/2,.28,z+d/2,white);add(w*.82,.06,d*.7,x+w/2,.53,z+d/2,mat("#b7d9e8"));}
   else if(k==="shower"){add(w,.04,d,x+w/2,.06,z+d/2,mat("#b7d9e8"));add(.04,2.1,d,x,.98,z+d/2,glass);add(w,2.1,.04,x+w/2,.98,z,glass);}
   else if(k==="hob"){add(w,.12,d,x+w/2,.85,z+d/2,dark);for(let n=0;n<4;n++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.025,8,24),metal);ring.rotation.x=Math.PI/2;ring.position.set(x+w*(.25+(n%2)*.5),.93,z+d*(.3+Math.floor(n/2)*.4));scene.add(ring);}}
   else if(k==="window"||k==="door"||k==="sliding"){add(w,.08,d,x+w/2,.04,z+d/2,glass);}
   else {add(w,.55,d,x+w/2,.35,z+d/2,upholstery);add(w,.08,d,x+w/2,.67,z+d/2,white);}
  });
  // Stair flight for multi-level concepts.
  if(showStairs){for(let i=0;i<12;i++){box(1.05,.13,.28,length*.78,.18+i*.13,width*.18+i*.28,trim);}}
  // Optional pitched roof as two visible sloping panels; transparent enough to read the model.
  if(!outdoor&&roof==="flat"){const slab=mat("#aeb9c7",.8);const cap=box(length,.16,width,length/2,wallHeight+.08,width/2,slab);cap.material= new THREE.MeshStandardMaterial({color:"#aeb9c7",roughness:.8,transparent:true,opacity:.2,side:THREE.DoubleSide});}
  if(!outdoor&&roof==="pitched"){const roofMat=new THREE.MeshStandardMaterial({color:"#6e829a",roughness:.62,side:THREE.DoubleSide,transparent:true,opacity:.82});const left=new THREE.Mesh(new THREE.BoxGeometry(length*.56,.16,width+1),roofMat);left.position.set(length*.25,wallHeight+.55,width/2);left.rotation.z=-.24;scene.add(left);const right=new THREE.Mesh(new THREE.BoxGeometry(length*.56,.16,width+1),roofMat);right.position.set(length*.75,wallHeight+.55,width/2);right.rotation.z=.24;scene.add(right);}
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(length/2,wallHeight*.35,width/2);controls.enableDamping=true;controls.dampingFactor=.065;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=4;controls.maxDistance=55;
  const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);};const observer=new ResizeObserver(resize);observer.observe(el);
  let frame=0;const animate=()=>{frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose();}});if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
 },[length,width,rooms,items,openings,wallHeight,roof,material,showStairs]);
 return <div ref={host} className="real3d-canvas"><div className="real3d-hint">DRAG TO ORBIT · SCROLL TO ZOOM · CONCEPT MODEL</div></div>;
}
