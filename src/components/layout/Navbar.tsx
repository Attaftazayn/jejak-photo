"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import Image from "next/image";
import { ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";

interface NavbarProps {
  albumTitle?: string;
}

export default function Navbar({ albumTitle }: NavbarProps) {
  const { items, toast } = useCart();
  const isError = toast && (toast.toLowerCase().includes("fail") || toast.toLowerCase().includes("error"));

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="Jejak Moments – Home" className="flex items-center">
          <Image
            src="/logo/jejak putih 2.svg"
            alt="Jejak Moments"
            width={110}
            height={70}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Active Album Title */}
        {albumTitle && (
          <div className="hidden sm:block text-base font-semibold text-gray-700 max-w-xs truncate">
            {albumTitle}
          </div>
        )}

        {/* Cart Icon */}
        <Link
          href="/cart"
          aria-label={`Cart – ${items.length} photo${items.length !== 1 ? "s" : ""} selected`}
          className="relative flex items-center justify-center p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-[#03412C] focus:ring-offset-2"
        >
          <ShoppingCart size={24} aria-hidden="true" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#03412C] text-[10px] font-bold text-white">
              {items.length}
            </span>
          )}
        </Link>
      </div>

      {/* Global Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-6 py-4 text-white shadow-xl animate-fade-in ${isError ? "bg-red-600" : "bg-[#03412C]"
            }`}
        >
          {isError ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          )}
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}
    </header>
  );
}