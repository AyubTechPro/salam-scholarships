import SuccessStoryForm from "@/components/admin/SuccessStoryForm";
import { getTranslations } from "next-intl/server";

export default async function NewSuccessStoryPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations("admin.forms");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">{t("publishStory")}</h1>
        <p className="text-sm text-[#888] mt-1">{t("publishStory")}</p>
      </div>
      <SuccessStoryForm locale={locale} />
    </div>
  );
}
