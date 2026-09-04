import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import SuccessStoryForm from "@/components/admin/SuccessStoryForm";

const prisma = new PrismaClient();

export default async function EditSuccessStoryPage({ 
  params: { id, locale } 
}: { 
  params: { id: string; locale: string } 
}) {
  const story = await prisma.successStory.findUnique({
    where: { id }
  });

  if (!story) notFound();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Edit Success Story</h1>
        <p className="text-sm text-[#888] mt-1">Update the details for {story.name}.</p>
      </div>
      <SuccessStoryForm initialData={story} locale={locale} />
    </div>
  );
}
