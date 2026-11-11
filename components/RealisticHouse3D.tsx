"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ModelRoom = { id:number; name:string; x:number; y:number; w:number; h:number; kind:string };
export type ModelItem = { id:number; name:string; x:number; y:number; w:number; h:number; kind:string; color:string };
export default function RealisticHouse3D({length,width,rooms,items}:{length:number;width:number;rooms:ModelRoom[];items:ModelItem[]}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color("#e9eff7");
  scene.fog=new THREE.Fog("#e9eff7",25,55);
  const camera=new THREE.PerspectiveCamera(42,el.clientWidth/el.clientHeight,.1,100);
  camera.position.set(length*1.35,width*1.45,Math.max(length,width)*1.35);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  el.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8b9ab0,2));
  const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(-length, width*1.8, length);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(length+10,width+10),new THREE.MeshStandardMaterial({color:"#dce4ee",roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.set(length/2,-.16,width/2);ground.receiveShadow=true;scene.add(ground);
  const floor=new THREE.Mesh(new THREE.BoxGeometry(length,.18,width),new THREE.MeshStandardMaterial({color:"#d5c9b7",roughness:.9}));
  floor.position.set(length/2,0,width/2);floor.receiveShadow=true;floor.castShadow=true;scene.add(floor);
  const wallMat=new THREE.MeshStandardMaterial({color:"#f4f1e9",roughness:.82});
  const edgeMat=new THREE.MeshStandardMaterial({color:"#c8d2df",roughness:.9});
  const wallH=2.75, wallT=.14;
  function wall(x:number,z:number,w:number,d:number,y=wallH/2,mat=wallMat){
   const m=new THREE.Mesh(new THREE.BoxGeometry(w,wallH,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
  }
  // Outer perimeter walls, intentionally kept low so the interior remains visible.
  wall(length/2,0,length,wallT);wall(length/2,width,length,wallT);
  wall(0,width/2,wallT,width);wall(length,width/2,wallT,width);
  // Interior room partitions are rendered as raised wall segments around each room.
  rooms.forEach(r=>{
   const x=r.x,z=r.y,w=r.w,d=r.h;
   wall(x+w/2,z,w,wallT,wallH/2,edgeMat);
   wall(x+w/2,z+d,w,wallT,wallH/2,edgeMat);
   wall(x,z+d/2,wallT,d,wallH/2,edgeMat);
   wall(x+w,z+d/2,wallT,d,wallH/2,edgeMat);
   const mat=new THREE.MeshStandardMaterial({color:"#dce7f6",roughness:.92});
   const rug=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.6,w*.62),.025,Math.max(.6,d*.62)),mat);
   rug.position.set(x+w/2,.105,z+d/2);rug.receiveShadow=true;scene.add(rug);
  });
  // Catalogue objects are represented as scaled furniture/fixture volumes.
  items.forEach(it=>{
   const material=new THREE.MeshStandardMaterial({color:it.color,roughness:.72});
   const body=new THREE.Mesh(new THREE.BoxGeometry(it.w,.65,it.h),material);
   body.position.set(it.x+it.w/2,.48,it.y+it.h/2);body.castShadow=true;body.receiveShadow=true;scene.add(body);
   const top=new THREE.Mesh(new THREE.BoxGeometry(it.w+.03,.06,it.h+.03),new THREE.MeshStandardMaterial({color:"#f5f1e8",roughness:.55}));
   top.position.set(it.x+it.w/2,.83,it.y+it.h/2);top.castShadow=true;scene.add(top);
  });
  // Soft skirting and a few window-like glazed panels on the outer walls.
  const glass=new THREE.MeshStandardMaterial({color:"#9dc7e5",metalness:.15,roughness:.2,transparent:true,opacity:.82});
  const windowMesh=new THREE.Mesh(new THREE.BoxGeometry(1.25,1,.08),glass);
  windowMesh.position.set(length*.48,1.7,wallT);scene.add(windowMesh);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(length/2,.5,width/2);controls.enableDamping=true;controls.dampingFactor=.06;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=4;controls.maxDistance=45;
  const resize=()=>{if(!el)return;camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);};
  const observer=new ResizeObserver(resize);observer.observe(el);
  let frame=0;const animate=()=>{frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose();}});if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
 },[length,width,rooms,items]);
 return <div ref={host} className="real3d-canvas"><div className="real3d-hint">DRAG TO ORBIT · SCROLL TO ZOOM</div></div>;
}
