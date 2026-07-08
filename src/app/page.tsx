import Navbar from "@/components/layout/Navbar";
import { getActiveAlbum, getPhotoCount } from "@/actions/albums";
import { computeGalleryState } from "@/lib/utils";
import Hero from "@/components/home/Hero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import EmptyState from "@/components/home/EmptyState";
import { Suspense } from "react";

export default async function Home() {
  const album = await getActiveAlbum();
  if (!album) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-8 py-12">
          <EmptyState />
        </main>
      </>
    );
  }

  const photoCount = await getPhotoCount(album.id);
  const durationFallback = album.gallery_duration_days ?? (album.slug && !isNaN(Number(album.slug)) ? Number(album.slug) : 30);
  const albumWithFallback = { ...album, gallery_duration_days: durationFallback };
  const { isClosed } = computeGalleryState(albumWithFallback);

  return (
    <>
      <Navbar albumTitle={album.title} />
      <main className="mx-auto max-w-7xl px-8 py-12">
        <Hero album={album} photoCount={photoCount} />
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        }>
          <GalleryGrid albumId={album.id} isClosed={isClosed} />
        </Suspense>
      </main>
    </>
  );
}