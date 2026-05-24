import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (reservation.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }
  if (new Date() > reservation.expiresAt) {
    return NextResponse.json({ error: "Reservation expired" }, { status: 410 });
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "confirmed" },
  });

  await prisma.stock.update({
    where: {
      productId_warehouseId: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
      },
    },
    data: {
      total: { decrement: reservation.quantity },
      reserved: { decrement: reservation.quantity },
    },
  });

  return NextResponse.json({ success: true });
}
