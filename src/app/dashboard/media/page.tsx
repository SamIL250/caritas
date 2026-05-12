import { getMediaUsage } from "@/app/actions/media";
import MediaLibraryClient from "./MediaLibraryClient";

export default async function MediaPage() {
  const usage = await getMediaUsage();
  return <MediaLibraryClient initialUsage={usage} />;
}
