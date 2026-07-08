import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryToolbar from "@/components/gallery/GalleryToolbar";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export default function AlbumPage() {
    return (
        <>
            <GalleryHero />
            <GalleryToolbar />
            <GalleryGrid />
        </>
    );
}