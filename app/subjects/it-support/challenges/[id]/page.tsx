import ITShell from "@/components/it-support/ITShell";import ChallengeRunner from "@/components/it-support/ChallengeRunner";
export default async function ChallengePage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ITShell active="challenges"><section className="it-section it-runner-section"><ChallengeRunner id={id}/></section></ITShell>}
