import PublicationCategoryForm from "@/components/dashboard/publications/PublicationCategoryForm";

export default function NewPublicationCategoryPage() {
  return (
    <div className="w-full max-w-full">
      <PublicationCategoryForm mode="create" />
    </div>
  );
}
