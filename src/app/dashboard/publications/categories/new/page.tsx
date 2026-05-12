import PublicationCategoryForm from "@/components/dashboard/publications/PublicationCategoryForm";

export default function NewPublicationCategoryPage() {
  return (
    <div className="w-full max-w-5xl">
      <PublicationCategoryForm mode="create" />
    </div>
  );
}
