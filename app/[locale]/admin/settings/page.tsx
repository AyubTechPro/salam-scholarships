import { PrismaClient } from "@prisma/client";
import { Settings as SettingsIcon, Image as ImageIcon, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import SiteStatsForm from "@/components/admin/SiteStatsForm";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";

const prisma = new PrismaClient();

export default async function SettingsPage({ params: { locale } }: { params: { locale: string } }) {
  let stats = await prisma.siteStats.findUnique({
    where: { id: 'global' }
  });

  let settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' }
  });

  if (!stats) {
    stats = {
      id: 'global',
      manualProgramsOffset: 0,
      manualCountriesOffset: 0,
      manualConsultationsBase: 2000,
      showLiveCounts: true,
      heroStatsOpportunities: 500,
      heroStatsCountries: 50,
      heroStatsStudents: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Settings & CMS</h1>
          <p className="text-sm text-[#888] mt-1">Manage global site settings and website content.</p>
        </div>
      </div>

      <div className="space-y-12">
        <div>
          <h2 className="text-lg font-medium text-white mb-4">Core Site Settings</h2>
          <SiteSettingsForm initialSettings={settings} locale={locale} />
        </div>

        <div>
          <h2 className="text-lg font-medium text-white mb-4">Marketing Stats (Trust Bar)</h2>
          <SiteStatsForm initialStats={stats} locale={locale} />
        </div>
      </div>
    </div>
  );
}
