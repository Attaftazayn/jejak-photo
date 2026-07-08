import { computeGalleryState } from "@/lib/utils";

interface Props {
  album: {
    id: string;
    title: string;
    description: string | null;
    cover_url: string | null;
    event_date: string | null;
    location: string | null;
    created_at?: string;
    gallery_duration_days?: number | null;
    slug?: string | null;
  };
  photoCount: number;
}

export default function Hero({ album, photoCount }: Props) {
  // Use slug fallback if gallery_duration_days is missing
  const durationFallback = album.gallery_duration_days ?? (album.slug && !isNaN(Number(album.slug)) ? Number(album.slug) : 30);
  const albumWithFallback = { ...album, gallery_duration_days: durationFallback };
  
  const { isClosed, remainingDays, percentage } = computeGalleryState(albumWithFallback);

  // Status-based color mapping for the progress bar
  const getProgressBarColor = () => {
    if (isClosed) return "#9ca3af"; // Gray
    if (percentage > 70) return "#03412C"; // Green (branding color)
    if (percentage >= 30) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm mb-10 px-8 py-12 md:px-12 md:py-16">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#03412C]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#03412C]/3 blur-2xl" />

      <div className="relative grid gap-8 md:grid-cols-3 items-start">
        {/* Left Column: Title, Description, Metadata */}
        <div className="md:col-span-2 space-y-5">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-3">
            {album.event_date && (
              <span className="rounded-full border border-[#03412C]/20 bg-[#03412C]/5 px-4 py-1.5 text-sm font-medium text-[#03412C]">
                {new Date(album.event_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {album.location && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
                {album.location}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
            {album.title}
          </h1>

          {/* Description */}
          {album.description && (
            <p className="max-w-2xl text-lg leading-8 text-gray-500">
              {album.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-8 pt-2">
            <div>
              <p className="text-3xl font-bold text-[#03412C]">{photoCount}</p>
              <p className="mt-1 text-sm text-gray-500">Photos</p>
            </div>
          </div>
        </div>

        {/* Right Column: Gallery Availability Card */}
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-gray-50/50 p-6 shadow-sm self-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
            {isClosed ? "Gallery Closed" : "Gallery Availability"}
          </h2>

          {/* Percentage Indicator */}
          {!isClosed && (
            <div className="mb-2 text-3xl font-extrabold text-gray-900">
              {percentage}%
            </div>
          )}

          {/* Progress Bar (Height 8px) */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{
                width: `${isClosed ? 100 : percentage}%`,
                backgroundColor: getProgressBarColor(),
              }}
            />
          </div>

          {/* Remaining Text */}
          <div className="text-sm font-medium text-gray-600">
            {isClosed ? (
              <p className="text-gray-500 leading-relaxed">
                This gallery is no longer accepting new orders.
              </p>
            ) : (
              <p className="text-[#03412C]">
                <strong>{remainingDays}</strong> day{remainingDays !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}