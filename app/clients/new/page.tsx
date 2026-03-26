"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const INDUSTRIES = [
  "Software / Technology", "Manufacturing", "Biotech / Pharma", "Agriculture",
  "Food & Beverage", "Aerospace & Defense", "Architecture / Engineering",
  "Chemicals", "Medical Devices", "Construction / Contracting", "Other",
]

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", ein: "", industry: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (!res.ok) { setError((await res.json()).error); setLoading(false); return }
    const client = await res.json()
    router.push(`/clients/${client.id}`)
  }

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-xl">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm mb-6" style={{ color: "#6b6b8b" }}>
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">New client</h1>
        <p className="text-sm mb-8" style={{ color: "#6b6b8b" }}>Add a new client to start an R&D credit study</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="label">Company name *</label>
            <input className="input" placeholder="Acme Corp" value={form.name} onChange={set("name")} required />
          </div>
          <div>
            <label className="label">EIN <span style={{ color: "#4b4b6b" }}>(optional)</span></label>
            <input className="input" placeholder="XX-XXXXXXX" value={form.ein} onChange={set("ein")} />
          </div>
          <div>
            <label className="label">Industry <span style={{ color: "#4b4b6b" }}>(optional)</span></label>
            <select className="input" value={form.industry} onChange={set("industry")}>
              <option value="">Select industry…</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create client"}
            </button>
            <Link href="/dashboard" className="btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
