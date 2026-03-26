"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle, Calculator } from "lucide-react"
import { fmt } from "@/lib/calc"

// ── Types ─────────────────────────────────────────────────────────────────
interface Employee { name: string; title: string; w2Wages: number; rdTimePct: number }
interface Supply    { description: string; amount: number }
interface Contract  { vendor: string; description: string; amount: number }

interface FilingData {
  id: string; taxYear: number; status: string; method: string | null
  qualAnswers: string | null; totalQRE: number | null; creditAmount: number | null
  ascPriorQRE1: number | null; ascPriorQRE2: number | null; ascPriorQRE3: number | null
  employees: (Employee & { id: string; qualWages: number })[]
  supplies:  (Supply  & { id: string })[]
  contracts: (Contract & { id: string; qualified: number })[]
  client: { name: string; id: string }
}

// ── Qualification questions ───────────────────────────────────────────────
const QUAL_QUESTIONS = [
  {
    id: "purpose",
    question: "Does the activity relate to a new or improved product, process, software, technique, formula, or invention?",
    hint: "Permitted purpose — IRC § 41(d)(1)(A)",
  },
  {
    id: "tech",
    question: "Does the activity fundamentally rely on principles of engineering, computer science, physics, or biology?",
    hint: "Technological in nature — IRC § 41(d)(1)(B)",
  },
  {
    id: "uncertainty",
    question: "Was there genuine technical uncertainty at the start — i.e., was it unclear whether or how the goal could be achieved?",
    hint: "Elimination of uncertainty — IRC § 41(d)(1)(C)",
  },
  {
    id: "experimentation",
    question: "Did the team evaluate alternative approaches through testing, simulation, prototyping, or trial and error?",
    hint: "Process of experimentation — IRC § 41(d)(1)(D)",
  },
  {
    id: "funded",
    question: "Is this activity funded by a grant, contract, or another company? (Answer NO if self-funded)",
    hint: "Funded research exclusion — IRC § 41(d)(4)(H). Must answer NO to qualify.",
    invert: true,
  },
  {
    id: "internal_use",
    question: "Is this software developed primarily for internal administrative use (HR, payroll, accounting)?",
    hint: "Internal-use software exclusion — IRC § 41(d)(4)(E). Must answer NO to qualify.",
    invert: true,
  },
]

const STEPS = ["Qualification", "Employees", "Supplies", "Contracts", "Calculate", "Summary"]

