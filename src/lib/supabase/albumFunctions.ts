// src/lib/supabase/albumFunctions.ts

import { createServerSupabase } from "./server";

/**
 * Fetch the currently active album.
 * Returns the album row or null if none is active.
 */
export async function getActiveAlbum() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("albums")
    .select("*, cover_url, event_date, description, location, title, slug")
    .eq("is_published", true)
    .single();
  if (error && error.code !== "PGRST116") {
    // PGRST116 = No rows found – treat as null.
    throw error;
  }
  return data || null;
}

/**
 * Set an album as the active one. Ensures only one album is active.
 * @param albumId - UUID of the album to activate
 */
export async function setActiveAlbum(albumId: string) {
  const supabase = await createServerSupabase();
  // Deactivate all albums first
  const { error: deactivateError } = await supabase
    .from("albums")
    .update({ is_published: false })
    .neq("id", albumId);
  if (deactivateError) throw deactivateError;

  // Activate the selected album
  const { error: activateError } = await supabase
    .from("albums")
    .update({ is_published: true })
    .eq("id", albumId);
  if (activateError) throw activateError;

  return true;
}
