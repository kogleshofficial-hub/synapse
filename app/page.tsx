"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Priority = "high" | "medium" | "low";
type View = "today" | "planned" | "all";
type Task = { id:string; title:string; context:string; due:string; minutes:number; priority:Priority; completed:boolean };
type Block = { taskId:string; minutes:number };
type Plan = Record<string, Block[]>;

const TASKS = "synapse-workload-v1";
const CAPACITY = "synapse-capacity-v1";
const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parseKey=(s:string)=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(s:string,n:number)=>{const d=parseKey(s);d.setDate(d.getDate()+n);return dateKey(d)};
const diff=(a:string,b:string)=>Math.round((parseKey(b).getTime()-parseKey(a).getTime())/86400000);
const dayName=(s:string)=>parseKey(s).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
const pval=(p:Priority)=>p==="high"?3:p==="medium"?2:1;
const id=()=>`${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function demo(today:string):Task[]{return[
{id:id(),title:"Chemistry: revise Chapter 4",context:"School",due:addDays(today,2),minutes:90,priority:"high",completed:false},
{id:id(),title:"Finish portfolio landing page",context:"Personal project",due:addDays(today,4),minutes:120,priority:"high",completed:false},
{id:id(),title:"Math: complete practice set",context:"School",due:addDays(today,1),minutes:60,priority:"medium",completed:false},
{id:id(),title:"Write video outline",context:"Creator",due:addDays(today,5),minutes:45,priority:"low",completed:false}]}

function makePlan(tasks:Task[],capacity:number,today:string):Plan{
 const plan:Plan={};
 const open=tasks.filter(t=>!t.completed).sort((a,b)=>a.due.localeCompare(b.due)||pval(b.priority)-pval(a.priority)||b.minutes-a.minutes);
 for(const task of open){let left=task.minutes;let day=today;const end=task.due<today?today:task.due;
  while(left>0&&day<=end){const used=(plan[day]??[]).reduce((n,b)=>n+b.minutes,0);const room=Math.max(0,capacity-used);if(room){const chunk=Math.min(left,room);plan[day]=[...(plan[day]??[]),{taskId:task.id,minutes:chunk}];left-=chunk}day=addDays(day,1)}
 }
 return plan;
}

function risk(task:Task,capacity:number,today:string){if(task.completed)return"done";if(task.due<today)return"overdue";const load=task.minutes/(Math.max(1,diff(today,task.due)+1)*capacity);return load>=.85?"tight":load>=.55?"watch":"healthy"}

export default function Home(){
 const [today,setToday]=useState("");const [tasks,setTasks]=useState<Task[]>([]);const [capacity,setCapacity]=useState(120);const [view,setView]=useState<View>("today");const [focus,setFocus]=useState<string|null>(null);
 const [title,setTitle]=useState("");const [context,setContext]=useState("School");const [due,setDue]=useState("");const [minutes,setMinutes]=useState(60);const [priority,setPriority]=useState<Priority>("medium");const fileRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{const t=dateKey(new Date());setToday(t);setDue(addDays(t,2));try{const saved=localStorage.getItem(TASKS);setTasks(saved?JSON.parse(saved):demo(t));const c=Number(localStorage.getItem(CAPACITY));if(c>=30&&c<=360)setCapacity(c)}catch{setTasks(demo(t))}},[]);
 useEffect(()=>{if(today)localStorage.setItem(TASKS,JSON.stringify(tasks))},[tasks,today]);
 useEffect(()=>{if(today)localStorage.setItem(CAPACITY,String(capacity))},[capacity,today]);
 const plan=useMemo(()=>today?makePlan(tasks,capacity,today):{},[tasks,capacity,today]);
 const open=tasks.filter(t=>!t.completed),done=tasks.filter(t=>t.completed),map=useMemo(()=>new Map(tasks.map(t=>[t.id,t])),[tasks]);
 const scheduled=Object.values(plan).flat().reduce((n,b)=>n+b.minutes,0),openMinutes=open.reduce((n,t)=>n+t.minutes,0);
 const next=useMemo(()=>[...open].sort((a,b)=>(a.due<today?-1:0)-(b.due<today?-1:0)||a.due.localeCompare(b.due)||pval(b.priority)-pval(a.priority)||a.minutes-b.minutes)[0]??null,[open,today]);
 const visible=useMemo(()=>view==="today"?tasks.filter(t=>!t.completed&&t.due<=today):view==="planned"?tasks.filter(t=>Object.values(plan).flat().some(b=>b.taskId===t.id)):[...tasks].sort((a,b)=>Number(a.completed)-Number(b.completed)||a.due.localeCompare(b.due)),[tasks,view,today,plan]);
 const days=today?Array.from({length:7},(_,i)=>addDays(today,i)):[];
 function add(e:FormEvent){e.preventDefault();if(!title.trim()||!due||!today)return;const t:Task={id:id(),title:title.trim(),context:context.trim()||"General",due,minutes:Math.max(15,Math.min(600,minutes)),priority,completed:false};setTasks(x=>[...x,t]);setTitle("");setMinutes(60);setPriority("medium");setFocus(t.id)}
 function toggle(taskId:string){setTasks(x=>x.map(t=>t.id===taskId?{...t,completed:!t.completed}:t))}
 function remove(taskId:string){setTasks(x=>x.filter(t=>t.id!==taskId));if(focus===taskId)setFocus(null)}
 function exportData(){const blob=new Blob([JSON.stringify({product:"SYNAPSE",version:1,dailyCapacityMinutes:capacity,tasks},null,2)],{type:"application/json"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download="synapse-plan.json";a.click();URL.revokeObjectURL(u)}
 function importData(file:File){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(String(r.result));if(!Array.isArray(x.tasks))throw Error();setTasks(x.tasks);if(Number.isFinite(x.dailyCapacityMinutes))setCapacity(Math.max(30,Math.min(360,x.dailyCapacityMinutes)))}catch{window.alert("That file is not a valid SYNAPSE plan.")}};r.readAsText(file)}
 return <main>
  <header className="topbar"><div className="brand"><span className="brandmark">S</span><div><b>SYNAPSE</b><small>WORKLOAD ENGINE</small></div></div><div className="top-actions"><span className="saved"><i/> SAVED LOCALLY</span><button className="ghost" onClick={exportData}>Export</button><button className="ghost" onClick={()=>fileRef.current?.click()}>Import</button><input ref={fileRef} hidden type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&importData(e.target.files[0])}/></div></header>
  <section className="hero shell"><div><div className="eyebrow">FROM DEADLINES TO A REALISTIC PLAN</div><h1>Know what to do <em>next.</em></h1><p>SYNAPSE turns deadlines, estimated effort and your available time into a practical schedule — then surfaces the task that deserves your attention first.</p></div><button className="focus-button" disabled={!next} onClick={()=>next&&setFocus(next.id)}>What should I do now? <span>→</span></button></section>
  <section className="shell stats"><div className="stat"><span>OPEN WORK</span><b>{Math.round(openMinutes/60*10)/10}h</b><small>{open.length} tasks remaining</small></div><div className="stat"><span>DUE SOON</span><b>{open.filter(t=>diff(today,t.due)<=2).length}</b><small>within 48 hours</small></div><div className="stat"><span>PLANNED</span><b>{Math.round(scheduled/60*10)/10}h</b><small>{Math.max(0,Math.round((openMinutes-scheduled)/60*10)/10)}h without room</small></div><div className="stat"><span>COMPLETED</span><b>{done.length}</b><small>finished tasks</small></div></section>
  <section className="shell app-grid">
   <aside className="panel add-panel"><div className="panel-title"><div><span className="kicker">01 / CAPTURE</span><h2>Add work</h2></div></div><form onSubmit={add}><label>Task name<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Finish chemistry revision" required/></label><label>Context<input value={context} onChange={e=>setContext(e.target.value)} placeholder="School, project, creator..."/></label><div className="two"><label>Due date<input type="date" min={today} value={due} onChange={e=>setDue(e.target.value)} required/></label><label>Effort (min)<input type="number" min="15" max="600" step="15" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label></div><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Priority)}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><button className="primary" type="submit">Add to workload <span>+</span></button></form><div className="capacity"><div><span>DAILY CAPACITY</span><b>{capacity} min</b></div><input type="range" min="30" max="360" step="15" value={capacity} onChange={e=>setCapacity(Number(e.target.value))}/><div className="capacity-labels"><span>30m</span><span>6h</span></div><p>SYNAPSE only schedules time you declare available.</p></div><div className="small-actions"><button onClick={()=>today&&setTasks(demo(today))}>Load demo</button><button onClick={()=>setTasks([])}>Clear all</button></div></aside>
   <section className="main-column">
    {focus&&map.get(focus)&&<div className="focus-card panel"><div><span className="kicker">FOCUS QUEUE</span><h2>Do this next</h2><strong>{map.get(focus)!.title}</strong><p>{map.get(focus)!.minutes} min · due {dayName(map.get(focus)!.due)} · {map.get(focus)!.priority} priority</p></div><div className="focus-actions"><button className="primary" onClick={()=>toggle(focus)}>Mark complete</button><button className="ghost" onClick={()=>setFocus(null)}>Dismiss</button></div></div>}
    <div className="panel task-panel"><div className="panel-title task-head"><div><span className="kicker">02 / WORKLOAD</span><h2>Your work</h2></div><div className="tabs">{(["today","planned","all"] as View[]).map(v=><button key={v} className={view===v?"active":""} onClick={()=>setView(v)}>{v}</button>)}</div></div><div className="task-list">{visible.length===0?<div className="empty"><strong>{tasks.length?"Nothing in this view.":"Your workload is empty."}</strong><span>Add a task or load the demo to see the planner work.</span></div>:visible.map(t=><article className={`task ${t.completed?"done":""} ${focus===t.id?"focused":""}`} key={t.id}><button className="check" onClick={()=>toggle(t.id)} aria-label={t.completed?`Mark ${t.title} incomplete`:`Mark ${t.title} complete`}>{t.completed?"✓":""}</button><div className="task-body"><div className="task-top"><div><b>{t.title}</b><span>{t.context}</span></div><span className={`priority ${t.priority}`}>{t.priority}</span></div><div className="task-meta"><span>Due {dayName(t.due)}</span><span>{t.minutes} min</span><span className={`risk ${risk(t,capacity,today)}`}>{risk(t,capacity,today)}</span></div></div><div className="task-actions"><button onClick={()=>setFocus(t.id)}>Focus</button><button onClick={()=>remove(t.id)} aria-label={`Delete ${t.title}`}>×</button></div></article>)}</div></div>
   </section>
  </section>
  <section className="shell panel planner"><div className="panel-title"><div><span className="kicker">03 / AUTO-PLAN</span><h2>Seven-day schedule</h2></div><span className="engine-badge"><i/> deterministic planner</span></div><div className="day-grid">{days.map(day=>{const blocks=plan[day]??[];const used=blocks.reduce((n,b)=>n+b.minutes,0);const pct=Math.min(100,Math.round(used/capacity*100));return <div className={`day ${day===today?"current":""}`} key={day}><div className="day-head"><div><b>{day===today?"Today":dayName(day)}</b><span>{used} / {capacity} min</span></div><strong>{pct}%</strong></div><div className="day-bar"><i style={{width:`${pct}%`}}/></div><div className="day-blocks">{blocks.length===0?<span className="free">Free</span>:blocks.map((b,i)=>{const t=map.get(b.taskId);return t?<button key={`${b.taskId}-${i}`} className={`schedule-block ${t.priority}`} onClick={()=>setFocus(t.id)}><b>{t.title}</b><span>{b.minutes} min</span></button>:null})}</div></div>})}</div><p className="planner-note">The engine uses due date, priority, estimated effort and your declared daily capacity. Large tasks are split across days instead of being unrealistically crammed into one session.</p></section>
  <footer className="shell footer"><div><b>SYNAPSE</b><span>Turn a pile of deadlines into a plan you can actually follow.</span></div><div><span>LOCAL-FIRST</span><span>DETERMINISTIC</span><span>EXPORTABLE</span></div></footer>
 </main>
}
