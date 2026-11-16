import ITShell from "@/components/it-support/ITShell";import TicketDetail from "@/components/it-support/TicketDetail";
export default async function TicketPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ITShell active="tickets"><section className="it-section it-ticket-page"><TicketDetail id={id}/></section></ITShell>}
