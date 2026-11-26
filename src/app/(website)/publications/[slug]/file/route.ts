import { createClient } from "@/lib/supabase/server";
import {
  cloudinaryOriginalDownloadUrl,
  parseCloudinaryAssetUrl,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

function attachmentName(slug: string, format: string): string {
  const safe = slug.replace(/[^a-z0-9-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${safe || "publication"}.${format || "pdf"}`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("publications")
    .select("slug, file_url")
    .eq("slug", slug)
    .maybeSingle();

  const fileUrl = data?.file_url?.trim() ?? "";
  if (!fileUrl) {
    return new Response("This publication has no file.", { status: 404 });
  }

  const asset = parseCloudinaryAssetUrl(fileUrl);
  if (!asset) {
    return Response.redirect(fileUrl, 302);
  }

  const upstream = await fetch(cloudinaryOriginalDownloadUrl(asset));
  if (!upstream.ok || !upstream.body) {
    return new Response("The file could not be downloaded.", { status: 502 });
  }

  const filename = attachmentName(data?.slug || slug, asset.format);
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);
  headers.set("Cache-Control", "private, max-age=300");

  return new Response(upstream.body, { status: 200, headers });
}
