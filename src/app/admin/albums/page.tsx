import AlbumPageClient from "@/components/admin/AlbumPageClient"
import { getActiveAlbumList } from "@/actions/albums"

export default async function AlbumsPage() {
  const albums = await getActiveAlbumList()

  const formattedAlbums = albums.map((album) => ({
    id: album.id,
    title: album.title,
    description: album.description,
    cover_url: album.cover_url,
    created_at: album.created_at || "",
    is_active: album.is_published,
    expires_at: album.expires_at,
    gallery_duration_days: album.gallery_duration_days ?? (album.slug && !isNaN(Number(album.slug)) ? Number(album.slug) : 30),
  }))

  return <AlbumPageClient albums={formattedAlbums} />
}
