import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyNewFiling } from "@/lib/email"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { clientId, taxYear } = body
  if (!clientId || !taxYear) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  const filing = await prisma.filing.create({
    data: { clientId, taxYear: parseInt(taxYear), status: "draft" },
  })

  if (client) {
    notifyNewFiling(session.user.name ?? "Unknown", session.user.email ?? "", client.name, parseInt(taxYear)).catch(() => {})
  }

  return NextResponse.json(filing)
}
