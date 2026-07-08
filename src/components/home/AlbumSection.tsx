import Link from "next/link";
import Image from "next/image";

const albums = [
    {
        title: "Weekend Match",
        photos: 520,
        image: "/albums/weekend.jpg",
        slug: "weekend-match",
    },
    {
        title: "Morning Rally",
        photos: 230,
        image: "/albums/morning.jpg",
        slug: "morning-rally",
    },
    {
        title: "Club Tournament",
        photos: 810,
        image: "/albums/tournament.jpg",
        slug: "club-tournament",
    },
    {
        title: "Friendly Match",
        photos: 420,
        image: "/albums/friendly.jpg",
        slug: "friendly-match",
    },
];

export default function AlbumSection() {
    return (
        <section className="bg-[#FAFAFA] py-24">
            <div className="mx-auto max-w-7xl px-6">

                <div className="mb-14 text-center">

                    <p className="font-medium uppercase tracking-[4px] text-[#03412C]">
                        Albums
                    </p>

                    <h2 className="mt-3 text-4xl font-bold text-gray-900">
                        Latest Albums
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-gray-500">
                        Browse every tournament, rally, and unforgettable tennis moment captured by our photographers.
                    </p>

                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

                    {albums.map((album) => (

                        <Link
                            key={album.slug}
                            href={`/albums/${album.slug}`}
                            className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                        >

                            <div className="relative aspect-[3/2] overflow-hidden">

                                <Image
                                    src={album.image}
                                    alt={album.title}
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            </div>

                            <div className="p-6">

                                <h3 className="text-xl font-semibold text-gray-900">
                                    {album.title}
                                </h3>

                                <p className="mt-2 text-gray-500">
                                    {album.photos} Photos
                                </p>

                                <div className="mt-6 flex items-center font-medium text-[#03412C]">

                                    View Album

                                    <span className="ml-2 transition group-hover:translate-x-2">
                                        →
                                    </span>

                                </div>

                            </div>

                        </Link>

                    ))}

                </div>

            </div>
        </section>
    );
}