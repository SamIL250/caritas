import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { fetchContactDetailForDashboard } from "@/app/actions/contact-messages";
import ContactDetailClient from "../ContactDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await fetchContactDetailForDashboard(id);
  if (!detail) notFound();

  return (
    <div className="w-full max-w-6xl">
      <Topbar title="Contact message" subtitle="Review the thread and reply by email." />
      <ContactDetailClient
        message={detail.message}
        replies={detail.replies}
        notifyInboxEmail={detail.notifyInboxEmail}
      />
    </div>
  );
}
