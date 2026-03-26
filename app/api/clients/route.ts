import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: { filings: { orderBy: { taxYear: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, ein, industry } = await req.json()
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const client = await prisma.client.create({
    data: { name, ein, industry, userId: session.user.id },
  })
  return NextResponse.json(client)
}
