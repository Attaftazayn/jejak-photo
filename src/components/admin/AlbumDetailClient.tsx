"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  getPhotosByAlbumAction,
  deletePhotoAction,
  updatePhotoPriceAction,
  updatePhotoNumberAction,
  uploadPhotoAction,
} from "@/actions/photos";
import {
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Upload,
} from "lucide-react";

interface Photo {
  id: string;
  album_id: string;
  filename: string;
  photo_number: string;
  preview_url: string;
  price: number;
  status: string;
}

interface UploadStatus {
  name: string;
  status: "idle" | "compressing" | "uploading" | "success" | "error";
  errorMsg?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function AlbumDetailClient({
  albumId,
  albumTitle,
}: {
  albumId: string;
  albumTitle: string;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Upload state
  const [files, setFiles] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPhotosByAlbumAction(albumId);
      setPhotos(data as Photo[]);
    } catch {
      showToast("Failed to load photos.", "error");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  /* ── Upload ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      setStatuses(selected.map((f) => ({ name: f.name, status: "idle" })));
    }
  };

  const compressToWebP = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context is null"));
          let { width, height } = img;
          const max = 1920;
          if (width > max || height > max) {
            if (width > height) { height = Math.round(height * max / width); width = max; }
            else { width = Math.round(width * max / height); height = max; }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Blob conversion failed"));
            resolve(blob);
          }, "image/webp", 0.8);
        };
        img.onerror = () => reject(new Error("Image load failed"));
      };
      reader.onerror = () => reject(new Error("File read failed"));
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) { showToast("Please choose files to upload", "error"); return; }
    setIsUploading(true);
    let successCount = 0, failureCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatuses((p) => { const n = [...p]; n[i] = { ...n[i], status: "compressing" }; return n; });
      try {
        const webpBlob = await compressToWebP(file);
        setStatuses((p) => { const n = [...p]; n[i] = { ...n[i], status: "uploading" }; return n; });
        const originalName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const webpFile = new File([webpBlob], `${originalName}.webp`, { type: "image/webp" });
        const formData = new FormData();
        formData.append("album_id", albumId);
        formData.append("file", webpFile);
        formData.append("photo_number", originalName);
        formData.append("price", "15000");
        await uploadPhotoAction(formData);
        setStatuses((p) => { const n = [...p]; n[i] = { ...n[i], status: "success" }; return n; });
        successCount++;
      } catch (err: any) {
        setStatuses((p) => { const n = [...p]; n[i] = { ...n[i], status: "error", errorMsg: err?.message }; return n; });
        failureCount++;
      }
    }
    setIsUploading(false);
    if (successCount > 0) {
      showToast(`Uploaded ${successCount} photos`, "success");
      loadPhotos();
    }
    if (failureCount > 0) showToast(`Failed: ${failureCount} photos`, "error");
  };

  /* ── Photos ── */
  const confirmDelete = async (photoId: string) => {
    setPendingDeleteId(null);
    try {
      await deletePhotoAction(photoId);
      setPhotos((p) => p.filter((x) => x.id !== photoId));
      showToast("Photo deleted.", "success");
    } catch {
      showToast("Failed to delete photo.", "error");
    }
  };

  const handleUpdatePrice = async (photoId: string, original: number, val: string) => {
    const price = parseInt(val, 10);
    if (isNaN(price) || price < 0 || price === original) return;
    setUpdatingId(photoId);
    try {
      await updatePhotoPriceAction(photoId, price);
      setPhotos((p) => p.map((x) => x.id === photoId ? { ...x, price } : x));
      showToast("Price updated.", "success");
    } catch { showToast("Failed to update price.", "error"); }
    finally { setUpdatingId(null); }
  };

  const handleUpdateNumber = async (photoId: string, original: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed || trimmed === original) return;
    setUpdatingId(photoId);
    try {
      await updatePhotoNumberAction(photoId, trimmed);
      setPhotos((p) => p.map((x) => x.id === photoId ? { ...x, photo_number: trimmed } : x));
      showToast("Photo number updated.", "success");
    } catch { showToast("Failed to update photo number.", "error"); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">

      {/* Upload Panel Toggle */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Upload Photos</h2>
            <p className="text-sm text-gray-500">Add photos to {albumTitle}</p>
          </div>
          <button
            onClick={() => setShowUpload((v) => !v)}
            className="flex items-center gap-2 rounded-2xl bg-[#03412C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#055639] transition"
          >
            <Upload size={16} />
            {showUpload ? "Hide" : "Upload Photos"}
          </button>
        </div>

        {showUpload && (
          <div className="mt-4 space-y-4">
            <div className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 px-6 transition hover:bg-gray-100/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Click or drag photos here</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG — auto compressed to WebP</p>
            </div>

            {statuses.length > 0 && (
              <div className="rounded-2xl border border-gray-100 p-4 max-h-60 overflow-y-auto space-y-2">
                {statuses.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm border-b border-gray-50 pb-1.5">
                    <span className="truncate max-w-[60%] font-medium text-gray-700">{item.name}</span>
                    <span className={`font-medium ${item.status === "success" ? "text-green-600" : item.status === "error" ? "text-red-600" : item.status === "idle" ? "text-gray-400" : "text-yellow-600"}`}>
                      {item.status === "idle" && "Ready"}
                      {item.status === "compressing" && "Compressing…"}
                      {item.status === "uploading" && "Uploading…"}
                      {item.status === "success" && "✓ Done"}
                      {item.status === "error" && `✗ Failed: ${item.errorMsg || "Unknown error"}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#03412C] py-3.5 text-sm font-semibold text-white hover:bg-[#055639] transition disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading…" : `Upload ${files.length} Photos`}
            </button>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-5">Photos ({photos.length})</h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-gray-100 animate-pulse aspect-[3/2]" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center">
            <p className="text-gray-400 font-medium">No photos yet. Upload some above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition duration-300"
              >
                {pendingDeleteId === photo.id && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-4 text-center">
                    <p className="font-semibold text-gray-800 mb-1">Delete this photo?</p>
                    <p className="text-xs text-gray-500 mb-4">This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(photo.id)}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPendingDeleteId(photo.id)}
                  aria-label={`Delete photo ${photo.photo_number}`}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 text-red-600 shadow hover:bg-red-600 hover:text-white transition"
                >
                  <Trash2 size={14} />
                </button>

                <div className="relative aspect-[3/2] w-full bg-gray-50 overflow-hidden">
                  <Image
                    src={photo.preview_url}
                    alt={`Photo ${photo.photo_number}`}
                    fill
                    className="object-cover select-none"
                    draggable={false}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                <div className="p-3 space-y-2 border-t border-gray-50">
                  <div>
                    <label htmlFor={`number-${photo.id}`} className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Code
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id={`number-${photo.id}`}
                        type="text"
                        defaultValue={photo.photo_number}
                        onBlur={(e) => handleUpdateNumber(photo.id, photo.photo_number, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                        className="w-full text-sm font-semibold text-gray-800 bg-transparent border border-transparent hover:border-gray-200 focus:border-[#03412C] focus:bg-white rounded-lg px-2 py-1 outline-none transition"
                      />
                      <Edit3 size={10} className="absolute right-2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`price-${photo.id}`} className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Price (Rp)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id={`price-${photo.id}`}
                        type="number"
                        defaultValue={photo.price}
                        onBlur={(e) => handleUpdatePrice(photo.id, photo.price, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                        className="w-full text-sm font-bold text-green-700 bg-transparent border border-transparent hover:border-gray-200 focus:border-[#03412C] focus:bg-white rounded-lg px-2 py-1 outline-none transition"
                      />
                      <Edit3 size={10} className="absolute right-2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {updatingId === photo.id && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#03412C]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-6 py-4 text-white shadow-xl ${
            toast.type === "success" ? "bg-[#03412C]" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
