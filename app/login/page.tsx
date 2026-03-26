"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) { setError("Invalid email or password"); setLoading(false) }
    else router.push("/dashboard")
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
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: "#6b6b8b" }}>Sign in to your CPA account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@firm.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#6b6b8b" }}>
          No account? <Link href="/signup" style={{ color: "#818cf8" }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
