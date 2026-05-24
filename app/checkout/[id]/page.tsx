/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Checkout({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [reservation, setReservation] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "confirmed" | "cancelled" | "expired"
  >("idle");
  const [resolvedId, setResolvedId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setResolvedId(p.id));
  }, [params]);

  useEffect(() => {
    if (!resolvedId) return;
    fetch(`/api/reservations/${resolvedId}`)
      .then((r) => r.json())
      .then((data) => {
        setReservation(data);
        const secs = Math.floor(
          (new Date(data.expiresAt).getTime() - Date.now()) / 1000,
        );
        setSecondsLeft(Math.max(0, secs));
      });
  }, [resolvedId]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setStatus("expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  async function confirm() {
    const res = await fetch(`/api/reservations/${resolvedId}/confirm`, {
      method: "POST",
    });
    if (res.status === 410) {
      alert("⏰ Reservation expired!");
      return;
    }
    setStatus("confirmed");
  }

  async function cancel() {
    await fetch(`/api/reservations/${resolvedId}/release`, { method: "POST" });
    setStatus("cancelled");
  }

  if (!reservation)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isExpired = status === "expired" || secondsLeft === 0;

  if (status === "confirmed")
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-green-700">
            Purchase Confirmed!
          </h2>
          <p className="text-gray-500 mt-2">
            Your order has been placed successfully.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Store
          </button>
        </div>
      </div>
    );

  if (status === "cancelled")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4">👋</p>
          <h2 className="text-2xl font-bold text-gray-700">
            Reservation Cancelled
          </h2>
          <p className="text-gray-500 mt-2">
            Your item is back in stock for others.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Store
          </button>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🧾 Checkout</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
          <p className="text-sm text-gray-500">Product</p>
          <p className="text-lg font-semibold text-gray-800">
            {reservation.product?.name}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {reservation.product?.description}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Warehouse</p>
            <p className="font-medium text-gray-700">
              {reservation.warehouse?.name}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="font-medium text-gray-700">
              {reservation.quantity} unit
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl p-5 mb-5 text-center ${isExpired ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"}`}
        >
          <p className="text-sm text-gray-500 mb-1">Time remaining</p>
          <p
            className={`text-4xl font-mono font-bold ${isExpired ? "text-red-500" : secondsLeft < 60 ? "text-orange-500" : "text-gray-800"}`}
          >
            {isExpired
              ? "EXPIRED"
              : `${mins}:${secs.toString().padStart(2, "0")}`}
          </p>
          {isExpired && (
            <p className="text-red-500 text-sm mt-2">
              This reservation has expired.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={confirm}
            disabled={isExpired}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ✅ Confirm Purchase
          </button>
          <button
            onClick={cancel}
            disabled={isExpired}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl font-semibold disabled:opacity-40 transition"
          >
            ✗ Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
