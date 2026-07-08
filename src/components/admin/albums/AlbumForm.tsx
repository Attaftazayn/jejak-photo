"use client"

import { useState, useRef, ChangeEvent } from "react"
import Image from "next/image"
import { createAlbum, updateAlbum } from "@/actions/albums"
import type { Album } from "@/actions/albums"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ImagePlus, X, AlertCircle } from "lucide-react"

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Compress an image File to WebP using the Canvas API (client-side). */
async function compressToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new window.Image()
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas context unavailable"))
        let { width, height } = img
        const MAX = 1920
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Blob conversion failed")),
          "image/webp",
          0.85,
        )
      }
      img.onerror = () => reject(new Error("Image load failed"))
    }
    reader.onerror = () => reject(new Error("File read failed"))
  })
}

/** Upload a Blob to Supabase Storage (covers bucket) using the browser client. */
async function uploadCoverToStorage(blob: Blob, filename: string): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const path = `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}.webp`

  const { data, error } = await supabase.storage
    .from("covers")
    .upload(path, blob, { contentType: "image/webp", upsert: true })

  if (error) {
    // If bucket not found, try to create it then retry
    if (error.message?.toLowerCase().includes("not found") || (error as any).status === 404) {
      throw new Error("Storage bucket 'covers' not found. Please create it in your Supabase dashboard (public bucket).")
    }
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from("covers").getPublicUrl(data.path)
  return urlData.publicUrl
}

// ─── types ────────────────────────────────────────────────────────────────────

type AlbumData = {
  id?: string
  title: string
  description?: string | null
  location?: string | null
  event_date?: string | null
  expires_at?: string | null
  cover_url?: string | null
  gallery_duration_days?: number | null
  slug?: string | null
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AlbumForm({
  mode = "create",
  album,
  onClose,
  onSuccess,
}: {
  mode?: "create" | "edit"
  album?: AlbumData | null
  onClose: () => void
  onSuccess: (album: Album) => void
}) {
  const [title, setTitle] = useState(album?.title ?? "")
  const [description, setDescription] = useState(album?.description ?? "")
  const [location, setLocation] = useState(album?.location ?? "")
  const [eventDate, setEventDate] = useState(album?.event_date ?? "")
  const [galleryDuration, setGalleryDuration] = useState<number>(() => {
    if (album?.gallery_duration_days !== undefined && album?.gallery_duration_days !== null) {
      return album.gallery_duration_days;
    }
    if (album?.slug && !isNaN(Number(album.slug))) {
      return Number(album.slug);
    }
    return 30;
  })

  // Cover image state
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(album?.cover_url ?? null)
  const [coverAction, setCoverAction] = useState<"keep" | "replace" | "remove">("keep")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<"idle" | "compressing" | "uploading" | "saving">("idle")
  const [error, setError] = useState<string | null>(null)

  // ── cover file selection ────────────────────────────────────────────────────

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverAction("replace")
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
  }

  const handleRemoveCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    setCoverAction("remove")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Album title is required.")
      return
    }

    setIsSubmitting(true)

    try {
      let finalCoverUrl: string | null | undefined = undefined // undefined = "don't touch"

      // 1. Handle cover upload / removal
      if (coverAction === "remove") {
        finalCoverUrl = null
      } else if (coverAction === "replace" && coverFile) {
        // Compress
        setUploadProgress("compressing")
        const webpBlob = await compressToWebP(coverFile)

        // Upload to Supabase Storage
        setUploadProgress("uploading")
        finalCoverUrl = await uploadCoverToStorage(webpBlob, coverFile.name)
      } else if (mode === "create") {
        // No cover selected on create → null
        finalCoverUrl = null
      }
      // If mode === "edit" and coverAction === "keep" → undefined (don't pass to server action)

      // 2. Build FormData for server action
      const formData = new FormData()
      formData.set("title", title.trim())
      formData.set("description", description)
      formData.set("location", location)
      formData.set("event_date", eventDate)
      formData.set("gallery_duration_days", String(galleryDuration))
      if (finalCoverUrl !== undefined) {
        formData.set("cover_url", finalCoverUrl ?? "REMOVE")
      }

      if (mode === "edit" && album?.id) {
        formData.set("id", album.id)
      }

      // 3. Call server action
      setUploadProgress("saving")
      const action = mode === "edit" ? updateAlbum : createAlbum
      const result = await action(formData)

      // 4. Success
      onSuccess(result)
      onClose()
    } catch (err: any) {
      setError(err?.message ?? "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
      setUploadProgress("idle")
    }
  }

  // ── progress label ─────────────────────────────────────────────────────────

  const progressLabel = () => {
    if (!isSubmitting) return mode === "create" ? "Create Album" : "Save Changes"
    switch (uploadProgress) {
      case "compressing": return "Compressing image…"
      case "uploading": return "Uploading cover…"
      case "saving": return "Saving album…"
      default: return "Please wait…"
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose() }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {mode === "create" ? "Create Album" : "Edit Album"}
        </h2>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cover image picker */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            Cover Image <span className="font-normal text-gray-400">(JPG, PNG, WEBP)</span>
          </label>

          {coverPreview ? (
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
              <div className="relative aspect-video w-full">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  unoptimized={coverPreview.startsWith("blob:")}
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow hover:bg-white transition"
                >
                  <ImagePlus size={13} />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1.5 text-xs font-semibold text-red-600 shadow hover:bg-white transition"
                  aria-label="Remove cover image"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-gray-400 transition hover:border-[#03412C] hover:text-[#03412C] hover:bg-gray-50/80"
            >
              <ImagePlus size={28} />
              <span className="text-sm font-medium">Click to add a cover image</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Title */}
        <div className="mb-3">
          <label htmlFor="album-title" className="mb-1 block text-sm font-semibold text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="album-title"
            required
            name="title"
            placeholder="e.g. Weekend Tournament"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#03412C] focus:ring-1 focus:ring-[#03412C] transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label htmlFor="album-description" className="mb-1 block text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            id="album-description"
            name="description"
            placeholder="Short description…"
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#03412C] focus:ring-1 focus:ring-[#03412C] transition resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Location */}
        <div className="mb-3">
          <label htmlFor="album-location" className="mb-1 block text-sm font-semibold text-gray-700">
            Location
          </label>
          <input
            id="album-location"
            name="location"
            placeholder="e.g. Senayan Tennis Club"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#03412C] focus:ring-1 focus:ring-[#03412C] transition"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Event date + Duration */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="album-event-date" className="mb-1 block text-sm font-semibold text-gray-700">
              Event Date
            </label>
            <input
              id="album-event-date"
              type="date"
              name="event_date"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#03412C] focus:ring-1 focus:ring-[#03412C] transition"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="album-duration" className="mb-1 block text-sm font-semibold text-gray-700">
              Gallery Duration (days)
            </label>
            <input
              id="album-duration"
              type="number"
              min="1"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#03412C] focus:ring-1 focus:ring-[#03412C] transition"
              value={galleryDuration}
              onChange={(e) => setGalleryDuration(parseInt(e.target.value, 10) || 1)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-[#03412C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#055639] transition disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {progressLabel()}
          </button>
        </div>
      </form>
    </div>
  )
}
