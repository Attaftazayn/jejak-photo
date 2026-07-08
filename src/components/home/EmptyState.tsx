import Link from "next/link";
import { Camera } from "lucide-react";

export default function EmptyState() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center text-center px-6">
        <div className="rounded-full bg-gray-50 p-6 text-gray-400 mb-6">
          <Camera size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">No Active Gallery</h1>
        <p className="mt-3 max-w-md text-gray-500 leading-relaxed">
          There's no active album right now. Please check back later.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Refresh
        </Link>
      </div>
    </section>
  );
}
