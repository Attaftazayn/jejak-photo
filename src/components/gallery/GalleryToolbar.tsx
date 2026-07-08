import { Search } from "lucide-react";

export default function GalleryToolbar() {
    return (
        <section className="sticky top-20 z-30 border-b bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">

                <div className="relative w-full max-w-md">

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        placeholder="Search photo number..."
                        className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition focus:border-[#03412C]"
                    />

                </div>

                <div className="flex gap-3">

                    <button className="rounded-full bg-[#03412C] px-5 py-2 text-white">
                        All
                    </button>

                    <button className="rounded-full border px-5 py-2">
                        Singles
                    </button>

                    <button className="rounded-full border px-5 py-2">
                        Doubles
                    </button>

                    <button className="rounded-full border px-5 py-2">
                        Tournament
                    </button>

                </div>

            </div>
        </section>
    );
}