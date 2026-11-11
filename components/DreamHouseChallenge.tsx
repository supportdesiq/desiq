"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, CircleHelp, House, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";

type Room = { id: string; name: string; cost: number; description: string; };
const catalogue: Room[] = [
  { id: "living", name: "Living room", cost: 2, description: "Shared family space" },
  { id: "bedroom", name: "Bedroom", cost: 2, description: "Private sleeping space" },
  { id: "balcony", name: "Balcony", cost: 3, description: "Outdoor space" },
  { id: "kitchen", name: "Kitchen", cost: 1.5, description: "Food preparation" },
  { id: "bathroom", name: "Bathroom", cost: 1, description: "Essential facilities" },
  { id: "study", name: "Study", cost: 1.5, description: "Quiet work or study area" },
  { id: "dining", name: "Dining area", cost: 1.5, description: "Family meals" },
];

const money = (n: number) => `₹${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)} lakh`;

export default function DreamHouseChallenge() {
  const [selected, setSelected] = useState<string[]>(["living", "bedroom", "kitchen", "bathroom"]);
  const [designName, setDesignName] = useState("My dream home");
  const [light, setLight] = useState(false);
  const [flow, setFlow] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [showResults, setShowResults] = useState(false);

  const total = useMemo(() => catalogue.filter(r => selected.includes(r.id)).reduce((sum, r) => sum + r.cost, 0), [selected]);
  const withinBudget = total <= 10;
  const essentials = ["bedroom", "kitchen", "bathroom"].every(id => selected.includes(id));
  const score = (withinBudget ? 40 : 0) + (essentials ? 20 : 0) + (light ? 15 : 0) + (flow ? 15 : 0) + (explanation.trim().length >= 40 ? 10 : 0);
  const remaining = 10 - total;

  function toggleRoom(id: string) {
    setShowResults(false);
    setSelected(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }
  function reset() {
    setSelected(["living", "bedroom", "kitchen", "bathroom"]);
    setDesignName("My dream home");
    setLight(false);
    setFlow(false);
    setExplanation("");
    setShowResults(false);
  }

  return (
    <div className="dream-challenge">
      <div className="challenge-topline">
        <Link href="/subjects/architecture" className="challenge-back"><ArrowLeft size={15}/> Architecture world</Link>
        <span><span className="live-dot"/> INTERACTIVE CHALLENGE · 01</span>
      </div>

      <section className="challenge-intro">
        <div>
          <div className="challenge-kicker"><Sparkles size={14}/> DESIQ ARCHITECTURE CHALLENGE</div>
          <h1>Design your<br/><em>dream house.</em></h1>
          <p>You have a budget of ₹10 lakh. Choose the spaces your family needs, make trade-offs and explain the thinking behind your design.</p>
          <div className="challenge-meta"><span>BEGINNER</span><i/> <span>20–30 MIN</span><i/> <span>DESIGN + BUDGETING</span></div>
        </div>
        <div className="challenge-illustration" aria-label="Illustration of a simple house plan">
          <div className="plan-measure measure-top">9.0 m</div>
          <div className="plan-measure measure-side">8.0 m</div>
          <div className="mini-floorplan">
            <div className="plan-room plan-bedroom">BEDROOM<small>3 × 3 m</small></div>
            <div className="plan-room plan-living">LIVING ROOM<small>3.5 × 4 m</small></div>
            <div className="plan-room plan-kitchen">KITCHEN</div>
            <div className="plan-room plan-bath">BATH</div>
          </div>
          <div className="plan-house-icon"><House size={88} strokeWidth={1.1}/></div>
          <span className="plan-caption">A PLAN BEGINS WITH A CHOICE</span>
        </div>
      </section>

      <section className="challenge-workspace">
        <div className="workspace-heading">
          <div><span className="challenge-step">YOUR BRIEF · 01</span><h2>Build within your budget.</h2><p>Choose the rooms you want to include. Every choice changes your available budget.</p></div>
          <button className="reset-button" onClick={reset}><RotateCcw size={14}/> Reset plan</button>
        </div>

        <div className="planner-layout">
          <div className="room-catalogue">
            <div className="planner-subhead"><b>ROOM CATALOGUE</b><span>SELECT TO ADD / REMOVE</span></div>
            <div className="room-options">
              {catalogue.map(room => {
                const active = selected.includes(room.id);
                return <button key={room.id} className={`room-option ${active ? "is-selected" : ""}`} onClick={() => toggleRoom(room.id)} aria-pressed={active}>
                  <span className="room-option-mark">{active ? <Check size={15}/> : <Plus size={15}/>}</span>
                  <span className="room-option-copy"><b>{room.name}</b><small>{room.description}</small></span>
                  <strong>{money(room.cost)}</strong>
                </button>;
              })}
            </div>
            <div className="planner-note"><CircleHelp size={16}/><span>These are starter planning values for this learning challenge, not real construction quotations.</span></div>
          </div>

          <aside className="budget-panel">
            <div className="budget-panel-top"><span>YOUR PROJECT</span><span className="budget-status">{withinBudget ? "ON TRACK" : "OVER BUDGET"}</span></div>
            <label className="design-name-label" htmlFor="design-name">Give your design a name</label>
            <input id="design-name" value={designName} onChange={e => setDesignName(e.target.value)} maxLength={48}/>
            <div className="budget-total-label">ESTIMATED ROOM BUDGET</div>
            <div className={`budget-total ${withinBudget ? "" : "over"}`}>{money(total)}</div>
            <div className="budget-track"><span style={{width:`${Math.min(total/10*100,100)}%`}}/></div>
            <div className="budget-figures"><span>₹0</span><b>₹10 lakh limit</b></div>
            <div className="budget-remaining"><span>{withinBudget ? "Remaining budget" : "Amount over budget"}</span><b>{money(Math.abs(remaining))}</b></div>
            <div className="selected-summary"><b>YOUR SELECTED SPACES</b>
              {selected.length ? catalogue.filter(r => selected.includes(r.id)).map(r => <div key={r.id}><span>{r.name}</span><strong>{money(r.cost)}</strong></div>) : <p>No rooms selected yet. Add a room to begin.</p>}
            </div>
          </aside>
        </div>
      </section>

      <section className="design-decisions">
        <div className="workspace-heading"><div><span className="challenge-step">YOUR THINKING · 02</span><h2>Design is more than a list of rooms.</h2><p>Think about how the spaces will work for the people living in your house.</p></div></div>
        <div className="decision-grid">
          <label className={`decision-card ${light ? "decision-active" : ""}`}><input type="checkbox" checked={light} onChange={e => setLight(e.target.checked)}/><span className="decision-check">{light && <Check size={14}/>}</span><span><b>Light & ventilation</b><small>I've considered natural light and airflow for the main rooms.</small></span></label>
          <label className={`decision-card ${flow ? "decision-active" : ""}`}><input type="checkbox" checked={flow} onChange={e => setFlow(e.target.checked)}/><span className="decision-check">{flow && <Check size={14}/>}</span><span><b>Practical room flow</b><small>I've thought about how people move between the spaces.</small></span></label>
        </div>
        <label className="explanation-label" htmlFor="design-explanation">Explain your choices <span>· at least 40 characters for full points</span></label>
        <textarea id="design-explanation" value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Why did you choose these rooms? What did you prioritise, and what did you decide to leave out?" rows={4}/>
        <div className="submit-row"><p>Your score is a learning guide based on the criteria shown below. It is not a professional architectural assessment.</p><button className="button challenge-submit" onClick={() => setShowResults(true)}>Evaluate my design <ArrowUpRight size={17}/></button></div>
      </section>

      {showResults && <section className="challenge-results" aria-live="polite">
        <div className="result-score"><span>YOUR CHALLENGE SCORE</span><strong>{score}<small>/100</small></strong><b>{score >= 80 ? "Thoughtful design!" : score >= 60 ? "Good start. Keep improving." : "A first draft is a great start."}</b></div>
        <div className="result-breakdown">
          <h3>How your design scored</h3>
          <div><span>Stayed within ₹10 lakh budget</span><b>{withinBudget ? "40 / 40" : "0 / 40"}</b></div>
          <div><span>Included bedroom, kitchen and bathroom</span><b>{essentials ? "20 / 20" : "0 / 20"}</b></div>
          <div><span>Considered light and ventilation</span><b>{light ? "15 / 15" : "0 / 15"}</b></div>
          <div><span>Considered practical room flow</span><b>{flow ? "15 / 15" : "0 / 15"}</b></div>
          <div><span>Explained design decisions</span><b>{explanation.trim().length >= 40 ? "10 / 10" : "0 / 10"}</b></div>
          <p>{withinBudget ? "Your selected rooms fit the challenge budget." : `Reduce your room choices by at least ${money(total - 10)} to meet the budget.`} Review the criteria and try another version to improve your score.</p>
          <button className="reset-button" onClick={() => setShowResults(false)}><Minus size={14}/> Continue editing</button>
        </div>
      </section>}

      <section className="challenge-rubric">
        <div><span className="challenge-step">THE SUCCESS CRITERIA · 03</span><h2>What makes a strong design?</h2></div>
        <div className="rubric-grid">
          <div><b>40 pts</b><strong>Budget discipline</strong><p>Stay within the ₹10 lakh limit.</p></div>
          <div><b>20 pts</b><strong>Essential spaces</strong><p>Include a bedroom, kitchen and bathroom.</p></div>
          <div><b>15 pts</b><strong>Light & airflow</strong><p>Consider comfort and ventilation.</p></div>
          <div><b>15 pts</b><strong>Room flow</strong><p>Think about movement between spaces.</p></div>
          <div><b>10 pts</b><strong>Creative reasoning</strong><p>Explain your trade-offs and priorities.</p></div>
        </div>
      </section>
      <div className="challenge-footer-cta"><div><span className="challenge-step">KEEP EXPLORING</span><h2>Every great space<br/><em>starts with an idea.</em></h2></div><Link className="button button-dark" href="/subjects/architecture">Back to Architecture <ArrowUpRight size={16}/></Link></div>
    </div>
  );
}
