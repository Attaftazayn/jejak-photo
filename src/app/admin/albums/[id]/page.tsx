import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Images, Calendar, MapPin } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPhotoCount } from "@/actions/albums";
import AlbumDetailClient from "@/components/admin/AlbumDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: album, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !album) {
    notFound();
  }

  const photoCount = await getPhotoCount(id);

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/admin/albums"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#03412C] transition"
      >
        <ArrowLeft size={18} />
        Back to Albums
      </Link>

      {/* Album Header */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{album.title}</h1>
              {album.is_published && (
                <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                  ACTIVE
                </span>
              )}
            </div>
            {album.description && (
              <p className="text-gray-500 mt-1">{album.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Images size={16} />
                {photoCount} Photos
              </div>
              {album.event_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  {new Date(album.event_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
              {album.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {album.location}
                </div>
              )}
              {album.expires_at && (
                <div className="flex items-center gap-1.5 text-orange-500">
                  Expires:{" "}
                  {new Date(album.expires_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload + Photos Client */}
      <AlbumDetailClient albumId={id} albumTitle={album.title} />
    </div>
  );
}
