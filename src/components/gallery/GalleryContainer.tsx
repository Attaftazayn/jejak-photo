"use client";

import { useState } from "react";
import { Photo } from "@/types/photo";
import PhotoCard from "./PhotoCard";
import { Search } from "lucide-react";

interface GalleryContainerProps {
  photos: Photo[];
  isClosed: boolean;
}

export default function GalleryContainer({ photos, isClosed }: GalleryContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhotos = photos.filter((photo) =>
    photo.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="sticky top-20 z-30 border-b border-gray-100 bg-white/90 py-4 backdrop-blur-md">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <label htmlFor="photo-search" className="sr-only">Search by photo number</label>
          <input
            id="photo-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by photo number..."
            aria-label="Search by photo number"
            className="w-full rounded-2xl border border-gray-200 py-3.5 pl-11 pr-4 outline-none transition focus:border-[#03412C] focus:bg-white bg-gray-50/50"
          />
        </div>
      </div>

      {/* Grid or empty state */}
      {filteredPhotos.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 py-20 text-center bg-white shadow-sm" role="status">
          <p className="text-gray-400 text-lg font-medium">No photos found.</p>
          {searchQuery ? (
            <p className="text-gray-500 text-sm mt-1">
              No results for <strong>&quot;{searchQuery}&quot;</strong>. Try a different number.
            </p>
          ) : (
            <p className="text-gray-500 text-sm mt-1">This album has no photos yet.</p>
          )}
        </div>
      ) : (
        <section
          className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 md:gap-6"
          aria-label={`${filteredPhotos.length} photos`}
        >
          {filteredPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} isClosed={isClosed} />
          ))}
        </section>
      )}
    </div>
  );
}
