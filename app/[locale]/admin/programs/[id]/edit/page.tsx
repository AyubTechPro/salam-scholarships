import { PrismaClient } from "@prisma/client";
import ProgramForm from "@/components/admin/ProgramForm";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function EditProgramPage({
  params: { id, locale }
}: {
  params: { id: string; locale: string }
}) {
  const program = await prisma.program.findUnique({
    where: { id }
  });

  if (!program) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProgramForm locale={locale} initialData={program} />
    </div>
  );
}
