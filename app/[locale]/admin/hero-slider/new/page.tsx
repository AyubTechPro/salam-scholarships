import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default function NewHeroSlidePage({ params: { locale } }: { params: { locale: string } }) {
  return <HeroSlideForm locale={locale} />;
}
