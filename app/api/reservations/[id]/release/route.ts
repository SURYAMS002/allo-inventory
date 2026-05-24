import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation || reservation.status !== "pending") {
    return NextResponse.json(
      { error: "Not found or already processed" },
      { status: 400 },
    );
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "released" },
  });

  await prisma.stock.update({
    where: {
      productId_warehouseId: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
      },
    },
    data: { reserved: { decrement: reservation.quantity } },
  });

  return NextResponse.json({ success: true });
}
