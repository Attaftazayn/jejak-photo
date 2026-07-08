import { Calendar, Camera } from "lucide-react";

export default function GalleryHero() {
    return (
        <section className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-6 py-16">

                <div className="inline-flex items-center gap-2 rounded-full bg-[#03412C]/10 px-4 py-2 text-sm text-[#03412C]">

                    <Camera size={16} />

                    Tennis Photography

                </div>

                <h1 className="mt-6 text-5xl font-bold">

                    Weekend Match

                </h1>

                <p className="mt-4 max-w-2xl text-lg text-gray-500">

                    Every rally, every emotion,
                    professionally captured.

                </p>

                <div className="mt-8 flex gap-8 text-gray-500">

                    <div className="flex items-center gap-2">

                        <Calendar size={18} />

                        27 July 2026

                    </div>

                    <div>

                        524 Photos

                    </div>

                </div>

            </div>
        </section>
    );
}