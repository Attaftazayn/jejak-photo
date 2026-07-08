-- src/lib/supabase/schema.sql
-- Database schema for JejakPhoto production

-- Table to store original photos (private)
create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  bucket_path text not null,
  filename text not null,
  mime_type text not null,
  uploaded_at timestamp with time zone default now(),
  size bigint not null
);

-- Table for preview images (public)
create table if not exists preview_images (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid not null references photos(id) on delete cascade,
  bucket_path text not null,
  filename text not null,
  mime_type text not null,
  width int not null,
  height int not null,
  created_at timestamp with time zone default now()
);

-- Table for watermarked images (private, optional)
create table if not exists watermarked_images (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid not null references photos(id) on delete cascade,
  bucket_path text not null,
  filename text not null,
  mime_type text not null,
  created_at timestamp with time zone default now()
);

-- Indexes for fast lookup
create index if not exists idx_photos_user on photos(user_id);
create index if not exists idx_preview_photo on preview_images(photo_id);
create index if not exists idx_watermark_photo on watermarked_images(photo_id);

-- Migration to add gallery_duration_days column to albums table
-- Run this in your Supabase SQL Editor:
-- ALTER TABLE albums ADD COLUMN gallery_duration_days int DEFAULT 30;
