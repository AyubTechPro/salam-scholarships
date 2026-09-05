import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import SuccessStoryForm from "@/components/admin/SuccessStoryForm";
import { getTranslations } from "next-intl/server";

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

  const t = await getTranslations("admin.forms");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">{t("updateStory")}</h1>
        <p className="text-sm text-[#888] mt-1">{t("updateStory")} {story.name}.</p>
      </div>
      <SuccessStoryForm initialData={story} locale={locale} />
    </div>
  );
}
