import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import ProgramCategoryForm from "@/components/dashboard/programs/ProgramCategoryForm";

export default function NewProgramCategoryPage() {
  return (
    <div className="w-full max-w-5xl">
      <Topbar
        title="New program category"
        subtitle="Add a new pillar — gives editors a tab in the dashboard and an anchor on /programs."
      />
      <ProgramCategoryForm mode="create" />
    </div>
  );
}
