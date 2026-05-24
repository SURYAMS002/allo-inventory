import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, warehouseId, quantity } = body;

  const lockKey = `lock:${productId}:${warehouseId}`;
  const lock = await redis.set(lockKey, "1", { nx: true, ex: 10 });

  if (!lock) {
    return NextResponse.json({ error: "Try again" }, { status: 429 });
  }

  try {
    const stock = await prisma.stock.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });

    if (!stock || stock.total - stock.reserved < quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 409 });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const reservation = await prisma.reservation.create({
      data: { productId, warehouseId, quantity, expiresAt },
    });

    await prisma.stock.update({
      where: { productId_warehouseId: { productId, warehouseId } },
      data: { reserved: { increment: quantity } },
    });

    return NextResponse.json(reservation, { status: 201 });
  } finally {
    await redis.del(lockKey);
  }
}
