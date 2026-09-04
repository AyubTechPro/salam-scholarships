import ProgramForm from "@/components/admin/ProgramForm";

export default function NewProgramPage({ params: { locale } }: { params: { locale: string } }) {
  return <ProgramForm locale={locale} />;
}
