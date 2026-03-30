"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, FileText, DollarSign, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const ADMIN_EMAIL = "timonian.98@gmail.com"

interface Stats {
  totalCredit: number
  complete: number
  users: {
    id: string; name: string; email: string; firm: string | null
    createdAt: string; _count: { clients: number }
  }[]
  clients: {
    id: string; name: string; ein: string | null; industry: string | null
    user: { name: string; email: string }
    filings: { taxYear: number; status: string; creditAmount: number | null; method: string | null }[]
  }[]
  filings: {
    id: string; taxYear: number; status: string; creditAmount: number | null; method: string | null
    updatedAt: string
    client: { name: string; user: { name: string; email: string } }
  }[]
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
const date = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [tab, setTab] = useState<"overview" | "users" | "clients" | "filings">("overview")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && session.user.email !== ADMIN_EMAIL) router.push("/dashboard")
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/admin/stats").then(r => r.json()).then(setStats)
  }, [status])

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#07080f" }}>
      <div className="text-sm" style={{ color: "#4b4b6b" }}>Loading admin…</div>
    </div>
  )

  const tabs = ["overview", "users", "clients", "filings"] as const

  return (
    <div className="min-h-screen px-8 py-8" style={{ background: "#07080f" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge text-xs px-2 py-0.5" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>Admin</span>
            </div>
            <h1 className="text-2xl font-bold text-white">CreditIQ Admin</h1>
          </div>
          <Link href="/dashboard" className="btn-ghost text-sm">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-lg w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-md text-sm font-medium capitalize transition-all"
              style={tab === t
                ? { background: "#0e0f1c", color: "white", border: "1px solid rgba(255,255,255,0.08)" }
                : { color: "#6b6b8b" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: <Users size={18} />,      label: "Total CPAs",        value: stats.users.length,                        color: "#818cf8" },
                { icon: <FileText size={18} />,   label: "Total clients",     value: stats.clients.length,                      color: "#34d399" },
                { icon: <CheckCircle size={18} />, label: "Completed studies", value: stats.complete,                            color: "#fbbf24" },
                { icon: <DollarSign size={18} />, label: "Total credits found", value: fmt(stats.totalCredit),                  color: "#f472b6" },
              ].map(s => (
                <div key={s.label} className="card p-5">
                  <div className="flex items-center gap-2 mb-3" style={{ color: s.color }}>{s.icon}</div>
                  <div className="text-xs mb-1" style={{ color: "#6b6b8b" }}>{s.label}</div>
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Recent filings */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <h2 className="font-semibold text-white text-sm">Recent filings</h2>
              </div>
              <table className="data-table">
                <thead><tr><th>Client</th><th>CPA</th><th>Year</th><th>Status</th><th>Credit</th><th>Updated</th></tr></thead>
                <tbody>
                  {stats.filings.slice(0, 10).map(f => (
                    <tr key={f.id}>
                      <td className="font-medium text-white">{f.client.name}</td>
                      <td style={{ color: "#8b8b9e" }}>{f.client.user.name}</td>
                      <td style={{ color: "#8b8b9e" }}>{f.taxYear}</td>
                      <td>
                        <span className="badge" style={f.status === "complete"
                          ? { background: "rgba(16,185,129,0.12)", color: "#34d399" }
                          : { background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                          {f.status}
                        </span>
                      </td>
                      <td className="font-semibold" style={{ color: "#34d399" }}>
                        {f.creditAmount ? fmt(f.creditAmount) : "—"}
                      </td>
                      <td style={{ color: "#6b6b8b" }}>{date(f.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold text-white text-sm">{stats.users.length} CPAs registered</h2>
            </div>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Firm</th><th>Clients</th><th>Joined</th></tr></thead>
              <tbody>
                {stats.users.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium text-white">{u.name}</td>
                    <td style={{ color: "#8b8b9e" }}>{u.email}</td>
                    <td style={{ color: "#6b6b8b" }}>{u.firm ?? "—"}</td>
                    <td style={{ color: "#818cf8" }}>{u._count.clients}</td>
                    <td style={{ color: "#6b6b8b" }}>{date(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Clients */}
        {tab === "clients" && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold text-white text-sm">{stats.clients.length} clients</h2>
            </div>
            <table className="data-table">
              <thead><tr><th>Client</th><th>Industry</th><th>CPA</th><th>Filings</th><th>Best credit</th></tr></thead>
              <tbody>
                {stats.clients.map(c => {
                  const best = Math.max(...c.filings.map(f => f.creditAmount ?? 0))
                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-white">{c.name}</td>
                      <td style={{ color: "#8b8b9e" }}>{c.industry ?? "—"}</td>
                      <td style={{ color: "#8b8b9e" }}>{c.user.name}</td>
                      <td style={{ color: "#818cf8" }}>{c.filings.length}</td>
                      <td className="font-semibold" style={{ color: "#34d399" }}>{best > 0 ? fmt(best) : "—"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* All filings */}
        {tab === "filings" && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold text-white text-sm">{stats.filings.length} total filings</h2>
            </div>
            <table className="data-table">
              <thead><tr><th>Client</th><th>CPA</th><th>Year</th><th>Method</th><th>Status</th><th>Credit</th><th>Updated</th></tr></thead>
              <tbody>
                {stats.filings.map(f => (
                  <tr key={f.id}>
                    <td className="font-medium text-white">{f.client.name}</td>
                    <td style={{ color: "#8b8b9e" }}>{f.client.user.name}</td>
                    <td style={{ color: "#8b8b9e" }}>{f.taxYear}</td>
                    <td style={{ color: "#818cf8" }}>{f.method?.toUpperCase() ?? "—"}</td>
                    <td>
                      <span className="badge" style={f.status === "complete"
                        ? { background: "rgba(16,185,129,0.12)", color: "#34d399" }
                        : { background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                        {f.status}
                      </span>
                    </td>
                    <td className="font-semibold" style={{ color: "#34d399" }}>{f.creditAmount ? fmt(f.creditAmount) : "—"}</td>
                    <td style={{ color: "#6b6b8b" }}>{date(f.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
