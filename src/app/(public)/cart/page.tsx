"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { createWhatsappMessage } from "@/utils/whatsapp";
import { getActiveAlbum } from "@/actions/albums";
import { Trash2, ShoppingCart as CartIcon, ArrowLeft } from "lucide-react";
import WatermarkOverlay from "@/components/ui/WatermarkOverlay";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [albumTitle, setAlbumTitle] = useState("Active Album");

  useEffect(() => {
    getActiveAlbum()
      .then((album) => {
        if (album?.title) setAlbumTitle(album.title);
      })
      .catch(() => {
        // silently fall back to default album title
      });
  }, []);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-bold">Cart</h1>
          <p className="text-gray-500 mt-1">Review the photos you want to request.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            aria-label="Clear all items from cart"
            className="flex items-center gap-2 rounded-2xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        )}
      </div>

      {/* Cart Content */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-20 px-6 text-center shadow-sm">
          <div className="rounded-full bg-gray-50 p-6 text-gray-400 mb-5">
            <CartIcon size={48} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Your cart is empty.</h2>
          <p className="mt-2 text-gray-500 max-w-sm">
            You haven't selected any photos yet. Browse the gallery and add your favorites.
          </p>
          <Link
            href="/"
            className="mt-8 flex items-center gap-2 rounded-2xl bg-[#03412C] px-8 py-4 font-semibold text-white hover:bg-[#055639] transition shadow-md focus:outline-none focus:ring-2 focus:ring-[#03412C] focus:ring-offset-2"
          >
            <ArrowLeft size={18} />
            Browse Photos
          </Link>
        </div>
      ) : (
        /* Cart List and Summary */
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Item list */}
          <div className="lg:col-span-2 space-y-4" role="list" aria-label="Cart items">
            {items.map((item) => (
              <div
                key={item.id}
                role="listitem"
                className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-[3/2] w-24 overflow-hidden rounded-2xl bg-gray-50 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={`Photo ${item.number}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <WatermarkOverlay />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 truncate">#{item.number}</h3>
                  <p className="text-sm font-semibold text-green-700 mt-1">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove photo ${item.number} from cart`}
                  className="rounded-full p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm h-fit space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">
              Summary
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Total Photos</span>
                <span className="font-semibold text-gray-800">{items.length}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4 text-base">
                <span className="font-semibold text-gray-800">Estimated Total</span>
                <span className="font-bold text-[#03412C] text-lg">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <a
              href={createWhatsappMessage(items, albumTitle)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Checkout via WhatsApp"
              className="block w-full rounded-2xl bg-[#03412C] py-4 text-center font-bold text-white shadow-md hover:bg-[#055639] transition focus:outline-none focus:ring-2 focus:ring-[#03412C] focus:ring-offset-2"
            >
              Checkout via WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  );
}