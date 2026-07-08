import Navbar from "@/components/layout/Navbar";
import { getActiveAlbum } from "@/actions/albums";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const activeAlbum = await getActiveAlbum();
    return (
        <>
            <Navbar albumTitle={activeAlbum?.title} />

            {children}
        </>
    );
}