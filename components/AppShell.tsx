"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LayoutDashboard, Users, LogOut, Zap, ShieldCheck } from "lucide-react"
import clsx from "clsx"

const nav = [
  { href: "/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { href: "/clients",   icon: <Users size={16} />,           label: "Clients" },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex min-h-screen" style={{ background: "#07080f" }}>
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col py-5 px-3"
        style={{ background: "#0a0b18", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
            <Zap size={13} color="white" />
          </div>
          <span className="font-bold text-white">CreditIQ</span>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map(n => (
            <Link key={n.href} href={n.href}
              className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                path.startsWith(n.href)
                  ? "text-white"
                  : "hover:text-white")}
              style={path.startsWith(n.href)
                ? { background: "rgba(99,102,241,0.15)", color: "#818cf8" }
                : { color: "#6b6b8b" }}>
              {n.icon}{n.label}
            </Link>
          ))}
        </nav>

        <div className="border-t pt-4 px-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs font-medium text-white mb-0.5">{session?.user?.name}</div>
          <div className="text-xs mb-3" style={{ color: "#4b4b6b" }}>{session?.user?.email}</div>
          {session?.user?.email === "timonian.98@gmail.com" && (
            <Link href="/admin" className="flex items-center gap-2 text-xs mb-2 transition-colors"
              style={{ color: "#f87171" }}>
              <ShieldCheck size={13} /> Admin
            </Link>
          )}
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-xs transition-colors w-full"
            style={{ color: "#4b4b6b" }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  )
}
