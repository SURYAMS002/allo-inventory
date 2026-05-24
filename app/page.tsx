/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  async function reserve(productId: string, warehouseId: string) {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    });
    if (res.status === 409) {
      alert("❌ Sorry! Not enough stock.");
      return;
    }
    const data = await res.json();
    router.push(`/checkout/${data.id}`);
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading products...</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">🛒 Allo Store</h1>
        <p className="text-gray-500 mb-8">
          Reserve your items before they run out!
        </p>

        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {product.name}
            </h2>
            <p className="text-gray-400 text-sm mb-4">{product.description}</p>

            {product.stocks.map((s: any) => {
              const available = s.total - s.reserved;
              return (
                <div
                  key={s.id}
                  className="flex justify-between items-center py-3 border-t border-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {s.warehouse.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${available === 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      {available === 0
                        ? "Out of stock"
                        : `${available} units available`}
                    </p>
                  </div>
                  <button
                    onClick={() => reserve(product.id, s.warehouseId)}
                    disabled={available === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Reserve
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
