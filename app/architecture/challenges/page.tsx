import Link from "next/link";
import { Sparkles } from "lucide-react";
import ChallengeLibrary from "@/components/ChallengeLibrary";

export default function ArchitectureChallengesPage(){
 return <main className="challenge-library">
  <div className="challenge-library-top"><Link href="/subjects/architecture">← Architecture world</Link><span>DESIQ · DESIGN CHALLENGE LIBRARY</span></div>
  <header>
   <div className="builder-kicker"><Sparkles size={14}/> LEARN BY MAKING</div>
   <h1>Architecture,<br/><em>designed by you.</em></h1>
   <p>Choose a real-world brief and explore its own design environment. Preview the goal, discover the tools and then bring your idea to life in the 2D and 3D studio.</p>
   <div className="challenge-library-stats"><span><b>07</b> DISTINCT BRIEFS</span><span><b>03</b> PROJECT TYPES</span><span><b>LIVE</b> COST ESTIMATES</span></div>
  </header>
  <ChallengeLibrary/>
  <footer>SEVEN DISTINCT DESIGN DISCIPLINES · ONE PLACE TO THINK, PLAN AND CREATE.</footer>
 </main>;
}
