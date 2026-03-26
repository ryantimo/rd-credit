import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { filings: { orderBy: { taxYear: "desc" } } },
  })
  if (!client || client.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(client)
}
