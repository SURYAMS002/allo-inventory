import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const mumbai = await prisma.warehouse.create({
    data: { name: "Mumbai Hub", city: "Mumbai" },
  });
  const delhi = await prisma.warehouse.create({
    data: { name: "Delhi Hub", city: "Delhi" },
  });

  const iphone = await prisma.product.create({
    data: { name: "iPhone 15", description: "128GB Black" },
  });
  const shoes = await prisma.product.create({
    data: { name: "Nike Air Max", description: "Size 10" },
  });
  const watch = await prisma.product.create({
    data: { name: "Samsung Watch", description: "Galaxy Watch 6" },
  });

  await prisma.stock.createMany({
    data: [
      { productId: iphone.id, warehouseId: mumbai.id, total: 5 },
      { productId: iphone.id, warehouseId: delhi.id, total: 2 },
      { productId: shoes.id, warehouseId: mumbai.id, total: 10 },
      { productId: shoes.id, warehouseId: delhi.id, total: 3 },
      { productId: watch.id, warehouseId: mumbai.id, total: 1 },
      { productId: watch.id, warehouseId: delhi.id, total: 4 },
    ],
  });

  console.log("✅ Seed data added!");
}

main();
