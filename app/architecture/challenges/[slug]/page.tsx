import DreamHouseChallenge from "@/components/DreamHouseChallenge";
const titles:Record<string,string>={"dream-house":"Design your dream house","tiny-home":"The 40 m² tiny home","climate-smart":"Design a climate-smart home","accessible-home":"A home for every generation","courtyard-home":"The courtyard home","community-cafe":"Design a neighbourhood café","studio-renovation":"Renovate a compact apartment"};
export function generateStaticParams(){return Object.keys(titles).map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:`${titles[slug]||"Architecture Challenge"} | DESIQ`,description:"An interactive DESIQ Architecture design challenge."};}
export default async function ChallengeDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!titles[slug])return <div className="challenge-not-found">Challenge not found.</div>;return <DreamHouseChallenge challengeKey={slug}/>;}
