import type { Metadata } from "next";
import { Suspense } from "react";
import GetInvolvedClient from "./GetInvolvedClient";

export const metadata: Metadata = {
  title: "Get Involved — Volunteer | Caritas Rwanda",
  description:
    "Apply to volunteer with Caritas Rwanda — choose a programme or offer your time for open roles across our work.",
};

export default function GetInvolvedPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-stone-50" aria-hidden />}>
      <GetInvolvedClient />
    </Suspense>
  );
}
