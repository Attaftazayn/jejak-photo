import Image from "next/image";

const photos = [
    "/gallery/1.jpg",
    "/gallery/2.jpg",
    "/gallery/3.jpg",
    "/gallery/4.jpg",
    "/gallery/5.jpg",
    "/gallery/6.jpg",
];

export default function FeaturedGallery() {
    return (
        <section className="bg-white py-28">
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}

                <div className="mb-16 text-center">

                    <p className="font-medium uppercase tracking-[4px] text-[#03412C]">
                        Gallery
                    </p>

                    <h2 className="mt-3 text-4xl font-bold text-gray-900">
                        Featured Moments
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-500">
                        A glimpse of unforgettable rallies, celebrations,
                        and emotions captured during every match.
                    </p>

                </div>

                {/* Masonry */}

                <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">

                    {photos.map((photo, index) => (

                        <div
                            key={index}
                            className="group relative mb-6 overflow-hidden rounded-3xl"
                        >
                            <div className="relative aspect-[3/2] overflow-hidden">
                                <Image
                                    src={photo}
                                    alt="Gallery"
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />

                                {/* Overlay */}

                                <div className="absolute inset-0 flex items-end bg-black/0 transition duration-300 group-hover:bg-black/40">

                                    <div className="translate-y-8 p-6 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">

                                        <h3 className="text-xl font-semibold text-white">
                                            Weekend Match
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-200">
                                            IMG_{1000 + index}
                                        </p>

                                    </div>

                                </div>
                            </div>

                        </div>

                    ))}

                </div>

            </div>
        </section>
    );
}