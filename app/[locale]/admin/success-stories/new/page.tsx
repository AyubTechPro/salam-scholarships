import SuccessStoryForm from "@/components/admin/SuccessStoryForm";

export default function NewSuccessStoryPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Add Success Story</h1>
        <p className="text-sm text-[#888] mt-1">Create a new student success story for the homepage.</p>
      </div>
      <SuccessStoryForm locale={locale} />
    </div>
  );
}
