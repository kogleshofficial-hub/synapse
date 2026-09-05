"use client";

import { useMemo, useState } from "react";

type NodeState = "stable" | "elevated" | "critical";
type Node = { id:string; label:string; icon:string; group:string; base:number; sensitivity:number; state:NodeState };
type Edge = { from:string; to:string; weight:number };

const nodes: Node[] = [
  {id:"rain",label:"Rainfall",icon:"↘",group:"Environment",base:35,sensitivity:1,state:"stable"},
  {id:"drain",label:"Drainage",icon:"⌁",group:"Water",base:30,sensitivity:.82,state:"stable"},
  {id:"flood",label:"Flood risk",icon:"≈",group:"Water",base:24,sensitivity:.9,state:"stable"},
  {id:"road",label:"Road access",icon:"⊞",group:"Mobility",base:18,sensitivity:.72,state:"stable"},
  {id:"transit",label:"Transport",icon:"→",group:"Mobility",base:15,sensitivity:.64,state:"stable"},
  {id:"facilities",label:"Facilities",icon:"⌂",group:"Community",base:12,sensitivity:.5,state:"stable"},
];
const edges: Edge[] = [
  {from:"rain",to:"drain",weight:.72},{from:"drain",to:"flood",weight:.86},{from:"flood",to:"road",weight:.82},{from:"road",to:"transit",weight:.7},{from:"transit",to:"facilities",weight:.58}
];
const positions: Record<string,[number,number]> = {rain:[13,26],drain:[31,48],flood:[49,31],road:[66,51],transit:[81,30],facilities:[91,58]};

function stateFor(score:number): NodeState { return score >= 72 ? "critical" : score >= 42 ? "elevated" : "stable"; }
function simulate(rain:number) {
  const scores: Record<string,number> = {rain,drain:0,flood:0,road:0,transit:0,facilities:0};
  const base = {drain:30,flood:24,road:18,transit:15,facilities:12};
  const factors = {drain:.72,flood:.86,road:.82,transit:.7,facilities:.58};
  scores.drain = Math.min(100, base.drain + Math.max(0,rain-35)*factors.drain);
  scores.flood = Math.min(100, base.flood + Math.max(0,scores.drain-30)*factors.flood + Math.max(0,rain-35)*.18);
  scores.road = Math.min(100, base.road + Math.max(0,scores.flood-24)*factors.road);
  scores.transit = Math.min(100, base.transit + Math.max(0,scores.road-18)*factors.transit);
  scores.facilities = Math.min(100, base.facilities + Math.max(0,scores.transit-15)*factors.facilities);
  return scores;
}

