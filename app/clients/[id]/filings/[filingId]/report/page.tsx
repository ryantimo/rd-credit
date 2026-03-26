"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import AppShell from "@/components/AppShell"
import Link from "next/link"
import { ArrowLeft, Download, CheckCircle } from "lucide-react"
import { fmt } from "@/lib/calc"

interface FilingData {
  id: string; taxYear: number; status: string; method: string | null
  totalWages: number | null; totalSupplies: number | null; totalContracts: number | null
  totalQRE: number | null; creditAmount: number | null
  ascPriorQRE1: number | null; ascPriorQRE2: number | null; ascPriorQRE3: number | null
  employees: { id: string; name: string; title: string | null; w2Wages: number; rdTimePct: number; qualWages: number }[]
  supplies:  { id: string; description: string; amount: number }[]
  contracts: { id: string; vendor: string; description: string; amount: number; qualified: number }[]
  client: { name: string; ein: string | null; id: string }
  qualAnswers: string | null
}

export default function ReportPage() {
  const { id: clientId, filingId } = useParams() as { id: string; filingId: string }
  const [filing, setFiling] = useState<FilingData | null>(null)

  useEffect(() => {
    fetch(`/api/filings/${filingId}`).then(r => r.json()).then(setFiling)
  }, [filingId])

  if (!filing) return (
    <AppShell>
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm" style={{ color: "#4b4b6b" }}>Loading…</div>
      </div>
    </AppShell>
  )

  const isASC = filing.method === "asc"
  const creditRate = isASC ? 0.14 : 0.20
  const avgPrior = isASC ? ((filing.ascPriorQRE1 ?? 0) + (filing.ascPriorQRE2 ?? 0) + (filing.ascPriorQRE3 ?? 0)) / 3 : 0
  const baseAmount = isASC ? avgPrior * 0.5 : 0
  const excessQRE  = Math.max((filing.totalQRE ?? 0) - baseAmount, 0)

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/clients/${clientId}/filings/${filingId}`} className="flex items-center gap-2 text-sm" style={{ color: "#6b6b8b" }}>
            <ArrowLeft size={15} /> Back to study
          </Link>
          <button className="btn-ghost text-sm" onClick={() => window.print()}>
            <Download size={14} /> Export / Print
          </button>
        </div>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} style={{ color: "#34d399" }} />
                <span className="text-xs font-medium" style={{ color: "#34d399" }}>Study complete</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{filing.client.name}</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6b8b" }}>
                Tax Year {filing.taxYear} · R&D Tax Credit Study
                {filing.client.ein && ` · EIN ${filing.client.ein}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs mb-1" style={{ color: "#6b6b8b" }}>IRC § 41 Credit</div>
              <div className="text-4xl font-bold" style={{ color: "#34d399" }}>{fmt(filing.creditAmount ?? 0)}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: "#818cf8" }}>Method: {filing.method?.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Form 6765 summary */}
        <div className="card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(99,102,241,0.06)" }}>
            <h2 className="font-semibold text-white text-sm">Form 6765 — Credit for Increasing Research Activities</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b6b8b" }}>
              {isASC ? "Section C — Alternative Simplified Credit" : "Section A — Regular Research Credit"}
            </p>
          </div>
          <div className="p-6 space-y-3">
            {isASC ? (
              <>
                <Row n="Line 27" label="Average annual QRE for prior 3 years" value={fmt(avgPrior)} />
                <Row n="Line 28" label="50% of line 27" value={fmt(baseAmount)} />
                <Row n="Line 29" label="Current year QRE" value={fmt(filing.totalQRE ?? 0)} />
                <Row n="Line 30" label="Excess (line 29 − line 28)" value={fmt(excessQRE)} bold />
                <Row n="Line 31" label="Credit (line 30 × 14%)" value={fmt(filing.creditAmount ?? 0)} bold highlight />
              </>
            ) : (
              <>
                <Row n="Line 1"  label="Wages for qualified services (IRC § 41(b)(2)(A))" value={fmt(filing.totalWages ?? 0)} />
                <Row n="Line 2"  label="Cost of supplies (IRC § 41(b)(2)(C))" value={fmt(filing.totalSupplies ?? 0)} />
                <Row n="Line 3"  label="65% of contract research (IRC § 41(b)(3))" value={fmt(filing.totalContracts ?? 0)} />
                <Row n="Line 5"  label="Total current year QREs (add lines 1–3)" value={fmt(filing.totalQRE ?? 0)} bold />
                <Row n="Line 17" label="Excess QRE over base amount" value={fmt(excessQRE)} bold />
                <Row n="Line 18" label="Credit (line 17 × 20%)" value={fmt(filing.creditAmount ?? 0)} bold highlight />
              </>
            )}
          </div>
        </div>

        {/* QRE Detail — Employees */}
        {filing.employees.length > 0 && (
          <div className="card overflow-hidden mb-6">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h3 className="font-semibold text-white text-sm">Qualified Research Wages</h3>
              <p className="text-xs mt-0.5" style={{ color: "#6b6b8b" }}>IRC § 41(b)(2)(A) — W-2 wages × R&D time allocation %</p>
            </div>
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Title</th><th>W-2 Wages</th><th>R&D %</th><th>Qualified Wages</th></tr></thead>
              <tbody>
                {filing.employees.map(e => (
                  <tr key={e.id}>
                    <td className="font-medium text-white">{e.name}</td>
                    <td style={{ color: "#8b8b9e" }}>{e.title ?? "—"}</td>
                    <td style={{ color: "#8b8b9e" }}>{fmt(e.w2Wages)}</td>
                    <td style={{ color: "#8b8b9e" }}>{e.rdTimePct}%</td>
                    <td className="font-semibold text-white">{fmt(e.qualWages)}</td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <td colSpan={4} className="font-semibold text-white text-right">Total qualified wages</td>
                  <td className="font-bold" style={{ color: "#818cf8" }}>{fmt(filing.totalWages ?? 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Supplies */}
        {filing.supplies.length > 0 && (
          <div className="card overflow-hidden mb-6">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h3 className="font-semibold text-white text-sm">Qualified Supply Expenses</h3>
              <p className="text-xs mt-0.5" style={{ color: "#6b6b8b" }}>IRC § 41(b)(2)(C)</p>
            </div>
            <table className="data-table">
              <thead><tr><th>Description</th><th>Amount</th></tr></thead>
              <tbody>
                {filing.supplies.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: "#8b8b9e" }}>{s.description}</td>
                    <td className="font-semibold text-white">{fmt(s.amount)}</td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <td className="font-semibold text-white text-right">Total</td>
                  <td className="font-bold" style={{ color: "#818cf8" }}>{fmt(filing.totalSupplies ?? 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Contracts */}
        {filing.contracts.length > 0 && (
          <div className="card overflow-hidden mb-6">
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h3 className="font-semibold text-white text-sm">Contract Research Expenses</h3>
              <p className="text-xs mt-0.5" style={{ color: "#6b6b8b" }}>IRC § 41(b)(3) — 65% qualified</p>
            </div>
            <table className="data-table">
              <thead><tr><th>Vendor</th><th>Description</th><th>Total Paid</th><th>65% Qualified</th></tr></thead>
              <tbody>
                {filing.contracts.map(c => (
                  <tr key={c.id}>
                    <td className="font-medium text-white">{c.vendor}</td>
                    <td style={{ color: "#8b8b9e" }}>{c.description}</td>
                    <td style={{ color: "#8b8b9e" }}>{fmt(c.amount)}</td>
                    <td className="font-semibold text-white">{fmt(c.qualified)}</td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <td colSpan={3} className="font-semibold text-white text-right">Total qualified (65%)</td>
                  <td className="font-bold" style={{ color: "#818cf8" }}>{fmt(filing.totalContracts ?? 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <div className="card p-5">
          <p className="text-xs" style={{ color: "#4b4b6b" }}>
            This study was prepared using CreditIQ. Amounts are estimates based on data entered and should be reviewed
            by a qualified CPA before filing. The federal R&D tax credit is reported on <strong>Form 6765</strong> and
            flows to <strong>Form 3800</strong> (General Business Credit). State credits are calculated separately.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

function Row({ n, label, value, bold, highlight }: {
  n: string; label: string; value: string; bold?: boolean; highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono w-14 flex-shrink-0" style={{ color: "#4b4b6b" }}>{n}</span>
        <span className={`text-sm ${bold ? "font-semibold text-white" : ""}`}
          style={!bold ? { color: "#8b8b9e" } : undefined}>{label}</span>
      </div>
      <span className={`font-${bold ? "bold" : "medium"} text-sm`}
        style={{ color: highlight ? "#34d399" : bold ? "white" : "#8b8b9e" }}>{value}</span>
    </div>
  )
}
