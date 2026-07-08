import { getPhotosByAlbum } from "@/actions/albums";
import GalleryContainer from "./GalleryContainer";

export default async function GalleryGrid({ albumId = "", isClosed = false }: { albumId?: string; isClosed?: boolean }) {
  const photos = await getPhotosByAlbum(albumId);
  return (
    <GalleryContainer photos={photos} isClosed={isClosed} />
  );
}