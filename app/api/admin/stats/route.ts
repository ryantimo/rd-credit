import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "timonian.98@gmail.com"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [users, clients, filings] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, firm: true, createdAt: true, _count: { select: { clients: true } } },
    }),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        filings: { orderBy: { taxYear: "desc" }, select: { taxYear: true, status: true, creditAmount: true, method: true } },
      },
    }),
    prisma.filing.findMany({
      orderBy: { updatedAt: "desc" },
      include: { client: { include: { user: { select: { name: true, email: true } } } } },
    }),
  ])

  const totalCredit = filings.reduce((s, f) => s + (f.creditAmount ?? 0), 0)
  const complete    = filings.filter(f => f.status === "complete").length

  return NextResponse.json({ users, clients, filings, totalCredit, complete })
}
