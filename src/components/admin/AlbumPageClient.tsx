"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AlbumCard from "@/components/admin/AlbumCard"
import AlbumForm from "@/components/admin/albums/AlbumForm"
import { PlusIcon } from "lucide-react"
import type { Album } from "@/actions/albums"

interface AlbumItem {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  created_at: string
  is_active: boolean
  expires_at: string | null
  gallery_duration_days?: number | null
}

export default function AlbumPageClient({ albums: initialAlbums }: { albums: AlbumItem[] }) {
  const router = useRouter()
  const [albums, setAlbums] = useState<AlbumItem[]>(initialAlbums)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editAlbum, setEditAlbum] = useState<AlbumItem | null>(null)

  const filtered = albums.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (album: AlbumItem) => {
    setEditAlbum(album)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditAlbum(null)
  }

  const handleSuccess = (result: Album) => {
    if (editAlbum) {
      // Update existing album in local state immediately
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === result.id
            ? {
                ...a,
                title: result.title,
                description: result.description,
                cover_url: result.cover_url,
                expires_at: result.expires_at,
                gallery_duration_days: result.gallery_duration_days,
              }
            : a
        )
      )
    } else {
      // Prepend new album to local state immediately (inactive by default)
      setAlbums((prev) => [
        {
          id: result.id,
          title: result.title,
          description: result.description,
          cover_url: result.cover_url,
          created_at: result.created_at ?? new Date().toISOString(),
          is_active: false,
          expires_at: result.expires_at,
          gallery_duration_days: result.gallery_duration_days,
        },
        ...prev,
      ])
    }
    router.refresh()
  }

  const handleActivated = (activatedId: string) => {
    // Immediately flip all is_active flags in local state
    setAlbums((prev) =>
      prev.map((a) => ({ ...a, is_active: a.id === activatedId }))
    )
    // Refresh RSC to sync server state (home page, etc.)
    router.refresh()
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Albums</h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          aria-label="Create new album"
          className="flex items-center gap-2 rounded-2xl bg-[#03412C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#055639] transition"
        >
          <PlusIcon size={18} />
          Create Album
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="album-search" className="sr-only">Search albums</label>
        <input
          id="album-search"
          type="search"
          placeholder="Search albums…"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 outline-none focus:border-[#03412C] focus:bg-white transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-lg font-medium">
            {search ? `No albums matching "${search}".` : "No albums yet. Create one to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((album) => (
            <AlbumCard
              key={album.id}
              albumId={album.id}
              title={album.title}
              description={album.description}
              image={album.cover_url}
              photos={0}
              isActive={album.is_active}
              createdAt={album.created_at}
              galleryDurationDays={album.gallery_duration_days}
              onEdit={() => handleEdit(album)}
              onActivated={() => handleActivated(album.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AlbumForm
          mode={editAlbum ? 'edit' : 'create'}
          album={editAlbum
            ? {
                id: editAlbum.id,
                title: editAlbum.title,
                description: editAlbum.description,
                cover_url: editAlbum.cover_url,
                expires_at: editAlbum.expires_at,
                gallery_duration_days: editAlbum.gallery_duration_days,
              }
            : null
          }
          onClose={handleClose}
          onSuccess={(result) => {
            handleSuccess(result)
            handleClose()
          }}
        />
      )}
    </section>
  )
}
