import Link from "next/link"
import { ArrowRight, CheckCircle, FileText, Users, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#07080f" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
            <Zap size={14} color="white" />
          </div>
          <span className="font-bold text-white text-lg">CreditIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
          Built by R&D tax credit specialists
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-6">
          R&D Tax Credits,<br />
          <span style={{ color: "#6366f1" }}>done in minutes.</span>
        </h1>
        <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "#8b8b9e" }}>
          The guided platform for CPAs to prepare accurate R&D tax credit studies.
          Answer the questions, we handle the calculation and generate Form 6765.
        </p>
        <Link href="/signup" className="btn-primary text-base px-6 py-3 inline-flex items-center gap-2">
          Start your first study <ArrowRight size={16} />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24 grid grid-cols-3 gap-6">
        {[
          {
            icon: <FileText size={20} />,
            title: "Guided interview flow",
            desc: "Step-by-step questions walk you through qualification, QRE collection, and method selection — no guesswork.",
          },
          {
            icon: <Zap size={20} />,
            title: "Automatic calculation",
            desc: "We run both RRC and ASC methods and pick the one that maximizes your client's credit.",
          },
          {
            icon: <Users size={20} />,
            title: "Multi-client dashboard",
            desc: "Manage all your clients and filings in one place. Track status from draft to complete.",
          },
        ].map(f => (
          <div key={f.title} className="card p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
              {f.icon}
            </div>
            <h3 className="font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-sm" style={{ color: "#6b6b8b" }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* 4-part test */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">The 4-Part Test, built in</h2>
        <div className="card overflow-hidden">
          {[
            { n: "01", title: "Permitted purpose", desc: "Activity must relate to a new or improved product, process, software, technique, formula, or invention." },
            { n: "02", title: "Technological in nature", desc: "Must fundamentally rely on principles of physical, biological, computer, or engineering science." },
            { n: "03", title: "Elimination of uncertainty", desc: "Must be intended to discover information to eliminate technical uncertainty about a business component." },
            { n: "04", title: "Process of experimentation", desc: "Must involve evaluation of alternatives through modeling, simulation, systematic trial, or other methods." },
          ].map((item, i) => (
            <div key={item.n} className="flex items-start gap-5 px-6 py-5"
              style={{ borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
              <span className="step-pill flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{item.n}</span>
              <div>
                <div className="font-semibold text-white mb-1">{item.title}</div>
                <div className="text-sm" style={{ color: "#6b6b8b" }}>{item.desc}</div>
              </div>
              <CheckCircle size={18} className="ml-auto flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
