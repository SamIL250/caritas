import { Topbar } from "@/components/layout/Topbar";
import { TestimonyForm } from "../TestimonyForm";

export default function NewTestimonyPage() {
  return (
    <div className="w-full max-w-full">
      <Topbar title="New testimony" subtitle="Create a testimonial story for the Publications page." />
      <TestimonyForm mode="create" />
    </div>
  );
}
