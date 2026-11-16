"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileUp, ScanSearch, Ruler, Shapes, Download, CheckCircle2, AlertTriangle, Trash2, Plus } from "lucide-react";

type Candidate={id:string;kind:"line"|"area"|"entity";label:string;value:number;unit:string;confidence:"High"|"Review";source:string;points?:number};
const id=()=>Math.random().toString(36).slice(2,10);
function parseDxf(text:string):Candidate[]{
 const lines=text.replace(/\r/g,"").split("\n").map(x=>x.trim()); const out:Candidate[]=[];
 const val=(i:number)=>lines[i+1]||"";
 for(let i=0;i<lines.length-1;i++){
  if(lines[i]!=="0")continue; const type=val(i);
  if(type==="LINE"){
   let x1=0,y1=0,x2=0,y2=0;
   for(let j=i+2;j<Math.min(i+35,lines.length-1);j+=2){const c=lines[j],v=Number(lines[j+1]);if(c==="10")x1=v;if(c==="20")y1=v;if(c==="11")x2=v;if(c==="21")y2=v;}
   const length=Math.hypot(x2-x1,y2-y1);if(length>0.01)out.push({id:id(),kind:"line",label:"Detected line",value:length,unit:"drawing units",confidence:"High",source:"DXF LINE"});
  }
  if(type==="LWPOLYLINE"){
   const pts:{x:number;y:number}[]=[];let x:number|null=null;
   for(let j=i+2;j<Math.min(i+160,lines.length-1);j+=2){const c=lines[j],v=Number(lines[j+1]);if(c==="0")break;if(c==="10")x=v;if(c==="20"&&x!==null){pts.push({x,y:v});x=null;}}
   if(pts.length>=2){let length=0;for(let k=1;k<pts.length;k++)length+=Math.hypot(pts[k].x-pts[k-1].x,pts[k].y-pts[k-1].y);const closed=lines.slice(i,Math.min(i+160,lines.length)).some((x,k)=>x==="70"&&lines[i+k+1]?.trim()==="1");if(closed&&pts.length>=3){const area=Math.abs(pts.reduce((a,p,k)=>{const q=pts[(k+1)%pts.length];return a+p.x*q.y-q.x*p.y;},0)/2);out.push({id:id(),kind:"area",label:"Closed polyline area",value:area,unit:"square drawing units",confidence:"High",source:"DXF LWPOLYLINE",points:pts.length});}else out.push({id:id(),kind:"line",label:"Polyline length",value:length,unit:"drawing units",confidence:"High",source:"DXF LWPOLYLINE",points:pts.length});}
  }
 }
 return out.slice(0,500);
}
function imageCandidates(canvas:HTMLCanvasElement):Candidate[]{
 const ctx=canvas.getContext("2d");if(!ctx)return [];
 const w=canvas.width,h=canvas.height,scale=Math.min(1,1000/Math.max(w,h));
 const sw=Math.max(1,Math.floor(w*scale)),sh=Math.max(1,Math.floor(h*scale));
 const data=ctx.getImageData(0,0,w,h).data;const dark=(x:number,y:number)=>{const i=(Math.min(h-1,Math.floor(y/scale))*w+Math.min(w-1,Math.floor(x/scale)))*4;return data[i]<95&&data[i+1]<95&&data[i+2]<95;};
 const horizontal:number[]=[],vertical:number[]=[];
 for(let y=2;y<sh-2;y+=2){let run=0;for(let x=0;x<sw;x++){if(dark(x,y))run++;else{if(run>sw*.12)horizontal.push(run/scale);run=0;}}if(run>sw*.12)horizontal.push(run/scale);}
 for(let x=2;x<sw-2;x+=2){let run=0;for(let y=0;y<sh;y++){if(dark(x,y))run++;else{if(run>sh*.12)vertical.push(run/scale);run=0;}}if(run>sh*.12)vertical.push(run/scale);}
 const avg=(a:number[])=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
 const out:Candidate[]=[];
 if(horizontal.length)out.push({id:id(),kind:"line",label:"Long horizontal line candidates",value:Math.round(avg(horizontal)),unit:"pixels (unscaled)",confidence:"Review",source:"Raster line scan"});
 if(vertical.length)out.push({id:id(),kind:"line",label:"Long vertical line candidates",value:Math.round(avg(vertical)),unit:"pixels (unscaled)",confidence:"Review",source:"Raster line scan"});
 const darkRatio=(()=>{let n=0;for(let y=0;y<sh;y+=4)for(let x=0;x<sw;x+=4)if(dark(x,y))n++;return n/Math.max(1,Math.ceil(sw/4)*Math.ceil(sh/4));})();
 out.push({id:id(),kind:"entity",label:"Drawing ink density indicator",value:Number((darkRatio*100).toFixed(1)),unit:"%",confidence:"Review",source:"Raster analysis"});
 return out;
}
export default function AIDrawingPage(){
 const input=useRef<HTMLInputElement>(null),canvasRef=useRef<HTMLCanvasElement>(null);
 const [fileName,setFileName]=useState(""),[format,setFormat]=useState(""),[items,setItems]=useState<Candidate[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[scale,setScale]=useState(1),[unit,setUnit]=useState("m");
 async function analyse(file:File){
  setBusy(true);setMessage("Reading drawing…");setItems([]);setFileName(file.name);
  try{
   const ext=file.name.split(".").pop()?.toLowerCase()||"";
   if(ext==="dxf"){const text=await file.text();const found=parseDxf(text);setItems(found);setFormat("DXF vector geometry");setMessage(found.length?`Extracted ${found.length} geometric entities. Review labels and drawing units before using quantities.`:"No supported LINE or LWPOLYLINE entities were found. This DXF may use other entity types or binary encoding.");}
   else if(ext==="jpg"||ext==="jpeg"||ext==="png"||file.type.startsWith("image/")){
    const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{const c=canvasRef.current;if(!c)return;const ratio=Math.min(1,1800/img.width);c.width=Math.round(img.width*ratio);c.height=Math.round(img.height*ratio);const ctx=c.getContext("2d");ctx?.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);const found=imageCandidates(c);setItems(found);setFormat("Raster image analysis");setMessage("Basic line and ink analysis completed. These are geometry cues, not confirmed rooms or measured dimensions.");setBusy(false);};img.onerror=()=>{URL.revokeObjectURL(url);setMessage("Could not read this image.");setBusy(false);};img.src=url;return;
   }else if(ext==="pdf"){
    const bytes=await file.arrayBuffer();const pdfjs=await import("pdfjs-dist");pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
    const pdf=await pdfjs.getDocument({data:bytes}).promise;const page=await pdf.getPage(1);const viewport=page.getViewport({scale:1.5});const c=canvasRef.current;if(!c)throw new Error("Preview canvas unavailable");c.width=viewport.width;c.height=viewport.height;await page.render({canvasContext:c.getContext("2d") as CanvasRenderingContext2D,viewport}).promise;const found=imageCandidates(c);setItems(found);setFormat(`PDF · page 1 of ${pdf.numPages} · raster analysis`);setMessage("First-page raster analysis completed. Vector PDF entity extraction and architectural room recognition are future upgrades.");
   }else{throw new Error("Supported formats: PDF, JPG, PNG and DXF.");}
  }catch(e){setMessage(e instanceof Error?e.message:"Could not analyse this drawing.");}finally{setBusy(false);}
 }
 function exportCsv(){const rows=[["Element","Type","Value","Unit","Confidence","Source"],...items.map(x=>[x.label,x.kind,x.value.toString(),x.unit,x.confidence,x.source])];const csv=rows.map(r=>r.map(v=>`"${v.replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="desiq-drawing-analysis.csv";a.click();URL.revokeObjectURL(a.href);}
 function update(id:string,patch:Partial<Candidate>){setItems(old=>old.map(x=>x.id===id?{...x,...patch}:x));}
 return <main className="min-h-screen bg-[#f5f7fb] text-slate-900"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/architecture/professional" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/> Professional Studio</Link><span className="text-xs font-bold tracking-widest text-indigo-600">DESIQ V6.3 · DRAWING INTELLIGENCE</span></div></header>
 <div className="mx-auto max-w-7xl space-y-6 px-5 py-8"><section className="rounded-3xl bg-slate-950 p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">AI-assisted geometry · experimental</p><h1 className="mt-3 text-3xl font-bold">Understand your drawing.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Upload a PDF, image or DXF. DESIQ extracts basic geometric cues and creates a reviewable measurement register. Human verification is required before estimating or quoting.</p></section>
 <section className="grid gap-4 md:grid-cols-3">{[{t:"DXF geometry",d:"Extracts LINE and LWPOLYLINE entities, including closed-polyline areas."},{t:"PDF plans",d:"Renders the first page and analyses long horizontal and vertical line cues."},{t:"JPG / PNG",d:"Analyses raster line runs and drawing ink density."}].map(x=><div key={x.t} className="rounded-2xl border bg-white p-5"><Shapes className="text-indigo-600"/><h2 className="mt-3 font-bold">{x.t}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{x.d}</p></div>)}</section>
 <section className="rounded-3xl border bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">1. Upload drawing</h2><p className="mt-1 text-sm text-slate-500">PDF, JPG, PNG or ASCII DXF · first PDF page is analysed in this release.</p></div><button onClick={()=>input.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"><FileUp size={17}/> Choose drawing</button><input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png,.dxf,application/pdf,image/png,image/jpeg" hidden onChange={e=>{const f=e.target.files?.[0];if(f)analyse(f);}}/></div>
 {fileName&&<p className="mt-4 text-sm font-semibold">{fileName} <span className="font-normal text-slate-500">· {format}</span></p>}
 <canvas ref={canvasRef} className="mt-4 max-h-[620px] w-full rounded-xl border bg-white object-contain" />
 {message&&<p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{message}</p>}
 </section>
 <section className="rounded-3xl border bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">2. Review detected geometry</h2><p className="mt-1 text-sm text-slate-500">Edit labels, apply a drawing-unit scale and export a review register.</p></div><button disabled={!items.length} onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40"><Download size={15}/> Export CSV</button></div>
 <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4"><label className="text-xs font-semibold">Drawing unit<select value={unit} onChange={e=>setUnit(e.target.value)} className="mt-1 block rounded-lg border bg-white p-2"><option value="m">Metres</option><option value="mm">Millimetres</option><option value="ft">Feet</option><option value="in">Inches</option></select></label><label className="text-xs font-semibold">Scale multiplier<input type="number" min="0.000001" step="any" value={scale} onChange={e=>setScale(Number(e.target.value))} className="mt-1 block w-32 rounded-lg border bg-white p-2"/></label><p className="text-xs text-slate-500">For DXF, set the multiplier to convert its drawing units into your selected unit. Raster results remain pixels and are not converted reliably by this control.</p></div>
 {busy&&<p className="mt-5 flex items-center gap-2 text-sm text-indigo-700"><ScanSearch className="animate-pulse"/> Analysing drawing…</p>}
 {!busy&&items.length===0?<p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No analysis results yet. Upload a drawing to begin.</p>:<div className="mt-4 space-y-3">{items.map(x=><div key={x.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_120px_150px_auto] md:items-end"><label className="text-xs font-semibold">Element name<input value={x.label} onChange={e=>update(x.id,{label:e.target.value})} className="mt-1 block w-full rounded-lg border p-2 text-sm"/></label><label className="text-xs font-semibold">Value<input type="number" value={x.value} onChange={e=>update(x.id,{value:Number(e.target.value)})} className="mt-1 block w-full rounded-lg border p-2 text-sm"/></label><div className="text-xs"><span className="block font-semibold">Type / confidence</span><span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-amber-800">{x.kind} · {x.confidence}</span><p className="mt-1 text-slate-500">{x.source}</p></div><button onClick={()=>setItems(old=>old.filter(y=>y.id!==x.id))} className="rounded-lg border p-2 text-slate-500 hover:text-red-600"><Trash2 size={16}/></button></div>)}</div>}
 </section>
 <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-2 font-bold text-amber-900"><AlertTriangle size={18}/> Important accuracy note</div><p className="mt-2 text-sm leading-6 text-amber-900">This release is an experimental geometry-extraction foundation, not full AI architectural recognition. Raster/PDF line cues are pixel-based; PDF vector entities, semantic room recognition, doors/windows, stairs and ramp classification are not yet implemented. DXF currently reads ASCII LINE and LWPOLYLINE entities. Verify all geometry and dimensions against the original drawing and site before using quantities in a quotation.</p></section>
 <div className="pb-8 text-center text-xs text-slate-400">DESIQ · Drawing Intelligence · Professional verification required</div></div></main>;
}
