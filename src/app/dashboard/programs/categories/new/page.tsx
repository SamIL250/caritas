import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import ProgramCategoryForm from "@/components/dashboard/programs/ProgramCategoryForm";

export default function NewProgramCategoryPage() {
  return (
    <div className="w-full max-w-full">
      <Topbar
        title="New department"
        subtitle="Add a new pillar — gives editors a tab in the dashboard and an anchor on /programs."
      />
      <ProgramCategoryForm mode="create" />
    </div>
  );
}
