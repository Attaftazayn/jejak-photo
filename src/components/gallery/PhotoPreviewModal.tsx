"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ShoppingCart } from "lucide-react";

import { usePreview } from "@/store/preview";
import { useCart } from "@/store/cart";
import WatermarkOverlay from "@/components/ui/WatermarkOverlay";
import { getActiveAlbum } from "@/actions/albums";
import { computeGalleryState } from "@/lib/utils";

export default function PhotoPreviewModal() {

    const {
        photo,
        open,
        closePreview,
    } = usePreview();

    const { items, addItem } = useCart();
    const isInCart = photo ? items.some((item) => item.id === photo.id) : false;
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        if (open) {
            getActiveAlbum()
                .then((album) => {
                    if (album) {
                        const durationFallback = album.gallery_duration_days ?? (album.slug && !isNaN(Number(album.slug)) ? Number(album.slug) : 30);
                        const { isClosed: closed } = computeGalleryState({ ...album, gallery_duration_days: durationFallback });
                        setIsClosed(closed);
                    }
                })
                .catch(() => {});
        }
    }, [open]);

    if (!photo || !open) return null;

    return (

        <div
            onClick={closePreview}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
        >

            <div
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.preventDefault()}
                className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white"
            >

                {/* Close */}

                <button
                    onClick={closePreview}
                    className="absolute right-5 top-5 z-50 rounded-full bg-white p-2 shadow"
                >
                    <X />
                </button>

                <div className="grid lg:grid-cols-2 items-center">

                    {/* LEFT */}

                    <div className="relative bg-black aspect-[3/2] w-full overflow-hidden">
                        <Image
                            src={photo.image}
                            alt={photo.number}
                            fill
                            draggable={false}
                            className="select-none object-contain"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />

                        {/* Watermark */}
                        <WatermarkOverlay />
                    </div>

                    {/* RIGHT */}

                    <div className="flex flex-col justify-center p-12">

                        <p className="text-sm uppercase tracking-[4px] text-[#03412C]">

                            Tennis Photography

                        </p>

                        <h1 className="mt-3 text-4xl font-bold">

                            {photo.number}

                        </h1>

                        <p className="mt-6 text-3xl font-bold text-[#03412C]">

                            Rp {photo.price.toLocaleString("id-ID")}

                        </p>

                        <div className="mt-10 space-y-5">

                            <div className="flex gap-3">

                                ✅

                                <span>Original photo sent after payment</span>

                            </div>

                            <div className="flex gap-3">

                                ✅

                                <span>No watermark on purchased photo</span>

                            </div>

                            <div className="flex gap-3">

                                ✅

                                <span>Delivery via WhatsApp</span>

                            </div>

                            <div className="flex gap-3">

                                ✅

                                <span>High quality JPEG</span>

                            </div>

                        </div>

                        {isClosed ? (
                            <button
                                disabled
                                className="mt-12 flex items-center justify-center gap-3 rounded-2xl bg-gray-300 py-4 text-lg font-semibold text-gray-500 cursor-not-allowed select-none"
                            >
                                Gallery Closed
                            </button>
                        ) : isInCart ? (
                            <button
                                disabled
                                className="mt-12 flex items-center justify-center gap-3 rounded-2xl bg-green-50 border border-green-200 py-4 text-lg font-semibold text-green-700 cursor-default select-none"
                            >
                                ✓ Added
                            </button>
                        ) : (
                            <button
                                onClick={() => addItem(photo)}
                                className="mt-12 flex items-center justify-center gap-3 rounded-2xl bg-[#03412C] py-4 text-lg font-semibold text-white hover:bg-[#055639]"
                            >
                                <ShoppingCart />
                                Add To Cart
                            </button>
                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}