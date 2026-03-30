import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildQRESummary, calcBestCredit } from "@/lib/calc"
import { notifyFilingComplete } from "@/lib/email"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    include: { employees: true, supplies: true, contracts: true, client: true },
  })
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(filing)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { qualAnswers, employees, supplies, contracts, grossReceipts,
          ascPriorQRE1, ascPriorQRE2, ascPriorQRE3, status } = body

  // Rebuild QREs + recalculate credit
  let creditData = {}
  if (employees || supplies || contracts) {
    const emps = employees ?? []
    const sups = supplies ?? []
    const cons = contracts ?? []

    const qre = buildQRESummary(emps, sups, cons)
    const result = calcBestCredit(
      qre,
      grossReceipts ?? 0,
      ascPriorQRE1 ?? 0,
      ascPriorQRE2 ?? 0,
      ascPriorQRE3 ?? 0,
    )

    creditData = {
      totalWages:     qre.wages,
      totalSupplies:  qre.supplies,
      totalContracts: qre.contracts,
      totalQRE:       qre.total,
      creditAmount:   result.best.credit,
      method:         result.best.method,
      ascPriorQRE1:   ascPriorQRE1 ?? 0,
      ascPriorQRE2:   ascPriorQRE2 ?? 0,
      ascPriorQRE3:   ascPriorQRE3 ?? 0,
    }

    // Replace employees / supplies / contracts
    await prisma.employee.deleteMany({ where: { filingId: params.id } })
    await prisma.supply.deleteMany({ where: { filingId: params.id } })
    await prisma.contract.deleteMany({ where: { filingId: params.id } })

    if (emps.length) await prisma.employee.createMany({
      data: emps.map((e: any) => ({
        ...e,
        filingId: params.id,
        qualWages: e.w2Wages * (e.rdTimePct / 100),
      })),
    })
    if (sups.length) await prisma.supply.createMany({
      data: sups.map((s: any) => ({ ...s, filingId: params.id })),
    })
    if (cons.length) await prisma.contract.createMany({
      data: cons.map((c: any) => ({
        ...c,
        filingId: params.id,
        qualified: c.amount * 0.65,
      })),
    })
  }

  const filing = await prisma.filing.update({
    where: { id: params.id },
    data: {
      ...(qualAnswers !== undefined && { qualAnswers: JSON.stringify(qualAnswers) }),
      ...(status     !== undefined && { status }),
      ...creditData,
    },
    include: { employees: true, supplies: true, contracts: true, client: true },
  })

  if (status === "complete" && filing.creditAmount && filing.method) {
    notifyFilingComplete(
      session.user.name ?? "Unknown",
      session.user.email ?? "",
      filing.client.name,
      filing.taxYear,
      filing.creditAmount,
      filing.method,
    ).catch(() => {})
  }

  return NextResponse.json(filing)
}
