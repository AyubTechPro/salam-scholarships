import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function EditHeroSlidePage({ 
  params 
}: { 
  params: { locale: string; id: string } 
}) {
  const slide = await prisma.heroSlide.findUnique({
    where: { id: params.id }
  });

  if (!slide) {
    notFound();
  }

  return <HeroSlideForm locale={params.locale} initialData={slide} />;
}
