"use server"

import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server"
import { uploadPreview, deletePreviewByUrl, deleteOriginalByUrl } from "@/lib/supabase/storage"
import { revalidatePath } from "next/cache"

export async function getPhotosByAlbumAction(albumId: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("photos")
    .select("id, album_id, filename, photo_number, preview_url, original_url, price, status, created_at")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return data || []
}

export async function uploadPhotoAction(formData: FormData) {
  const albumId = formData.get("album_id") as string
  const priceStr = formData.get("price") as string
  const photoNumber = formData.get("photo_number") as string
  const file = formData.get("file") as File

  if (!albumId || !file) {
    throw new Error("Missing required fields")
  }

  // Backend Validations
  if (!file.name || !file.name.trim()) {
    throw new Error("File name is required.")
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed.");
  }

  const MAX_SIZE = 15 * 1024 * 1024; // 15MB
  if (file.size > MAX_SIZE) {
    throw new Error("File size must not exceed 15MB.");
  }

  if (!photoNumber || !photoNumber.trim()) {
    throw new Error("Photo number is required.");
  }

  const price = priceStr ? parseInt(priceStr, 10) : 15000
  if (isNaN(price) || price < 0) {
    throw new Error("Price must be at least Rp 0.");
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to Supabase Storage (bucket "preview")
  const previewUrl = await uploadPreview(buffer, file.name, file.type)

  // Save metadata to database using admin client to bypass RLS
  const supabase = createAdminSupabase()
  const { data: insertedPhoto, error } = await supabase
    .from("photos")
    .insert({
      album_id: albumId,
      filename: file.name,
      photo_number: photoNumber.trim(),
      preview_url: previewUrl,
      price: price,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    // Database insert failed -> ROLLBACK preview file from storage!
    await deletePreviewByUrl(previewUrl);
    throw new Error(`Database error: ${error.message}`)
  }

  revalidatePath(`/admin/albums/${albumId}`)
  revalidatePath(`/admin/albums`)
  revalidatePath(`/`)
}

export async function deletePhotoAction(photoId: string) {
  const supabase = createAdminSupabase() // Use admin client to bypass delete limits if any

  // 1. Fetch photo details from database (including original_url and album_id)
  const { data: photo } = await supabase
    .from("photos")
    .select("preview_url, original_url, album_id")
    .eq("id", photoId)
    .single()

  // 2. Delete storage files first (preview + original)
  if (photo) {
    if (photo.preview_url) {
      await deletePreviewByUrl(photo.preview_url)
    }
    if (photo.original_url) {
      await deleteOriginalByUrl(photo.original_url)
    }
  }

  // 3. Delete metadata row from database
  const { error } = await supabase.from("photos").delete().eq("id", photoId)
  if (error) {
    throw new Error(error.message)
  }

  if (photo?.album_id) {
    revalidatePath(`/admin/albums/${photo.album_id}`)
  }
  revalidatePath(`/admin/albums`)
  revalidatePath(`/`)
}

export async function updatePhotoPriceAction(photoId: string, price: number) {
  if (isNaN(price) || price < 0) {
    throw new Error("Price must be at least Rp 0.");
  }

  const supabase = await createServerSupabase()

  // Fetch album_id to trigger specific path revalidation
  const { data: photo } = await supabase
    .from("photos")
    .select("album_id")
    .eq("id", photoId)
    .single()

  const { error } = await supabase
    .from("photos")
    .update({ price })
    .eq("id", photoId)

  if (error) {
    throw new Error(error.message)
  }

  if (photo?.album_id) {
    revalidatePath(`/admin/albums/${photo.album_id}`)
  }
  revalidatePath(`/admin/albums`)
  revalidatePath(`/`)
}

export async function updatePhotoNumberAction(photoId: string, photoNumber: string) {
  if (!photoNumber || !photoNumber.trim()) {
    throw new Error("Photo number is required.");
  }

  const supabase = await createServerSupabase()

  // Fetch album_id to trigger specific path revalidation
  const { data: photo } = await supabase
    .from("photos")
    .select("album_id")
    .eq("id", photoId)
    .single()

  const { error } = await supabase
    .from("photos")
    .update({ photo_number: photoNumber.trim() })
    .eq("id", photoId)

  if (error) {
    throw new Error(error.message)
  }

  if (photo?.album_id) {
    revalidatePath(`/admin/albums/${photo.album_id}`)
  }
  revalidatePath(`/admin/albums`)
  revalidatePath(`/`)
}
