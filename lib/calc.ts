/**
 * R&D Tax Credit Calculator — IRC § 41
 * Supports Regular Research Credit (RRC) and Alternative Simplified Credit (ASC)
 */

export interface QRESummary {
  wages:     number
  supplies:  number
  contracts: number
  total:     number
}

export interface RRCResult {
  method:       "rrc"
  baseAmount:   number
  excessQRE:    number
  creditRate:   number
  credit:       number
}

export interface ASCResult {
  method:       "asc"
  avgPriorQRE:  number
  baseAmount:   number
  excessQRE:    number
  creditRate:   number
  credit:       number
}

export type CreditResult = RRCResult | ASCResult

/**
 * Regular Research Credit (Traditional Method)
 * Credit = 20% × (Current QRE − Base Amount)
 * Base Amount = Fixed-base % × avg gross receipts (last 4 yrs), min 50% of QRE
 * Simplified: we use 3% of current QRE as the floor base when no history provided.
 */
export function calcRRC(qre: QRESummary, grossReceipts: number, fixedBasePct = 0.03): RRCResult {
  const baseAmount = Math.max(fixedBasePct * grossReceipts, qre.total * 0.5)
  const excessQRE  = Math.max(qre.total - baseAmount, 0)
  const credit     = excessQRE * 0.20

  return { method: "rrc", baseAmount, excessQRE, creditRate: 0.20, credit }
}

/**
 * Alternative Simplified Credit (ASC) — IRC § 41(c)(5)
 * Credit = 14% × (Current QRE − 50% of avg prior 3yr QRE)
 * If no prior QRE history: credit = 6% × current QRE
 */
export function calcASC(
  qre: QRESummary,
  priorQRE1 = 0,
  priorQRE2 = 0,
  priorQRE3 = 0,
): ASCResult {
  const hasPrior    = priorQRE1 > 0 || priorQRE2 > 0 || priorQRE3 > 0
  const avgPriorQRE = hasPrior ? (priorQRE1 + priorQRE2 + priorQRE3) / 3 : 0
  const baseAmount  = avgPriorQRE * 0.5
  const excessQRE   = Math.max(qre.total - baseAmount, 0)
  const creditRate  = hasPrior ? 0.14 : 0.06
  const credit      = hasPrior ? excessQRE * creditRate : qre.total * creditRate

  return { method: "asc", avgPriorQRE, baseAmount, excessQRE, creditRate, credit }
}

/** Returns both methods and picks the better one */
export function calcBestCredit(
  qre: QRESummary,
  grossReceipts: number,
  priorQRE1 = 0,
  priorQRE2 = 0,
  priorQRE3 = 0,
): { rrc: RRCResult; asc: ASCResult; best: CreditResult } {
  const rrc = calcRRC(qre, grossReceipts)
  const asc = calcASC(qre, priorQRE1, priorQRE2, priorQRE3)
  return { rrc, asc, best: rrc.credit >= asc.credit ? rrc : asc }
}

export function buildQRESummary(
  employees: { qualWages: number }[],
  supplies:  { amount: number }[],
  contracts: { qualified: number }[],
): QRESummary {
  const wages     = employees.reduce((s, e) => s + e.qualWages, 0)
  const suppliesT = supplies.reduce((s, x) => s + x.amount, 0)
  const contractT = contracts.reduce((s, c) => s + c.qualified, 0)
  return { wages, supplies: suppliesT, contracts: contractT, total: wages + suppliesT + contractT }
}

export function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}
