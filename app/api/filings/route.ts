import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildQRESummary, calcBestCredit } from "@/lib/calc"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { clientId, taxYear } = body
  if (!clientId || !taxYear) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const filing = await prisma.filing.create({
    data: { clientId, taxYear: parseInt(taxYear), status: "draft" },
  })
  return NextResponse.json(filing)
}
