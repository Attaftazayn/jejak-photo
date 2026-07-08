import Link from "next/link";
import Image from "next/image";
import { computeGalleryState } from "@/lib/utils";

type Props = {
    title: string;
    photos: number;
    slug: string;
    coverUrl?: string;
    createdAt?: string;
    galleryDurationDays?: number | null;
};

export default function AlbumCard({
    title,
    photos,
    slug,
    coverUrl,
    createdAt,
    galleryDurationDays,
}: Props) {
    const { isClosed, remainingDays, percentage } = computeGalleryState({
        created_at: createdAt,
        gallery_duration_days: galleryDurationDays ?? (slug && !isNaN(Number(slug)) ? Number(slug) : 30)
    });

    return (
        <Link href={`/gallery/${slug}`}>
            <div className="overflow-hidden rounded-xl border hover:shadow-lg transition cursor-pointer">
                {coverUrl && (
                    <div className="relative aspect-[3/2]">
                        <Image src={coverUrl} alt={title} fill className="object-cover" />
                    </div>
                )}
                <div className="p-4 space-y-2">
                    <h2 className="font-semibold truncate">
                        {title}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {photos} Photos
                    </p>
                    
                    {/* Small Progress Bar */}
                    <div className="space-y-1 pt-1">
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${isClosed ? 100 : percentage}%`,
                                    backgroundColor: isClosed ? "#9ca3af" : percentage > 70 ? "#03412C" : percentage >= 30 ? "#eab308" : "#ef4444"
                                }}
                            />
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400">
                            {isClosed ? "Closed" : `${remainingDays} days left`}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}