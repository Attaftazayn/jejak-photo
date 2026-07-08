"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2, Eye, CheckCircle, ImageOff, Loader2 } from "lucide-react";
import { deleteAlbum, setActiveAlbum } from "@/actions/albums";
import { computeGalleryState } from "@/lib/utils";

interface Props {
    albumId: string;
    title: string;
    description?: string | null;
    image?: string | null;
    photos: number;
    isActive?: boolean;
    createdAt?: string;
    galleryDurationDays?: number | null;
    onEdit?: () => void;
    onActivated?: () => void; // callback so parent can update local state
}

export default function AlbumCard({
    albumId,
    title,
    description,
    image,
    photos,
    isActive = false,
    createdAt,
    galleryDurationDays,
    onEdit,
    onActivated,
}: Props) {
    const [activating, setActivating] = useState(false);

    const handleSetActive = async () => {
        if (isActive || activating) return;
        setActivating(true);
        try {
            await setActiveAlbum(albumId);
            onActivated?.();
        } finally {
            setActivating(false);
        }
    };

    // Compute progress
    const { isClosed, remainingDays, percentage, durationDays } = computeGalleryState({
        created_at: createdAt,
        gallery_duration_days: galleryDurationDays
    });

    return (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl relative flex flex-col">

            {isActive && (
                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white z-10">
                    <CheckCircle size={12} />
                    ACTIVE
                </span>
            )}

            <div className="relative h-52 flex-shrink-0 bg-gray-100">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
                        <ImageOff size={36} />
                        <span className="text-xs font-medium">No cover image</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 p-6">
                <h2 className="text-xl font-bold truncate">{title}</h2>

                {description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
                )}

                {/* Info & Photos count */}
                <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                    <span>{photos} Photos</span>
                </div>

                {/* Gallery Availability Card */}
                <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Gallery Availability</span>
                        {!isClosed && <span>{percentage}%</span>}
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${isClosed ? 100 : percentage}%`,
                                backgroundColor: isClosed ? "#9ca3af" : percentage > 70 ? "#03412C" : percentage >= 30 ? "#eab308" : "#ef4444"
                            }}
                        />
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                        {isClosed ? (
                            <span className="text-red-500">Gallery Closed</span>
                        ) : (
                            <span>{remainingDays} / {durationDays} days remaining</span>
                        )}
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                        href={`/admin/albums/${albumId}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm hover:bg-gray-50 transition"
                    >
                        <Eye size={16} />
                        Open
                    </Link>

                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#03412C] py-2.5 text-sm text-white hover:bg-[#055639] transition"
                    >
                        <Pencil size={16} />
                        Edit
                    </button>

                    <form 
                        action={deleteAlbum}
                        onSubmit={(e) => {
                            if (!window.confirm("Apakah Anda yakin ingin menghapus album ini beserta seluruh foto di dalamnya? Tindakan ini tidak dapat dibatalkan.")) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <input type="hidden" name="id" value={albumId} />
                        <button
                            type="submit"
                            className="flex items-center justify-center rounded-xl border border-red-200 p-2.5 text-red-600 hover:bg-red-50 transition"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </form>

                    {/* Set Active / Active indicator */}
                    {isActive ? (
                        <span className="flex items-center justify-center gap-1.5 rounded-xl bg-green-100 px-3 py-2.5 text-sm font-semibold text-green-700 cursor-default select-none">
                            <CheckCircle size={15} />
                            Active
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSetActive}
                            disabled={activating}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                            title="Set as active album"
                        >
                            {activating ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : null}
                            {activating ? "Activating…" : "Set Active"}
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}