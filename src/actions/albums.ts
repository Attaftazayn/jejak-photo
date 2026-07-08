"use server"

import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Photo } from '@/types/photo';
import { deleteCoverByUrl, deletePreviewByUrl, deleteOriginalByUrl } from '@/lib/supabase/storage';

export interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  event_date: string | null;
  location: string | null;
  expires_at: string | null;
  is_published: boolean;
  created_at?: string;
  gallery_duration_days?: number | null;
  slug?: string | null;
}

export async function getActiveAlbum(): Promise<Album | null> {
  // Use admin client to bypass RLS — this is a server-only function
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('is_published', true)
    .limit(1)
    .maybeSingle();
  if (error) console.error('Error fetching active album:', error);
  return (data as Album) ?? null;
}

export async function getActiveAlbumList(): Promise<Album[]> {
  // Use admin client to bypass RLS
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('Error fetching album list:', error);
  return (data as Album[]) ?? [];
}

export async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('photos').select('*').eq('album_id', albumId);
  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
  return (data || []).map((p: any) => ({
    id: p.id,
    image: p.preview_url || "",
    number: p.photo_number || "",
    price: p.price || 0,
  }));
}

export async function getPhotoCount(albumId: string): Promise<number> {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .eq('album_id', albumId);
  if (error) console.error('Error counting photos:', error);
  return Number(count) || 0;
}

export async function setActiveAlbum(albumId: string) {
  const supabase = createAdminSupabase();
  // Deactivate all albums, then activate the selected one
  const { error: deactivateErr } = await supabase
    .from('albums')
    .update({ is_published: false })
    .neq('id', albumId);
  if (deactivateErr) throw new Error(`Failed to deactivate albums: ${deactivateErr.message}`);

  const { error: activateErr } = await supabase
    .from('albums')
    .update({ is_published: true })
    .eq('id', albumId);
  if (activateErr) throw new Error(`Failed to activate album: ${activateErr.message}`);

  revalidatePath('/');
  revalidatePath('/admin/albums');
}


/** Server Action: create album */
export async function createAlbum(formData: FormData): Promise<Album> {
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const location = (formData.get('location') as string) || null;
  const event_date = (formData.get('event_date') as string) || null;
  const cover_url = (formData.get('cover_url') as string) || null;
  const gallery_duration_days = formData.get('gallery_duration_days') 
    ? parseInt(formData.get('gallery_duration_days') as string, 10) 
    : 30;

  if (!title?.trim()) throw new Error('Album title is required.');
  if (isNaN(gallery_duration_days) || gallery_duration_days < 1) {
    throw new Error('Gallery duration must be at least 1 day.');
  }
  if (location !== null && location.trim() === '') {
    throw new Error('Location cannot be only spaces.');
  }
  if (cover_url && !cover_url.startsWith('http://') && !cover_url.startsWith('https://')) {
    throw new Error('Invalid cover image URL.');
  }

  const supabase = createAdminSupabase();
  let insertPayload: any = { 
    title, 
    description, 
    location, 
    event_date, 
    cover_url, 
    is_published: false,
    gallery_duration_days
  };

  let { data, error } = await supabase
    .from('albums')
    .insert(insertPayload)
    .select()
    .single();

  if (error && (error.message.includes('gallery_duration_days') || error.code === 'PGRST204' || error.message.includes('column'))) {
    // Fallback: column doesn't exist, store in slug instead
    insertPayload = { 
      title, 
      description, 
      location, 
      event_date, 
      cover_url, 
      is_published: false,
      slug: String(gallery_duration_days)
    };
    const retry = await supabase
      .from('albums')
      .insert(insertPayload)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    // Database creation failed -> ROLLBACK album cover from storage!
    if (cover_url) {
      await deleteCoverByUrl(cover_url);
    }
    throw new Error(`Failed to create album: ${error.message}`);
  }

  revalidatePath('/admin/albums');
  revalidatePath('/');

  return data as Album;
}