// ── Component ─────────────────────────────────────────────────────────────
export default function FilingPage() {
  const { id: clientId, filingId } = useParams() as { id: string; filingId: string }
  const router = useRouter()

  const [filing, setFiling]   = useState<FilingData | null>(null)
  const [step, setStep]       = useState(0)
  const [saving, setSaving]   = useState(false)

  // Step 0 — qualification
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  // Step 1 — employees
  const [employees, setEmployees] = useState<Employee[]>([{ name: "", title: "", w2Wages: 0, rdTimePct: 100 }])

  // Step 2 — supplies
  const [supplies, setSupplies] = useState<Supply[]>([{ description: "", amount: 0 }])

  // Step 3 — contracts
  const [contracts, setContracts] = useState<Contract[]>([{ vendor: "", description: "", amount: 0 }])

  // Step 4 — calculate
  const [grossReceipts, setGrossReceipts] = useState(0)
  const [priorQRE, setPriorQRE] = useState([0, 0, 0])
  const [method, setMethod]   = useState<"best" | "rrc" | "asc">("best")

  useEffect(() => {
    fetch(`/api/filings/${filingId}`)
      .then(r => r.json())
      .then((d: FilingData) => {
        setFiling(d)
        if (d.qualAnswers) setAnswers(JSON.parse(d.qualAnswers))
        if (d.employees.length) setEmployees(d.employees.map(({ name, title, w2Wages, rdTimePct }) => ({ name, title, w2Wages, rdTimePct })))
        if (d.supplies.length) setSupplies(d.supplies.map(({ description, amount }) => ({ description, amount })))
        if (d.contracts.length) setContracts(d.contracts.map(({ vendor, description, amount }) => ({ vendor, description, amount })))
        if (d.ascPriorQRE1 || d.ascPriorQRE2 || d.ascPriorQRE3) setPriorQRE([d.ascPriorQRE1 ?? 0, d.ascPriorQRE2 ?? 0, d.ascPriorQRE3 ?? 0])
      })
  }, [filingId])

  const qualPasses = QUAL_QUESTIONS.every(q => {
    const ans = answers[q.id]
    return q.invert ? ans === false : ans === true
  })

  async function save(extra?: Record<string, unknown>) {
    setSaving(true)
    const res = await fetch(`/api/filings/${filingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qualAnswers:  answers,
        employees,
        supplies:     supplies.filter(s => s.description && s.amount > 0),
        contracts:    contracts.filter(c => c.vendor && c.amount > 0),
        grossReceipts,
        ascPriorQRE1: priorQRE[0],
        ascPriorQRE2: priorQRE[1],
        ascPriorQRE3: priorQRE[2],
        ...extra,
      }),
    })
    const d = await res.json()
    setFiling(d)
    setSaving(false)
    return d
  }

  async function complete() {
    await save({ status: "complete" })
    router.push(`/clients/${clientId}/filings/${filingId}/report`)
  }

  if (!filing) return (
    <AppShell>
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm" style={{ color: "#4b4b6b" }}>Loading…</div>
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="px-8 py-8">
        <Link href={`/clients/${clientId}`} className="flex items-center gap-2 text-sm mb-6" style={{ color: "#6b6b8b" }}>
          <ArrowLeft size={15} /> {filing.client.name}
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {filing.taxYear} R&D Credit Study
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b6b8b" }}>{filing.client.name}</p>
          </div>
          {filing.creditAmount && (
            <div className="card px-5 py-3 text-right">
              <div className="text-xs mb-0.5" style={{ color: "#6b6b8b" }}>Estimated credit</div>
              <div className="text-2xl font-bold" style={{ color: "#34d399" }}>{fmt(filing.creditAmount)}</div>
            </div>
          )}
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button onClick={() => setStep(i)}
                className="flex items-center gap-2 text-xs font-medium transition-colors"
                style={{ color: step === i ? "#818cf8" : i < step ? "#34d399" : "#4b4b6b" }}>
                <span className="step-pill"
                  style={{
                    background: step === i ? "rgba(99,102,241,0.2)" : i < step ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                    color: step === i ? "#818cf8" : i < step ? "#34d399" : "#4b4b6b",
                  }}>
                  {i < step ? <CheckCircle size={12} /> : i + 1}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
        </div>

        {/* ── Step 0: Qualification ── */}
        {step === 0 && (
          <div className="max-w-2xl space-y-4">
            <div className="card p-5 mb-2">
              <p className="text-sm" style={{ color: "#8b8b9e" }}>
                Answer all 6 questions. All 4 positive tests must be <strong className="text-white">YES</strong> and both exclusions must be <strong className="text-white">NO</strong> for the activity to qualify.
              </p>
            </div>
            {QUAL_QUESTIONS.map((q, i) => (
              <div key={q.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <span className="step-pill flex-shrink-0 text-xs"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">{q.question}</p>
                    <p className="text-xs mb-4" style={{ color: "#4b4b6b" }}>{q.hint}</p>
                    <div className="flex gap-3">
                      {[true, false].map(v => (
                        <button key={String(v)} onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background: answers[q.id] === v
                              ? v === !q.invert ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)"
                              : "rgba(255,255,255,0.04)",
                            color: answers[q.id] === v
                              ? v === !q.invert ? "#34d399" : "#f87171"
                              : "#6b6b8b",
                            border: `1px solid ${answers[q.id] === v
                              ? v === !q.invert ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"
                              : "rgba(255,255,255,0.06)"}`,
                          }}>
                          {v ? "Yes" : "No"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(answers).length === QUAL_QUESTIONS.length && (
              <div className={`card p-4 ${qualPasses ? "" : ""}`}
                style={{
                  background: qualPasses ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                  borderColor: qualPasses ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                }}>
                <p className="text-sm font-medium" style={{ color: qualPasses ? "#34d399" : "#f87171" }}>
                  {qualPasses ? "✅ Activity qualifies under IRC § 41" : "❌ Activity does not qualify — review answers above"}
                </p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={() => { save(); setStep(1) }} disabled={!qualPasses || saving} className="btn-primary">
                {saving ? "Saving…" : "Continue"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Employees ── */}
        {step === 1 && (
          <div className="max-w-3xl">
            <div className="card p-5 mb-4">
              <p className="text-sm" style={{ color: "#8b8b9e" }}>
                Enter each employee who spent time on qualified R&D activities. Qualified wages = W-2 wages × R&D time %. Include only employees who directly performed, supervised, or supported qualified research.
              </p>
            </div>
            <div className="space-y-3 mb-4">
              {employees.map((emp, i) => (
                <div key={i} className="card p-4 grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-3">
                    <label className="label">Name</label>
                    <input className="input" placeholder="John Doe" value={emp.name}
                      onChange={e => setEmployees(es => es.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Title</label>
                    <input className="input" placeholder="Software Engineer" value={emp.title}
                      onChange={e => setEmployees(es => es.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">W-2 Wages ($)</label>
                    <input type="number" className="input" placeholder="120000" value={emp.w2Wages || ""}
                      onChange={e => setEmployees(es => es.map((x, j) => j === i ? { ...x, w2Wages: parseFloat(e.target.value) || 0 } : x))} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">R&D Time %</label>
                    <input type="number" className="input" placeholder="75" min={1} max={100} value={emp.rdTimePct || ""}
                      onChange={e => setEmployees(es => es.map((x, j) => j === i ? { ...x, rdTimePct: parseFloat(e.target.value) || 0 } : x))} />
                  </div>
                  <div className="col-span-1 flex items-center justify-end pb-0.5">
                    <button onClick={() => setEmployees(es => es.filter((_, j) => j !== i))} disabled={employees.length === 1}
                      className="text-xs transition-colors" style={{ color: "#4b4b6b" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setEmployees(es => [...es, { name: "", title: "", w2Wages: 0, rdTimePct: 100 }])}
                className="btn-ghost text-sm">
                <Plus size={14} /> Add employee
              </button>
              <div className="text-sm" style={{ color: "#6b6b8b" }}>
                Qualified wages: <span className="font-semibold text-white">
                  {fmt(employees.reduce((s, e) => s + e.w2Wages * (e.rdTimePct / 100), 0))}
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>
              <button onClick={() => { save(); setStep(2) }} disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Continue"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Supplies ── */}
        {step === 2 && (
          <div className="max-w-2xl">
            <div className="card p-5 mb-4">
              <p className="text-sm" style={{ color: "#8b8b9e" }}>
                List supplies and materials consumed or used in qualified research. Excludes land, depreciable property, or general & administrative costs.
              </p>
            </div>
            <div className="space-y-3 mb-4">
              {supplies.map((s, i) => (
                <div key={i} className="card p-4 grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-8">
                    <label className="label">Description</label>
                    <input className="input" placeholder="Lab reagents, materials, components…" value={s.description}
                      onChange={e => setSupplies(xs => xs.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Amount ($)</label>
                    <input type="number" className="input" placeholder="5000" value={s.amount || ""}
                      onChange={e => setSupplies(xs => xs.map((x, j) => j === i ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} />
                  </div>
                  <div className="col-span-1 flex items-center justify-end pb-0.5">
                    <button onClick={() => setSupplies(xs => xs.filter((_, j) => j !== i))}
                      className="text-xs" style={{ color: "#4b4b6b" }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setSupplies(xs => [...xs, { description: "", amount: 0 }])} className="btn-ghost text-sm">
                <Plus size={14} /> Add supply
              </button>
              <div className="text-sm" style={{ color: "#6b6b8b" }}>
                Total: <span className="font-semibold text-white">{fmt(supplies.reduce((s, x) => s + x.amount, 0))}</span>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>
              <button onClick={() => { save(); setStep(3) }} disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Continue"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Contracts ── */}
        {step === 3 && (
          <div className="max-w-2xl">
            <div className="card p-5 mb-4">
              <p className="text-sm" style={{ color: "#8b8b9e" }}>
                Enter payments to third-party contractors for qualified research. Per IRC § 41(b)(3), only <strong className="text-white">65%</strong> of contract research expenses qualify. We apply this automatically.
              </p>
            </div>
            <div className="space-y-3 mb-4">
              {contracts.map((c, i) => (
                <div key={i} className="card p-4 grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-3">
                    <label className="label">Vendor</label>
                    <input className="input" placeholder="Lab Inc." value={c.vendor}
                      onChange={e => setContracts(xs => xs.map((x, j) => j === i ? { ...x, vendor: e.target.value } : x))} />
                  </div>
                  <div className="col-span-5">
                    <label className="label">Description</label>
                    <input className="input" placeholder="Testing, prototyping…" value={c.description}
                      onChange={e => setContracts(xs => xs.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Amount ($)</label>
                    <input type="number" className="input" placeholder="20000" value={c.amount || ""}
                      onChange={e => setContracts(xs => xs.map((x, j) => j === i ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} />
                  </div>
                  <div className="col-span-1 flex items-center justify-end pb-0.5">
                    <button onClick={() => setContracts(xs => xs.filter((_, j) => j !== i))}
                      className="text-xs" style={{ color: "#4b4b6b" }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setContracts(xs => [...xs, { vendor: "", description: "", amount: 0 }])} className="btn-ghost text-sm">
                <Plus size={14} /> Add contract
              </button>
              <div className="text-sm" style={{ color: "#6b6b8b" }}>
                65% qualified: <span className="font-semibold text-white">{fmt(contracts.reduce((s, c) => s + c.amount * 0.65, 0))}</span>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>
              <button onClick={() => { save(); setStep(4) }} disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Continue"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Calculate ── */}
        {step === 4 && (
          <div className="max-w-2xl">
            <div className="card p-5 mb-6">
              <p className="text-sm" style={{ color: "#8b8b9e" }}>
                Provide gross receipts and prior-year QREs so we can compare Regular Research Credit (RRC) vs. Alternative Simplified Credit (ASC) and pick the best method.
              </p>
            </div>
            <div className="card p-6 space-y-5 mb-6">
              <div>
                <label className="label">Gross receipts for {filing.taxYear} ($)</label>
                <input type="number" className="input" placeholder="5000000" value={grossReceipts || ""}
                  onChange={e => setGrossReceipts(parseFloat(e.target.value) || 0)} />
                <p className="text-xs mt-1" style={{ color: "#4b4b6b" }}>Used to calculate the RRC base amount</p>
              </div>
              <div className="border-t pt-5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <label className="label mb-3">Prior 3 years' QREs (for ASC) — leave 0 if no history</label>
                <div className="grid grid-cols-3 gap-4">
                  {[filing.taxYear - 3, filing.taxYear - 2, filing.taxYear - 1].map((yr, i) => (
                    <div key={yr}>
                      <label className="label">{yr}</label>
                      <input type="number" className="input" placeholder="0" value={priorQRE[i] || ""}
                        onChange={e => setPriorQRE(p => p.map((v, j) => j === i ? parseFloat(e.target.value) || 0 : v))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {filing.creditAmount && filing.totalQRE && (
              <div className="card p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator size={16} style={{ color: "#818cf8" }} />
                  <h3 className="font-semibold text-white text-sm">Calculation result</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs mb-1" style={{ color: "#6b6b8b" }}>Total QRE</div>
                    <div className="text-xl font-bold text-white">{fmt(filing.totalQRE)}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: "#6b6b8b" }}>Best method</div>
                    <div className="text-xl font-bold" style={{ color: "#818cf8" }}>{filing.method?.toUpperCase()}</div>
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <div className="text-xs mb-1" style={{ color: "#34d399" }}>Estimated federal R&D credit</div>
                  <div className="text-3xl font-bold" style={{ color: "#34d399" }}>{fmt(filing.creditAmount)}</div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>
              <button onClick={async () => { await save(); setStep(5) }} disabled={saving} className="btn-primary">
                {saving ? "Calculating…" : "Calculate"} <Calculator size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Summary ── */}
        {step === 5 && filing.creditAmount && (
          <div className="max-w-2xl">
            <div className="rounded-xl p-6 mb-6" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="text-sm mb-1" style={{ color: "#34d399" }}>Estimated federal R&D tax credit (Form 6765)</div>
              <div className="text-4xl font-bold text-white mb-0.5">{fmt(filing.creditAmount)}</div>
              <div className="text-xs" style={{ color: "#34d399" }}>Method: {filing.method?.toUpperCase()}</div>
            </div>

            <div className="card p-5 mb-4">
              <h3 className="font-semibold text-white text-sm mb-4">QRE Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Qualified wages (IRC § 41(b)(2)(A))",      value: filing.employees?.reduce((s, e) => s + e.qualWages, 0) ?? 0 },
                  { label: "Qualified supplies (IRC § 41(b)(2)(C))",   value: filing.supplies?.reduce((s, x) => s + x.amount, 0) ?? 0 },
                  { label: "Contract research 65% (IRC § 41(b)(3))",   value: filing.contracts?.reduce((s, c) => s + c.qualified, 0) ?? 0 },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span className="text-sm" style={{ color: "#8b8b9e" }}>{row.label}</span>
                    <span className="font-semibold text-white">{fmt(row.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-white">Total QRE</span>
                  <span className="font-bold text-white">{fmt(filing.totalQRE ?? 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(4)} className="btn-ghost"><ArrowLeft size={15} /> Back</button>
              <button onClick={complete} disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Complete & view report"} <CheckCircle size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
