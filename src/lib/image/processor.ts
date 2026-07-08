// src/lib/image/processor.ts
// Central image processing utilities for JejakPhoto project.
// Uses sharp (Node.js image library) for transformations.

import sharp from "sharp";
import { Readable } from "stream";

/**
 * Generate a preview image (web‑optimized) from the original buffer.
 * Returns a Buffer containing the resized image in WebP format.
 */
export async function generatePreview(
  input: Buffer,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 80
): Promise<Buffer> {
  return await sharp(input)
    .rotate()
    .resize({ width: maxWidth, height: maxHeight, fit: "inside" })
    .webp({ quality })
    .toBuffer();
}

/**
 * Apply a watermark (text or image) onto the input buffer.
 * `watermark` can be a Buffer (image) or a string (text).
 */
export async function applyWatermark(
  input: Buffer,
  watermark: Buffer | string,
  options: { opacity?: number; position?: "center" | "top-left" | "bottom-right" } = {}
): Promise<Buffer> {
  const { opacity = 0.5, position = "center" } = options;
  const img = sharp(input).rotate();
  let watermarkImg: sharp.Sharp;

  if (typeof watermark === "string") {
    // Simple text watermark using SVG
    const svg = `<svg width="500" height="200"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      fill="white" fill-opacity="${opacity}" font-size="48" font-family="Arial,Helvetica,sans-serif">${watermark}</text></svg>`;
    watermarkImg = sharp(Buffer.from(svg)).png();
  } else {
    watermarkImg = sharp(watermark).png();
  }

  const wmBuffer = await watermarkImg
    .ensureAlpha(opacity)
    .toBuffer();

  const { width, height } = await img.metadata();
  const wmMetadata = await sharp(wmBuffer).metadata();

  const left = position.includes("left")
    ? 10
    : position.includes("right")
    ? (width! - wmMetadata.width! - 10)
    : (width! - wmMetadata.width!) / 2;
  const top = position.includes("top")
    ? 10
    : position.includes("bottom")
    ? (height! - wmMetadata.height! - 10)
    : (height! - wmMetadata.height!) / 2;

  return await img
    .composite([{ input: wmBuffer, left: Math.round(left), top: Math.round(top) }])
    .toBuffer();
}

/**
 * Compress an image to the specified quality (WebP).
 */
export async function compressImage(input: Buffer, quality: number = 80): Promise<Buffer> {
  return await sharp(input).webp({ quality }).toBuffer();
}

/**
 * Generate a low‑resolution blurred placeholder (Base64).
 */
export async function generateBlurPlaceholder(
  input: Buffer,
  width: number = 20,
  blur: number = 10
): Promise<string> {
  const resized = await sharp(input).resize({ width }).blur(blur).toBuffer();
  return `data:image/webp;base64,${resized.toString("base64")}`;
}

export default {
  generatePreview,
  applyWatermark,
  compressImage,
  generateBlurPlaceholder,
};
