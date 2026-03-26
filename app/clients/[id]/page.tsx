"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"
import Link from "next/link"
import { ArrowLeft, Plus, ChevronRight, FileText } from "lucide-react"

interface Filing {
  id: string; taxYear: number; status: string
  method: string | null; creditAmount: number | null
}
interface Client { id: string; name: string; ein: string | null; industry: string | null; filings: Filing[] }

export default function ClientPage() {
  const { id } = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [creating, setCreating] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear() - 1)

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient)
  }, [id])

  async function newFiling() {
    setCreating(true)
    const res = await fetch("/api/filings", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, taxYear: year }) })
    const f = await res.json()
    router.push(`/clients/${id}/filings/${f.id}`)
  }

  if (!client) return <AppShell><div className="flex items-center justify-center h-screen"><div className="text-sm" style={{ color: "#4b4b6b" }}>Loading…</div></div></AppShell>

  return (
    <AppShell>
      <div className="px-8 py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm mb-6" style={{ color: "#6b6b8b" }}>
          <ArrowLeft size={15} /> Dashboard
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <p className="text-sm mt-1" style={{ color: "#6b6b8b" }}>
              {[client.industry, client.ein].filter(Boolean).join(" · ") || "No details"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="input text-sm py-2" value={year} onChange={e => setYear(parseInt(e.target.value))}
              style={{ width: 110 }}>
              {[0,1,2,3].map(i => { const y = new Date().getFullYear() - i - 1; return <option key={y} value={y}>{y}</option> })}
            </select>
            <button onClick={newFiling} className="btn-primary" disabled={creating}>
              <Plus size={15} /> {creating ? "Creating…" : "New filing"}
            </button>
          </div>
        </div>

        {client.filings.length === 0 ? (
          <div className="card p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
              <FileText size={22} />
            </div>
            <h3 className="font-semibold text-white mb-2">No filings yet</h3>
            <p className="text-sm mb-5" style={{ color: "#6b6b8b" }}>Select a tax year and create a new R&D credit study</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold text-white text-sm">Filings</h2>
            </div>
            <table className="data-table">
              <thead><tr><th>Tax year</th><th>Method</th><th>Status</th><th>Credit amount</th><th></th></tr></thead>
              <tbody>
                {client.filings.map(f => (
                  <tr key={f.id}>
                    <td className="font-semibold text-white">{f.taxYear}</td>
                    <td style={{ color: "#8b8b9e" }}>{f.method?.toUpperCase() ?? "—"}</td>
                    <td>
                      <span className="badge"
                        style={f.status === "complete"
                          ? { background: "rgba(16,185,129,0.12)", color: "#34d399" }
                          : { background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                        {f.status === "complete" ? "Complete" : "Draft"}
                      </span>
                    </td>
                    <td className="font-bold" style={{ color: "#34d399" }}>
                      {f.creditAmount ? `$${Math.round(f.creditAmount).toLocaleString()}` : "—"}
                    </td>
                    <td>
                      <Link href={`/clients/${id}/filings/${f.id}`} className="flex items-center gap-1 text-xs"
                        style={{ color: "#818cf8" }}>
                        Open <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