export default function Home() {
  const [rain,setRain] = useState(70);
  const [selected,setSelected] = useState("flood");
  const [scenario,setScenario] = useState("Rainfall stress");
  const scores = useMemo(()=>simulate(rain),[rain]);
  const computed = nodes.map(n=>({...n,score:scores[n.id],state:stateFor(scores[n.id])}));
  const affected = computed.filter(n=>n.state!=="stable").length;
  const critical = computed.filter(n=>n.state==="critical").length;
  const selectedNode = computed.find(n=>n.id===selected) ?? computed[2];
  const selectedIncoming = edges.filter(e=>e.to===selectedNode.id).map(e=>computed.find(n=>n.id===e.from)?.label).filter(Boolean);
  const selectedOutgoing = edges.filter(e=>e.from===selectedNode.id).map(e=>computed.find(n=>n.id===e.to)?.label).filter(Boolean);
  const confidence = Math.round(Math.max(62, 94 - Math.abs(rain-35)*.22 - affected*1.5));

  return <main>
    <header className="topbar"><div className="brand"><span className="brandmark">S</span><div><b>SYNAPSE</b><small>SYSTEM STATE ENGINE</small></div></div><div className="topmeta"><span className="live-dot"/> SIMULATION LIVE <span className="divider"/> SCENARIO 01</div></header>

    <section className="hero shell"><div><div className="eyebrow">REAL-WORLD CASCADE MODEL</div><h1>See what happens <em>next.</em></h1><p>Model connected systems, change one condition, and trace how its effects propagate across everything downstream.</p></div><div className="hero-stat"><strong>{affected}</strong><span>components affected</span><small>from one upstream change</small></div></section>

    <section className="workspace shell">
      <div className="control-panel panel">
        <div className="panel-head"><div><span className="kicker">01 / SCENARIO</span><h2>Change a condition</h2></div><button className="reset" onClick={()=>setRain(35)}>Reset</button></div>
        <label className="field-label">Scenario</label>
        <select value={scenario} onChange={e=>setScenario(e.target.value)}><option>Rainfall stress</option><option>Heat stress</option><option>Water demand spike</option></select>
        <div className="slider-row"><div><b>Rainfall intensity</b><span>Baseline 35 mm</span></div><strong>{rain} <small>mm</small></strong></div>
        <input className="range" type="range" min="10" max="120" value={rain} onChange={e=>setRain(Number(e.target.value))} aria-label="Rainfall intensity" />
        <div className="range-labels"><span>10</span><span>35 baseline</span><span>120 mm</span></div>
        <div className="impact-card"><div><span>CASCADE IMPACT</span><b>{critical} critical · {affected} affected</b></div><div className="impact-bars"><i style={{width:`${Math.min(100,rain)}%`}}/><i style={{width:`${Math.min(100,(scores.flood))}%`}}/><i style={{width:`${Math.min(100,scores.road)}%`}}/></div></div>
        <p className="hint">The engine propagates the change through weighted dependencies. No black-box prediction is used for this simulation.</p>
      </div>

      <div className="graph panel">
        <div className="panel-head graph-head"><div><span className="kicker">02 / SYSTEM GRAPH</span><h2>Community resilience model</h2></div><div className="legend"><span><i className="dot stable"/>Stable</span><span><i className="dot elevated"/>Elevated</span><span><i className="dot critical"/>Critical</span></div></div>
        <div className="graph-canvas">
          <svg className="edges" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true">{edges.map((e,i)=>{const a=positions[e.from],b=positions[e.to]; return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={computed.find(n=>n.id===e.to)?.state!=="stable"?"hot":""}/>})}</svg>
          {computed.map(n=>{const [x,y]=positions[n.id]; return <button key={n.id} className={`node ${n.state} ${selected===n.id?"selected":""}`} style={{left:`${x}%`,top:`${y}%`}} onClick={()=>setSelected(n.id)}><span className="node-icon">{n.icon}</span><span className="node-copy"><b>{n.label}</b><small>{Math.round(n.score)} / 100</small></span></button>})}
          <div className="graph-note"><span className="pulse"/> propagating state changes</div>
        </div>
        <div className="graph-footer"><span><b>INPUT</b> Rainfall</span><span>→</span><span><b>ENGINE</b> 5 dependency hops</span><span>→</span><span><b>OUTPUT</b> {affected} affected nodes</span></div>
      </div>

      <aside className="inspector panel">
        <div className="panel-head"><div><span className="kicker">03 / INSPECT</span><h2>Why did it change?</h2></div></div>
        <div className={`state-banner ${selectedNode.state}`}><span className="big-state">{selectedNode.state.toUpperCase()}</span><strong>{selectedNode.label}</strong><span>state score {Math.round(selectedNode.score)}/100</span></div>
        <div className="inspector-block"><span className="label">UPSTREAM CAUSES</span>{selectedIncoming.length ? selectedIncoming.map(x=><div className="cause" key={x}><i/> {x}<b>contributes</b></div>) : <div className="muted">Root input — no upstream dependency.</div>}</div>
        <div className="inspector-block"><span className="label">DOWNSTREAM EFFECTS</span>{selectedOutgoing.length ? selectedOutgoing.map(x=><div className="cause" key={x}><i/> {x}<b>affected</b></div>) : <div className="muted">Terminal node.</div>}</div>
        <div className="confidence"><div><span>MODEL CONFIDENCE</span><b>{confidence}%</b></div><div className="confidence-bar"><i style={{width:`${confidence}%`}}/></div><p>Confidence reflects the deterministic dependency model and distance from baseline.</p></div>
      </aside>
    </section>

    <section className="timeline shell panel"><div><span className="kicker">04 / STATE HISTORY</span><h2>Watch the cascade evolve</h2></div><div className="timeline-track"><div className="track-line"/><div className="ticks">{[0,25,50,75,100].map((v,i)=><button key={v} className={i===3?"active":""}><span>{i===0?"BASELINE":i===4?"NOW":`${10+i}:30`}</span><i/></button>)}</div></div><div className="timeline-value"><b>{rain} mm</b><span>current input</span></div></section>

    <footer className="shell footer"><div><b>SYNAPSE</b><span>Understand the domino effect before it reaches you.</span></div><div className="footer-meta"><span>DETERMINISTIC CORE</span><span>EXPLAINABLE STATE</span><span>BUILT FOR THE WEB</span></div></footer>
  </main>;
}
