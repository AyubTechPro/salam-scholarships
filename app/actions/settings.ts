"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateSiteStats(formData: FormData, locale: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const manualProgramsOffset = parseInt(formData.get("manualProgramsOffset") as string) || 0;
  const manualCountriesOffset = parseInt(formData.get("manualCountriesOffset") as string) || 0;
  const manualConsultationsBase = parseInt(formData.get("manualConsultationsBase") as string) || 2000;
  const showLiveCounts = formData.get("showLiveCounts") === "on";

  await prisma.siteStats.upsert({
    where: { id: 'global' },
    update: {
      manualProgramsOffset,
      manualCountriesOffset,
      manualConsultationsBase,
      showLiveCounts,
    },
    create: {
      id: 'global',
      manualProgramsOffset,
      manualCountriesOffset,
      manualConsultationsBase,
      showLiveCounts,
      heroStatsOpportunities: 500,
      heroStatsCountries: 50,
      heroStatsStudents: 10000,
    }
  });

  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/settings`);
}
