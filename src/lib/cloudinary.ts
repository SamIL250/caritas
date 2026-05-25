import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  bytes: number;
}

/**
 * Upload a File to Cloudinary. The file is streamed as a buffer to avoid
 * writing temp files to disk.
 *
 * @param file  The browser-originated File from a FormData upload.
 * @param folder  Optional subfolder inside Cloudinary (default `caritas_media`).
 */
export async function uploadToCloudinary(
  file: File,
  folder = "caritas_media",
): Promise<CloudinaryUploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          bytes: result.bytes,
        });
      },
    );
    uploadStream.end(buffer);
  });
}

/**
 * Permanently delete a file from Cloudinary by its public_id.
 * If the asset is already gone, this resolves silently.
 */
export async function destroyFromCloudinary(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary destroy returned "${result.result}"`);
  }
}

/** Cloudinary account usage info returned by the usage API. */
export interface CloudinaryUsageResult {
  storage: { usage: number; limit: number; used_percent: number };
  credits: { usage: number; limit: number; used_percent: number };
  plan: string;
}



/**
 * Fetch real storage & credit usage from the Cloudinary account.
 * Falls back to `null` if the API call fails (e.g. network issue).
 */
export async function getCloudinaryUsage(): Promise<CloudinaryUsageResult | null> {
  try {
    const result: CloudinaryUsageResult = await cloudinary.api.usage();
    return result;
  } catch {
    return null;
  }
}
