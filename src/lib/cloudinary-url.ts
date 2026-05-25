/**
 * Client-safe Cloudinary URL transformation helper.
 * Zero server dependencies — safe to import in `"use client"` components.
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "scale" | "fit" | "thumb" | "crop";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "png" | "jpg";
  /** Gravity used with c_fill / c_thumb (e.g. "auto", "face", "center") */
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
}

/**
 * Take any Cloudinary `secure_url` and return an optimised version with the
 * requested transformations baked into the URL path.
 *
 * If the URL isn't a Cloudinary URL, it's returned as-is.
 *
 * Example:
 *   input:  https://res.cloudinary.com/demo/image/upload/v1/sample.jpg
 *   opts:   { width: 400, height: 300, crop: "fill", quality: "auto", format: "auto" }
 *   output: https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,h_300,c_fill/v1/sample.jpg
 */
export function cloudinaryUrl(
  url: string,
  opts: CloudinaryTransformOptions = {},
): string {
  if (!url.includes("res.cloudinary.com")) return url;

  const parts: string[] = [];
  if (opts.format) parts.push(`f_${opts.format}`);
  if (opts.quality) parts.push(`q_${opts.quality}`);
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);

  const transform = parts.join(",");
  if (!transform) return url;

  // Insert after "/image/upload/" — the standard location for Cloudinary transforms.
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}
