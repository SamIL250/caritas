import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import crypto from "crypto";

const CLOUDINARY_MAX_BYTES = 10 * 1024 * 1024; // 10 MB free-plan cap
const STORAGE_BUCKET = "media";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const folderRaw = formData.get("folder_id");
    const folder_id =
      typeof folderRaw === "string" && folderRaw.length > 0 ? folderRaw : null;

    const isImage = file.type.startsWith("image/");
    let url: string;
    let storage_path: string;

    // Small images → Cloudinary (image optimisation via transforms)
    // Large files & everything else → Supabase Storage (no per-file limit)
    if (isImage && file.size <= CLOUDINARY_MAX_BYTES) {
      const result = await uploadToCloudinary(file);
      url = result.url;
      storage_path = result.publicId;
    } else {
      const ext = file.name.split(".").pop() || "";
      const uniquePath = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uniquePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uniquePath);
      url = urlData?.publicUrl ?? "";
      storage_path = uniquePath;
    }

    // ── Save to DB ──
    const row = {
      filename: file.name,
      storage_path,
      url,
      size_bytes: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
      folder_id,
      deleted_at: null as string | null,
    };

    const { data: mediaData, error: mediaError } = await supabase
      .from("media")
      .insert(row)
      .select()
      .single();

    if (mediaError) {
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }

    return NextResponse.json(mediaData);
  } catch (e: unknown) {
    let message: string;
    if (e instanceof Error) {
      message = e.message;
    } else if (typeof e === "object" && e !== null) {
      message = JSON.stringify(e);
    } else {
      message = String(e);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
