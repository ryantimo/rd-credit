"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", firm: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (!res.ok) { setError((await res.json()).error); setLoading(false); return }
    router.push("/login?registered=1")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#07080f" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
            <Zap size={16} color="white" />
          </div>
          <span className="font-bold text-white text-xl">CreditIQ</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm mb-6" style={{ color: "#6b6b8b" }}>Free to start — no credit card needed</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="jane@firm.com" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <label className="label">Firm name <span style={{ color: "#4b4b6b" }}>(optional)</span></label>
              <input className="input" placeholder="Smith & Associates CPA" value={form.firm} onChange={set("firm")} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={set("password")} required minLength={8} />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#6b6b8b" }}>
          Already have an account? <Link href="/login" style={{ color: "#818cf8" }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