/** Server Action: update album */
export async function updateAlbum(formData: FormData): Promise<Album> {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const location = (formData.get('location') as string) || null;
  const event_date = (formData.get('event_date') as string) || null;
  const cover_url_raw = formData.get('cover_url') as string | null;
  const cover_url = cover_url_raw === 'REMOVE' ? null : cover_url_raw || null;
  const gallery_duration_days = formData.get('gallery_duration_days') 
    ? parseInt(formData.get('gallery_duration_days') as string, 10) 
    : 30;

  if (!id) throw new Error('Album ID is required for update.');
  if (!title?.trim()) throw new Error('Album title is required.');
  if (isNaN(gallery_duration_days) || gallery_duration_days < 1) {
    throw new Error('Gallery duration must be at least 1 day.');
  }
  if (location !== null && location.trim() === '') {
    throw new Error('Location cannot be only spaces.');
  }
  if (cover_url && !cover_url.startsWith('http://') && !cover_url.startsWith('https://')) {
    throw new Error('Invalid cover image URL.');
  }

  const supabase = createAdminSupabase();

  // Fetch old cover details first to clean up or rollback
  const { data: oldAlbum } = await supabase
    .from('albums')
    .select('cover_url')
    .eq('id', id)
    .single();
  const oldCoverUrl = oldAlbum?.cover_url;

  let updatePayload: Record<string, any> = { 
    title, 
    description, 
    location, 
    event_date,
    gallery_duration_days
  };

  if (cover_url_raw !== null) {
    updatePayload.cover_url = cover_url;
  }

  let { data, error } = await supabase
    .from('albums')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error && (error.message.includes('gallery_duration_days') || error.code === 'PGRST204' || error.message.includes('column'))) {
    // Fallback: column doesn't exist, store in slug instead
    updatePayload = { 
      title, 
      description, 
      location, 
      event_date,
      slug: String(gallery_duration_days)
    };
    if (cover_url_raw !== null) {
      updatePayload.cover_url = cover_url;
    }
    const retry = await supabase
      .from('albums')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    // Rollback: if a new cover was uploaded and passed, delete it from storage
    if (cover_url_raw !== null && cover_url !== null && cover_url !== oldCoverUrl) {
      await deleteCoverByUrl(cover_url);
    }
    throw new Error(`Failed to update album: ${error.message}`);
  }

  // Success: if a new cover was successfully set, delete the old cover from storage
  if (cover_url_raw !== null && oldCoverUrl && cover_url !== oldCoverUrl) {
    await deleteCoverByUrl(oldCoverUrl);
  }

  revalidatePath('/admin/albums');
  revalidatePath('/');

  return data as Album;
}

/** Server Action: update cover only */
export async function updateAlbumCover(albumId: string, coverUrl: string | null): Promise<void> {
  if (!albumId) throw new Error('Album ID is required.');
  const supabase = createAdminSupabase();

  // Fetch old cover details
  const { data: oldAlbum } = await supabase
    .from('albums')
    .select('cover_url')
    .eq('id', albumId)
    .single();
  const oldCoverUrl = oldAlbum?.cover_url;

  const { error } = await supabase
    .from('albums')
    .update({ cover_url: coverUrl })
    .eq('id', albumId);

  if (error) {
    // Rollback: delete the new cover if update failed
    if (coverUrl && coverUrl !== oldCoverUrl) {
      await deleteCoverByUrl(coverUrl);
    }
    throw new Error(`Failed to update album cover: ${error.message}`);
  }

  // Success: delete old cover
  if (oldCoverUrl && coverUrl !== oldCoverUrl) {
    await deleteCoverByUrl(oldCoverUrl);
  }

  revalidatePath('/admin/albums');
  revalidatePath('/');
}

/** Server Action: delete album */
export async function deleteAlbum(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) throw new Error("Album ID is required.");

  const supabase = createAdminSupabase();

  // 1. Fetch album details to delete cover from storage
  const { data: album } = await supabase
    .from('albums')
    .select('cover_url')
    .eq('id', id)
    .single();

  // 2. Fetch all photos in this album to delete preview + original files from storage
  const { data: photos } = await supabase
    .from('photos')
    .select('id, preview_url, original_url')
    .eq('album_id', id);

  // 3. Delete files from Storage (Photos first)
  if (photos && photos.length > 0) {
    for (const photo of photos) {
      if (photo.preview_url) {
        await deletePreviewByUrl(photo.preview_url);
      }
      if (photo.original_url) {
        await deleteOriginalByUrl(photo.original_url);
      }
    }

    // 4. Delete photos metadata from database
    const { error: deletePhotosErr } = await supabase
      .from('photos')
      .delete()
      .eq('album_id', id);

    if (deletePhotosErr) {
      throw new Error(`Failed to delete photos metadata: ${deletePhotosErr.message}`);
    }
  }

  // 5. Delete album cover from storage
  if (album?.cover_url) {
    await deleteCoverByUrl(album.cover_url);
  }

  // 6. Finally, delete the album record itself
  const { error: deleteAlbumErr } = await supabase
    .from('albums')
    .delete()
    .eq('id', id);

  if (deleteAlbumErr) {
    throw new Error(`Failed to delete album: ${deleteAlbumErr.message}`);
  }

  revalidatePath('/admin/albums');
  revalidatePath('/');
}

export async function activateAlbumAction(formData: FormData) {
  const albumId = formData.get('albumId') as string;
  if (!albumId) throw new Error('Missing albumId');
  await setActiveAlbum(albumId);
  revalidatePath('/admin/albums');
  revalidatePath('/');
}
