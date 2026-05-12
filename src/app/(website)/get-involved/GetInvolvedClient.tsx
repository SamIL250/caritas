"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVolunteer } from "@/context/VolunteerContext";

export default function GetInvolvedClient() {
  const { openModal } = useVolunteer();
  const searchParams = useSearchParams();

  useEffect(() => {
    const cid = searchParams.get("campaign")?.trim() || null;
    openModal(cid);
  }, [openModal, searchParams]);

  return (
    <div className="relative min-h-[42vh] bg-gradient-to-b from-stone-50 to-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A1515]/90">Volunteer</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading,Poppins)] text-3xl font-bold text-stone-900 sm:text-4xl">
          Get involved
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-600">
          Offer your time and skills to Caritas Rwanda programmes. Use the form above to choose a campaign or tell us
          you&apos;re open to any role — our team will review every application.
        </p>
        <p className="mt-8 text-sm text-stone-500">
          Form not visible?{" "}
          <button
            type="button"
            className="font-semibold text-[#7A1515] underline decoration-[#7A1515]/25 underline-offset-4 hover:decoration-[#7A1515]/60"
            onClick={() => openModal(searchParams.get("campaign")?.trim() || null)}
          >
            Open volunteer sign-up
          </button>
          {" · "}
          <Link href="/" className="font-semibold text-stone-700 underline underline-offset-4 hover:text-[#7A1515]">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
