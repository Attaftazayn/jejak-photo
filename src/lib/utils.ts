import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeGalleryState(album: { created_at?: string; gallery_duration_days?: number | null }) {
  const durationDays = album.gallery_duration_days ?? 30;
  const createdTime = album.created_at ? new Date(album.created_at).getTime() : Date.now();
  const totalMs = durationDays * 24 * 60 * 60 * 1000;
  const elapsedMs = Date.now() - createdTime;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  const percentage = Math.max(0, Math.min(100, Math.round((remainingMs / totalMs) * 100)));
  const isClosed = remainingMs <= 0;
  
  return {
    isClosed,
    remainingMs,
    remainingDays,
    percentage,
    durationDays
  };
}
