"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useVolunteer } from "@/context/VolunteerContext";
import VolunteerModal from "./VolunteerModal";

/** Opens the volunteer modal when ?volunteer=1 or ?volunteer_campaign=id is present (then clears params). */
export default function VolunteerModalWrapper() {
  const { isModalOpen, openModal, closeModal, campaignId } = useVolunteer();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const v = searchParams.get("volunteer");
    const cid = searchParams.get("volunteer_campaign");
    if (v === "1" || v === "true") {
      openModal(cid?.trim() || null);
      const params = new URLSearchParams(searchParams);
      params.delete("volunteer");
      params.delete("volunteer_campaign");
      router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false });
    }
  }, [searchParams, pathname, router, openModal]);

  return (
    <VolunteerModal
      isOpen={isModalOpen}
      onClose={closeModal}
      initialCampaignId={campaignId}
    />
  );
}
