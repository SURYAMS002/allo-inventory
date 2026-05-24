import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const expired = await prisma.reservation.findMany({
    where: { status: "pending", expiresAt: { lt: new Date() } },
  });

  for (const r of expired) {
    await prisma.reservation.update({
      where: { id: r.id },
      data: { status: "released" },
    });
    await prisma.stock.update({
      where: {
        productId_warehouseId: {
          productId: r.productId,
          warehouseId: r.warehouseId,
        },
      },
      data: { reserved: { decrement: r.quantity } },
    });
  }

  return NextResponse.json({ released: expired.length });
}
