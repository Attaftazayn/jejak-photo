"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/store/cart";
import { usePreview } from "@/store/preview";
import { Photo } from "@/types/photo";
import WatermarkOverlay from "@/components/ui/WatermarkOverlay";

interface Props {
  photo: Photo;
  isClosed?: boolean;
}

export default function PhotoCard({ photo, isClosed }: Props) {
  const { items, addItem } = useCart();
  const openPreview = usePreview((state) => state.openPreview);
  const isInCart = items.some((item) => item.id === photo.id);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#03412C] hover:shadow-md"
    >
      {/* IMAGE (Clickable to zoom) */}
      <div 
        className="relative aspect-[3/2] overflow-hidden cursor-pointer"
        onClick={() => openPreview(photo)}
        title="Click to preview photo"
      >
        <Image
          src={photo.image}
          alt={`Photo ${photo.number}`}
          fill
          draggable={false}
          loading="lazy"
          className="object-cover select-none transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {/* Repeating Watermark */}
        <WatermarkOverlay />
      </div>

      {/* INFO FOOTER */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-500">
            #{photo.number}
          </span>
          <span className="text-base font-extrabold text-[#03412C]">
            Rp {photo.price.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="mt-auto">
          {isClosed ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 border border-gray-200 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed select-none"
            >
              Gallery Closed
            </button>
          ) : isInCart ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 border border-green-200 py-2.5 text-sm font-semibold text-green-700 cursor-default select-none"
            >
              ✓ Added
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addItem(photo);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#03412C] hover:bg-[#055639] py-2.5 text-sm font-semibold text-white transition-colors"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}