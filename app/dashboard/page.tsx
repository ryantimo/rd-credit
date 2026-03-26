"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import { Plus, FileText, ChevronRight } from "lucide-react"

interface Client {
  id: string
  name: string
  ein: string | null
  industry: string | null
  filings: { taxYear: number; status: string; creditAmount: number | null }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/clients").then(r => r.json()).then(d => { setClients(d); setLoading(false) })
  }, [status])

  const totalFilings = clients.reduce((s, c) => s + c.filings.length, 0)
  const totalCredit  = clients.reduce((s, c) => s + c.filings.reduce((x, f) => x + (f.creditAmount ?? 0), 0), 0)

  if (status === "loading" || loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm" style={{ color: "#4b4b6b" }}>Loading…</div>
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "#6b6b8b" }}>Welcome back, {session?.user?.name}</p>
          </div>
          <Link href="/clients/new" className="btn-primary">
            <Plus size={16} /> New client
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total clients",  value: clients.length,                                    color: "#818cf8" },
            { label: "Total filings",  value: totalFilings,                                      color: "#34d399" },
            { label: "Credits found",  value: `$${Math.round(totalCredit).toLocaleString()}`,    color: "#fbbf24" },
          ].map(s => (
            <div key={s.label} className="card p-6">
              <div className="text-xs mb-2" style={{ color: "#6b6b8b" }}>{s.label}</div>
              <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Clients */}
        {clients.length === 0 ? (
          <div className="card p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
              <FileText size={22} />
            </div>
            <h3 className="font-semibold text-white mb-2">No clients yet</h3>
            <p className="text-sm mb-5" style={{ color: "#6b6b8b" }}>Add your first client to get started</p>
            <Link href="/clients/new" className="btn-primary">
              <Plus size={15} /> Add client
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold text-white text-sm">Recent clients</h2>
            </div>
            <table className="data-table">
              <thead><tr><th>Client</th><th>Industry</th><th>EIN</th><th>Last filing</th><th>Credit</th><th></th></tr></thead>
              <tbody>
                {clients.map(c => {
                  const last = c.filings[0]
                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-white">{c.name}</td>
                      <td style={{ color: "#8b8b9e" }}>{c.industry ?? "—"}</td>
                      <td style={{ color: "#6b6b8b" }}>{c.ein ?? "—"}</td>
                      <td style={{ color: "#8b8b9e" }}>{last ? `${last.taxYear}` : "No filings"}</td>
                      <td className="font-semibold" style={{ color: "#34d399" }}>
                        {last?.creditAmount ? `$${Math.round(last.creditAmount).toLocaleString()}` : "—"}
                      </td>
                      <td>
                        <Link href={`/clients/${c.id}`} className="flex items-center gap-1 text-xs"
                          style={{ color: "#818cf8" }}>
                          View <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
